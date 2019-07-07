#all: build/openmaptiles.tm2source/data.yml build/mapping.yaml build/tileset.sql

build:
	mkdir -p build/sql
	mkdir -p build/osmcsymbol
	mkdir -p build/pattern
	mkdir -p build/symbol
	mkdir -p build/shield
	mkdir -p build/cartocss
	mkdir -p build/mapnik

clean-docker:
	docker-compose down -v --remove-orphans
	docker-compose rm -fv
	docker volume ls -q | grep openmaptiles  | xargs -r docker volume rm || true

db-start:
	docker-compose up   -d postgres

psql: db-start
	docker-compose run --rm import-osm /usr/src/app/psql.sh

import-osm: db-start
	docker-compose run --rm import-osm

generate-sql: db-start
	docker-compose run --rm  generate-sql

generate-cartocss: db-start
	docker-compose run --rm  generate-cartocss

compile-cartocss: db-start
	docker-compose run --rm  compile-cartocss

generate-vodak-sql: db-start
	docker-compose run --rm  generate-vodak-sql

import-sql: db-start
	docker-compose run --rm import-sql

import-dem: db-start
	docker-compose run --rm import-dem

generate-osmcsymbols: db-start
	docker-compose run --rm  generate-osmcsymbols

generate-highway-access: db-start
	docker-compose run --rm  generate-highway-access

relations2lines: db-start
	docker-compose run --rm  relations2lines

import-osmsql: db-start
	docker-compose run --rm import-osm
	docker-compose run --rm import-sql

render-map: db-start
	docker-compose run --rm render-map

psql-list-tables:
	docker-compose run --rm import-osm /usr/src/app/psql.sh  -P pager=off  -c "\d+"

psql-pg-stat-reset:
	docker-compose run --rm import-osm /usr/src/app/psql.sh  -P pager=off  -c 'SELECT pg_stat_statements_reset();'

forced-clean-sql:
	docker-compose run --rm import-osm /usr/src/app/psql.sh -c "DROP SCHEMA IF EXISTS public CASCADE ; CREATE SCHEMA IF NOT EXISTS public; "
	docker-compose run --rm import-osm /usr/src/app/psql.sh -c "CREATE EXTENSION hstore; CREATE EXTENSION postgis; CREATE EXTENSION unaccent; CREATE EXTENSION fuzzystrmatch; CREATE EXTENSION osml10n; CREATE EXTENSION pg_stat_statements;"
	docker-compose run --rm import-osm /usr/src/app/psql.sh -c "GRANT ALL ON SCHEMA public TO public;COMMENT ON SCHEMA public IS 'standard public schema';"

pgclimb-list-views:
	docker-compose run --rm import-osm /usr/src/app/pgclimb.sh -c "select schemaname,viewname from pg_views where schemaname='public' order by viewname;" csv

pgclimb-list-tables:
	docker-compose run --rm import-osm /usr/src/app/pgclimb.sh -c "select schemaname,tablename from pg_tables where schemaname='public' order by tablename;" csv

psql-vacuum-analyze:
	@echo "Start - postgresql: VACUUM ANALYZE VERBOSE;"
	docker-compose run --rm import-osm /usr/src/app/psql.sh  -P pager=off  -c 'VACUUM ANALYZE VERBOSE;'

psql-analyze:
	@echo "Start - postgresql: ANALYZE VERBOSE ;"
	docker-compose run --rm import-osm /usr/src/app/psql.sh  -P pager=off  -c 'ANALYZE VERBOSE;'

list-docker-images:
	docker images | grep openmaptiles

refresh-docker-images:
	docker-compose pull --ignore-pull-failures

remove-docker-images:
	@echo "Deleting all openmaptiles related docker image(s)..."
	@docker-compose down
	@docker images | grep "openmaptiles" | awk -F" " '{print $$3}' | xargs --no-run-if-empty docker rmi -f


docker-unnecessary-clean:
	@echo "Deleting unnecessary container(s)..."
	@docker ps -a  | grep Exited | awk -F" " '{print $$1}' | xargs  --no-run-if-empty docker rm
	@echo "Deleting unnecessary image(s)..."
	@docker images | grep \<none\> | awk -F" " '{print $$3}' | xargs  --no-run-if-empty  docker rmi
