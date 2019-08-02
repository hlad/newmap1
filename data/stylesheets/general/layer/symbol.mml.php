<?php
	require_once "sql/symbol.sql.php";
?>
{
	"id": "symbol-priority<?php echo $priority?>",
	"name": "symbol-priority<?php echo $priority?>",
	"class": "symbol priority<?php echo $priority?>",
	"srs": "<?php echo SRS900913?>",
	<?php echo ds_pgis(sql_symbol_short($priority));?>
	<?php if( $priority < 0 ): ?>
	,"properties" : {
		 "clear-label-cache": "true"
	}
	<?php endif; ?>
}


