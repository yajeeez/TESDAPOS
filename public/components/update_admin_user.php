<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\ObjectId;

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    // Update the specific admin user by ID
    $adminId = '693a6be322f8f34bde060edc';
    
    $updateData = [
        'email' => 'yajeee1209@gmail.com',
        'password' => 'admin123', // Plain text password as requested
        'name' => 'Admin User',
        'role' => 'admin',
        'created_at' => new UTCDateTime('2025-12-11T06:59:47.700+00:00'),
        'status' => 'active'
    ];
    
    $result = $adminsCollection->updateOne(
        ['_id' => new ObjectId($adminId)],
        ['$set' => ['password' => 'admin123']]
    );
    
    if ($result->getModifiedCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Admin user updated successfully with plain text password']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Admin user not found or no changes made']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
