<?php
// Debug script to check what's in the database for transactions
session_start();

require_once __DIR__ . '/connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    
    echo "<h2>Database Debug - All Orders</h2>";
    echo "<pre>";
    
    // Get all orders
    $cursor = $mongoOrders->getCollection()->find([], [
        'sort' => ['created_at' => -1]
    ]);
    
    $orders = [];
    foreach ($cursor as $document) {
        $order = (array) $document;
        
        // Convert dates
        if (isset($order['created_at']) && $order['created_at'] instanceof MongoDB\BSON\UTCDateTime) {
            $order['created_at'] = $order['created_at']->toDateTime()->format('Y-m-d H:i:s');
        }
        
        $orders[] = $order;
    }
    
    echo "Total orders in database: " . count($orders) . "\n\n";
    
    foreach ($orders as $order) {
        echo "Order ID: " . ($order['order_id'] ?? 'N/A') . "\n";
        echo "Status: " . ($order['status'] ?? 'N/A') . "\n";
        echo "Served By: " . ($order['served_by'] ?? 'N/A') . "\n";
        echo "Served By Username: " . ($order['served_by_username'] ?? 'N/A') . "\n";
        echo "Total Amount: " . ($order['total_amount'] ?? 'N/A') . "\n";
        echo "Payment Method: " . ($order['payment_method'] ?? 'N/A') . "\n";
        echo "Created At: " . ($order['created_at'] ?? 'N/A') . "\n";
        echo "Transaction ID: " . ($order['transaction_id'] ?? 'N/A') . "\n";
        echo "---\n";
    }
    
    echo "\n\n<h3>Session Info</h3>\n";
    echo "Cashier Username: " . ($_SESSION['cashier_username'] ?? 'NOT SET') . "\n";
    echo "Cashier Name: " . ($_SESSION['cashier_name'] ?? 'NOT SET') . "\n";
    
    echo "\n\n<h3>Orders for current cashier (if logged in)</h3>\n";
    if (isset($_SESSION['cashier_username'])) {
        $cashierUsername = $_SESSION['cashier_username'];
        $cashierOrders = $mongoOrders->getCollection()->find([
            'served_by_username' => $cashierUsername
        ])->toArray();
        
        echo "Orders served by $cashierUsername: " . count($cashierOrders) . "\n";
        foreach ($cashierOrders as $order) {
            $order = (array) $order;
            echo "  - Order " . ($order['order_id'] ?? 'N/A') . " - Status: " . ($order['status'] ?? 'N/A') . "\n";
        }
    } else {
        echo "No cashier logged in\n";
    }
    
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<pre>Error: " . $e->getMessage() . "</pre>";
}
?>
