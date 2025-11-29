<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    $result = $mongoOrders->getAllOrders();
    
    echo json_encode($result);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching orders: ' . $e->getMessage()
    ]);
}
?>
