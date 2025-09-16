<?php
// Enable error reporting for debugging
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);

// Start output buffering
ob_start();

// Set JSON header
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Clean output buffer
    ob_clean();
    
    // Image directory path
    $imageDir = __DIR__ . '/../img/product/';
    $webPath = 'img/product/';
    
    // Check if directory exists
    if (!is_dir($imageDir)) {
        echo json_encode([
            'success' => true, 
            'images' => [],
            'message' => 'Image directory does not exist'
        ]);
        exit();
    }
    
    // Get list of image files
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    $images = [];
    
    $files = scandir($imageDir);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        
        $filePath = $imageDir . $file;
        if (is_file($filePath)) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (in_array($extension, $allowedExtensions)) {
                $images[] = [
                    'filename' => $file,
                    'path' => $webPath . $file,
                    'size' => filesize($filePath),
                    'modified' => filemtime($filePath),
                    'extension' => $extension
                ];
            }
        }
    }
    
    // Sort by modification time (newest first)
    usort($images, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
    
    echo json_encode([
        'success' => true,
        'images' => $images,
        'count' => count($images)
    ]);
    
} catch (Exception $e) {
    error_log("Error listing images: " . $e->getMessage());
    echo json_encode([
        'success' => false, 
        'message' => 'Server error occurred: ' . $e->getMessage()
    ]);
}

ob_end_flush();
?>