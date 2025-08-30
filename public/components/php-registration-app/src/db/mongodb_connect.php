<?php
require 'vendor/autoload.php'; // Include Composer's autoloader

$mongoClient = new MongoDB\Client("mongodb://localhost:27017"); // Replace with your MongoDB connection string

try {
    // Select the database
    $database = $mongoClient->selectDatabase('your_database_name'); // Replace with your database name
    echo "Connected to MongoDB database successfully.";
} catch (MongoDB\Driver\Exception\Exception $e) {
    echo "Failed to connect to MongoDB: " . $e->getMessage();
}
?>