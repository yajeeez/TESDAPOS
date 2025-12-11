<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

function testSMTPConnection() {
    try {
        echo "Testing SMTP connection...\n";
        
        // Create a simple SMTP test
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'yajeee1209@gmail.com';
        $mail->Password   = 'qrlrdnzyognkhgba';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        
        echo "Configuration set, attempting to send test email...\n";
        
        // Test recipients
        $mail->setFrom('yajeee1209@gmail.com', 'TESDA POS System');
        $mail->addAddress('yajeee1209@gmail.com');
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'SMTP Test - TESDA POS';
        $mail->Body    = 'This is a test email to verify SMTP connection.';
        
        // Send the test email
        $mail->send();
        
        echo "Test email sent successfully!\n";
        return ['success' => true, 'message' => 'Test email sent successfully'];
        
    } catch (Exception $e) {
        echo "Exception: " . $e->getMessage() . "\n";
        echo "PHPMailer Error: " . $mail->ErrorInfo . "\n";
        return ['success' => false, 'message' => $e->getMessage(), 'error_info' => $mail->ErrorInfo];
    }
}

// Test the connection
$result = testSMTPConnection();
echo json_encode($result);
?>
