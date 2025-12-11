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
    
    // Check if admin exists by ID
    $adminId = '693a6be322f8f34bde060edc';
    
    $admin = $adminsCollection->findOne(['_id' => new ObjectId($adminId)]);
    
    if ($admin) {
        echo json_encode([
            'success' => true, 
            'message' => 'Admin found',
            'admin' => [
                'id' => (string)$admin['_id'],
                'email' => $admin['email'],
                'name' => $admin['name'],
                'role' => $admin['role'],
                'password' => $admin['password']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Admin not found with that ID']);
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
