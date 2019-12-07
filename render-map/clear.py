import os

import argparse
from tqdm import tqdm

import math


def deg2num(lon_deg, lat_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 2.0 ** zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.log(math.tan(lat_rad) + (1 / math.cos(lat_rad))) / math.pi) / 2.0 * n)
    return xtile, ytile


def main():

    parser = argparse.ArgumentParser(description='Schelude render region')

    min_lon, min_lat, max_lon, max_lat = [float(a) for a in os.environ['BBOX'].split(',')]
    zooms = list(range(int(os.environ['MIN_ZOOM']), int(os.environ['MAX_ZOOM']) + 1))

    parser.add_argument('min_lon', type=lambda x: float(x) if x.strip() != '' else min_lon)
    parser.add_argument('min_lat', type=lambda x: float(x) if x.strip() != '' else min_lat)
    parser.add_argument('max_lon', type=lambda x: float(x) if x.strip() != '' else max_lon)
    parser.add_argument('max_lat', type=lambda x: float(x) if x.strip() != '' else max_lat)
    parser.add_argument('zooms', type=lambda x: [int(a) for a in x.split(',')] if x.strip() != '' else zooms)

    args = parser.parse_args()

    min_lon = args.min_lon
    max_lon = args.max_lon
    min_lat = args.min_lat
    max_lat = args.max_lat
    zooms = args.zooms

    for zoom in tqdm(zooms, desc='Remving files'):
        minx, maxy = deg2num(min_lon, min_lat, zoom)
        maxx, miny = deg2num(max_lon, max_lat, zoom)
        for x in tqdm(range(minx, maxx + 1), desc='X', leave=False):
            for y in tqdm(range(miny, maxy + 1), desc='Y', leave=False):
                for ext in ['jpg', 'js', 'js.tmp']:
                    path = "/render/{}/{}/{}.{}".format(zoom, x, y, ext)
                    if os.path.exists(path):
                        os.remove(path)
            path = "/render/{}/{}".format(zoom, x)
            if os.path.exists(path) and not os.listdir(path):
                os.rmdir(path)
        path = "/render/{}".format(zoom)
        if os.path.exists(path) and not os.listdir(path):
            os.rmdir(path)


if __name__ == "__main__":
    main()
