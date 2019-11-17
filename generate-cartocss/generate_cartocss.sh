#!/bin/bash

generate_cartocss(){
  ZOOMS=$1

  echo ""
  echo "================================"
  echo "ZOOM: \"$ZOOMS\""
  echo "================================"
  echo ""
  export ZOOMS

  if [ -z "$2" ] || [ "$2" == "carto" ]; then
    echo ""

    echo "Generating cartocss files"
    echo "--------------------------------"
    mkdir -p "/cartocss/$ZOOMS/style"
    for f in /stylesheets/general/style/*.mss.php; do
        f=`basename "$f"`
        if [ -z "$3" ] || [ -z "${f##$3.mss*}" ]; then
          f2=${f%.*}
          printf "~$f2 "
          php "/stylesheets/general/style.php" $f > "/cartocss/$ZOOMS/style/~$f2"
        fi
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
      if [ -z "$4" ]  || [ "$4" == "$LAYER" ]; then
        RENDER_LAYER=$LAYER
        export RENDER_LAYER
        printf "/cartocss/$ZOOMS/~map-$LAYER.mml "
        php "/stylesheets/general/map.mml.php" > "/cartocss/$ZOOMS/~map-$LAYER.mml"
      fi
    done

  fi

  if [ -z "$2" ] || [ "$2" == "shields" ]; then
    echo ""

    echo ""
    echo "Generating shield files"
    echo "--------------------------------"
    for f in /stylesheets/general/shield/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""
  fi

  if [ -z "$2" ] || [ "$2" == "patterns" ]; then
    echo ""
    echo "Generating pattern files"
    echo "--------------------------------"
    for f in /stylesheets/general/pattern/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""
  fi

  if [ -z "$2" ] || [ "$2" == "symbols" ]; then
    echo ""
    echo "Generating symbol files"
    echo "--------------------------------"
    for f in /stylesheets/general/symbol/*.svgs.php; do
        printf "$f "
        php $f
    done
    echo ""
  fi

  echo ""
}

for ((ZOOMS=MIN_ZOOM;ZOOMS<=MAX_ZOOM;ZOOMS++)); do
    if [ -z "$4" ] || [ "$4" == $ZOOMS ]; then
      generate_cartocss $ZOOMS $1 $2 $3 &
    fi
done

wait

echo ""
