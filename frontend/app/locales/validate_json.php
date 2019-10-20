#!/usr/bin/env php
<?php

$json = json_encode(file_get_contents($argv[1]));


var_dump($json);

