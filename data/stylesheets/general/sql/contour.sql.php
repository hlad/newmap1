<?php
require_once "sql/_common.sql.php";

function sql_contour($cols = '0',$where = '1 = 1') {
return <<<EOD
	SELECT 
		wkb_geometry AS way,
		modulo,
		ele,
		$cols
	FROM {$GLOBALS['PGIS_TBL_CONTOUR']}
	WHERE
		($where)
EOD;
}
