<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    // Update admin user by ID with plain text password
    $adminId = '693a6be322f8f34bde060edc';
    
    $result = $adminsCollection->updateOne(
        ['_id' => new ObjectId($adminId)],
        ['$set' => [
            'password' => '$2y$10$Xx5ZerfFLNOngu8JUYmtmeCSz6dTLING09s0gtjvIr1r7ndiw2a1C',
            'name' => 'Admin User',
            'role' => 'admin',
            'status' => 'active'
        ]]
    );
    
    if ($result->getModifiedCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Admin password updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Admin not found or no changes made']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
