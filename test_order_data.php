<?php
require_once __DIR__ . '/connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    $result = $mongoOrders->getAllOrders();
    
    if ($result['success']) {
        echo "<h2>Current Orders in Database:</h2>";
        echo "<pre>";
        foreach ($result['orders'] as $order) {
            echo "Order ID: " . ($order['order_id'] ?? 'N/A') . "\n";
            echo "Status: " . ($order['status'] ?? 'N/A') . "\n";
            echo "Served By (name): " . ($order['served_by'] ?? 'NOT SET') . "\n";
            echo "Served By (username): " . ($order['served_by_username'] ?? 'NOT SET') . "\n";
            echo "---\n";
        }
        echo "</pre>";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
