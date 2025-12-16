<?php
require_once __DIR__ . '/components/cashier_auth.php';

header('Content-Type: application/json');

try {
    $cashierAuth = new CashierAuth();
    $result = $cashierAuth->getAllCashiers();
    
    echo json_encode([
        'success' => true,
        'message' => 'Cashier authentication system working',
        'data' => $result
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>