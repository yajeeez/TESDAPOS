<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    $adminUser = [
        'email' => 'yajeee1209@gmail.com',
        'password' => password_hash('test123', PASSWORD_DEFAULT),
        'name' => 'Admin User',
        'role' => 'admin',
        'created_at' => new UTCDateTime(),
        'status' => 'active'
    ];
    
    $existingAdmin = $adminsCollection->findOne(['email' => 'yajeee1209@gmail.com']);
    
    if ($existingAdmin) {
        echo json_encode(['success' => true, 'message' => 'Admin user already exists']);
    } else {
        $result = $adminsCollection->insertOne($adminUser);
        if ($result->getInsertedId()) {
            echo json_encode(['success' => true, 'message' => 'Admin user created successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create admin user']);
        }
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
