<?php
header('Content-Type: application/json');
try {
    require_once __DIR__ . '/../connection/MongoInventory.php';
    $mongo = new MongoInventory();
    echo json_encode(['success' => true, 'message' => 'MongoDB is connected!']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'MongoDB error: ' . $e->getMessage()]);
}
?>