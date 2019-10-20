
$(document).ready(function(){	
	visits = $.cookie('visits') === undefined ? 1 : parseInt($.cookie('visits')) + 1;
	$.cookie('visits',visits, {expires: 5, path: '/'});	
	jQuery.getJSON('http://freegeoip.net/json/', function(location) {
		region = location.country_code;				
		window.map = new map1.Map({})		
	}
	).fail(function() {
		region = 'EU'
		window.map = new map1.Map({})
	});
	
	
})
