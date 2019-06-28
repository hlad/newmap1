#!/bin/bash

for ((ZOOMS=MIN_ZOOM;ZOOMS<=MAX_ZOOM;ZOOMS++)); do
    echo ""
    echo "================================"
    echo "ZOOM: \"$ZOOMS\""
    echo "================================"
    echo ""
    export ZOOMS
    echo ""
    echo "Generating cartocss files"
    echo "--------------------------------"
    mkdir -p "/cartocss/$ZOOMS/style"
    for f in /stylesheets/general/style/*.mss.php; do
        f=`basename "$f"`
        f2=${f%.*}
        printf "~$f2 "
        php "/stylesheets/general/style.php" $f > "/cartocss/$ZOOMS/style/~$f2"
    done
    echo ""

    echo ""
    echo "Generating cartocss mml files"
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
		php "/stylesheets/general/map.mml.php" > "/cartocss/$ZOOMS/~map-$LAYER.mml"
	done
	echo ""

    echo ""
    echo "Generating shield files"
    echo "--------------------------------"
    for f in /stylesheets/general/shield/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""

    echo ""
    echo "Generating pattern files"
    echo "--------------------------------"
    for f in /stylesheets/general/pattern/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""

    echo ""
    echo "Generating symbol files"
    echo "--------------------------------"
    for f in /stylesheets/general/symbol/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""

    echo ""

done