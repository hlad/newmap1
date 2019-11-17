#!/bin/bash

compile_layer(){
  ZOOMS=$1
  LAYER=$2

  RENDER_LAYER=$LAYER
  export RENDER_LAYER
  printf "/cartocss/$ZOOMS/~map-$LAYER.mml "
  mkdir -p "/mapnik-styles/$ZOOMS/"
  carto "/cartocss/$ZOOMS/~map-$LAYER.mml" | grep -v "^\\[millstone\\]" > "/mapnik-styles/$ZOOMS/~map-$LAYER.xml"

  sed -i "s/'\\\\a'/'\n'/g"  "/mapnik-styles/$ZOOMS/~map-$LAYER.xml"
  sed -i "s/background-color=\"#[A-Fa-f0-9]*\"/background-color=\"transparent\"/g"  "/mapnik-styles/$ZOOMS/~map-$LAYER.xml"
}

compile_layers(){
  ZOOMS=$1

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
	  if [ -z "$2" ] || [ "$2" == "$LAYER" ]; then
      compile_layer $ZOOMS $LAYER &
    fi
  done

  wait
}

for ((ZOOMS=MIN_ZOOM;ZOOMS<=MAX_ZOOM;ZOOMS++)); do
  if [ -z "$2" ] || [ "$2" == $ZOOMS ]; then
	  compile_layers $ZOOMS $1 &
	fi
done

wait

echo ""
