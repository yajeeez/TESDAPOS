<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    // Admin data with usernames
    $adminUpdates = [
        [
            '_id' => new ObjectId('693a6be322f8f34bde060edc'),
            'email' => 'yajeee1209@gmail.com',
            'username' => 'yajeee1209'
        ],
        [
            '_id' => new ObjectId('693a6cfa22f8f34bde060ede'),
            'email' => 'sarahdirector912@gmail.com',
            'username' => 'sarahdirector912'
        ],
        [
            '_id' => new ObjectId('693a6cfb22f8f34bde060edf'),
            'email' => 'lisaadmin848@gmail.com',
            'username' => 'lisaadmin848'
        ],
        [
            '_id' => new ObjectId('693a6cfb22f8f34bde060ee0'),
            'email' => 'janemanager895@gmail.com',
            'username' => 'janemanager895'
        ],
        [
            '_id' => new ObjectId('693a6cfb22f8f34bde060ee1'),
            'email' => 'mikesupervisor989@gmail.com',
            'username' => 'mikesupervisor989'
        ]
    ];
    
    $updatedCount = 0;
    $results = [];
    
    foreach ($adminUpdates as $admin) {
        $result = $adminsCollection->updateOne(
            ['_id' => $admin['_id']],
            ['$set' => ['username' => $admin['username']]]
        );
        
        if ($result->getModifiedCount() > 0) {
            $updatedCount++;
            $results[] = [
                'email' => $admin['email'],
                'username' => $admin['username'],
                'status' => 'updated'
            ];
        } else {
            $results[] = [
                'email' => $admin['email'],
                'username' => $admin['username'],
                'status' => 'no change'
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Updated $updatedCount admin accounts with usernames",
        'results' => $results
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
