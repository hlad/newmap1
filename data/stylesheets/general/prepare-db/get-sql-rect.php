<?php
    error_reporting(E_ALL & ~E_WARNING);

    $LON_START = $argv[1] - ($argv[3] - $argv[1]) * 0.15;
    $LAT_START = $argv[2] - ($argv[4] - $argv[2]) * 0.05;
    $LON_END = $argv[3] + ($argv[3] - $argv[1]) * 0.15;
    $LAT_END = $argv[4] + ($argv[4] - $argv[2]) * 0.05;

    $POSTFIX = $argv[5] . '_' . $argv[6];

    if ( !defined('ROOT') ) {
        define('ROOT',dirname(dirname(dirname(__FILE__))));
    
        set_include_path (        
            get_include_path() . PATH_SEPARATOR .
            ROOT . '/general/'
        );
    }        
    
    $sqls = array(        
        array('waters','waterways',sql_waterway),
        array('boundary','adminboundaries',sql_boundary),
        array('text-waters','text_waterway',sql_text_waterway),
    );
    
    foreach ( $sqls as $sql ) {
        require_once "sql/{$sql[0]}.sql.php";
        echo "DROP TABLE IF EXISTS {$sql[1]}_$POSTFIX;\n";    
        echo "CREATE TABLE {$sql[1]}_$POSTFIX AS " . $sql[2]() . ";\n";
    }
