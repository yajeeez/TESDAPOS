<?php
// MySQL Database Configuration for Verification Codes

// MySQL connection settings
$mysql_host = 'localhost';
$mysql_port = '3306';
$mysql_dbname = 'tesda_verification';
$mysql_username = 'root';
$mysql_password = '';

// Create PDO connection
try {
    $pdo = new PDO(
        "mysql:host=$mysql_host;port=$mysql_port;dbname=$mysql_dbname;charset=utf8mb4",
        $mysql_username,
        $mysql_password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    // If database doesn't exist, try to create it
    try {
        // Connect without database name first
        $pdo_temp = new PDO(
            "mysql:host=$mysql_host;port=$mysql_port;charset=utf8mb4",
            $mysql_username,
            $mysql_password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        
        // Create database
        $pdo_temp->exec("CREATE DATABASE IF NOT EXISTS $mysql_dbname");
        $pdo_temp->exec("USE $mysql_dbname");
        
        // Create verification codes table
        $pdo_temp->exec("
            CREATE TABLE IF NOT EXISTS verification_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(6) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP NULL,
                INDEX idx_email (email),
                INDEX idx_created_at (created_at)
            )
        ");
        
        // Now connect to the created database
        $pdo = new PDO(
            "mysql:host=$mysql_host;port=$mysql_port;dbname=$mysql_dbname;charset=utf8mb4",
            $mysql_username,
            $mysql_password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        
    } catch (PDOException $e) {
        throw new Exception('Failed to create/connect to MySQL database: ' . $e->getMessage());
    }
}
?>
