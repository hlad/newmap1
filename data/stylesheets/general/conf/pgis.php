<?php


$PGIS_TBL_PREFIX = 'planet_osm';

function ds_pgis($table, $geometry_field = 'way') {
	return '"Datasource": ' . json_encode(array(
		'table'              => '(' . trim($table) . ') AS data',
		'type'               => 'postgis',
		'password'           => $_ENV['POSTGRES_PASSWORD'],
		'host'               => $_ENV['POSTGRES_HOST'],
		'port'               => $_ENV['POSTGRES_PORT'],
		'user'               => $_ENV['POSTGRES_USER'],
		'dbname'             => $_ENV['POSTGRES_DB'],
		'persist_connection' => true,
		'cache-features'     => true,
		'connect_timeout'    => 60,
		'max_size'           => 10,
		'initial_size'       => 10,
		'estimate_extent'    => false,
		'extent'          => '-20037508,-19929239,20037508,19929239',
		'max_async_connection' => 4,
		'geometry_field'     => $geometry_field,
		'srid'               => 900913,
	));
}

$PGIS_TBL_POINT = $PGIS_TBL_PREFIX . '_point';
$PGIS_TBL_LINE = $PGIS_TBL_PREFIX . '_line';
$PGIS_TBL_ROAD = $PGIS_TBL_PREFIX . '_road';
$PGIS_TBL_POLYGON = $PGIS_TBL_PREFIX . '_polygon';
$PGIS_TBL_ROUTE = $PGIS_TBL_PREFIX . '_routes2';
$PGIS_TBL_CONTOUR = 'contour';

