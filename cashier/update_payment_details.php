<?php
// Require cashier authentication
require_once __DIR__ . '/components/cashier_auth.php';
require_once __DIR__ . '/../connection/connection.php';

// Prevent caching
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Content-Type: application/json');

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit();
}

$orderId = $input['order_id'] ?? '';
$cashReceived = floatval($input['cash_received'] ?? 0);
$changeAmount = floatval($input['change_amount'] ?? 0);
$totalBalance = floatval($input['total_balance'] ?? 0);
$updatedBy = $input['updated_by'] ?? '';

if (empty($orderId) || $cashReceived <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid order ID or cash amount']);
    exit();
}

try {
    $db = getDatabaseConnection();
    $ordersCollection = $db->orders;
    
    // Update the order with payment details
    $result = $ordersCollection->updateOne(
        ['order_id' => $orderId],
        [
            '$set' => [
                'cash_received' => $cashReceived,
                'change_amount' => $changeAmount,
                'total_balance' => $totalBalance,
                'payment_updated_by' => $updatedBy,
                'payment_updated_at' => new MongoDB\BSON\UTCDateTime()
            ]
        ]
    );
    
    if ($result->getModifiedCount() > 0 || $result->getMatchedCount() > 0) {
        // Log the action
        require_once __DIR__ . '/../includes/audit_logger.php';
        AuditLogger::log('payment_update', "Updated payment details for order $orderId");
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment details updated successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Order not found or no changes made'
        ]);
    }
} catch (Exception $e) {
    error_log('Error updating payment details: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
