<?php
    error_reporting(E_ALL & ~E_WARNING);

    if ( !defined('ROOT') ) {
        define('ROOT',dirname(dirname(dirname(__FILE__))));
    
        set_include_path (        
            get_include_path() . PATH_SEPARATOR .
            ROOT . '/general/'
        );
    }

    $what = isset($argv[7]) && !empty($argv[7]) ? explode(',', $argv[7]) : [];

    //require_once 'place_short_names.list.php';
    
    //require_once 'river_names.list.php';
    
    $sqls = array(
        array('symbol','symbols',sql_symbol,'table'),
//         array('text-symbol','text_symbol',sql_text_symbol),
//         array('shield-peak','peak',sql_shieldPeak),
        array('text-place','places',sql_text_place),
//         array('text-highway','text_highway',sql_text_highway),
//         array('text-highway','highways_access',sql_text_highway_access),
        array('aeroway','aeroways',sql_aeroway),
        array('aeroway','aeroareas',sql_aeroarea),
        array('aerialway','aerialways',sql_aerialway),
        array('aerialway','aerialpoints',sql_aerialpoint),
        array('barrier','barriers',sql_barrier),
        array('barrier','barrierpoints',sql_barrierpoint),
        array('pisteway','pisteways',sql_pisteway),
        array('pisteway','pisteareas',sql_pistearea),
        array('power','powers',sql_power),
        array('power','powerpoints',sql_powerpoint),
        array('highway','highways',sql_highway),
        array('highway','highway_areas',sql_highway_area),
        array('landcover','landcovers',sql_landcover),
        array('landcover','landcover_lines',sql_landcover_line),
        array('landcover','landcover_points',sql_landcover_point),
        array('railway','railways',sql_railway),
        array('waters','waterways',sql_waterway),
        //array('text-waters','text_waterway',sql_text_waterway),
        array('waters','waterareas',sql_waterarea),
        array('waters','waterpoints',sql_waterpoint),
        array('boundary','adminboundaries',sql_boundary),
        array('boundary','paboundaries',sql_boundary_pa),
        array('building','buildings',sql_building),

    );
    
    foreach ( $sqls as $sql ) {
        if ( empty($what) || in_array($sql[0], $what) ) {
            require_once "sql/{$sql[0]}.sql.php";
            $type = count($sql) > 3 ? $sql[3] : 'VIEW';
            echo "DROP {$type} IF EXISTS {$sql[1]} CASCADE;\n";
            echo "CREATE {$type} {$sql[1]} AS (" . $sql[2]() . ");\n";
        }
    }


    /*
    foreach ( $PLACE_SHORT_NAMES as $pattern => $__tmp ) {
        list($shortName,$veryShortName) = $__tmp;
        if (empty($veryShortName) ) $veryShortName = $shortName;
        echo "UPDATE osm_place SET name_short = regexp_replace(name_short,'$pattern','$shortName') WHERE name_short ~ '$pattern';\n";
        echo "UPDATE osm_place SET name_very_short = regexp_replace(name_very_short,'$pattern','$veryShortName') WHERE name_very_short ~ '$pattern';\n";
    }
    */
    

/*

CREATE INDEX i__text_waterway__way ON text_waterway USING GIST (way);
CREATE INDEX i__waterways__layer ON waterways (layer);
CREATE INDEX i__waterways__way ON waterways USING GIST (way);
*/
