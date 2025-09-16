<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/mongostubs.php'; // Include MongoDB stubs for IDE support

use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use MongoDB\Exception\Exception as MongoException;

class MongoInventory {
    private $client;
    private $database;
    private $collection;
    
    public function __construct() {
        try {
            // Create MongoDB client using the configuration
            $this->client = new Client(DB_URI);
            $this->database = $this->client->selectDatabase('TESDAPOS1');
            $this->collection = $this->database->selectCollection('Inventory');
            
            // Test the connection
            $adminDatabase = $this->client->selectDatabase('admin');
            $adminDatabase->command(['ping' => 1]);
        } catch (Exception $e) {
            error_log("MongoDB connection error: " . $e->getMessage());
            throw new Exception("Failed to connect to MongoDB: " . $e->getMessage());
        }
    }
    
    /**
     * Add a new product to inventory
     */
    public function addProduct($productData) {
        try {
            // Add timestamp for creation
            $productData['created_at'] = new UTCDateTime();
            $productData['updated_at'] = new UTCDateTime();
            
            // Insert the product
            $result = $this->collection->insertOne($productData);
            
            if ($result->getInsertedCount() === 1) {
                return [
                    'success' => true, 
                    'message' => 'Product added successfully',
                    'product_id' => (string) $result->getInsertedId()
                ];
            } else {
                return ['success' => false, 'message' => 'Failed to add product'];
            }
        } catch (Exception $e) {
            error_log("Error adding product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get all products from inventory
     */
    public function getAllProducts() {
        try {
            $cursor = $this->collection->find([], ['sort' => ['created_at' => -1]]);
            $products = [];
            
            foreach ($cursor as $document) {
                $product = [
                    'id' => (string) $document['_id'],
                    'product_name' => $document['product_name'] ?? '',
                    'category' => $document['category'] ?? '',
                    'price' => (float) ($document['price'] ?? 0),
                    'stock_quantity' => (int) ($document['stock_quantity'] ?? 0),
                    'image_path' => $document['image_path'] ?? '',
                    'created_at' => $document['created_at'] ?? null,
                    'updated_at' => $document['updated_at'] ?? null
                ];
                $products[] = $product;
            }
            
            return ['success' => true, 'products' => $products];
        } catch (Exception $e) {
            error_log("Error fetching products: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update a product in inventory
     */
    public function updateProduct($productId, $updateData) {
        try {
            // Add timestamp for update
            $updateData['updated_at'] = new UTCDateTime();
            
            $result = $this->collection->updateOne(
                ['_id' => new ObjectId($productId)],
                ['$set' => $updateData]
            );
            
            if ($result->getModifiedCount() === 1) {
                return ['success' => true, 'message' => 'Product updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Product not found or no changes made'];
            }
        } catch (Exception $e) {
            error_log("Error updating product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Delete a product from inventory
     */
    public function deleteProduct($productId) {
        try {
            $result = $this->collection->deleteOne(['_id' => new ObjectId($productId)]);
            
            if ($result->getDeletedCount() === 1) {
                return ['success' => true, 'message' => 'Product deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Product not found'];
            }
        } catch (Exception $e) {
            error_log("Error deleting product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get a single product by ID
     */
    public function getProductById($productId) {
        try {
            $document = $this->collection->findOne(['_id' => new ObjectId($productId)]);
            
            if ($document) {
                $product = [
                    'id' => (string) $document['_id'],
                    'product_name' => $document['product_name'] ?? '',
                    'category' => $document['category'] ?? '',
                    'price' => (float) ($document['price'] ?? 0),
                    'stock_quantity' => (int) ($document['stock_quantity'] ?? 0),
                    'image_path' => $document['image_path'] ?? '',
                    'created_at' => $document['created_at'] ?? null,
                    'updated_at' => $document['updated_at'] ?? null
                ];
                
                return ['success' => true, 'product' => $product];
            } else {
                return ['success' => false, 'message' => 'Product not found'];
            }
        } catch (Exception $e) {
            error_log("Error fetching product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
}
?>