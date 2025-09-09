<?php
require_once '../connection/mongo/connection.php';

header('Content-Type: application/json');

try {
    $client = MongoConnection::getClient();
    $database = 'tesdapos';
    $collection = 'product';
    
    // Create query to fetch all products
    $query = new MongoDB\Driver\Query([]);
    $cursor = $client->executeQuery("$database.$collection", $query);
    
    $products = [];
    foreach ($cursor as $document) {
        $product = [
            'id' => $document->id,
            'product_name' => $document->product_name,
            'category' => $document->category,
            'price' => $document->price,
            'stock_quantity' => $document->stock_quantity
        ];
        $products[] = $product;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful!',
        'count' => count($products),
        'products' => $products
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $e->getMessage()
    ]);
}
?>
