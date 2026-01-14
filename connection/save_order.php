<?php
// Disable output buffering and error display to prevent HTML in JSON response
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Start output buffering to catch any unwanted output
ob_start();

// Handle preflight OPTIONS request first (for fetch from browser)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    http_response_code(200);
    exit();
}

// Set headers for actual request
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    ob_end_flush();
    exit();
}

require_once __DIR__ . '/MongoOrders.php';
require_once __DIR__ . '/MongoInventory.php';
require_once __DIR__ . '/../includes/audit_logger.php';

// Start session to get cashier info
session_start();

try {
    // Read raw JSON body
    $rawBody = file_get_contents('php://input');
    $data = json_decode($rawBody, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON body: ' . json_last_error_msg());
    }

    // Basic validation
    if (empty($data['items']) || !is_array($data['items'])) {
        throw new Exception('Order items are required.');
    }

    if (empty($data['payment_method'])) {
        throw new Exception('Payment method is required.');
    }

    if (!isset($data['total_amount'])) {
        throw new Exception('Total amount is required.');
    }

    if (empty($data['transaction_id'])) {
        throw new Exception('Transaction ID is required.');
    }

    // Build simple product summary fields for easier viewing in Compass
    $productNames = [];
    $totalItems = 0;
    foreach ($data['items'] as $item) {
        if (isset($item['name'])) {
            $productNames[] = $item['name'];
        }
        if (isset($item['quantity'])) {
            $totalItems += (int) $item['quantity'];
        }
    }

    $order = [
        'items'           => $data['items'],
        'payment_method'  => $data['payment_method'],
        'total_amount'    => (float) $data['total_amount'],
        'cash_amount'     => isset($data['cash_amount']) ? (float) $data['cash_amount'] : null,
        'change_amount'   => isset($data['change_amount']) ? (float) $data['change_amount'] : null,
        'transaction_id'  => $data['transaction_id'],
        'card_type'       => isset($data['card_type']) ? $data['card_type'] : null,
        'card_number'     => isset($data['card_number']) ? $data['card_number'] : null,
        'card_holder'     => isset($data['card_holder']) ? $data['card_holder'] : null,
        'product_names'   => $productNames,
        'total_item_count'=> $totalItems,
    ];

    $mongoOrders = new MongoOrders();
    $result = $mongoOrders->addOrder($order);

    // Update stock quantities for each item in the order
    if ($result['success']) {
        $mongoInventory = new MongoInventory();
        $stockUpdateErrors = [];
        
        foreach ($data['items'] as $item) {
            if (isset($item['product_id']) && isset($item['quantity'])) {
                $stockResult = $mongoInventory->decreaseStock($item['product_id'], $item['quantity']);
                
                if (!$stockResult['success']) {
                    $stockUpdateErrors[] = $item['name'] . ': ' . $stockResult['message'];
                    error_log("Stock update failed for product {$item['product_id']}: {$stockResult['message']}");
                }
            }
        }
        
        // Log stock update errors if any (but don't fail the order)
        if (!empty($stockUpdateErrors)) {
            error_log("Stock update errors: " . implode(', ', $stockUpdateErrors));
        }
    }

    // Log the order creation in audit trail
    if ($result['success']) {
        $orderId = $result['order_id'] ?? 'Unknown';
        AuditLogger::logOrderCreated(
            $orderId,
            $order['total_amount'],
            $order['total_item_count'],
            $order['payment_method']
        );
    }

    ob_clean();
    echo json_encode($result, JSON_UNESCAPED_SLASHES);
} catch (Exception $e) {
    error_log("Error in save_order.php: " . $e->getMessage());
    ob_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred: ' . $e->getMessage()
    ], JSON_UNESCAPED_SLASHES);
}

ob_end_flush();

?>


