<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    
    // Get filter parameters from GET request
    $startDate = $_GET['start_date'] ?? null;
    $endDate = $_GET['end_date'] ?? null;
    $cashier = $_GET['cashier'] ?? null;
    $status = $_GET['status'] ?? null;
    $paymentMethod = $_GET['payment_method'] ?? null;
    
    // Build MongoDB filter
    $filter = [];
    
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
    
    // Cashier filter - use served_by field (full name)
    if ($cashier && $cashier !== '') {
        $filter['served_by'] = $cashier;
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
    
    // Fetch filtered orders
    $cursor = $mongoOrders->getCollection()->find($filter, [
        'sort' => ['created_at' => -1]
    ]);
    
    $orders = [];
    $cashiers = [];
    
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
            $paymentMethod = $order['payment_method'];
            if ($paymentMethod === 'card' || $paymentMethod === 'Card' || $paymentMethod === 'Credit or Debit Card') {
                $order['payment_method'] = 'Credit or Debit Card';
            } elseif ($paymentMethod === 'cash') {
                $order['payment_method'] = 'Cash';
            }
        }
        
        // Collect unique cashiers for filter options - use served_by field
        if (isset($order['served_by']) && $order['served_by']) {
            $cashiers[] = $order['served_by'];
        }
        
        $orders[] = $order;
    }
    
    // Get unique cashiers for filter dropdown
    $uniqueCashiers = array_unique($cashiers);
    sort($uniqueCashiers);
    
    echo json_encode([
        'success' => true,
        'orders' => $orders,
        'cashiers' => $uniqueCashiers,
        'count' => count($orders)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error fetching filtered orders: ' . $e->getMessage()
    ]);
}
?>
