FROM openmaptiles/postgis:2.9

ENV SQL_DIR=/sql

VOLUME /sql

COPY . /usr/src/app/
WORKDIR /usr/src/app



CMD ["./import_sql.sh"]
