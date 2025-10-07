<?php
// Simulate what the JavaScript is trying to do
echo "Simulating JavaScript fetch...\n";

// Test the paths that JavaScript would use
$paths = [
    '../admin/fetch_products.php',
    '../connection/fetch_products.php',
    '/admin/fetch_products.php',
    '/connection/fetch_products.php'
];

foreach ($paths as $path) {
    echo "\nTesting path: $path\n";
    
    // Check if file exists
    $fullPath = __DIR__ . '/' . $path;
    echo "File exists: " . (file_exists($fullPath) ? 'YES' : 'NO') . "\n";
    
    if (file_exists($fullPath)) {
        echo "File size: " . filesize($fullPath) . " bytes\n";
    }
}

// Test actual HTTP requests
echo "\n--- Testing HTTP Requests ---\n";

$urls = [
    'http://localhost:8000/admin/fetch_products.php',
    'http://localhost:8000/connection/fetch_products.php'
];

foreach ($urls as $url) {
    echo "\nTesting URL: $url\n";
    
    $context = stream_context_create([
        "http" => [
            "method" => "GET",
            "header" => "Accept: application/json\r\n"
        ]
    ]);
    
    $result = @file_get_contents($url, false, $context);
    
    if ($result === false) {
        echo "ERROR: Could not fetch from URL\n";
    } else {
        echo "SUCCESS: URL returned data\n";
        // Try to parse JSON
        $data = json_decode($result, true);
        if ($data && isset($data['success'])) {
            echo "JSON parsed successfully. Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            if (isset($data['count'])) {
                echo "Product count: " . $data['count'] . "\n";
            }
        } else {
            echo "JSON parsing failed\n";
        }
    }
}
?>