#!/bin/bash

IFS=', ' read -r -a BBOX_ARRAY <<< "$BBOX"

LON_START="${BBOX_ARRAY[0]}"
LAT_START="${BBOX_ARRAY[1]}"
LON_END="${BBOX_ARRAY[2]}"
LAT_END="${BBOX_ARRAY[3]}"

for f in /sql/*.sql; do
    echo "Backuping $f"
    mv -fb "$f" "$f.bak"
done

if [ -z "$1" ] || [ "$1" == "static" ]; then
  if [ -d "/stylesheets/import-sql" ]; then
      for f in /stylesheets/import-sql/*.sql; do
          if [ -z "$2" ] || [ -z "${f##*$2*}" ]; then
            echo "Coping $f"
            cp "$f" /sql/
          fi
      done
  fi
fi

if [ -z "$1" ] || [ "$1" == "fishnet" ]; then
  echo "Generating /sql/20-fishnet.sql"
  php /stylesheets/general/prepare-db/get-sql-fishnet.php $LON_START $LAT_START $LON_END $LAT_END $MIN_ZOOM $MAX_ZOOM > /sql/20-fishnet.sql
fi

if [ -z "$1" ] || [ "$1" == "dynamic" ]; then
  echo "Generating /sql/30-sql.sql"
  php /stylesheets/general/prepare-db/get-sql.php $LON_START $LAT_START $LON_END $LAT_END $MIN_ZOOM $MAX_ZOOM $2 > /sql/30-sql.sql
fi
