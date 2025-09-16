<?php
// Debug endpoint to test basic functionality
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'success' => true,
    'message' => 'PHP endpoint is working!',
    'timestamp' => date('Y-m-d H:i:s'),
    'request_method' => $_SERVER['REQUEST_METHOD'],
    'post_data' => $_POST,
    'files_data' => $_FILES,
    'php_version' => phpversion(),
    'mongodb_extension' => extension_loaded('mongodb') ? 'Available' : 'Not Available'
]);
?>