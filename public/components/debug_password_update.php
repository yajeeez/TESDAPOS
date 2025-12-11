<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

try {
    // Connect to MongoDB
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    
    $email = 'yajeee1209@gmail.com';
    
    echo "Debugging password update for: $email\n\n";
    
    // Check users collection
    $usersCollection = $database->selectCollection('users');
    $user = $usersCollection->findOne(['email' => $email]);
    
    echo "USERS COLLECTION:\n";
    if ($user) {
        echo "Found user: " . $user['email'] . "\n";
        echo "Current password hash: " . substr($user['password'], 0, 20) . "...\n";
        echo "Password verification with 'test123': " . (password_verify('test123', $user['password']) ? 'TRUE' : 'FALSE') . "\n";
        echo "Password verification with 'r2HK15IV': " . (password_verify('r2HK15IV', $user['password']) ? 'TRUE' : 'FALSE') . "\n";
    } else {
        echo "User not found\n";
    }
    
    echo "\nADMINS COLLECTION:\n";
    // Check admins collection
    $adminsCollection = $database->selectCollection('admins');
    $admin = $adminsCollection->findOne(['email' => $email]);
    
    if ($admin) {
        echo "Found admin: " . $admin['email'] . "\n";
        echo "Current password hash: " . substr($admin['password'], 0, 20) . "...\n";
        echo "Password verification with 'test123': " . (password_verify('test123', $admin['password']) ? 'TRUE' : 'FALSE') . "\n";
        echo "Password verification with 'r2HK15IV': " . (password_verify('r2HK15IV', $admin['password']) ? 'TRUE' : 'FALSE') . "\n";
    } else {
        echo "Admin not found\n";
    }
    
    // Test password update
    echo "\nTESTING PASSWORD UPDATE:\n";
    $newPassword = 'testNew123';
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    $userUpdate = $usersCollection->updateOne(
        ['email' => $email],
        ['$set' => ['password' => $hashedPassword]]
    );
    
    echo "Users update result: " . $userUpdate->getModifiedCount() . " documents modified\n";
    
    $adminUpdate = $adminsCollection->updateOne(
        ['email' => $email],
        ['$set' => ['password' => $hashedPassword]]
    );
    
    echo "Admins update result: " . $adminUpdate->getModifiedCount() . " documents modified\n";
    
    // Verify update
    $updatedUser = $usersCollection->findOne(['email' => $email]);
    if ($updatedUser) {
        echo "Updated user password verification with 'testNew123': " . (password_verify('testNew123', $updatedUser['password']) ? 'TRUE' : 'FALSE') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
