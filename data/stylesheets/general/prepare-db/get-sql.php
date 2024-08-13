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
?>

CREATE INDEX IF NOT EXISTS i__symbols__way ON symbols USING GIST (way);
CREATE INDEX IF NOT EXISTS i__symbols__type ON symbols(type);
CREATE INDEX IF NOT EXISTS i__symbols__name ON symbols(name);

CREATE INDEX i__highways__type ON osm_highway(
    (CASE
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'footway' AND (
	(CASE
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('motorway','trunk','motorway_link','trunk_link') THEN 0
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','minor','service','residential','living_street','pedestrian') THEN (CASE
		    WHEN surface IN ('unpaved','compacted','fine_gravel','grass_paver') THEN 2
		    WHEN surface IN ('dirt','earth','ground','gravel','mud','sand','grass') THEN 3
		    ELSE 1
	    END)
	    WHEN highway = 'track' THEN (CASE
		    WHEN tracktype = 'grade1' THEN (CASE
			    WHEN surface IN ('asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20') THEN 1
			    WHEN surface IN ('unpaved','compacted','fine_gravel','grass_paver','gravel') THEN 3
			    WHEN surface IN ('dirt','earth','ground','mud','sand','grass') THEN 4
			    ELSE 2
		    END)
		    WHEN tracktype IN ('grade2','grade3') THEN (CASE
			    WHEN surface IN ('asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20','paved','cobblestone','concrete ','concrete:lanes','paving_stones:30','paving_stones:20','wood','metal') THEN 2
			    WHEN surface IN ('dirt','earth','ground','mud','sand','grass') THEN 4
			    ELSE 3
		    END)
		    ELSE (CASE
			    WHEN surface IN ('paved','asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20','paved','cobblestone','concrete ','concrete:lanes','paving_stones:30','paving_stones:20','wood','metal') THEN 3
			    WHEN surface IN ('sand','grass') THEN 5
			    ELSE 4
		    END)
	    END)
	    WHEN highway = 'road' THEN  (CASE
		    WHEN surface IN ('paved','asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20','paved','cobblestone','concrete ','concrete:lanes','paving_stones:30','paving_stones:20','wood','metal') THEN 3
		    WHEN surface IN ('sand','grass') THEN 5
		    ELSE 4
	    END)
	    WHEN highway IN ('cycleway','footway') THEN  (CASE
		    WHEN surface IN ('unpaved','compacted','fine_gravel','grass_paver','gravel') THEN 3
		    WHEN surface IN ('dirt','earth','ground','mud','sand','grass') THEN 4
		    ELSE 1
	    END)
	    WHEN highway = 'bridleway' THEN  (CASE
		    WHEN surface IN ('paved','asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20','paved','cobblestone','concrete ','concrete:lanes','paving_stones:30','paving_stones:20','wood','metal') THEN 2
		    ELSE 4
	    END)
	    WHEN highway = 'steps' THEN 7
	    ELSE (CASE
		    WHEN surface IN ('paved','asphalt','cobblestone:flattened','concrete:plates','paving_stones','paving_stones:30','paving_stones:20','paved','cobblestone','concrete ','concrete:lanes','paving_stones:30','paving_stones:20','wood','metal') THEN 3
		    WHEN surface IN ('sand','grass') THEN 5
		    ELSE 4
	    END)
	END)
    ) > 2 THEN 'path'
			    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('footway','cycleway','bridleway','motorway','motorway_link','trunk','trunk_link','primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','unclassified','minor','service','residential','living_street','pedestrian','track') THEN 'road'
			    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('path','steps') THEN 'path'
			    ELSE 'unknown'
		    END));


CREATE INDEX i__highways__grade ON osm_highway(
    (CASE
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('motorway','motorway_link') THEN 0
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('trunk','trunk_link') THEN 1
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('primary','primary_link') THEN 2
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('secondary','secondary_link') THEN 3
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('tertiary','tertiary_link') THEN 4
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('unclassified','minor') THEN 5
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('service') THEN 6
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('residential','living_street','pedestrian') THEN 7
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'track' THEN (CASE
            WHEN tracktype = 'grade1' THEN 8
            WHEN tracktype = 'grade2' THEN 9
            WHEN tracktype = 'grade3' THEN 10
            WHEN tracktype = 'grade4' THEN 11
            WHEN tracktype = 'grade5' THEN 12
            ELSE 13
        END)
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'road' THEN 13
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('footway','cycleway') THEN 8
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) IN ('bridleway','steps') THEN 9
        WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'path' THEN 12
        ELSE 13
    END)
);

CREATE INDEX i__highways__highway ON osm_highway(
    (CASE
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'motorway_link' THEN 'motorway'
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'trunk_link' THEN 'trunk'
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'primary_link' THEN 'primary'
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'secondary_link' THEN 'secondary'
	    WHEN (CASE WHEN highway='construction' THEN construction ELSE highway END) = 'tertiary_link' THEN 'tertiary'
	    ELSE (CASE WHEN highway='construction' THEN construction ELSE highway END)
	END)
);


CREATE INDEX i__highways__layer ON osm_highway(
		COALESCE(
			layer,
			CASE
				WHEN (bridge IS NOT NULL AND bridge IN ('yes','true','1','viaduct')) THEN 1
				WHEN tunnel IS NOT NULL AND tunnel IN ('culvert','yes','true','1') THEN -1
				ELSE 0
			END
		)
);

CREATE INDEX i__highways__bridge ON osm_highway(
    (CASE
        WHEN (bridge IS NOT NULL AND bridge IN ('yes','true','1','viaduct')) THEN CAST('yes' AS text)
        ELSE CAST('no' AS text)
    END)
);

CREATE INDEX i__highways__tunnel ON osm_highway(
(CASE
			    WHEN tunnel IS NOT NULL AND tunnel IN ('culvert','yes','true','1') THEN CAST('yes' AS text)
			    ELSE CAST('no' AS text)
		    END)
);
/*

CREATE INDEX i__text_waterway__way ON text_waterway USING GIST (way);
CREATE INDEX i__waterways__layer ON waterways (layer);
CREATE INDEX i__waterways__way ON waterways USING GIST (way);
*/

