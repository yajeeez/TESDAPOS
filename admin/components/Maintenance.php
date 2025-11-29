<?php
// Start session and check authentication

// Add any necessary PHP logic here
$test = 'test';

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../connection/MongoOrders.php';
require_once __DIR__ . '/../../connection/MongoInventory.php';

// Define all functions first
function logAudit($action, $details = '') {
    $auditFile = __DIR__ . '/../../backups/audit_log.json';
    $auditDir = dirname($auditFile);
    
    if (!is_dir($auditDir)) {
        mkdir($auditDir, 0755, true);
    }
    
    $auditData = [];
    if (file_exists($auditFile)) {
        $auditData = json_decode(file_get_contents($auditFile), true) ?: [];
    }
    
    $auditData[] = [
        'timestamp' => date('Y-m-d H:i:s'),
        'action' => $action,
        'details' => $details,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ];
    
    file_put_contents($auditFile, json_encode($auditData, JSON_PRETTY_PRINT));
}

function formatFileSize($bytes) {
    if ($bytes === 0) return '0 Bytes';
    $k = 1024;
    $sizes = ['Bytes', 'KB', 'MB', 'GB'];
    $i = floor(log($bytes) / log($k));
    return round($bytes / pow($k, $i), 2) . ' ' . $sizes[$i];
}

function performBackup() {
    try {
        $backupDir = __DIR__ . '/../../backups/';
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d_H-i-s');
        $backupFile = $backupDir . 'backup_' . $timestamp . '.json';
        
        $backupData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => defined('APP_VERSION') ? APP_VERSION : '1.0.0',
            'orders' => [],
            'products' => []
        ];
        
        // Check if MongoDB is available before attempting backup
        if (class_exists('MongoOrders') && class_exists('MongoInventory')) {
            try {
                // Connect to MongoDB
                $mongoOrders = new MongoOrders();
                $mongoInventory = new MongoInventory();
                
                // Backup orders from Orders collection
                try {
                    $ordersCollection = $mongoOrders->getCollection();
                    $cursor = $ordersCollection->find([]);
                    $orders = [];
                    foreach ($cursor as $document) {
                        $orders[] = $document;
                    }
                    $backupData['orders'] = $orders;
                } catch (Exception $e) {
                    $backupData['orders'] = ['error' => 'Failed to backup orders: ' . $e->getMessage()];
                }
                
                // Backup products from Inventory collection
                try {
                    $productsCollection = $mongoInventory->getCollection();
                    $cursor = $productsCollection->find([]);
                    $products = [];
                    foreach ($cursor as $document) {
                        $products[] = $document;
                    }
                    $backupData['products'] = $products;
                } catch (Exception $e) {
                    $backupData['products'] = ['error' => 'Failed to backup products: ' . $e->getMessage()];
                }
            } catch (Exception $e) {
                $backupData['orders'] = ['error' => 'MongoDB connection failed: ' . $e->getMessage()];
                $backupData['products'] = ['error' => 'MongoDB connection failed: ' . $e->getMessage()];
            }
        } else {
            $backupData['orders'] = ['error' => 'MongoDB classes not available'];
            $backupData['products'] = ['error' => 'MongoDB classes not available'];
        }
        
        // Write backup file
        $jsonContent = json_encode($backupData, JSON_PRETTY_PRINT);
        if (file_put_contents($backupFile, $jsonContent) === false) {
            throw new Exception('Failed to write backup file');
        }
        
        $fileSize = filesize($backupFile);
        $fileName = basename($backupFile);
        
        // Log the backup action
        try {
            logAudit('backup', "Backup created: {$fileName} (Size: " . round($fileSize / 1024 / 1024, 2) . " MB)");
        } catch (Exception $e) {
            // Ignore audit logging errors
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Backup completed successfully',
            'file' => $fileName,
            'size' => $fileSize,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        // Log the failed backup
        try {
            logAudit('backup', 'Backup failed: ' . $e->getMessage());
        } catch (Exception $auditError) {
            // Ignore audit logging errors
        }
        
        echo json_encode([
            'success' => false,
            'message' => 'Backup failed: ' . $e->getMessage()
        ]);
    }
}

