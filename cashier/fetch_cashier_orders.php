<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Start session to get cashier info
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if cashier is logged in
if (!isset($_SESSION['cashier_username'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized: No cashier session found'
    ]);
    exit();
}

require_once __DIR__ . '/../connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    $cashierUsername = $_SESSION['cashier_username'];
    
    // Get filter parameters from GET request
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;
    $status = $_GET['status'] ?? null;
    $paymentMethod = $_GET['payment_method'] ?? null;
    $transactionsOnly = $_GET['transactions_only'] ?? null;  // New parameter for transactions page
    
    // Build MongoDB filter - ALWAYS filter by current cashier
    // Check both served_by_username and served_by fields for compatibility
    $filter = [
        '$or' => [
            ['served_by_username' => $cashierUsername],
            ['served_by' => $_SESSION['cashier_name'] ?? $cashierUsername]
        ]
    ];
    
    // If transactions_only parameter is set, only show Served orders
    if ($transactionsOnly === 'true' || $transactionsOnly === '1') {
        $filter['status'] = 'Served';
    }
    
    // Date filter
    if ($startDate || $endDate) {
        $dateFilter = [];
        
        if ($startDate) {
            $startDateTime = new DateTime($startDate);
            $startDateTime->setTime(0, 0, 0);
            $startDateTime->setTimezone(new DateTimeZone('UTC'));
            $dateFilter['$gte'] = new MongoDB\BSON\UTCDateTime($startDateTime->getTimestamp() * 1000);
        }
        
        if ($endDate) {
            $endDateTime = new DateTime($endDate);
            $endDateTime->setTime(23, 59, 59);
            $endDateTime->setTimezone(new DateTimeZone('UTC'));
            $dateFilter['$lte'] = new MongoDB\BSON\UTCDateTime($endDateTime->getTimestamp() * 1000);
        }
        
        $filter['created_at'] = $dateFilter;
    }
    
    // Status filter
    if ($status && $status !== '') {
        $filter['status'] = $status;
    }
    
    // Payment method filter
    if ($paymentMethod && $paymentMethod !== '') {
        // Normalize payment method values
        if ($paymentMethod === 'Cash') {
            $filter['payment_method'] = ['$in' => ['Cash', 'cash']];
        } elseif ($paymentMethod === 'Cashless' || $paymentMethod === 'Credit or Debit Card') {
            $filter['payment_method'] = ['$in' => ['card', 'Card', 'Credit or Debit Card', 'Cashless']];
        }
    }
    
    // Fetch filtered orders for this cashier only
    $cursor = $mongoOrders->getCollection()->find($filter, [
        'sort' => ['created_at' => -1]
    ]);
    
    $orders = [];
    
    foreach ($cursor as $document) {
        $order = (array) $document;
        
        // Convert MongoDB's UTCDateTime to readable format
        if (isset($order['created_at']) && $order['created_at'] instanceof MongoDB\BSON\UTCDateTime) {
            $order['created_at'] = $order['created_at']->toDateTime()->format('Y-m-d H:i:s');
        }
        
        // Calculate total amount if not present
        if (!isset($order['total_amount']) && isset($order['items']) && is_array($order['items'])) {
            $total = 0;
            foreach ($order['items'] as $item) {
                if (isset($item['subtotal'])) {
                    $total += (float) $item['subtotal'];
                } elseif (isset($item['price']) && isset($item['quantity'])) {
                    $total += (float) $item['price'] * (int) $item['quantity'];
                }
            }
            $order['total_amount'] = $total;
        }
        
        // Extract product names and other info for display
        if (isset($order['items']) && is_array($order['items'])) {
            $productNames = [];
            foreach ($order['items'] as $item) {
                if (isset($item['name'])) {
                    $productNames[] = $item['name'];
                }
            }
            $order['product_names'] = $productNames;
            $order['total_item_count'] = array_sum(array_column($order['items'], 'quantity'));
        }
        
        // Normalize payment method for display
        if (isset($order['payment_method'])) {
            $paymentMethodValue = $order['payment_method'];
            if ($paymentMethodValue === 'card' || $paymentMethodValue === 'Card' || $paymentMethodValue === 'Credit or Debit Card') {
                $order['payment_method'] = 'Credit or Debit Card';
            } elseif ($paymentMethodValue === 'cash') {
                $order['payment_method'] = 'Cash';
            }
        }
        
        $orders[] = $order;
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'cashiers' => [$_SESSION['cashier_name'] ?? $cashierUsername], // Only this cashier
        'count' => count($orders),
        'cashier_username' => $cashierUsername
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching cashier orders: ' . $e->getMessage()
    ]);
}
?>
