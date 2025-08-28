<?php
require __DIR__ . '/connection/mongo/connection.php';

use MongoDB\BSON\UTCDateTime;

try {
    $client = MongoConnection::getClient();
    $db = $client->sampleDB;
    $collection = $db->users;

    // ✅ Use int (64-bit) milliseconds
    $milliseconds = (int) (microtime(true) * 1000);

    $result = $collection->insertOne([
        'name'       => 'Ej',
        'role'       => 'Tester'
    ]);

    echo "✅ Inserted ID: " . $result->getInsertedId() . PHP_EOL;

    $user = $collection->findOne(['name' => 'Ej']);
    if ($user) {
        $createdAt = $user['created_at']->toDateTime();
        echo "🔎 Found User: " . $user['name'] .
             " (Role: " . $user['role'] .
             ", Created At: " . $createdAt->format('Y-m-d H:i:s') . ")" . PHP_EOL;
    } else {
        echo "⚠️ User not found" . PHP_EOL;
    }

} catch (Exception $e) {
    echo "❌ MongoDB Error: " . $e->getMessage() . PHP_EOL;
}
