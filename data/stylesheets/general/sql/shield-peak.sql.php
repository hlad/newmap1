<?php
require_once "inc/utils.php";
require_once "conf/pgis.php";
require_once "conf/shield-peak.conf.php";
require_once "sql/_common.sql.php";

function sql_shieldPeak_short() {
    return "
	SELECT way,name,ele,round(grade) as grade FROM peak ORDER BY grade DESC
    ";
}

function sql_shiledPeakGrade() {
return <<<EOD
    (SELECT (-20 + 2/log(2) * log(Avg(d)/3.318)) FROM (SELECT ST_Distance(p.way, p2.way) AS d FROM osm_peaks P2 WHERE p2.ele > p.ele ORDER BY p.way <-> p2.way LIMIT 5) T)
EOD;
}


function sql_shieldPeak($cols = '0',$where = '1 = 1') {
    $gradeSQL = sql_shiledPeakGrade();
return <<<EOD
	SELECT
		P.way AS way,
		P.ele AS ele,
		P.name AS name,
		P.osm_id,
		    $gradeSQL AS
		grade
	FROM osm_peaks P
	WHERE 
		    P."natural" = 'peak'
		AND ((P.name IS NOT NULL AND P.name<>'') AND P.ele IS NOT NULL)
		AND ($where)
EOD;
}
