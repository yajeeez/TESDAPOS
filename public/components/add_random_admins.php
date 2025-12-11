<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

function generateRandomPassword($length = 8) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return substr(str_shuffle($chars), 0, $length);
}

function generateRandomEmail() {
    $names = ['john', 'jane', 'mike', 'sarah', 'alex', 'emma', 'david', 'lisa'];
    $domains = ['admin', 'manager', 'supervisor', 'director'];
    $numbers = rand(100, 999);
    
    $name = $names[array_rand($names)];
    $domain = $domains[array_rand($domains)];
    
    return "{$name}{$domain}{$numbers}@gmail.com";
}

function generateRandomName() {
    $firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'Robert', 'Emily', 'David', 'Lisa', 'James', 'Mary'];
    $lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return $firstNames[array_rand($firstNames)] . ' ' . $lastNames[array_rand($lastNames)];
}

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    // Generate 4 random admin accounts
    $randomAdmins = [];
    $createdCount = 0;
    
    for ($i = 1; $i <= 4; $i++) {
        $admin = [
            'email' => generateRandomEmail(),
            'password' => generateRandomPassword(),
            'name' => generateRandomName(),
            'role' => 'admin',
            'created_at' => new UTCDateTime(),
            'status' => 'active'
        ];
        
        // Check if email already exists
        $existing = $adminsCollection->findOne(['email' => $admin['email']]);
        if (!$existing) {
            $result = $adminsCollection->insertOne($admin);
            if ($result->getInsertedId()) {
                $admin['_id'] = (string)$result->getInsertedId();
                $randomAdmins[] = $admin;
                $createdCount++;
            }
        } else {
            // Try again with different email
            $i--;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Successfully created $createdCount random admin accounts",
        'admins' => $randomAdmins
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
