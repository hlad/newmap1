import os
import math
from tqdm import tqdm
import asyncio
from asyncio import as_completed
import asyncpg
import numpy as np


def deg2num(lon_deg, lat_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
    return xtile, ytile


def num2deg(xtile, ytile, zoom):
    n = 2.0 ** zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return lon_deg, lat_deg


def calc_density(tblname, src_tblname, agg_queries, where_query, zoom):
    async def main(tblname, src_tblname, agg_queries, where_query, zoom):
        pool = await asyncpg.create_pool(
            host=os.environ['POSTGRES_HOST'],
            port=os.environ['POSTGRES_PORT'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
            database=os.environ['POSTGRES_DB']
        )

        agg_names, agg_queries = zip(*list(agg_queries.items()))

        agg_queries = ','.join(agg_queries)

        conn = await pool.acquire()
        try:
            await conn.execute('DROP TABLE IF EXISTS {}'.format(tblname))

            await conn.execute('''
                CREATE TABLE {}(
                    id SERIAL PRIMARY KEY,                    
                    {}
                )
            '''.format(tblname, ','.join('{} FLOAT NOT NULL'.format(n) for n in agg_names)))

            await conn.execute('''
                SELECT AddGeometryColumn ('{}','geom',4326,'POINT',2)
            '''.format(tblname))
        finally:
            await pool.release(conn)

        conn = await pool.acquire()
        try:
            value = await conn.fetchrow('''
                SELECT Box2D(ST_TRansform(ST_SetSrid(ST_estimatedextent('{}','way'),3857),  4326));
            '''.format(src_tblname))
            min_lon, min_lat, max_lon, max_lat = [float(y) for x in value[0][4:-1].split(' ') for y in x.split(',')]
        finally:
            await pool.release(conn)

        async def one_step(x, y, zoom):
            lon, lat = num2deg(x, y, zoom)
            lon1, lat2 = num2deg(x - 1, y - 1, zoom)
            lon2, lat1 = num2deg(x + 1, y + 1, zoom)

            async with pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT {}
                    FROM {} 
                    WHERE                            
                        ({}) AND
                        way && ST_Transform(
                            ST_SetSRID(
                                ST_MakeBox2D(
                                    ST_MakePoint($1,$2), 
                                    ST_MakePoint($3,$4)
                                )
                            , 4326), 3857);
                '''.format(agg_queries, src_tblname, where_query), lon1, lat1, lon2, lat2)

                await conn.execute('''
                    INSERT INTO {}({}, geom)
                    VALUES({}, ST_GeomFromText('POINT({} {})', 4326));
                '''.format(tblname, ','.join(agg_names), ','.join(map(str, tuple(row))), lon, lat))

                return lon, lat, row

        minx, maxy = deg2num(min_lon, min_lat, zoom)
        maxx, miny = deg2num(max_lon, max_lat, zoom)

        aws = [one_step(x, y, zoom) for x in np.arange(minx, maxx) for y in np.arange(miny, maxy)]

        for next_to_complete in tqdm(as_completed(aws), total=len(aws), desc=tblname):
            lon, lat, row = await next_to_complete

        conn = await pool.acquire()
        try:
            await conn.execute('''
                DROP INDEX IF EXISTS idx__{}__geom
            '''.format(tblname, tblname))

            await conn.execute('''
                CREATE INDEX idx__{}__geom ON {} USING GIST(geom)                
            '''.format(tblname, tblname))
        finally:
            await pool.release(conn)

        await pool.close()

    densemap = asyncio.get_event_loop().run_until_complete(main(tblname, src_tblname, agg_queries, where_query, zoom))

    return densemap


def main():
    calc_density('symbol_density', 'osm_symbol', {'density': 'COUNT(*)'}, "1=1", 13)
    calc_density('peak_density11', 'osm_peaks', {
        'average': 'COALESCE(avg(ele), 0)',
        'maximum': 'COALESCE(max(ele), 0)'
    }, "1=1", 11)


    calc_density('peak_density9', 'osm_peaks', {
        'average': 'COALESCE(avg(ele), 0)',
        'maximum': 'COALESCE(max(ele), 0)'
    }, "1=1", 9)


    calc_density('peak_density7', 'osm_peaks', {
        'average': 'COALESCE(avg(ele), 0)',
        'maximum': 'COALESCE(max(ele), 0)'
    }, "1=1", 7)


    calc_density('peak_density5', 'osm_peaks', {
        'average': 'COALESCE(avg(ele), 0)',
        'maximum': 'COALESCE(max(ele), 0)'
    }, "1=1", 5)



if __name__ == "__main__":
    main()


