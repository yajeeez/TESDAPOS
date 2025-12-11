<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

try {
    // Connect to MongoDB
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $collection = $database->selectCollection('verification_codes');
    
    // Find all verification codes for the email
    $email = 'yajeee1209@gmail.com';
    $codes = $collection->find(['email' => $email])->toArray();
    
    echo "Found " . count($codes) . " verification codes for $email\n\n";
    
    foreach ($codes as $code) {
        echo "Code: " . $code['code'] . "\n";
        echo "Created: " . $code['created_at']->toDateTime()->format('Y-m-d H:i:s') . "\n";
        echo "Used: " . ($code['used'] ? 'Yes' : 'No') . "\n";
        echo "Expired: " . (time() - $code['created_at']->toDateTime()->getTimestamp() > 900 ? 'Yes' : 'No') . "\n";
        echo "---\n";
    }
    
    // Test the specific code from the screenshot
    $testCode = '392150';
    $cutoffTime = new UTCDateTime((time() - 900) * 1000); // 15 minutes ago
    
    $verification = $collection->findOne([
        'email' => $email,
        'code' => $testCode,
        'used' => false,
        'created_at' => ['$gte' => $cutoffTime]
    ]);
    
    echo "\nTesting code: $testCode\n";
    echo "Found valid code: " . ($verification ? 'Yes' : 'No') . "\n";
    
    if ($verification) {
        echo "Code details:\n";
        echo "  Code: " . $verification['code'] . "\n";
        echo "  Created: " . $verification['created_at']->toDateTime()->format('Y-m-d H:i:s') . "\n";
        echo "  Used: " . ($verification['used'] ? 'Yes' : 'No') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
