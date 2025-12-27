<?php
/**
 * Log Landing Page Access
 * This logs when customers visit the ordering page
 */

require_once __DIR__ . '/../includes/audit_logger.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Log the page access as a customer/guest
        AuditLogger::log('page_access', 'Customer accessed Order page (Landing Page)');
        
        echo json_encode([
            'success' => true,
            'message' => 'Page access logged'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to log page access: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method'
    ]);
}
?>
