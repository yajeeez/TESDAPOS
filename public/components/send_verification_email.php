<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Include PHPMailer autoloader
require_once __DIR__ . '/../../vendor/autoload.php';

// Database connection for storing verification codes
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

function generateVerificationCode() {
    return sprintf('%06d', mt_rand(0, 999999));
}

function storeVerificationCode($email, $code) {
    try {
        // Create MongoDB client using the configuration
        $client = new Client(DB_URI);
        $database = $client->selectDatabase(DB_NAME);
        $collection = $database->selectCollection('verification_codes');
        
        // Clean up old codes (older than 15 minutes)
        $cutoffTime = new UTCDateTime((time() - 900) * 1000); // 15 minutes ago
        $collection->deleteMany([
            'email' => $email,
            'created_at' => ['$lt' => $cutoffTime]
        ]);
        
        // Insert new verification code
        $result = $collection->insertOne([
            'email' => $email,
            'code' => $code,
            'created_at' => new UTCDateTime(),
            'used' => false
        ]);
        
        return $result->getInsertedId() !== null;
        
    } catch (Exception $e) {
        error_log("MongoDB error storing verification code: " . $e->getMessage());
        return false;
    }
}

function sendVerificationEmail($email) {
    $verificationCode = generateVerificationCode();
    
    // Store verification code in database
    if (!storeVerificationCode($email, $verificationCode)) {
        return ['success' => false, 'message' => 'Failed to store verification code'];
    }
    
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'yajeee1209@gmail.com'; // Your Gmail
        $mail->Password   = 'avzhoaqsyagjiews';     // New Gmail app password (no spaces)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        
        // Recipients
        $mail->setFrom('yajeee1209@gmail.com', 'TESDA POS System');
        $mail->addAddress($email);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'TESDA POS - Password Reset Verification Code';
        $mail->Body    = '
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h2>TESDA POS System</h2>
                    <p>Password Reset Verification</p>
                </div>
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <h3>Hello,</h3>
                    <p>You requested a password reset for your TESDA POS account.</p>
                    <p>Your verification code is:</p>
                    <div style="background-color: #007bff; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        ' . $verificationCode . '
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn\'t request this code, please ignore this email.</p>
                </div>
                <div style="background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
                    <p>&copy; 2024 TESDA POS System. All rights reserved.</p>
                </div>
            </div>
        ';
        $mail->AltBody = "Your TESDA POS verification code is: " . $verificationCode . "\nThis code will expire in 15 minutes.";
        
        $mail->send();
        
        return ['success' => true, 'message' => 'Verification code sent successfully'];
        
    } catch (Exception $e) {
        error_log("PHPMailer error: " . $mail->ErrorInfo);
        return ['success' => false, 'message' => 'Failed to send verification email: ' . $mail->ErrorInfo];
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
        exit;
    }
    
    $email = $input['email'];
    
    // Validate Gmail address
    if (!preg_match('/^[^\s@]+@gmail\.com$/', $email)) {
        echo json_encode(['success' => false, 'message' => 'Only Gmail addresses are supported']);
        exit;
    }
    
    $result = sendVerificationEmail($email);
    echo json_encode($result);
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
