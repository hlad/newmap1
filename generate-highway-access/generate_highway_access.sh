#!/bin/bash

echo "Converting svgs to pngs"
cd /highway_access
for f in *.svg; do
     convert  +antialias -background transparent $f -resize 128 /tmp/${f%.*}.png
done

echo "Generating highwayaccess"
cd /usr/src/app
python ./generate_highway_access.py


