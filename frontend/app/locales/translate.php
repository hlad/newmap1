<?php

function translate($word,$lang) {

	$api_key = 'AIzaSyC4eZrHn05L6Pt7vDSTYK5I77z_UQgZt8o';
	$text = 'How are you';
	$source="en";
	$target="cs";
	 
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
