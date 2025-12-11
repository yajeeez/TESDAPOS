<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;

try {
    // Connect to MongoDB
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    
    // List all collections
    $collections = $database->listCollections();
    
    echo "Collections in database:\n";
    foreach ($collections as $collection) {
        echo "- " . $collection->getName() . "\n";
    }
    
    // Check if users collection exists and has documents
    if ($database->collectionExists('users')) {
        $usersCollection = $database->selectCollection('users');
        $userCount = $usersCollection->countDocuments();
        echo "\nUsers collection has $userCount documents\n";
        
        // Show sample users
        $users = $usersCollection->find()->limit(3)->toArray();
        foreach ($users as $user) {
            echo "User: " . (isset($user['email']) ? $user['email'] : 'No email') . "\n";
        }
    }
    
    // Check if admins collection exists and has documents
    if ($database->collectionExists('admins')) {
        $adminsCollection = $database->selectCollection('admins');
        $adminCount = $adminsCollection->countDocuments();
        echo "\nAdmins collection has $adminCount documents\n";
        
        // Show sample admins
        $admins = $adminsCollection->find()->limit(3)->toArray();
        foreach ($admins as $admin) {
            echo "Admin: " . (isset($admin['email']) ? $admin['email'] : 'No email') . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
