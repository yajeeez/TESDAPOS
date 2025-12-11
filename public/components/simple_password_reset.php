<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;
use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

function generateRandomPassword($length = 8) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return substr(str_shuffle($chars), 0, $length);
}

function resetPasswordDirectly($email) {
    try {
        // Connect to MongoDB
        $client = new Client(DB_URI);
        $database = $client->selectDatabase(DB_NAME);
        
        // Check if email exists in users or admins collection
        $usersCollection = $database->selectCollection('users');
        $adminsCollection = $database->selectCollection('admins');
        
        $user = $usersCollection->findOne(['email' => $email]);
        $admin = $adminsCollection->findOne(['email' => $email]);
        
        if (!$user && !$admin) {
            return ['success' => false, 'message' => 'Email address not found in our system'];
        }
        
        // Generate new password
        $newPassword = generateRandomPassword();
        
        // Update password in both collections with PLAIN TEXT (not hashed)
        $usersCollection = $database->selectCollection('users');
        $adminsCollection = $database->selectCollection('admins');
        
        $userUpdate = $usersCollection->updateOne(
            ['email' => $email],
            ['$set' => ['password' => $newPassword]]  // Plain text password
        );
        
        $adminUpdate = $adminsCollection->updateOne(
            ['email' => $email],
            ['$set' => ['password' => $newPassword]]  // Plain text password
        );
        
        // Check if at least one update was successful
        if ($userUpdate->getModifiedCount() == 0 && $adminUpdate->getModifiedCount() == 0) {
            return ['success' => false, 'message' => 'Failed to update password in database'];
        }
        
        // Send new password via email AFTER updating database
        // DISABLED: Use verify_code_and_reset.php instead to avoid duplicate emails
        // $emailSent = sendNewPasswordEmail($email, $newPassword);
        $emailSent = true; // Skip actual email sending
        
        if ($emailSent) {
            return ['success' => true, 'message' => 'Password reset successfully. Check your email for the new password.'];
        } else {
            return ['success' => false, 'message' => 'Password updated but failed to send email. Please contact support.'];
        }
        
    } catch (Exception $e) {
        error_log("Password reset error: " . $e->getMessage());
        return ['success' => false, 'message' => 'Server error during password reset'];
    }
}

function sendNewPasswordEmail($email, $newPassword) {
    try {
        $mail = new PHPMailer(true);
        
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'yajeee1209@gmail.com';
        $mail->Password   = 'avzhoaqsyagjiews';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        
        // Recipients
        $mail->setFrom('yajeee1209@gmail.com', 'TESDA POS System');
        $mail->addAddress($email);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = 'TESDA POS - Your New Password';
        $mail->Body    = '
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
                    <h2>TESDA POS System</h2>
                    <p>Password Reset Complete</p>
                </div>
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <h3>Hello,</h3>
                    <p>Your password has been successfully reset for your TESDA POS account.</p>
                    <p>Your new password is:</p>
                    <div style="background-color: #28a745; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                        ' . $newPassword . '
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>Save this password in a secure location</li>
                        <li>Change your password after logging in</li>
                        <li>This password is temporary for security reasons</li>
                    </ul>
                    <p>You can now login with this new password.</p>
                    <p><a href="http://localhost/TESDAPOS/public/components/login.html" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
                </div>
                <div style="background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px;">
                    <p>&copy; 2024 TESDA POS System. All rights reserved.</p>
                </div>
            </div>
        ';
        $mail->AltBody = "Your new TESDA POS password is: " . $newPassword . "\n\nPlease save this password and change it after logging in.";
        
        $mail->send();
        return true;
        
    } catch (Exception $e) {
        error_log("Failed to send new password email: " . $e->getMessage());
        return false;
    }
}

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email'])) {
        echo json_encode(['success' => false, 'message' => 'Email address is required']);
        exit;
    }
    
    $email = $input['email'];
    
    // Validate inputs
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[^\s@]+@gmail\.com$/', $email)) {
        echo json_encode(['success' => false, 'message' => 'Valid Gmail address required']);
        exit;
    }
    
    $result = resetPasswordDirectly($email);
    echo json_encode($result);
    
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
