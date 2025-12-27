<?php
/**
 * Shared Audit Logger
 * This file provides audit logging functionality for the entire application
 */

require_once __DIR__ . '/session.php';

class AuditLogger {
    private static $auditFile = null;
    
    /**
     * Initialize the audit file path
     */
    private static function init() {
        if (self::$auditFile === null) {
            self::$auditFile = __DIR__ . '/../backups/audit_log.json';
            $auditDir = dirname(self::$auditFile);
            
            if (!is_dir($auditDir)) {
                mkdir($auditDir, 0755, true);
            }
        }
    }
    
    /**
     * Log an audit entry
     * 
     * @param string $action The action being performed
     * @param string $details Details about the action
     * @param array $additionalData Optional additional data to log
     */
    public static function log($action, $details = '', $additionalData = []) {
        self::init();
        
        try {
            $auditData = [];
            if (file_exists(self::$auditFile)) {
                $content = file_get_contents(self::$auditFile);
                $auditData = json_decode($content, true) ?: [];
            }
            
            // Generate unique ID for each audit entry
            $id = uniqid('audit_', true);
            
            // Get user information from session
            SessionManager::start();
            $user = SessionManager::getFullName();
            $role = SessionManager::getUserRole() ?? 'guest';
            
            // If no session user, check if it's a cashier
            if ($user === 'Unknown User' && isset($_SESSION['cashier_name'])) {
                $user = $_SESSION['cashier_name'];
                $role = 'cashier';
            }
            
            // If still no user, it's a guest/customer
            if ($user === 'Unknown User') {
                $user = 'Guest/Customer';
                $role = 'guest';
            }
            
            $entry = [
                'id' => $id,
                'timestamp' => date('Y-m-d H:i:s'),
                'action' => $action,
                'details' => $details,
                'user' => $user,
                'role' => $role,
                'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ];
            
            // Merge additional data if provided
            if (!empty($additionalData)) {
                $entry = array_merge($entry, $additionalData);
            }
            
            $auditData[] = $entry;
            
            file_put_contents(self::$auditFile, json_encode($auditData, JSON_PRETTY_PRINT));
            
            return true;
        } catch (Exception $e) {
            error_log("Audit logging error: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Log order creation
     */
    public static function logOrderCreated($orderId, $totalAmount, $itemCount, $paymentMethod) {
        return self::log(
            'order_created',
            "Order #{$orderId} created - Amount: ₱{$totalAmount}, Items: {$itemCount}, Payment: {$paymentMethod}",
            [
                'order_id' => $orderId,
                'total_amount' => $totalAmount,
                'item_count' => $itemCount,
                'payment_method' => $paymentMethod
            ]
        );
    }
    
    /**
     * Log order status update
     */
    public static function logOrderStatusUpdate($orderId, $oldStatus, $newStatus) {
        return self::log(
            'order_status_updated',
            "Order #{$orderId} status changed from '{$oldStatus}' to '{$newStatus}'",
            [
                'order_id' => $orderId,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]
        );
    }
    
    /**
     * Log transaction
     */
    public static function logTransaction($transactionId, $amount, $paymentMethod, $status) {
        return self::log(
            'transaction_processed',
            "Transaction #{$transactionId} - Amount: ₱{$amount}, Method: {$paymentMethod}, Status: {$status}",
            [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'payment_method' => $paymentMethod,
                'status' => $status
            ]
        );
    }
    
    /**
     * Log cashier login
     */
    public static function logCashierLogin($cashierName, $cashierUsername) {
        return self::log(
            'cashier_login',
            "Cashier '{$cashierName}' ({$cashierUsername}) logged in",
            [
                'cashier_name' => $cashierName,
                'cashier_username' => $cashierUsername
            ]
        );
    }
    
    /**
     * Log cashier logout
     */
    public static function logCashierLogout($cashierName, $cashierUsername) {
        return self::log(
            'cashier_logout',
            "Cashier '{$cashierName}' ({$cashierUsername}) logged out",
            [
                'cashier_name' => $cashierName,
                'cashier_username' => $cashierUsername
            ]
        );
    }
}
?>
