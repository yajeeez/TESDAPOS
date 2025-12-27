<?php
/**
 * Clear All Audit Logs
 * This script will delete all existing audit trail entries
 * Use with caution - this action cannot be undone!
 */

require_once __DIR__ . '/../includes/session.php';

// Require admin login
SessionManager::requireLogin();

// Check if user is admin
if (SessionManager::getUserRole() !== 'admin') {
    die('Access denied. Admin privileges required.');
}

$auditFile = __DIR__ . '/../backups/audit_log.json';

if (file_exists($auditFile)) {
    // Create a backup before clearing
    $backupFile = __DIR__ . '/../backups/audit_log_backup_' . date('Y-m-d_H-i-s') . '.json';
    copy($auditFile, $backupFile);
    
    // Clear the audit log (create empty array)
    $emptyLog = [];
    file_put_contents($auditFile, json_encode($emptyLog, JSON_PRETTY_PRINT));
    
    echo "✅ Audit logs cleared successfully!<br>";
    echo "📦 Backup created: " . basename($backupFile) . "<br><br>";
    echo "<a href='components/Maintenance.php'>← Back to Maintenance</a>";
} else {
    echo "❌ Audit log file not found.<br><br>";
    echo "<a href='components/Maintenance.php'>← Back to Maintenance</a>";
}
?>
