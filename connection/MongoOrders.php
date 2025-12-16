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
            
            // Set default status as Pending if not provided
            if (!isset($orderData['status'])) {
                $orderData['status'] = 'Pending';
            }

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
                
                // Convert served_at timestamp if exists
                if (isset($order['served_at']) && $order['served_at'] instanceof UTCDateTime) {
                    $order['served_at'] = $order['served_at']->toDateTime()->format('Y-m-d H:i:s');
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
     * Update order status with optional cashier tracking
     */
    public function updateOrderStatus($orderId, $newStatus, $servedBy = null, $servedByUsername = null, $servedAt = null) {
        try {
            // Update by order_id or _id
            $filter = [];
            if (is_string($orderId) && strlen($orderId) === 24 && ctype_xdigit($orderId)) {
                // Looks like a MongoDB _id
                $filter['_id'] = new MongoDB\BSON\ObjectId($orderId);
            } else {
                // Treat as order_id
                $filter['order_id'] = $orderId;
            }
            
            // Base update
            $updateData = ['status' => $newStatus];
            
            // Add cashier tracking if marking as served or canceled
            if (($newStatus === 'Served' || $newStatus === 'Canceled') && $servedBy) {
                $updateData['served_by'] = $servedBy;
                $updateData['served_by_username'] = $servedByUsername;
                $updateData['served_at'] = $servedAt ? new UTCDateTime(strtotime($servedAt) * 1000) : new UTCDateTime();
                
                // Add specific action field to distinguish between served and canceled
                $updateData['action_type'] = $newStatus === 'Served' ? 'served' : 'canceled';
            } elseif ($newStatus === 'Pending') {
                // Clear served_by info if changing back to pending
                $updateData['served_by'] = null;
                $updateData['served_by_username'] = null;
                $updateData['served_at'] = null;
                $updateData['action_type'] = null;
            }
            
            $update = ['$set' => $updateData];
            
            $result = $this->collection->updateOne($filter, $update);
            
            if ($result->getModifiedCount() === 1) {
                // Track cashier performance for both served and canceled orders
                if (($newStatus === 'Served' || $newStatus === 'Canceled') && $servedByUsername) {
                    $this->trackCashierPerformance($servedByUsername, $orderId, $newStatus);
                }
                
                return [
                    'success' => true,
                    'message' => 'Order status updated successfully'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Order not found or no changes made'
                ];
            }
            
        } catch (MongoException $e) {
            error_log("MongoDB error updating order status: " . $e->getMessage());
            return ['success' => false, 'message' => 'MongoDB error: ' . $e->getMessage()];
        } catch (Exception $e) {
            error_log("General error updating order status: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error: ' . $e->getMessage()];
        }
    }

    /**
     * Track cashier performance when they serve orders
     */
    private function trackCashierPerformance($cashierUsername, $orderId, $status) {
        try {
            $cashierPerformanceCollection = $this->database->selectCollection('CashierPerformance');
            
            // Get order details for tracking
            $order = $this->collection->findOne(['order_id' => $orderId]);
            
            if ($order) {
                $performanceData = [
                    'cashier_username' => $cashierUsername,
                    'order_id' => $orderId,
                    'status' => $status,
                    'order_amount' => isset($order['total_amount']) ? $order['total_amount'] : 0,
                    'served_at' => new UTCDateTime(),
                    'date' => date('Y-m-d')
                ];
                
                $cashierPerformanceCollection->insertOne($performanceData);
                error_log("Tracked performance for cashier: $cashierUsername, order: $orderId");
            }
        } catch (Exception $e) {
            error_log("Error tracking cashier performance: " . $e->getMessage());
            // Don't fail the main operation if performance tracking fails
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


