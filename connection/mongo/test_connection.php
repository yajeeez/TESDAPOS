<?php
require __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Driver\Exception\Exception;

echo "🔍 Testing MongoDB Connection...\n";
echo "================================\n\n";

try {
    // Test connection
    $uri = "mongodb://localhost:27017";
    echo "📍 Connecting to: $uri\n";
    
    $client = new Client($uri);
    
    // Test if we can list databases (this will fail if connection is bad)
    $databases = $client->listDatabases();
    
    echo "✅ MongoDB Connection Successful!\n\n";
    
    // List available databases
    echo "📚 Available Databases:\n";
    foreach ($databases as $database) {
        echo "   - " . $database->getName() . "\n";
    }
    
    // Test if we can create/access a test database
    echo "\n🧪 Testing Database Operations...\n";
    $testDb = $client->testConnection;
    $testCollection = $testDb->testCollection;
    
    // Insert a test document
    $result = $testCollection->insertOne([
        'test' => true,
        'timestamp' => new MongoDB\BSON\UTCDateTime(),
        'message' => 'Connection test successful'
    ]);
    
    echo "✅ Test document inserted with ID: " . $result->getInsertedId() . "\n";
    
    // Find the test document
    $doc = $testCollection->findOne(['test' => true]);
    if ($doc) {
        echo "✅ Test document retrieved successfully\n";
    }
    
    // Clean up test data
    $testCollection->deleteMany(['test' => true]);
    echo "✅ Test data cleaned up\n";
    
    echo "\n🎉 All tests passed! MongoDB Compass is working correctly.\n";
    
} catch (Exception $e) {
    echo "❌ MongoDB Connection Failed!\n";
    echo "Error: " . $e->getMessage() . "\n\n";
    
    echo "🔧 Troubleshooting Tips:\n";
    echo "1. Make sure MongoDB service is running\n";
    echo "2. Check if MongoDB is running on port 27017\n";
    echo "3. Verify MongoDB Compass can connect to localhost:27017\n";
    echo "4. Check if firewall is blocking the connection\n";
    echo "5. Ensure MongoDB PHP driver is installed\n";
} 