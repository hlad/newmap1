<?php
require_once "sql/contour.sql.php";

function sql_textContour($cols = '0',$where = '1 = 1') {
return <<<EOD
	SELECT
		wkb_geometry AS way,
		modulo,
		ele,
		$cols
	FROM {$GLOBALS['PGIS_TBL_CONTOUR']}
	WHERE
		    modulo IN (100,200,500)
		AND ($where)		
EOD;
}
