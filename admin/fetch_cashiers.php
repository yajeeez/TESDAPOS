<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use MongoDB\Client;
use MongoDB\Exception\Exception as MongoException;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    // Connect to MongoDB
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $collection = $database->selectCollection('admins');

    // Fetch all cashier accounts
    $cursor = $collection->find(
        ['role' => 'cashier', 'status' => 'active'],
        [
            'projection' => ['username' => 1, 'name' => 1, 'email' => 1],
            'sort' => ['username' => 1]
        ]
    );

    $cashiers = [];
    foreach ($cursor as $document) {
        $cashiers[] = [
            'username' => $document['username'] ?? '',
            'name' => $document['name'] ?? '',
            'email' => $document['email'] ?? ''
        ];
    }

    echo json_encode([
        'success' => true,
        'cashiers' => $cashiers
    ]);

} catch (MongoException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error: ' . $e->getMessage()
    ]);
}
?>