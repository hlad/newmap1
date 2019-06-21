<?php
    error_reporting(E_ALL & ~E_WARNING);

    if ( !defined('ROOT') ) {
        define('ROOT',dirname(dirname(dirname(__FILE__))));
    
        set_include_path (        
            get_include_path() . PATH_SEPARATOR .
            ROOT . '/general/'
        );
    }

    $dbname = $_ENV["POSTGRES_DB"];
    $dbuser = $_ENV["POSTGRES_USER"];
    $dbpass = $_ENV["POSTGRES_PASSWORD"];
    $dbhost = $_ENV["POSTGRES_HOST"];
    $dbport = $_ENV["POSTGRES_PORT"];

?>


<?php foreach( array(1000,10000) as $size ): ?>

DROP TABLE IF EXISTS fishnet<?php echo $size?>;
CREATE TABLE fishnet<?php echo $size?> (
    osm_id INTEGER 
);
SELECT AddGeometryColumn('public', 'fishnet<?php echo $size?>', 'way', 900913, 'GEOMETRY', 2);

<?php
$conn = pg_connect("host=$dbhost port=$dbport dbname=$dbname user=$dbuser password=$dbpass");

$result = pg_query($conn, "SELECT DISTINCT osm_id FROM osm_adminboundary WHERE admin_level = 2");
if (!$result) {
    echo pg_last_error();
    exit;
}

$osm_ids = pg_fetch_all($result);


?>

<?php foreach ( $osm_ids as $osm_id ): $osm_id = $osm_id['osm_id'] ?>

INSERT INTO fishnet<?php echo $size?> (osm_id,way) SELECT osm_id,ST_Collect(( 
        SELECT
            ST_Collect(ST_Intersection(
                ST_Transform(
                    ST_MakeLine(
                        ST_SetSRID(ST_MakePoint((SELECT ST_XMIN(ST_Transform(ST_Envelope(B.way),4326))), y::float/1000000.0),4326),
                        ST_SetSRID(ST_MakePoint((SELECT ST_XMAX(ST_Transform(ST_Envelope(B.way),4326))), y::float/1000000.0),4326)
                    ),
                    900913
                )
                ,B.way
            )) AS way
        FROM 
            generate_series(
                (SELECT floor(1000000*ST_YMIN(ST_Transform(ST_Envelope(B.way),4326)))::int),
                (SELECT ceiling(1000000*ST_YMAX(ST_Transform(ST_Envelope(B.way),4326)))::int),
                (SELECT
                    <?php echo $size?> * ceiling(
                        1000000 /
                            ST_Distance_Sphere(
                               ST_Centroid((ST_Transform(ST_Envelope(B.way),4326))),
                               ST_Translate(ST_Centroid((ST_Transform(ST_Envelope(B.way),4326))),0,1)
                            )
                    )::int                    
                )
            ) AS y
    ),(
        SELECT
            ST_Collect(ST_Intersection(
                ST_Transform(
                    ST_MakeLine(
                        ST_SetSRID(ST_MakePoint(y::float/1000000.0,(SELECT ST_YMIN(ST_Transform(ST_Envelope(B.way),4326)))),4326),
                        ST_SetSRID(ST_MakePoint(y::float/1000000.0,(SELECT ST_YMAX(ST_Transform(ST_Envelope(B.way),4326)))),4326)
                    ),
                    900913
                )
                ,B.way
            )) AS way
        FROM 
            generate_series(
                (SELECT floor(1000000*ST_XMIN(ST_Transform(ST_Envelope(B.way),4326)))::int),
                (SELECT ceiling(1000000*ST_XMAX(ST_Transform(ST_Envelope(B.way),4326)))::int),
                (SELECT
                    <?php echo $size?> * ceiling(
                        1000000 /
                            ST_Distance_Sphere(
                               ST_Centroid((ST_Transform(ST_Envelope(B.way),4326))),
                               ST_Translate(ST_Centroid((ST_Transform(ST_Envelope(B.way),4326))),1,0)
                            )
                    )::int                    
                )
            ) AS y
)) AS way
            
    FROM adminboundary B WHERE osm_id = <?php echo $osm_id ?> ORDER BY way_area DESC LIMIT 1;

<?php endforeach; ?>

<?php endforeach; ?>
