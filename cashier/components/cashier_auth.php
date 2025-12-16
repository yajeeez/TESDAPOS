<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\Exception\Exception as MongoException;

class CashierAuth {
    private $client;
    private $database;
    private $collection;

    public function __construct() {
        try {
            $this->client = new Client(DB_URI);
            $this->database = $this->client->selectDatabase(DB_NAME);
            $this->collection = $this->database->selectCollection('admins');
        } catch (Exception $e) {
            error_log("MongoDB connection error (CashierAuth): " . $e->getMessage());
            throw new Exception("Failed to connect to MongoDB: " . $e->getMessage());
        }
    }

    /**
     * Get cashier by username
     */
    public function getCashierByUsername($username) {
        try {
            $cashier = $this->collection->findOne([
                'username' => $username,
                'role' => 'cashier',
                'status' => 'active'
            ]);

            if ($cashier) {
                return [
                    'success' => true,
                    'cashier' => [
                        'username' => $cashier['username'],
                        'name' => $cashier['name'],
                        'email' => $cashier['email'],
                        'role' => $cashier['role']
                    ]
                ];
            }

            return ['success' => false, 'message' => 'Cashier not found'];
        } catch (Exception $e) {
            error_log("Error getting cashier: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }

    /**
     * Get all active cashiers
     */
    public function getAllCashiers() {
        try {
            $cursor = $this->collection->find([
                'role' => 'cashier',
                'status' => 'active'
            ], [
                'sort' => ['username' => 1]
            ]);

            $cashiers = [];
            foreach ($cursor as $document) {
                $cashiers[] = [
                    'username' => $document['username'],
                    'name' => $document['name'],
                    'email' => $document['email']
                ];
            }

            return [
                'success' => true,
                'cashiers' => $cashiers
            ];
        } catch (Exception $e) {
            error_log("Error getting cashiers: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error'];
        }
    }
}

/**
 * Get current cashier info from URL parameters or default
 */
function getCurrentCashierInfo() {
    $username = isset($_GET['username']) ? $_GET['username'] : 'cashier1';
    
    try {
        $cashierAuth = new CashierAuth();
        $result = $cashierAuth->getCashierByUsername($username);
        
        if ($result['success']) {
            return $result['cashier'];
        }
    } catch (Exception $e) {
        error_log("Error getting current cashier info: " . $e->getMessage());
    }
    
    // Fallback to default values
    return [
        'username' => $username,
        'name' => 'Cashier',
        'email' => '',
        'role' => 'cashier'
    ];
}
?>