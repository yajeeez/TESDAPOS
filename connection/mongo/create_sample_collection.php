<?php
require __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Driver\Exception\Exception;
use MongoDB\BSON\UTCDateTime;

echo "🚀 Creating Sample Collection...\n";
echo "================================\n\n";

try {
    $client = MongoConnection::getClient();
    $db = $client->sampleDB;
    
    echo "✅ Connected to database: sampleDB\n";
    
    // Create users collection
    $usersCollection = $db->users;
    echo "📝 Working with collection: users\n\n";
    
    // Sample user data
    $sampleUsers = [
        [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'role' => 'Admin',
            'department' => 'IT',
            'created_at' => new UTCDateTime(),
            'status' => 'active'
        ],
        [
            'name' => 'Jane Smith',
            'email' => 'jane.smith@example.com',
            'role' => 'User',
            'department' => 'HR',
            'created_at' => new UTCDateTime(),
            'status' => 'active'
        ],
        [
            'name' => 'Mike Johnson',
            'email' => 'mike.johnson@example.com',
            'role' => 'Manager',
            'department' => 'Sales',
            'created_at' => new UTCDateTime(),
            'status' => 'active'
        ],
        [
            'name' => 'Sarah Wilson',
            'email' => 'sarah.wilson@example.com',
            'role' => 'Developer',
            'department' => 'IT',
            'created_at' => new UTCDateTime(),
            'status' => 'active'
        ],
        [
            'name' => 'David Brown',
            'email' => 'david.brown@example.com',
            'role' => 'Analyst',
            'department' => 'Finance',
            'created_at' => new UTCDateTime(),
            'status' => 'inactive'
        ]
    ];
    
    // Insert sample users
    echo "📥 Inserting sample users...\n";
    $result = $usersCollection->insertMany($sampleUsers);
    echo "✅ Inserted " . $result->getInsertedCount() . " users\n\n";
    
    // Create products collection
    $productsCollection = $db->products;
    echo "📝 Working with collection: products\n\n";
    
    // Sample product data
    $sampleProducts = [
        [
            'name' => 'Laptop',
            'category' => 'Electronics',
            'price' => 999.99,
            'stock' => 50,
            'created_at' => new UTCDateTime(),
            'tags' => ['computer', 'portable', 'work']
        ],
        [
            'name' => 'Smartphone',
            'category' => 'Electronics',
            'price' => 699.99,
            'stock' => 100,
            'created_at' => new UTCDateTime(),
            'tags' => ['mobile', 'communication', 'smart']
        ],
        [
            'name' => 'Coffee Mug',
            'category' => 'Home & Kitchen',
            'price' => 19.99,
            'stock' => 200,
            'created_at' => new UTCDateTime(),
            'tags' => ['kitchen', 'drink', 'ceramic']
        ]
    ];
    
    // Insert sample products
    echo "📥 Inserting sample products...\n";
    $result = $productsCollection->insertMany($sampleProducts);
    echo "✅ Inserted " . $result->getInsertedCount() . " products\n\n";
    
    // Display collection statistics
    echo "📊 Collection Statistics:\n";
    echo "   Users: " . $usersCollection->countDocuments() . " documents\n";
    echo "   Products: " . $productsCollection->countDocuments() . " documents\n\n";
    
    // Show sample data
    echo "👥 Sample Users:\n";
    $users = $usersCollection->find()->limit(3);
    foreach ($users as $user) {
        echo "   - " . $user['name'] . " (" . $user['role'] . ")\n";
    }
    
    echo "\n🛍️ Sample Products:\n";
    $products = $productsCollection->find()->limit(3);
    foreach ($products as $product) {
        echo "   - " . $product['name'] . " ($" . $product['price'] . ")\n";
    }
    
    echo "\n🎉 Sample collections created successfully!\n";
    echo "💡 You can now view these in MongoDB Compass\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
} 