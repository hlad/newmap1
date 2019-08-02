#!/bin/bash

IFS=', ' read -r -a BBOX_ARRAY <<< "$BBOX"

LON_START="${BBOX_ARRAY[0]}"
LAT_START="${BBOX_ARRAY[1]}"
LON_END="${BBOX_ARRAY[2]}"
LAT_END="${BBOX_ARRAY[3]}"

if [ -d "/stylesheets/import-sql" ]; then
    for f in /stylesheets/import-sql/*.sql; do
        echo "Coping $f"
        cp "$f" /sql/
    done
fi

echo "Generating /sql/20-fishnet.sql"
php /stylesheets/general/prepare-db/get-sql-fishnet.php $LON_START $LAT_START $LON_END $LAT_END $MIN_ZOOM $MAX_ZOOM > /sql/20-fishnet.sql

echo "Generating /sql/30-sql.sql"
php /stylesheets/general/prepare-db/get-sql.php $LON_START $LAT_START $LON_END $LAT_END $MIN_ZOOM $MAX_ZOOM > /sql/30-sql.sql

#echo "Generating /sql/40-sql-rect.sql"
#php /stylesheets/general/prepare-db/get-sql-rect.php $LON_START $LAT_START $LON_END $LAT_END $MIN_ZOOM $MAX_ZOOM > /sql/40-sql-rect.sql


