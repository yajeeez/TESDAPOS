<?php
require_once __DIR__ . '/connection/MongoInventory.php';

try {
    $mongo = new MongoInventory();
    $result = $mongo->getAllProducts();
    
    if ($result['success']) {
        echo "SUCCESS: Found " . count($result['products']) . " products\n";
        foreach ($result['products'] as $product) {
            echo "- " . $product['product_name'] . " (₱" . $product['price'] . ")\n";
        }
    } else {
        echo "ERROR: " . $result['message'] . "\n";
    }
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}
?>