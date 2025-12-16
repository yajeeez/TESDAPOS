<?php
require_once __DIR__ . '/connection/MongoOrders.php';

try {
    $mongoOrders = new MongoOrders();
    
    // Get the collection directly
    $collection = $mongoOrders->getCollection();
    
    // Find order with ID "01" that has "Cashier" as served_by
    $order = $collection->findOne(['order_id' => '01']);
    
    if ($order) {
        echo "<h2>Current Order Data:</h2>";
        echo "<pre>";
        echo "Order ID: " . $order['order_id'] . "\n";
        echo "Status: " . ($order['status'] ?? 'N/A') . "\n";
        echo "Served By: " . ($order['served_by'] ?? 'NOT SET') . "\n";
        echo "Served By Username: " . ($order['served_by_username'] ?? 'NOT SET') . "\n";
        echo "</pre>";
        
        // Check if served_by is "Cashier" 
        if (isset($order['served_by']) && $order['served_by'] === 'Cashier') {
            echo "<h3>Fixing order...</h3>";
            
            // Determine the correct name based on username
            $correctName = 'Cashier One'; // Default
            $correctUsername = 'cashier1'; // Default
            
            if (isset($order['served_by_username'])) {
                $username = $order['served_by_username'];
                // Map usernames to full names
                $usernameMap = [
                    'cashier' => 'Cashier One',
                    'cashier1' => 'Cashier One',
                    'cashier2' => 'Cashier Two',
                    'cashier3' => 'Cashier Three'
                ];
                
                if (isset($usernameMap[$username])) {
                    $correctName = $usernameMap[$username];
                    $correctUsername = $username === 'cashier' ? 'cashier1' : $username;
                }
            }
            
            echo "<p>Updating to: $correctName (username: $correctUsername)</p>";
            
            // Update the order with the correct full name and username
            $result = $collection->updateOne(
                ['order_id' => '01'],
                ['$set' => [
                    'served_by' => $correctName,
                    'served_by_username' => $correctUsername
                ]]
            );
            
            if ($result->getModifiedCount() > 0) {
                echo "<p style='color: green;'>✓ Successfully updated order! 'Cashier' changed to 'Cashier One'</p>";
                
                // Show updated data
                $updatedOrder = $collection->findOne(['order_id' => '01']);
                echo "<h3>Updated Order Data:</h3>";
                echo "<pre>";
                echo "Order ID: " . $updatedOrder['order_id'] . "\n";
                echo "Status: " . ($updatedOrder['status'] ?? 'N/A') . "\n";
                echo "Served By: " . ($updatedOrder['served_by'] ?? 'NOT SET') . "\n";
                echo "Served By Username: " . ($updatedOrder['served_by_username'] ?? 'NOT SET') . "\n";
                echo "</pre>";
                
                echo "<p><strong>Now refresh your Orders page to see 'Cashier One' instead of 'Cashier'</strong></p>";
            } else {
                echo "<p style='color: orange;'>No changes made (order might already be correct)</p>";
            }
        } else {
            echo "<p>Order doesn't need fixing or username doesn't match 'cashier1'</p>";
        }
    } else {
        echo "<p style='color: red;'>Order with ID '01' not found</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}
?>
