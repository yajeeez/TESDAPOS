<?php
// Cleanup duplicate products from MongoDB
require_once __DIR__ . '/MongoInventory.php';

try {
    $mongo = new MongoInventory();
    
    // Get all products
    $result = $mongo->getAllProducts();
    
    if ($result['success']) {
        $products = $result['products'];
        $duplicates = [];
        $uniqueProducts = [];
        
        // Find duplicates based on product_name
        foreach ($products as $product) {
            $name = $product['product_name'];
            if (isset($uniqueProducts[$name])) {
                // This is a duplicate, add to deletion list
                $duplicates[] = $product['id'];
            } else {
                // First occurrence, keep it
                $uniqueProducts[$name] = $product;
            }
        }
        
        // Delete duplicates
        $deletedCount = 0;
        foreach ($duplicates as $productId) {
            $deleteResult = $mongo->deleteProduct($productId);
            if ($deleteResult['success']) {
                $deletedCount++;
                echo "Deleted duplicate product with ID: " . $productId . "\n";
            }
        }
        
        echo "Cleanup completed!\n";
        echo "Total duplicates removed: " . $deletedCount . "\n";
        echo "Remaining products: " . count($uniqueProducts) . "\n";
        
        // Show remaining products
        echo "\nRemaining products:\n";
        foreach ($uniqueProducts as $product) {
            echo "- " . $product['product_name'] . " (ID: " . $product['id'] . ")\n";
        }
        
    } else {
        echo "Error fetching products: " . $result['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>