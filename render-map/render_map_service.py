import os
import logging
import math
from time import sleep
import asyncpg
import asyncio
from PIL import Image
import time
from collections import defaultdict
import mapnik
from multiprocessing import Pool
import numpy as np
import struct
from tqdm import tqdm
from color_to_alpha import color_to_alpha

mapnik.register_fonts('/fonts')


def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return (lon_deg, lat_deg)


def wkbHeader(raw):
    # See http://trac.osgeo.org/postgis/browser/trunk/raster/doc/RFC2-WellKnownBinaryFormat

    header = {}

    header['endianess'] = struct.unpack('B', raw[0:1])[0]
    header['version'] = struct.unpack('H', raw[1:3])[0]
    header['nbands'] = struct.unpack('H', raw[3:5])[0]
    header['scaleX'] = struct.unpack('d', raw[5:13])[0]
    header['scaleY'] = struct.unpack('d', raw[13:21])[0]
    header['ipX'] = struct.unpack('d', raw[21:29])[0]
    header['ipY'] = struct.unpack('d', raw[29:37])[0]
    header['skewX'] = struct.unpack('d', raw[37:45])[0]
    header['skewY'] = struct.unpack('d', raw[45:53])[0]
    header['srid'] = struct.unpack('i', raw[53:57])[0]
    header['width'] = struct.unpack('H', raw[57:59])[0]
    header['height'] = struct.unpack('H', raw[59:61])[0]

    return header


def wkbImage(raw):
    h = wkbHeader(raw)
    img = [] # array to store image bands
    offset = 61 # header raw length in bytes
    for i in range(h['nbands']):
        # Determine pixtype for this band
        pixtype = struct.unpack('B', raw[offset:offset+1])[0]>>4
        # For now, we only handle unsigned byte
        if pixtype == 4:
            band = np.frombuffer(raw, dtype='uint8', count=h['width']*h['height'], offset=offset+1)
            img.append((np.reshape(band, ((h['height'], h['width'])))))
            offset = offset + 2 + h['width']*h['height']
        elif pixtype == 6:
            band = np.frombuffer(raw, dtype='uint8', count=h['width']*h['height'], offset=offset+2)
            img.append((np.reshape(band, ((h['height'], h['width'])))))
            offset = offset + 3 + h['width']*h['height']
        # to do: handle other data types

    return img


