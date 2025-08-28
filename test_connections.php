<?php
/**
 * TESDA POS System - Connection Test Script
 * This script tests all major system connections and functionality
 */

// Check MongoDB extension first before any output
$mongodbAvailable = extension_loaded('mongodb');

// Start output buffering to prevent header issues
ob_start();

echo "<h1>🧪 TESDA POS System - Connection Test</h1>\n";
echo "<style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .success { background: #d4edda; border-color: #c3e6cb; color: #155724; }
    .error { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
    .warning { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
    .info { background: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
    .test-item { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
    .status { font-weight: bold; }
    .status.ok { color: #28a745; }
    .status.fail { color: #dc3545; }
    .status.warning { color: #ffc107; }
</style>\n";

// Test 1: File System Connections
echo "<div class='test-section info'>\n";
echo "<h2>📁 File System Tests</h2>\n";

$requiredFiles = [
    'index.php' => 'Main entry point',
    'config/database.php' => 'Database configuration',
    'includes/session.php' => 'Session management',
    'includes/navigation.php' => 'Navigation component',
    'connection/mongo/connection.php' => 'MongoDB connection',
    'admin/dashboard.php' => 'Admin dashboard',
    'LandingPage/LandingPage.html' => 'Landing page',
    'menu/menu.html' => 'Menu system',
    'composer.json' => 'Dependencies file'
];

foreach ($requiredFiles as $file => $description) {
    if (file_exists($file)) {
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> $file - $description";
        echo "</div>\n";
    } else {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> $file - $description <strong>MISSING!</strong>";
        echo "</div>\n";
    }
}

echo "</div>\n";

// Test 2: Configuration Loading
echo "<div class='test-section info'>\n";
echo "<h2>⚙️ Configuration Tests</h2>\n";

try {
    if (file_exists('config/database.php')) {
        require_once 'config/database.php';
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Configuration file loaded successfully";
        echo "</div>\n";
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Database URI: " . (defined('DB_URI') ? DB_URI : 'Not defined');
        echo "</div>\n";
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> App Name: " . (defined('APP_NAME') ? APP_NAME : 'Not defined');
        echo "</div>\n";
    } else {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> Configuration file not found";
        echo "</div>\n";
    }
} catch (Exception $e) {
    echo "<div class='test-item'>";
    echo "<span class='status fail'>✗</span> Configuration error: " . $e->getMessage();
    echo "</div>\n";
}

echo "</div>\n";

// Test 3: Composer Dependencies
echo "<div class='test-section info'>\n";
echo "<h2>📦 Composer Dependencies Test</h2>\n";

if (file_exists('vendor/autoload.php')) {
    echo "<div class='test-item'>";
    echo "<span class='status ok'>✓</span> Composer autoloader found";
    echo "</div>\n";
    
    try {
        require_once 'vendor/autoload.php';
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Autoloader loaded successfully";
        echo "</div>\n";
        
        // Check if MongoDB classes are available
        if ($mongodbAvailable) {
            echo "<div class='test-item'>";
            echo "<span class='status ok'>✓</span> MongoDB PHP extension available";
            echo "</div>\n";
        } else {
            echo "<div class='test-item'>";
            echo "<span class='status fail'>✗</span> MongoDB PHP extension not available";
            echo "</div>\n";
        }
    } catch (Exception $e) {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> Autoloader error: " . $e->getMessage();
        echo "</div>\n";
    }
} else {
    echo "<div class='test-item'>";
    echo "<span class='status fail'>✗</span> Composer autoloader not found. Run 'composer install'";
    echo "</div>\n";
}

echo "</div>\n";

// Test 4: MongoDB Connection
echo "<div class='test-section info'>\n";
echo "<h2>🗄️ MongoDB Connection Test</h2>\n";

if ($mongodbAvailable) {
    try {
        require_once 'connection/mongo/connection.php';
        $client = MongoConnection::getClient();
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> MongoDB connection established";
        echo "</div>\n";
        
        // Test database operations using MongoDB\Driver\Manager
        $command = new MongoDB\Driver\Command(['listDatabases' => 1]);
        $cursor = $client->executeCommand('admin', $command);
        $dbList = iterator_to_array($cursor);
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Available databases: " . count($dbList);
        echo "</div>\n";
        
        // Check if tesdapos database exists
        $dbExists = false;
        foreach ($dbList as $db) {
            if (isset($db->name) && $db->name === 'tesdapos') {
                $dbExists = true;
                break;
            }
        }
        
        if ($dbExists) {
            echo "<div class='test-item'>";
            echo "<span class='status ok'>✓</span> TESDAPOS database found";
            echo "</div>\n";
            
            // Check collections
            $command = new MongoDB\Driver\Command(['listCollections' => 1]);
            $cursor = $client->executeCommand('tesdapos', $command);
            $collectionList = iterator_to_array($cursor);
            
            echo "<div class='test-item'>";
            echo "<span class='status ok'>✓</span> Collections found: " . count($collectionList);
            echo "</div>\n";
            
            foreach ($collectionList as $collection) {
                echo "<div class='test-item'>";
                echo "<span class='status ok'>✓</span> Collection: " . $collection->name;
                echo "</div>\n";
            }
        } else {
            echo "<div class='test-item'>";
            echo "<span class='status warning'>⚠</span> TESDAPOS database not found. Run setup script.";
            echo "</div>\n";
        }
        
    } catch (Exception $e) {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> MongoDB connection failed: " . $e->getMessage();
        echo "</div>\n";
    }
} else {
    echo "<div class='test-item'>";
    echo "<span class='status fail'>✗</span> MongoDB PHP extension not available";
    echo "</div>\n";
}

echo "</div>\n";

// Test 5: Session Management
echo "<div class='test-section info'>\n";
echo "<h2>🔐 Session Management Test</h2>\n";

try {
    if (file_exists('includes/session.php')) {
        require_once 'includes/session.php';
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Session manager loaded";
        echo "</div>\n";
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Session status: " . (SessionManager::isLoggedIn() ? 'Logged In' : 'Not Logged In');
        echo "</div>\n";
        
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> Session name: " . session_name();
        echo "</div>\n";
    } else {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> Session manager not found";
        echo "</div>\n";
    }
} catch (Exception $e) {
    echo "<div class='test-item'>";
    echo "<span class='status fail'>✗</span> Session test error: " . $e->getMessage();
    echo "</div>\n";
}

echo "</div>\n";

// Test 6: File Permissions
echo "<div class='test-section info'>\n";
echo "<h2>🔒 File Permissions Test</h2>\n";

$directories = [
    'uploads' => 'Upload directory',
    'img' => 'Image directory',
    'config' => 'Config directory',
    'includes' => 'Includes directory'
];

foreach ($directories as $dir => $description) {
    if (is_dir($dir)) {
        if (is_readable($dir)) {
            echo "<div class='test-item'>";
            echo "<span class='status ok'>✓</span> $dir - Readable";
            echo "</div>\n";
        } else {
            echo "<div class='test-item'>";
            echo "<span class='status fail'>✗</span> $dir - Not readable";
            echo "</div>\n";
        }
        
        if (is_writable($dir)) {
            echo "<div class='test-item'>";
            echo "<span class='status ok'>✓</span> $dir - Writable";
            echo "</div>\n";
        } else {
            echo "<div class='test-item'>";
            echo "<span class='status warning'>⚠</span> $dir - Not writable";
            echo "</div>\n";
        }
    } else {
        echo "<div class='test-item'>";
        echo "<span class='status warning'>⚠</span> $dir - Directory not found";
        echo "</div>\n";
    }
}

echo "</div>\n";

// Test 7: URL Accessibility
echo "<div class='test-section info'>\n";
echo "<h2>🌐 URL Accessibility Test</h2>\n";

$testUrls = [
    'LandingPage/LandingPage.html' => 'Landing Page',
    'admin/dashboard.php' => 'Admin Dashboard',
    'menu/menu.html' => 'Menu System',
    'index.php' => 'Main Entry Point'
];

foreach ($testUrls as $url => $description) {
    if (file_exists($url)) {
        echo "<div class='test-item'>";
        echo "<span class='status ok'>✓</span> $description accessible at: $url";
        echo "</div>\n";
    } else {
        echo "<div class='test-item'>";
        echo "<span class='status fail'>✗</span> $description not accessible at: $url";
        echo "</div>\n";
    }
}

echo "</div>\n";

// Summary
echo "<div class='test-section success'>\n";
echo "<h2>📊 Test Summary</h2>\n";
echo "<p><strong>System Status:</strong> All major connections have been tested.</p>\n";
echo "<p><strong>Next Steps:</strong></p>\n";
echo "<ul>\n";
echo "<li>If MongoDB connection failed, ensure MongoDB service is running</li>\n";
echo "<li>If dependencies are missing, run 'composer install'</li>\n";
echo "<li>If database doesn't exist, run the setup script</li>\n";
echo "<li>Check file permissions for writable directories</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<div class='test-section warning'>\n";
echo "<h2>🚀 Quick Setup Commands</h2>\n";
echo "<p>Run these commands in your project directory if needed:</p>\n";
echo "<pre>\n";
echo "# Install dependencies\n";
echo "composer install\n\n";
echo "# Setup initial users\n";
echo "php connection/mongo/setup_users.php\n\n";
echo "# Test MongoDB connection\n";
echo "php connection/mongo/test_connection.php\n";
echo "</pre>\n";
echo "</div>\n";

echo "<p><em>Test completed at: " . date('Y-m-d H:i:s') . "</em></p>\n";

// Flush output buffer
ob_end_flush();
?> 