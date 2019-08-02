<?php
	require_once "sql/contour.sql.php";
	require_once "conf/shapefile.php";
?>
{
	"id": "contour",
	"name": "contour",
	"class": "contour",
	"srs": "<?php echo SRS900913?>",
	<?php echo ds_pgis(sql_contour());?>
}

