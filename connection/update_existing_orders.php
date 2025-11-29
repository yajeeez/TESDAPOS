<?php
require_once __DIR__ . '/MongoOrders.php';

echo "Starting migration to add order_id to existing orders...\n";

try {
    $mongoOrders = new MongoOrders();
    $collection = $mongoOrders->getCollection();
    
    // Find all orders that don't have an order_id field
    $cursor = $collection->find([
        'order_id' => ['$exists' => false]
    ], [
        'sort' => ['created_at' => 1] // Sort by creation date (oldest first)
    ]);
    
    $ordersToUpdate = [];
    foreach ($cursor as $document) {
        $ordersToUpdate[] = $document;
    }
    
    if (empty($ordersToUpdate)) {
        echo "No orders need updating. All orders already have order_id.\n";
        exit;
    }
    
    echo "Found " . count($ordersToUpdate) . " orders to update.\n";
    
    // Get the current highest order_id
    $highestOrderId = 0;
    $existingOrdersCursor = $collection->find(
        ['order_id' => ['$exists' => true]],
        ['sort' => ['order_id' => -1], 'limit' => 1]
    );
    
    foreach ($existingOrdersCursor as $document) {
        $order = (array) $document;
        if (isset($order['order_id'])) {
            $highestOrderId = (int) ltrim($order['order_id'], '0');
            break;
        }
    }
    
    echo "Current highest order_id: " . str_pad($highestOrderId, 2, '0', STR_PAD_LEFT) . "\n";
    
    // Update each order with a new order_id
    $updateCount = 0;
    foreach ($ordersToUpdate as $document) {
        $highestOrderId++;
        $newOrderId = str_pad($highestOrderId, 2, '0', STR_PAD_LEFT);
        
        $result = $collection->updateOne(
            ['_id' => $document['_id']],
            ['$set' => ['order_id' => $newOrderId]]
        );
        
        if ($result->getModifiedCount() === 1) {
            echo "Updated order _id: " . $document['_id'] . " with order_id: $newOrderId\n";
            $updateCount++;
        } else {
            echo "Failed to update order _id: " . $document['_id'] . "\n";
        }
    }
    
    echo "\nMigration completed!\n";
    echo "Successfully updated $updateCount orders.\n";
    echo "New highest order_id: " . str_pad($highestOrderId, 2, '0', STR_PAD_LEFT) . "\n";
    
} catch (Exception $e) {
    echo "Error during migration: " . $e->getMessage() . "\n";
}
?>