def get_hillshade(minlon, minlat, maxlon, maxlat):
    async def _do():
        query = '''
            SELECT ST_AsBinary(ST_Clip(ST_Transform(ST_Union(rast),3857), ST_Transform(ST_MakeEnvelope($1, $2, $3, $4, 4326),3857)))
            FROM hillshade
            WHERE ST_Intersects(rast, ST_Transform(ST_MakeEnvelope($1, $2, $3, $4, 4326),3035));
        '''
        conn = await asyncpg.connect(
            host=os.environ['POSTGRES_HOST'],
            port=os.environ['POSTGRES_PORT'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
            database=os.environ['POSTGRES_DB']
        )
        width = maxlon - minlon
        height = maxlat - minlat
        row = await conn.fetchrow(query, minlon-width/20, minlat-height/20, maxlon+width/20, maxlat+height/20)
        await conn.close()

        return row
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    ret = loop.run_until_complete(_do())
    tileim = wkbImage(ret[0])[0]
    tileim = tileim[int(tileim.shape[0]/1.1/20):-int(tileim.shape[0]/1.1/20),int(tileim.shape[1]/1.1/20):-int(tileim.shape[1]/1.1/20)]
    return Image.frombytes('L',(tileim.shape[1], tileim.shape[0]),tileim.tostring())


class Tracer():
    _current_tracings = {}
    _tracings = defaultdict(lambda: 0)

    @classmethod
    def start(cls, name, *args, **kwargs):
        cls._current_tracings[name] = time.time()

    @classmethod
    def end(cls, name):
        cls._tracings[name] += time.time() - cls._current_tracings[name]

    @classmethod
    def reset(cls):
        cls._tracings = defaultdict(lambda: 0)


def render(id, mnx, mny, mxx, mxy, zoom):
    TILE_SIZE = 256

    try:
        logging.info("Rendering ({},{},{},{},{}) started".format(mnx, mny, mxx, mxy, zoom))
        global map_pool, P_900913

        if 'map_pool' not in globals():
            map_pool = {}
        if 'P_900913' not in globals():
            P_900913 = mapnik.Projection(
                '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs +over'
            )

        Tracer.start('render_init')

        mnlon, mnlat = num2deg(mnx, mxy, zoom)
        mxlon, mxlat = num2deg(mxx, mny, zoom)

        bbox = P_900913.forward(mapnik.Box2d(mnlon, mnlat, mxlon, mxlat))

        sizex = int((mxx - mnx) * TILE_SIZE)
        sizey = int((mxy - mny) * TILE_SIZE)

        Tracer.end('render_init')

        pic = Image.new('RGBA', (sizex, sizey), (255, 255, 255, 255))

        for layer_name in tqdm(['landcover', 'hillshade', 'contour', 'way', 'building',
                           'ferry', 'boundary', 'route', 'fishnet', 'symbol', 'text'], leave=False):
            if layer_name != 'hillshade':
                while True:
                    try:
                        Tracer.start("render_{}_{}_map_load".format(zoom, layer_name))

                        layer = "/mapnik-styles/{}/~map-{}.xml".format(zoom, layer_name)

                        if layer in map_pool:
                            m = map_pool[layer]
                            m.resize(sizex, sizey)
                        else:
                            m = mapnik.Map(sizex, sizey)

                            mapnik.load_map(m, layer, True)
                            m.buffer_size = 48 if layer_name != 'text' else 512
                            map_pool[layer] = m

                        m.zoom_to_box(bbox)

                        Tracer.end("render_{}_{}_map_load".format(zoom, layer_name))

                        Tracer.start("render_{}_{}_render".format(zoom, layer_name))
                        tileim = mapnik.Image(sizex, sizey)
                        mapnik.render(m, tileim)
                        Tracer.end("render_{}_{}_render".format(zoom, layer_name))

                        break
                    except RuntimeError as e:
                        Tracer.start("render_{}_{}_dberror_recovery".format(zoom, layer_name))
                        logging.error('Problem with connection.')
                        logging.exception(e)
                        sleep(10)
                        Tracer.end("render_{}_{}_dberror_recovery".format(zoom, layer_name))

                Tracer.start("render_{}_compositing".format(zoom))
                tileim = Image.frombytes('RGBA', (sizex, sizey), tileim.tostring())
                if layer_name == 'boundary':
                    tileim = color_to_alpha(tileim, [255, 255, 255, 255])
                    tileim = np.array(tileim, dtype=np.uint8)
                    tileim[:, 3] //= 2
                    tileim = Image.fromarray(tileim, mode='RGBA')

                pic = Image.alpha_composite(pic, tileim)
                Tracer.end("render_{}_compositing".format(zoom))
            else:
                tileim = get_hillshade(mnlon, mnlat, mxlon, mxlat)

                tileim = tileim.resize(
                    (sizex, sizey),
                    Image.ANTIALIAS if sizex < tileim.width else Image.BILINEAR
                )
                tileim = np.array(tileim, dtype=np.float32) / 255

                low_limit = 0.6
                low_compression = 2
                high_limit = 0.9
                high_compression = 2.5
                tileim **= 1 / 1.3
                tileim = np.maximum(low_limit - ((low_limit - tileim) / low_compression), tileim)
                tileim = np.minimum(high_limit + ((tileim - high_limit) / high_compression), tileim)
                tileim += (1 - high_limit) * (1.0 - 1.0 / high_compression)
                tileim = 95 * (1-tileim)

                tileim = Image.fromarray(tileim.astype(np.uint8), mode='L')

                Tracer.start("render_{}_compositing".format(zoom))
                black = Image.new('L', (sizex, sizey), (0))
                tileim = Image.merge('RGBA', (black, black, black, tileim))
                pic = Image.alpha_composite(pic, tileim)
                Tracer.end("render_{}_compositing".format(zoom))

        Tracer.start("render_{}_croping".format(zoom))
        if pic:
            pic = pic.convert('RGB')

            for i in range(mxx - mnx):
                for j in range(mxy - mny):
                    crop = pic.crop((TILE_SIZE * i, TILE_SIZE * j, TILE_SIZE * (i + 1), TILE_SIZE * (j + 1)))
                    tileX = i + mnx
                    tileY = j + mny
                    if not os.path.isdir("/render/%s/%s" % (zoom, tileX)):
                        os.makedirs("/render/%s/%s" % (zoom, tileX))
                    crop.save("/render/%s/%s/%s.jpg" % (zoom, tileX, tileY), 'JPEG', quality=85)
        Tracer.end("render_{}_croping".format(zoom))

        logging.info("Rendering ({},{},{},{},{}) done.".format(mnx, mny, mxx, mxy, zoom))
        return id, True
    except (KeyboardInterrupt, SystemExit):
        raise
    except Exception as e:
        logging.exception("Rendering of ({},{},{},{},{}) failed".format(mnx, mny, mxx, mxy, zoom))
        return id, False


def get_next_task():
    async def _do():
        query = '''
            UPDATE render_queue 
            SET work_time = NOW() 
            WHERE id IN (
                SELECT id 
                FROM render_queue 
                WHERE work_time IS NULL 
                ORDER by add_time 
                LIMIT 1
            ) 
            RETURNING id, zoom,minx, miny, maxx, maxy;
        '''
        conn = await asyncpg.connect(
            host=os.environ['POSTGRES_HOST'],
            port=os.environ['POSTGRES_PORT'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
            database=os.environ['POSTGRES_DB']
        )
        row = await conn.fetchrow(query)
        await conn.close()

        return row

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    return loop.run_until_complete(_do())


def set_task_result(task_id, status):
    async def _do():
        if status:
            query = '''
                UPDATE render_queue 
                SET done_time = NOW() 
                WHERE id = $1            
            '''
        else:
            query = '''
                UPDATE render_queue 
                SET failed_time = NOW(), attemts = attemts + 1                 
                WHERE id = $1            
            '''
        conn = await asyncpg.connect(
            host=os.environ['POSTGRES_HOST'],
            port=os.environ['POSTGRES_PORT'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
            database=os.environ['POSTGRES_DB']
        )
        await conn.execute(query, task_id)
        await conn.close()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_do())


def tasks():
    while True:
        while True:
            task = get_next_task()
            if task is not None:
                break
            sleep(5)
        print('New task: ({},{},{},{},{},{})'.format(task['id'], task['minx'], task['miny'], task['maxx'], task['maxy'],
                                                     task['zoom']))
        yield task['id'], task['minx'], task['miny'], task['maxx'], task['maxy'], task['zoom']


running = None


def main():
    global running

    Tracer.reset()

    with Pool(processes=4) as pool:
        running = 0

        def done(ret):
            global running
            task_id, status = ret
            set_task_result(task_id, status)
            print("Task {} finihed successfully".format(task_id))
            running -= 1

        while True:
            while True:
                if running < 4:
                    task = get_next_task()
                    if task is not None:
                        break
                sleep(5)
            running += 1
            pool.apply_async(
                render,
                (task['id'], task['minx'], task['miny'], task['maxx'], task['maxy'], task['zoom']),
                callback=done
            )

    pool.join()


if __name__ == "__main__":
    print("Rendering map service.")
    main()
