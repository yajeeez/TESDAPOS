<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use MongoDB\Client;

/**
 * MongoDB Inventory Management Class
 * Fixed version with proper error handling and IDE compatibility
 */
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
            $this->client->selectDatabase('admin')->command(['ping' => 1]);
        } catch (\Exception $e) {
            error_log("MongoDB connection error: " . $e->getMessage());
            throw new \Exception("Failed to connect to MongoDB: " . $e->getMessage());
        }
    }
    
    /**
     * Add a new product to inventory
     */
    public function addProduct($productData) {
        try {
            // Add timestamp for creation using proper class names
            $productData['created_at'] = new \MongoDB\BSON\UTCDateTime();
            $productData['updated_at'] = new \MongoDB\BSON\UTCDateTime();
            
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
        } catch (\Exception $e) {
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
        } catch (\Exception $e) {
            error_log("Error fetching products: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Update a product in inventory
     */
    public function updateProduct($productId, $updateData) {
        try {
            // Add timestamp for update using proper class name
            $updateData['updated_at'] = new \MongoDB\BSON\UTCDateTime();
            
            $result = $this->collection->updateOne(
                ['_id' => new \MongoDB\BSON\ObjectId($productId)],
                ['$set' => $updateData]
            );
            
            if ($result->getModifiedCount() === 1) {
                return ['success' => true, 'message' => 'Product updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Product not found or no changes made'];
            }
        } catch (\Exception $e) {
            error_log("Error updating product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Delete a product from inventory
     */
    public function deleteProduct($productId) {
        try {
            $result = $this->collection->deleteOne(['_id' => new \MongoDB\BSON\ObjectId($productId)]);
            
            if ($result->getDeletedCount() === 1) {
                return ['success' => true, 'message' => 'Product deleted successfully'];
            } else {
                return ['success' => false, 'message' => 'Product not found'];
            }
        } catch (\Exception $e) {
            error_log("Error deleting product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Get a single product by ID
     */
    public function getProductById($productId) {
        try {
            $document = $this->collection->findOne(['_id' => new \MongoDB\BSON\ObjectId($productId)]);
            
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
        } catch (\Exception $e) {
            error_log("Error fetching product: " . $e->getMessage());
            return ['success' => false, 'message' => 'Database error: ' . $e->getMessage()];
        }
    }
    
    /**
     * Test connection method
     */
    public function testConnection() {
        try {
            $this->client->selectDatabase('admin')->command(['ping' => 1]);
            return ['success' => true, 'message' => 'MongoDB connection is working'];
        } catch (\Exception $e) {
            return ['success' => false, 'message' => 'MongoDB connection failed: ' . $e->getMessage()];
        }
    }
}
?>