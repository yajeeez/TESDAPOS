<?php
require __DIR__ . '/../../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Driver\Exception\Exception;
use MongoDB\BSON\UTCDateTime;

class DatabaseOperations {
    private $client;
    private $db;
    
    public function __init__($databaseName = 'sampleDB') {
        $this->client = MongoConnection::getClient();
        $this->db = $this->client->$databaseName;
    }
    
    // Create a new collection
    public function createCollection($collectionName) {
        try {
            $this->db->createCollection($collectionName);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    
    // Insert a single document
    public function insertDocument($collectionName, $document) {
        try {
            $collection = $this->db->$collectionName;
            $result = $collection->insertOne($document);
            return $result->getInsertedId();
        } catch (Exception $e) {
            throw new Exception("Failed to insert document: " . $e->getMessage());
        }
    }
    
    // Insert multiple documents
    public function insertManyDocuments($collectionName, $documents) {
        try {
            $collection = $this->db->$collectionName;
            $result = $collection->insertMany($documents);
            return $result->getInsertedCount();
        } catch (Exception $e) {
            throw new Exception("Failed to insert documents: " . $e->getMessage());
        }
    }
    
    // Find documents
    public function findDocuments($collectionName, $filter = [], $options = []) {
        try {
            $collection = $this->db->$collectionName;
            return $collection->find($filter, $options);
        } catch (Exception $e) {
            throw new Exception("Failed to find documents: " . $e->getMessage());
        }
    }
    
    // Find one document
    public function findOneDocument($collectionName, $filter = []) {
        try {
            $collection = $this->db->$collectionName;
            return $collection->findOne($filter);
        } catch (Exception $e) {
            throw new Exception("Failed to find document: " . $e->getMessage());
        }
    }
    
    // Update a document
    public function updateDocument($collectionName, $filter, $update) {
        try {
            $collection = $this->db->$collectionName;
            $result = $collection->updateOne($filter, $update);
            return $result->getModifiedCount();
        } catch (Exception $e) {
            throw new Exception("Failed to update document: " . $e->getMessage());
        }
    }
    
    // Delete documents
    public function deleteDocuments($collectionName, $filter) {
        try {
            $collection = $this->db->$collectionName;
            $result = $collection->deleteMany($filter);
            return $result->getDeletedCount();
        } catch (Exception $e) {
            throw new Exception("Failed to delete documents: " . $e->getMessage());
        }
    }
    
    // Count documents
    public function countDocuments($collectionName, $filter = []) {
        try {
            $collection = $this->db->$collectionName;
            return $collection->countDocuments($filter);
        } catch (Exception $e) {
            throw new Exception("Failed to count documents: " . $e->getMessage());
        }
    }
    
    // List all collections
    public function listCollections() {
        try {
            return $this->db->listCollections();
        } catch (Exception $e) {
            throw new Exception("Failed to list collections: " . $e->getMessage());
        }
    }
    
    // Drop a collection
    public function dropCollection($collectionName) {
        try {
            $this->db->$collectionName->drop();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}

// Example usage functions
function createSampleUser($name, $email, $role) {
    $dbOps = new DatabaseOperations();
    $user = [
        'name' => $name,
        'email' => $email,
        'role' => $role,
        'created_at' => new UTCDateTime(),
        'status' => 'active'
    ];
    
    return $dbOps->insertDocument('users', $user);
}

function getAllUsers() {
    $dbOps = new DatabaseOperations();
    return $dbOps->findDocuments('users');
}

function getUserByEmail($email) {
    $dbOps = new DatabaseOperations();
    return $dbOps->findOneDocument('users', ['email' => $email]);
} 