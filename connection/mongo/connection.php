<?php
require __DIR__ . '/../../config/database.php'; // Load configuration

// Since we have the MongoDB extension directly, we can use it without Composer
class MongoConnection {
    private static $client = null;

    public static function getClient() {
        if (self::$client === null) {
            try {
                // Use the MongoDB extension directly
                self::$client = new MongoDB\Driver\Manager(DB_URI);
                
                // Test connection by listing databases
                $command = new MongoDB\Driver\Command(['listDatabases' => 1]);
                self::$client->executeCommand('admin', $command);
                
            } catch (Exception $e) {
                die("❌ MongoDB Connection Error: " . $e->getMessage());
            }
        }
        return self::$client;
    }
    
    public static function getDatabase($databaseName) {
        return new MongoDB\Driver\Manager(DB_URI . '/' . $databaseName);
    }
}
