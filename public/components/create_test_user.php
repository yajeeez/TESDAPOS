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
    
    // Create users collection if it doesn't exist
    $usersCollection = $database->selectCollection('users');
    
    // Create test user
    $testUser = [
        'email' => 'yajeee1209@gmail.com',
        'password' => password_hash('test123', PASSWORD_DEFAULT),
        'name' => 'Test User',
        'role' => 'user',
        'created_at' => new UTCDateTime(),
        'status' => 'active'
    ];
    
    // Check if user already exists
    $existingUser = $usersCollection->findOne(['email' => 'yajeee1209@gmail.com']);
    
    if ($existingUser) {
        echo json_encode(['success' => true, 'message' => 'Test user already exists']);
    } else {
        // Insert test user
        $result = $usersCollection->insertOne($testUser);
        
        if ($result->getInsertedId()) {
            echo json_encode(['success' => true, 'message' => 'Test user created successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create test user']);
        }
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
