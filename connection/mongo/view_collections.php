<?php
require __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Driver\Exception\Exception;

header('Content-Type: text/plain');

try {
    $client = MongoConnection::getClient();
    $db = $client->sampleDB;
    
    echo "📊 Database: sampleDB\n";
    echo "================================\n\n";
    
    // List all collections
    $collections = $db->listCollections();
    echo "📁 Collections found:\n";
    foreach ($collections as $collection) {
        echo "   - " . $collection->getName() . "\n";
    }
    echo "\n";
    
    // Show users collection
    if ($db->users->countDocuments() > 0) {
        echo "👥 Users Collection (" . $db->users->countDocuments() . " documents):\n";
        echo "----------------------------------------\n";
        $users = $db->users->find()->limit(5);
        foreach ($users as $user) {
            echo "   Name: " . $user['name'] . "\n";
            echo "   Email: " . $user['email'] . "\n";
            echo "   Role: " . $user['role'] . "\n";
            echo "   Department: " . $user['department'] . "\n";
            echo "   Status: " . $user['status'] . "\n";
            if (isset($user['created_at'])) {
                $createdAt = $user['created_at']->toDateTime();
                echo "   Created: " . $createdAt->format('Y-m-d H:i:s') . "\n";
            }
            echo "   ---\n";
        }
        echo "\n";
    }
    
    // Show products collection
    if ($db->products->countDocuments() > 0) {
        echo "🛍️ Products Collection (" . $db->products->countDocuments() . " documents):\n";
        echo "----------------------------------------\n";
        $products = $db->products->find()->limit(5);
        foreach ($products as $product) {
            echo "   Name: " . $product['name'] . "\n";
            echo "   Category: " . $product['category'] . "\n";
            echo "   Price: $" . $product['price'] . "\n";
            echo "   Stock: " . $product['stock'] . "\n";
            if (isset($product['tags'])) {
                echo "   Tags: " . implode(', ', $product['tags']) . "\n";
            }
            if (isset($product['created_at'])) {
                $createdAt = $product['created_at']->toDateTime();
                echo "   Created: " . $createdAt->format('Y-m-d H:i:s') . "\n";
            }
            echo "   ---\n";
        }
        echo "\n";
    }
    
    // Show any other collections
    foreach ($collections as $collection) {
        $collectionName = $collection->getName();
        if ($collectionName !== 'users' && $collectionName !== 'products') {
            $count = $db->$collectionName->countDocuments();
            if ($count > 0) {
                echo "📋 " . ucfirst($collectionName) . " Collection (" . $count . " documents):\n";
                echo "----------------------------------------\n";
                $docs = $db->$collectionName->find()->limit(3);
                foreach ($docs as $doc) {
                    echo "   Document ID: " . $doc['_id'] . "\n";
                    foreach ($doc as $key => $value) {
                        if ($key !== '_id') {
                            if (is_array($value)) {
                                echo "   " . ucfirst($key) . ": [" . implode(', ', $value) . "]\n";
                            } else {
                                echo "   " . ucfirst($key) . ": " . $value . "\n";
                            }
                        }
                    }
                    echo "   ---\n";
                }
                echo "\n";
            }
        }
    }
    
    echo "✅ Collection data retrieved successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} 