<?php
// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// Capture any output that might interfere with JSON
ob_start();

try {
    // Include PHPMailer autoloader
    require_once __DIR__ . '/../../vendor/autoload.php';
    
    // Database connection
    require_once __DIR__ . '/../../config/database.php';
    
    // Test MongoDB connection
    try {
        $client = new MongoDB\Client(DB_URI);
        $database = $client->selectDatabase(DB_NAME);
        $database->command(['ping' => 1]);
    } catch (Exception $e) {
        throw new Exception('MongoDB connection failed: ' . $e->getMessage());
    }
    
    // Test PHPMailer loading
    if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
        throw new Exception('PHPMailer class not found');
    }
    
    // Clean any buffered output
    ob_clean();
    
    // Return success
    echo json_encode([
        'success' => true, 
        'message' => 'All dependencies loaded successfully',
        'database' => 'Connected',
        'phpmailer' => 'Loaded'
    ]);
    
} catch (Exception $e) {
    // Clean any buffered output
    ob_clean();
    
    echo json_encode([
        'success' => false, 
        'message' => $e->getMessage(),
        'error_details' => 'Check vendor/autoload.php and database.php'
    ]);
}

// End output buffering
ob_end_flush();
?>
