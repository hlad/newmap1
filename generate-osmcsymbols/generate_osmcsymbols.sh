#!/bin/bash

echo "Converting svgs to pngs"
cd /osmcsymbol
for f in *.svg; do
     convert  +antialias -background transparent $f -resize 128 /osmcsymbol_png/${f%.*}.png
done

echo "Generating osmcsymbols"
cd /usr/src/app
python ./generate_osmcsymbols.py


