<?php
    require_once "conf/symbol.conf.php";
    require_once "conf/text.conf.php";
?>

<?php foreach ( $RENDER_ZOOMS as $zoom ):?>
    .symbol[zoom = <?php echo $zoom?>] {
	<?php $i = 0; foreach ( $SYMBOL AS $selector => $a ): ++$i; ?>
	     <?php if ( !empty($a['zooms']) && array_key_exists($zoom, $a['zooms']) ): ?>
		<?php $pr = $a['zooms'][$zoom] > 2 ? $a['zooms'][$zoom] - 2 : 0 ?>
		<?php $size = exponential($a['symbol-size'],$zoom)?>
		.priority<?php echo $pr ?> {
		    [type = <?php echo $i?>] {
		        shield-placement: point;

		        shield-face-name: "<?php echo FONT_BOOK_SANS ?>";
			    shield-name: "";
			    shield-placement-type: simple;
				shield-placements: "X,N,S,E,W,NE,SE,NW,SW";

			<?php if ( !empty($a['symbol-file']) ): ?>
			     shield-file: url('/symbol/~<?php echo $a['symbol-file']?>-<?php echo $zoom?>-<?php echo empty($a['symbol-color']) ? '#000000' : linear($a['symbol-color'],$zoom)?>.png');
			<?php endif; ?>
		    }

		}
	    <?php endif; ?>
	<?php endforeach; ?>
    }    
<?php endforeach;?>

