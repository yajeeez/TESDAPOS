<?php
/**
 * MongoDB PHP Extension Stubs
 * This file provides class definitions for MongoDB classes to prevent IDE errors
 * Place this file in your project to help IDEs recognize MongoDB types
 */

// Only define stubs if MongoDB extension is not loaded
if (!extension_loaded('mongodb')) {
    
    // MongoDB\Client stub
    if (!class_exists('MongoDB\Client')) {
        class MongoDB_Client {
            public function __construct($uri = null, array $uriOptions = [], array $driverOptions = []) {}
            public function selectDatabase($databaseName) {}
            public function selectCollection($databaseName, $collectionName) {}
        }
        class_alias('MongoDB_Client', 'MongoDB\Client');
    }
    
    // MongoDB\Database stub
    if (!class_exists('MongoDB\Database')) {
        class MongoDB_Database {
            public function selectCollection($collectionName) {}
            public function command($command) {}
        }
        class_alias('MongoDB_Database', 'MongoDB\Database');
    }
    
    // MongoDB\Collection stub
    if (!class_exists('MongoDB\Collection')) {
        class MongoDB_Collection {
            public function insertOne($document) {}
            public function find($filter = [], $options = []) {}
            public function findOne($filter = [], $options = []) {}
            public function updateOne($filter, $update, $options = []) {}
            public function deleteOne($filter, $options = []) {}
            public function count($filter = []) {}
        }
        class_alias('MongoDB_Collection', 'MongoDB\Collection');
    }
    
    // MongoDB\InsertOneResult stub
    if (!class_exists('MongoDB\InsertOneResult')) {
        class MongoDB_InsertOneResult {
            public function getInsertedCount() { return 1; }
            public function getInsertedId() { return 'stub_id'; }
        }
        class_alias('MongoDB_InsertOneResult', 'MongoDB\InsertOneResult');
    }
    
    // MongoDB\UpdateResult stub
    if (!class_exists('MongoDB\UpdateResult')) {
        class MongoDB_UpdateResult {
            public function getModifiedCount() { return 1; }
            public function getMatchedCount() { return 1; }
        }
        class_alias('MongoDB_UpdateResult', 'MongoDB\UpdateResult');
    }
    
    // MongoDB\DeleteResult stub
    if (!class_exists('MongoDB\DeleteResult')) {
        class MongoDB_DeleteResult {
            public function getDeletedCount() { return 1; }
        }
        class_alias('MongoDB_DeleteResult', 'MongoDB\DeleteResult');
    }
    
    // MongoDB\BSON\ObjectId stub
    if (!class_exists('MongoDB\BSON\ObjectId')) {
        class MongoDB_BSON_ObjectId {
            private $id;
            public function __construct($id = null) {
                $this->id = $id ?: uniqid();
            }
            public function __toString() {
                return (string) $this->id;
            }
        }
        class_alias('MongoDB_BSON_ObjectId', 'MongoDB\BSON\ObjectId');
    }
    
    // MongoDB\BSON\UTCDateTime stub
    if (!class_exists('MongoDB\BSON\UTCDateTime')) {
        class MongoDB_BSON_UTCDateTime {
            private $timestamp;
            public function __construct($milliseconds = null) {
                $this->timestamp = $milliseconds ?: time() * 1000;
            }
            public function toDateTime() {
                return new DateTime('@' . ($this->timestamp / 1000));
            }
        }
        class_alias('MongoDB_BSON_UTCDateTime', 'MongoDB\BSON\UTCDateTime');
    }
    
    // MongoDB\Exception\Exception stub
    if (!class_exists('MongoDB\Exception\Exception')) {
        class MongoDB_Exception_Exception extends Exception {}
        class_alias('MongoDB_Exception_Exception', 'MongoDB\Exception\Exception');
    }
    
    // MongoDB\Driver\Exception\Exception stub
    if (!class_exists('MongoDB\Driver\Exception\Exception')) {
        class MongoDB_Driver_Exception_Exception extends Exception {}
        class_alias('MongoDB_Driver_Exception_Exception', 'MongoDB\Driver\Exception\Exception');
    }
}

/**
 * Helper function to test MongoDB connection
 */
function test_mongodb_connection($uri = 'mongodb://localhost:27017') {
    try {
        if (!extension_loaded('mongodb')) {
            return [
                'success' => false,
                'error' => 'MongoDB extension not loaded'
            ];
        }
        
        $client = new MongoDB\Client($uri);
        $client->selectDatabase('admin')->command(['ping' => 1]);
        
        return [
            'success' => true,
            'message' => 'MongoDB connection successful'
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

?>