FROM geographica/gdal2:2.4.1

ENV DEM_DIR=/dem
ENV HILLSHADE_DIR=/hillshade

RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client postgis \
    && rm -rf /var/lib/apt/lists/*

VOLUME /dem

COPY . /usr/src/app/
WORKDIR /usr/src/app



CMD ["./import_dem.sh"]