function getAuditTrail() {
    try {
        $auditFile = __DIR__ . '/../../backups/audit_log.json';
        $auditData = [];
        
        if (file_exists($auditFile)) {
            $content = file_get_contents($auditFile);
            $auditData = json_decode($content, true) ?: [];
        }
        
        // Sort by timestamp (newest first)
        usort($auditData, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        // Log the audit trail access
        logAudit('audit_view', 'Audit trail viewed - ' . count($auditData) . ' entries');
        
        echo json_encode([
            'success' => true,
            'data' => array_slice($auditData, 0, 50) // Last 50 entries
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to load audit trail: ' . $e->getMessage()
        ]);
    }
}

function performSystemCheck() {
    $checks = [];
    
    // Check database connection
    try {
        // Check if MongoDB classes exist first
        if (!class_exists('MongoDB\Client')) {
            $checks['database'] = ['status' => 'error', 'message' => 'MongoDB driver not installed'];
        } else {
            $mongoOrders = new MongoOrders();
            // Test connection by listing collections (this will throw if connection fails)
            $mongoOrders->getCollection()->findOne([]);
            $checks['database'] = ['status' => 'healthy', 'message' => 'Database connection successful'];
        }
    } catch (Exception $e) {
        $checks['database'] = ['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()];
    } catch (Error $e) {
        $checks['database'] = ['status' => 'error', 'message' => 'Database system error: ' . $e->getMessage()];
    }
    
    // Check backup directory
    $backupDir = __DIR__ . '/../../backups/';
    if (is_dir($backupDir) && is_writable($backupDir)) {
        $checks['backup_dir'] = ['status' => 'healthy', 'message' => 'Backup directory accessible'];
    } else {
        $checks['backup_dir'] = ['status' => 'error', 'message' => 'Backup directory not writable'];
    }
    
    // Check upload directory
    $uploadDir = __DIR__ . '/../../uploads/';
    if (is_dir($uploadDir) && is_writable($uploadDir)) {
        $checks['upload_dir'] = ['status' => 'healthy', 'message' => 'Upload directory accessible'];
    } else {
        $checks['upload_dir'] = ['status' => 'error', 'message' => 'Upload directory not writable'];
    }
    
    // Check disk space
    $freeSpace = disk_free_space(__DIR__);
    $totalSpace = disk_total_space(__DIR__);
    $usedPercent = (($totalSpace - $freeSpace) / $totalSpace) * 100;
    
    if ($usedPercent < 80) {
        $checks['disk_space'] = ['status' => 'healthy', 'message' => 'Disk space: ' . round($usedPercent, 2) . '% used'];
    } else {
        $checks['disk_space'] = ['status' => 'warning', 'message' => 'Disk space: ' . round($usedPercent, 2) . '% used (High)'];
    }
    
    // Check PHP version
    $phpVersion = PHP_VERSION;
    if (version_compare($phpVersion, '7.4.0', '>=')) {
        $checks['php_version'] = ['status' => 'healthy', 'message' => 'PHP Version: ' . $phpVersion];
    } else {
        $checks['php_version'] = ['status' => 'warning', 'message' => 'PHP Version: ' . $phpVersion . ' (Consider upgrading)'];
    }
    
    // Check MongoDB extension
    if (extension_loaded('mongodb')) {
        $checks['mongodb_extension'] = ['status' => 'healthy', 'message' => 'MongoDB extension loaded'];
    } else {
        $checks['mongodb_extension'] = ['status' => 'error', 'message' => 'MongoDB extension not loaded'];
    }
    
    // Determine overall status
    $overallStatus = 'healthy';
    foreach ($checks as $check) {
        if ($check['status'] === 'error') {
            $overallStatus = 'error';
            break;
        } elseif ($check['status'] === 'warning' && $overallStatus === 'healthy') {
            $overallStatus = 'warning';
        }
    }
    
    // Log the system check
    try {
        logAudit('system_check', 'System health check performed - Status: ' . $overallStatus);
    } catch (Exception $e) {
        // Ignore audit logging errors
    }
    
    echo json_encode([
        'success' => true,
        'checks' => $checks,
        'overall_status' => $overallStatus
    ]);
}

function listBackups() {
    try {
        $backupDir = __DIR__ . '/../../backups/';
        $backups = [];
        
        if (is_dir($backupDir)) {
            $files = scandir($backupDir);
            foreach ($files as $file) {
                if ($file !== '.' && $file !== '..' && strpos($file, 'backup_') === 0 && strpos($file, '.json') !== false) {
                    $filePath = $backupDir . $file;
                    $fileSize = filesize($filePath);
                    $fileModTime = filemtime($filePath);
                    
                    $backups[] = [
                        'name' => $file,
                        'size' => formatFileSize($fileSize),
                        'timestamp' => date('Y-m-d H:i:s', $fileModTime),
                        'path' => $filePath
                    ];
                }
            }
        }
        
        // Sort by timestamp (newest first)
        usort($backups, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });
        
        echo json_encode([
            'success' => true,
            'backups' => $backups
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to list backups: ' . $e->getMessage()
        ]);
    }
}

function downloadBackup() {
    $filename = $_POST['filename'] ?? '';
    if (empty($filename)) {
        echo json_encode(['success' => false, 'message' => 'Filename not provided']);
        return;
    }
    
    $backupDir = __DIR__ . '/../../backups/';
    $filePath = $backupDir . $filename;
    
    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'Backup file not found']);
        return;
    }
    
    // Log the download
    logAudit('backup_download', "Backup downloaded: {$filename}");
    
    echo json_encode([
        'success' => true,
        'download_url' => "/TESDAPOS/backups/{$filename}"
    ]);
}

