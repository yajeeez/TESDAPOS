<?php
header('Content-Type: application/json');

// Test MongoDB connection
try {
    require_once __DIR__ . '/../connection/MongoInventory.php';
    
    $mongo = new MongoInventory();
    
    echo json_encode([
        'success' => true,
        'message' => 'MongoDB connection successful!',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'MongoDB connection failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>