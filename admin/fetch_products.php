<?php
require_once '../connection/mongo/connection.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
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
            'stock_quantity' => $document->stock_quantity,
            'photo' => isset($document->photo) ? $document->photo : null
        ];
        $products[] = $product;
    }
    
    echo json_encode([
        'success' => true,
        'products' => $products
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch products: ' . $e->getMessage()
    ]);
}
?>
