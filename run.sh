#!/bin/bash

sudo rm -rf ./build

make forced-clean-sql

make build


make import-osm

make import-dem

make generate-sql

make generate-styles

make generate-cartocss

make compile-cartocss

make generate-vodak-sql

make import-sql

make generate-osmcsymbols

make calc-densities

