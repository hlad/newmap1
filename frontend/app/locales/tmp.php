<?php

$LANG = $argv[1];

$lines = file('tmp');

function translate($word,$lang) {
	$api_key = 'AIzaSyC4eZrHn05L6Pt7vDSTYK5I77z_UQgZt8o';
	$text = $word;
	$source="en";
	$target=$lang;
	 
	$url = 'https://www.googleapis.com/language/translate/v2?key=' . $api_key . '&q=' . rawurlencode($text);
	$url .= '&target='.$target;
	$url .= '&source='.$source;
	 
	$response = file_get_contents($url);
	$obj =json_decode($response,true); //true converts stdClass to associative array.
	if($obj != null)
	{
		if(isset($obj['error']))
		{
			return $word;
		}
		else
		{
			return $obj['data']['translations'][0]['translatedText'];
		}
	}
	else
		return $word;
}

//translate('World','cs');


foreach ($lines as $line_num => $line) {
	$tmp = explode("\t",$line);
	$translate = strtr(trim($tmp[1]),'_',' ');
	//printf("\t\"%s %s\": \"%s\",\n",ucfirst(trim($tmp[0])),trim($tmp[1]),ucfirst(translate($translate,$LANG)));		
	printf("\t\"%s %s\": \"%s\",\n",ucfirst(trim($tmp[0])),trim($tmp[1]),ucfirst($translate));
	usleep(1000);	
}

