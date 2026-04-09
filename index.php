<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 *
 * This file allows the application to run without /public in the URL.
 * It forwards all requests to the public/index.php front controller.
 */

// Set the public directory as the working directory
chdir(__DIR__ . '/public');

// Load the front controller
require __DIR__ . '/public/index.php';
