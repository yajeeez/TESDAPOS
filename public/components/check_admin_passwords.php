<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;

try {
    $client = new Client(DB_URI);
    $database = $client->selectDatabase(DB_NAME);
    $adminsCollection = $database->selectCollection('admins');
    
    // Get all admin users
    $admins = $adminsCollection->find()->toArray();
    
    $adminData = [];
    foreach ($admins as $admin) {
        $password = $admin['password'];
        $isHashed = strlen($password) >= 60 && strpos($password, '$2') === 0;
        
        $adminData[] = [
            'id' => (string)$admin['_id'],
            'email' => $admin['email'],
            'username' => $admin['username'] ?? 'N/A',
            'password' => $password,
            'is_hashed' => $isHashed,
            'password_length' => strlen($password)
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Found ' . count($adminData) . ' admin accounts',
        'admins' => $adminData
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
