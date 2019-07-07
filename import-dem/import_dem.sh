#!/bin/bash

first=1
for dem_file in `ls "$DEM_DIR"/*.tif | sort -V`; do
    echo "Importing $dem_file"
    if [ -n $first ]; then
        gdal_contour -f PostgreSQL -snodata -32768 -a ele -i 10 -lco OVERWRITE=yes $dem_file \
            "PG:host=$POSTGRES_HOST user=$POSTGRES_USER password=$POSTGRES_PASSWORD dbname=$POSTGRES_DB"
        first=''
    else
        gdal_contour -f PostgreSQL -snodata -32768 -a ele -i 10 -lco OVERWRITE=no  $dem_file \
            "PG:host=$POSTGRES_HOST user=$POSTGRES_USER password=$POSTGRES_PASSWORD dbname=$POSTGRES_DB OVERWRITE=NO"
    fi
done


