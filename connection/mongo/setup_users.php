<?php
require_once 'connection.php';

try {
    $manager = MongoConnection::getClient();
    
    // Check if users already exist
    $query = new MongoDB\Driver\Query([]);
    $cursor = $manager->executeQuery('tesdapos.users', $query);
    $users = iterator_to_array($cursor);
    
    if (count($users) > 0) {
        echo "Users already exist in the database.\n";
        exit();
    }

    // Create default users
    $defaultUsers = [
        [
            'username' => 'admin',
            'password' => password_hash('admin123', PASSWORD_DEFAULT),
            'role' => 'admin',
            'full_name' => 'System Administrator',
            'email' => 'admin@tesdapos.com',
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'is_active' => true
        ],
        [
            'username' => 'manager',
            'password' => password_hash('manager123', PASSWORD_DEFAULT),
            'role' => 'manager',
            'full_name' => 'Store Manager',
            'email' => 'manager@tesdapos.com',
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'is_active' => true
        ],
        [
            'username' => 'cashier',
            'password' => password_hash('cashier123', PASSWORD_DEFAULT),
            'role' => 'cashier',
            'full_name' => 'Cashier',
            'email' => 'cashier@tesdapos.com',
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'is_active' => true
        ],
        [
            'username' => 'inventory',
            'password' => password_hash('inventory123', PASSWORD_DEFAULT),
            'role' => 'inventory',
            'full_name' => 'Inventory Manager',
            'email' => 'inventory@tesdapos.com',
            'created_at' => new MongoDB\BSON\UTCDateTime(),
            'is_active' => true
        ]
    ];

    // Insert users
    $bulk = new MongoDB\Driver\BulkWrite();
    foreach ($defaultUsers as $user) {
        $bulk->insert($user);
    }
    
    $result = $manager->executeBulkWrite('tesdapos.users', $bulk);
    
    echo "Successfully created " . $result->getInsertedCount() . " users:\n";
    echo "- admin (password: admin123)\n";
    echo "- manager (password: manager123)\n";
    echo "- cashier (password: cashier123)\n";
    echo "- inventory (password: inventory123)\n";
    
    // Create indexes for better performance
    $command = new MongoDB\Driver\Command([
        'createIndexes' => 'users',
        'indexes' => [
            [
                'key' => ['username' => 1],
                'unique' => true,
                'name' => 'username_unique'
            ],
            [
                'key' => ['role' => 1],
                'name' => 'role_index'
            ]
        ]
    ]);
    
    $manager->executeCommand('tesdapos', $command);
    echo "\nDatabase indexes created successfully.\n";
    
} catch (Exception $e) {
    echo "Error setting up users: " . $e->getMessage() . "\n";
}
?> 