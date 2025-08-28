<?php
/**
 * Simple Autoloader for TESDA POS System
 * This replaces the Composer autoloader since we can't install dependencies
 */

// Autoload function
spl_autoload_register(function ($class) {
    // Convert namespace separators to directory separators
    $file = __DIR__ . '/../' . str_replace('\\', '/', $class) . '.php';
    
    // Check if the file exists
    if (file_exists($file)) {
        require_once $file;
        return true;
    }
    
    return false;
});

// Since we're using the MongoDB extension directly, we don't need to autoload MongoDB classes
// They are already available through the PHP extension
?>
