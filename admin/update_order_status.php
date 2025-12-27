<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, PATCH');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../connection/MongoOrders.php';
require_once __DIR__ . '/../includes/audit_logger.php';

try {
    // Get JSON input
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);
    
    if (!$data || !isset($data['order_id']) || !isset($data['status'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing required fields: order_id and status'
        ]);
        exit;
    }
    
    $orderId = $data['order_id'];
    $newStatus = $data['status'];
    
    // Get cashier info if provided
    $servedBy = isset($data['served_by']) ? $data['served_by'] : null;
    $servedByUsername = isset($data['served_by_username']) ? $data['served_by_username'] : null;
    $servedAt = isset($data['served_at']) ? $data['served_at'] : null;
    
    // Validate status
    $allowedStatuses = ['Pending', 'Approved', 'Served', 'Canceled'];
    if (!in_array($newStatus, $allowedStatuses)) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid status. Allowed values: Pending, Approved, Served, Canceled'
        ]);
        exit;
    }
    
    $mongoOrders = new MongoOrders();
    
    // Get old status before updating
    $oldOrder = $mongoOrders->getOrderById($orderId);
    $oldStatus = $oldOrder['status'] ?? 'Unknown';
    
    // Update the order status with cashier info
    $result = $mongoOrders->updateOrderStatus($orderId, $newStatus, $servedBy, $servedByUsername, $servedAt);
    
    // Log the status update in audit trail
    if ($result['success']) {
        AuditLogger::logOrderStatusUpdate($orderId, $oldStatus, $newStatus);
    }
    
    echo json_encode($result);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error updating order status: ' . $e->getMessage()
    ]);
}
?>
