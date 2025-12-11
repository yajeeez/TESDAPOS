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
    
    // Find admin by email and update password
    $result = $adminsCollection->updateOne(
        ['email' => 'yajeee1209@gmail.com'],
        ['$set' => ['password' => 'admin123']]
    );
    
    echo json_encode([
        'success' => $result->getModifiedCount() > 0,
        'message' => $result->getModifiedCount() > 0 ? 'Admin password updated to admin123' : 'Admin not found',
        'modified_count' => $result->getModifiedCount()
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
