#!/bin/bash

for ((ZOOMS=MIN_ZOOM;ZOOMS<=MAX_ZOOM;ZOOMS++)); do
    echo ""
    echo "================================"
    echo "ZOOM: \"$ZOOMS\""
    echo "================================"
    echo ""
    export ZOOMS
    echo ""
    echo "Compiling cartocss"
    echo "--------------------------------"
    if [ $ZOOMS -ge 9 ]; then
		OUTPUT_LAYERS="landcover countryfill hillshade building accessarea boundary route way ferry contour fishnet symbol text"
	else
		OUTPUT_LAYERS="landcover countryfill hillshade boundary way,fishnet,symbol text,countrytext gridinfo"
	fi

	for LAYER in $OUTPUT_LAYERS; do
		RENDER_LAYER=$LAYER
		export RENDER_LAYER
		printf "/cartocss/$ZOOMS/~map-$LAYER.mml "
		mkdir -p "/mapnik/$ZOOMS/"
		carto "/cartocss/$ZOOMS/~map-$LAYER.mml" | grep -v "^\\[millstone\\]" > "/mapnik/$ZOOMS/~map-$LAYER.mml"

		sed -i "s/'\\\\a'/'\n'/g"  "/mapnik/$ZOOMS/~map-$LAYER.mml"
		sed -i "s/background-color=\"#[A-Fa-f0-9]*\"/background-color=\"transparent\"/g"  "/mapnik/$ZOOMS/~map-$LAYER.mml"
	done
done