function deleteBackup() {
    $filename = $_POST['filename'] ?? '';
    if (empty($filename)) {
        echo json_encode(['success' => false, 'message' => 'Filename not provided']);
        return;
    }
    
    $backupDir = __DIR__ . '/../../backups/';
    $filePath = $backupDir . $filename;
    
    if (!file_exists($filePath)) {
        echo json_encode(['success' => false, 'message' => 'Backup file not found']);
        return;
    }
    
    if (unlink($filePath)) {
        // Log the deletion
        logAudit('backup_delete', "Backup deleted: {$filename}");
        
        echo json_encode([
            'success' => true,
            'message' => 'Backup deleted successfully'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to delete backup file'
        ]);
    }
}

// Handle maintenance actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Disable error display for API responses to prevent HTML error output
    ini_set('display_errors', 0);
    error_reporting(0);
    
    // Clear any output buffers to ensure clean JSON response
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    // Set JSON content type header
    header('Content-Type: application/json');
    
    $action = $_POST['action'] ?? '';
    
    try {
        switch ($action) {
            case 'backup':
                performBackup();
                break;
            case 'audit_trail':
                getAuditTrail();
                break;
            case 'system_check':
                performSystemCheck();
                break;
            case 'list_backups':
                listBackups();
                break;
            case 'download_backup':
                downloadBackup();
                break;
            case 'delete_backup':
                deleteBackup();
                break;
            default:
                echo json_encode(['success' => false, 'message' => 'Invalid action']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    } catch (Error $e) {
        echo json_encode(['success' => false, 'message' => 'System error: ' . $e->getMessage()]);
    }
    exit;
}

// Log page access (only when not handling POST requests)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    try {
        logAudit('page_access', 'Maintenance page accessed');
    } catch (Exception $e) {
        // Silently ignore audit logging errors on page load
    }
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>TESDA POS - Maintenance</title>
  <link rel="icon" type="image/x-icon" href="../../favicon.ico">
  <link rel="stylesheet" href="../assets/css/Maintenance.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="dashboard">

    <!-- Sidebar -->
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="../../img/TESDAG.png" alt="TESDA Logo" class="tesda-logo" />
      </div>
      <h2>TESDA POS</h2>
      <ul>
        <li><a href="AdminDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
        <li><a href="CreateProducts.php"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
        <li><a href="Inventory.php"><i class="fas fa-boxes"></i><span>Inventory</span></a></li>
        <li><a href="Transactions.php"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="Maintenance.php" class="active"><i class="fas fa-tools"></i><span>Maintenance</span></a></li>
        <li><a href="#" onclick="logout(event)"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <!-- Main Content -->
    <main class="main">

      <!-- Topbar -->
      <div class="topbar">
        <div class="topbar-left">
          <h2>Maintenance</h2>
        </div>
        <div class="topbar-right">
          <input type="text" placeholder="Search..." class="search-input" />
        </div>
      </div>

      <!-- Maintenance Section -->
      <section id="maintenance" class="page-section">
        <div id="maintenanceContent">
          <div class="maintenance-header">
            <h3><i class="fas fa-tools"></i> System Maintenance</h3>
            <p>Perform regular system checkups, backup data, and monitor audit trails</p>
          </div>

          <!-- System Status Cards -->
          <div class="status-grid">
            <div class="status-card" id="systemStatus">
              <div class="status-icon">
                <i class="fas fa-heartbeat"></i>
              </div>
              <div class="status-info">
                <h4>System Health</h4>
                <p id="healthStatus">Checking...</p>
                <button onclick="runSystemCheck()" class="btn btn-primary">
                  <i class="fas fa-sync"></i> Check System
                </button>
              </div>
            </div>

            <div class="status-card">
              <div class="status-icon">
                <i class="fas fa-database"></i>
              </div>
              <div class="status-info">
                <h4>Backup Status</h4>
                <p id="backupStatus">No recent backups</p>
                <button onclick="performBackup()" class="btn btn-success">
                  <i class="fas fa-download"></i> Create Backup
                </button>
              </div>
            </div>

            <div class="status-card">
              <div class="status-icon">
                <i class="fas fa-history"></i>
              </div>
              <div class="status-info">
                <h4>Audit Trail</h4>
                <p id="auditStatus">Monitoring active</p>
                <button onclick="viewAuditTrail()" class="btn btn-info">
                  <i class="fas fa-list"></i> View Logs
                </button>
              </div>
            </div>
          </div>

          <!-- Detailed Information Panels -->
          <div class="maintenance-panels">
            <!-- System Check Results -->
            <div id="systemCheckResults" class="panel" style="display: none;">
              <h4><i class="fas fa-clipboard-check"></i> System Check Results</h4>
              <div id="checkResults" class="check-list"></div>
            </div>

            <!-- Backup History -->
            <div id="backupHistory" class="panel" style="display: none;">
              <h4><i class="fas fa-archive"></i> Recent Backups</h4>
              <div id="backupList" class="backup-list"></div>
            </div>

            <!-- Audit Trail Display -->
            <div id="auditTrailDisplay" class="panel" style="display: none;">
              <h4><i class="fas fa-user-shield"></i> Audit Trail</h4>
              <div class="audit-controls">
                <input type="text" id="auditSearch" placeholder="Search audit logs..." class="search-input">
                <select id="auditFilter" class="filter-select">
                  <option value="">All Actions</option>
                  <option value="backup">Backup</option>
                  <option value="login">Login</option>
                  <option value="order">Order</option>
                  <option value="product">Product</option>
                </select>
              </div>
              <div id="auditList" class="audit-list"></div>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- JS -->
  <script src="../assets/js/Maintenance.js"></script>
</body>
</html>
