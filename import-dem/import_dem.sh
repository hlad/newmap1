#!/bin/bash

echo "######################"
echo "# Importing contours #"
echo "######################"
echo ""
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


echo "#######################"
echo "# Importing hillshade #"
echo "#######################"
echo ""

for dem_file in `ls "$DEM_DIR"/*.tif | sort -V`; do
    dem_base=$(basename $dem_file)
    echo "$HILLSHADE_DIR/$dem_base"
    gdaldem hillshade -z 3 -alt 66 $dem_file "$HILLSHADE_DIR/$dem_base"
done


raster2pgsql -c -I -Y -t 256x256 $HILLSHADE_DIR/*.tif hillshade | PGPASSWORD=$POSTGRES_PASSWORD psql -U $POSTGRES_USER -d $POSTGRES_DB -h $POSTGRES_HOST -p $POSTGRES_PORT
