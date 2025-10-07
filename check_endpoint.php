<?php
// Check if the admin endpoint works
echo "Testing admin endpoint...\n";

$context = stream_context_create([
    "http" => [
        "method" => "GET",
        "header" => "Accept: application/json\r\n"
    ]
]);

$result = file_get_contents('http://localhost:8000/admin/fetch_products.php', false, $context);

if ($result === false) {
    echo "ERROR: Could not fetch from admin endpoint\n";
} else {
    echo "SUCCESS: Admin endpoint returned data\n";
    echo "Data: " . substr($result, 0, 100) . "...\n";
}

echo "\nTesting connection endpoint...\n";

$result2 = file_get_contents('http://localhost:8000/connection/fetch_products.php', false, $context);

if ($result2 === false) {
    echo "ERROR: Could not fetch from connection endpoint\n";
} else {
    echo "SUCCESS: Connection endpoint returned data\n";
    echo "Data: " . substr($result2, 0, 100) . "...\n";
}
?>