<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../connection/MongoInventory.php';

try {
    $mongo = new MongoInventory();
    echo json_encode([
        'success' => true, 
        'message' => 'MongoDB connection successful',
        'database' => 'TESDAPOS1',
        'collection' => 'Inventory'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false, 
        'message' => 'MongoDB connection failed: ' . $e->getMessage()
    ]);
}
?>