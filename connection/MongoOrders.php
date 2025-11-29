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
     * Get the MongoDB collection (for migration purposes)
     */
    public function getCollection() {
        return $this->collection;
    }

    /**
     * Get the next sequential order ID
     */
    private function getNextOrderId() {
        try {
            // Find the order with the highest order_id
            $cursor = $this->collection->find(
                ['order_id' => ['$exists' => true]],
                ['sort' => ['order_id' => -1], 'limit' => 1]
            );
            
            $highestOrderId = 0;
            foreach ($cursor as $document) {
                $order = (array) $document;
                if (isset($order['order_id'])) {
                    // Remove leading zeros and convert to integer
                    $highestOrderId = (int) ltrim($order['order_id'], '0');
                    break;
                }
            }
            
            // Increment and format with leading zeros
            $nextOrderId = $highestOrderId + 1;
            return str_pad($nextOrderId, 2, '0', STR_PAD_LEFT);
        } catch (Exception $e) {
            error_log("Error getting next order ID: " . $e->getMessage());
            // If there's an error, start with 01
            return '01';
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
            // Generate and add order_id
            $orderData['order_id'] = $this->getNextOrderId();
            $orderData['created_at'] = new UTCDateTime();

            $result = $this->collection->insertOne($orderData);

            if ($result->getInsertedCount() === 1) {
                return [
                    'success' => true,
                    'message' => 'Order saved successfully',
                    'order_id' => $orderData['order_id'],
                    'inserted_id' => (string) $result->getInsertedId()
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

    /**
     * Get total sales from all orders
     */
    public function getTotalSales() {
        try {
            $pipeline = [
                [
                    '$group' => [
                        '_id' => null,
                        'totalSales' => ['$sum' => '$total_amount']
                    ]
                ]
            ];

            $result = $this->collection->aggregate($pipeline)->toArray();
            
            if (!empty($result) && isset($result[0]['totalSales'])) {
                return (float) $result[0]['totalSales'];
            }
            
            return 0.0;
        } catch (Exception $e) {
            error_log("Error getting total sales: " . $e->getMessage());
            return 0.0;
        }
    }

    /**
     * Get count of orders created today (based on server's local timezone)
     */
    public function getOrdersToday() {
        try {
            // Get server's default timezone
            $timezone = date_default_timezone_get();
            
            // Get start and end of today in server's local timezone
            $todayStart = new \DateTime('today', new \DateTimeZone($timezone));
            $todayEnd = new \DateTime('tomorrow', new \DateTimeZone($timezone));
            
            // Convert to UTC for MongoDB query (MongoDB stores dates in UTC)
            $todayStart->setTimezone(new \DateTimeZone('UTC'));
            $todayEnd->setTimezone(new \DateTimeZone('UTC'));
            
            $startUTCDateTime = new UTCDateTime($todayStart->getTimestamp() * 1000);
            $endUTCDateTime = new UTCDateTime($todayEnd->getTimestamp() * 1000);
            
            $filter = [
                'created_at' => [
                    '$gte' => $startUTCDateTime,
                    '$lt' => $endUTCDateTime
                ]
            ];
            
            $count = $this->collection->countDocuments($filter);
            return (int) $count;
        } catch (Exception $e) {
            error_log("Error getting orders today: " . $e->getMessage());
            return 0;
        }
    }

    /**
     * Get all orders with sequential order IDs
     */
    public function getAllOrders() {
        try {
            $cursor = $this->collection->find([], [
                'sort' => ['order_id' => -1]
            ]);
            
            $orders = [];
            
            foreach ($cursor as $document) {
                $order = (array) $document;
                
                // Convert MongoDB's UTCDateTime to readable format
                if (isset($order['created_at']) && $order['created_at'] instanceof UTCDateTime) {
                    $order['created_at'] = $order['created_at']->toDateTime()->format('Y-m-d H:i:s');
                }
                
                // Extract product names from items array for display
                if (isset($order['items']) && is_array($order['items'])) {
                    $productNames = [];
                    foreach ($order['items'] as $item) {
                        if (isset($item['name'])) {
                            $productNames[] = $item['name'];
                        }
                    }
                    $order['product_names'] = $productNames;
                    $order['total_item_count'] = count($productNames);
                }
                
                $orders[] = $order;
            }
            
            return [
                'success' => true,
                'orders' => $orders
            ];
        } catch (Exception $e) {
            error_log("Error getting all orders: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get dashboard metrics (total sales and orders today)
     */
    public function getDashboardMetrics() {
        try {
            $totalSales = $this->getTotalSales();
            $ordersToday = $this->getOrdersToday();
            
            return [
                'success' => true,
                'totalSales' => $totalSales,
                'ordersToday' => $ordersToday
            ];
        } catch (Exception $e) {
            error_log("Error getting dashboard metrics: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'totalSales' => 0.0,
                'ordersToday' => 0
            ];
        }
    }
}

?>


