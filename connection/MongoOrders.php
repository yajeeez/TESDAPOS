<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/mongostubs.php'; // IDE support only

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Exception\Exception as MongoException;

class MongoOrders {
    private $client;
    private $database;
    private $collection;

    public function __construct() {
        try {
            $this->client = new Client(DB_URI);
            $this->database = $this->client->selectDatabase(DB_NAME);
            $this->collection = $this->database->selectCollection('Orders');

            // Test the connection
            $adminDatabase = $this->client->selectDatabase('admin');
            $adminDatabase->command(['ping' => 1]);
        } catch (Exception $e) {
            error_log("MongoDB connection error (Orders): " . $e->getMessage());
            throw new Exception("Failed to connect to MongoDB (Orders): " . $e->getMessage());
        }
    }

    /**
     * Save a new order document.
     *
     * Expected structure of $orderData:
     *  - items: array of products with qty, price, subtotal, etc.
     *  - payment_method: "cash" | "card"
     *  - total_amount: float
     *  - cash_amount: float|null
     *  - change_amount: float|null
     *  - transaction_id: string
     */
    public function addOrder(array $orderData) {
        try {
            $orderData['created_at'] = new UTCDateTime();

            $result = $this->collection->insertOne($orderData);

            if ($result->getInsertedCount() === 1) {
                return [
                    'success' => true,
                    'message' => 'Order saved successfully',
                    'order_id' => (string) $result->getInsertedId()
                ];
            }

            return ['success' => false, 'message' => 'Failed to save order'];
        } catch (MongoException $e) {
            error_log("MongoDB error adding order: " . $e->getMessage());
            return ['success' => false, 'message' => 'MongoDB error: ' . $e->getMessage()];
        } catch (Exception $e) {
            error_log("General error adding order: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }
}

?>


