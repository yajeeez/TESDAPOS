<?php
// Prevent any output before headers
ob_start();

// Set JSON header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Clean output buffer and send JSON response
ob_clean();
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
ob_end_flush();
?>
