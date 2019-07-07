FROM geographica/gdal2:2.4.1

ENV DEM_DIR=/dem

VOLUME /dem

COPY . /usr/src/app/
WORKDIR /usr/src/app



CMD ["./import_dem.sh"]
