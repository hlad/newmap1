import os

import argparse

import asyncpg
import asyncio

import numpy as np

import math


def deg2num(lon_deg, lat_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
    return xtile, ytile


def add_task(mnx, mny, mxx, mxy, zoom):
    async def _do():

        query = '''
            INSERT INTO render_queue (minx,miny,maxx,maxy,zoom) 
            VALUES ($1, $2, $3, $4, $5)                             
        '''

        conn = await asyncpg.connect(
            host=os.environ['POSTGRES_HOST'],
            port=os.environ['POSTGRES_PORT'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
            database=os.environ['POSTGRES_DB']
        )
        await conn.execute(query, mnx, mny, mxx, mxy, zoom)
        await conn.close()

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(_do())


TILE_SIZE = 256
METATILE_SIZE = 12


def main():

    parser = argparse.ArgumentParser(description='Schelude redner region')

    parser.add_argument('min_lon', type=float)
    parser.add_argument('min_lat', type=float)
    parser.add_argument('max_lon', type=float)
    parser.add_argument('max_lat', type=float)
    parser.add_argument('zooms', type=lambda x: [int(a) for a in x.split(',')])

    args = parser.parse_args()

    min_lon = args.min_lon
    max_lon = args.max_lon
    min_lat = args.min_lat
    max_lat = args.max_lat
    zooms = args.zooms

    minx, maxx, miny, maxy, xs, ys = {}, {}, {}, {}, {}, {}
    for zoom in zooms:

        minx[zoom], maxy[zoom] = deg2num(min_lon, min_lat, zoom)
        maxx[zoom], miny[zoom] = deg2num(max_lon, max_lat, zoom)
        maxx[zoom] += 1
        maxy[zoom] += 1

        xs[zoom] = [(x, min(x + METATILE_SIZE, maxx[zoom])) for x in np.arange(minx[zoom], maxx[zoom], METATILE_SIZE)]
        ys[zoom] = [(y, min(y + METATILE_SIZE, maxy[zoom])) for y in np.arange(miny[zoom], maxy[zoom], METATILE_SIZE)]

    metatiles = [(mnx, mny, mxx, mxy, zoom) for zoom in zooms for mnx, mxx in xs[zoom] for mny, mxy in ys[zoom]]

    for mnx, mny, mxx, mxy, zoom in metatiles:
        add_task(mnx, mny, mxx, mxy, zoom)


if __name__ == "__main__":
    main()
