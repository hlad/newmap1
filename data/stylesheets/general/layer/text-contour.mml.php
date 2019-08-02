<?php
	require_once "sql/text-contour.sql.php";
	require_once "conf/shapefile.php";
?>
{
	"id": "textContour-priority<?php echo $priority?>",
	"name": "textContour-priority<?php echo $priority?>",
	"class": "textContour priority<?php echo $priority?>",
	"srs": "<?php echo SRS900913?>",
	<?php echo ds_pgis(sql_textContour());?>
}

