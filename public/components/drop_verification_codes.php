<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;

try {
    // Connect to MongoDB
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    
    // Drop the verification_codes collection
    $result = $database->dropCollection('verification_codes');
    
    echo json_encode([
        'success' => true, 
        'message' => 'verification_codes collection has been successfully dropped from the database'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'Error dropping collection: ' . $e->getMessage()
    ]);
}
?>
