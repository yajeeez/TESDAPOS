<?php
require_once __DIR__ . '/../../includes/session.php';
require_once __DIR__ . '/../../includes/audit_logger.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../config/database.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

// Start session
SessionManager::start();

// Handle POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $role = trim($_POST['role'] ?? '');
    
    // Validate input
    if (empty($username) || empty($password)) {
        $error = urlencode('Username and password are required');
        header('Location: login.html?error=' . $error);
        exit();
    }
    
    try {
        // Connect to MongoDB TESDAPOS1 database
        $client = new Client(DB_URI);
        $database = $client->selectDatabase('TESDAPOS1');
        $collection = $database->selectCollection('admins');
        
        // Find user by username or email (support both login methods)
        $user = $collection->findOne([
            '$or' => [
                ['username' => $username],
                ['email' => $username]
            ]
        ]);
        
        if ($user) {
            // Check if password is hashed or plain text
            $passwordValid = false;
            $storedPassword = $user['password'];
            
            if (strpos($storedPassword, '$2y$') === 0 || strpos($storedPassword, '$2a$') === 0) {
                // Password is hashed, verify using password_verify
                $passwordValid = password_verify($password, $storedPassword);
            } else {
                // Password is plain text, compare directly
                $passwordValid = ($storedPassword === $password);
            }
            
            if ($passwordValid) {
                // Authentication successful - set session variables
                $_SESSION['user_id'] = (string) $user['_id'];
                $_SESSION['username'] = $user['username'] ?? $user['email'];
                $_SESSION['full_name'] = $user['name'] ?? $user['full_name'] ?? 'User';
                $_SESSION['email'] = $user['email'];
                $_SESSION['user_role'] = $user['role'] ?? 'admin';
                $_SESSION['login_time'] = time();
                
                // Regenerate session ID for security
                SessionManager::regenerateId();
                
                // Log the login in audit trail
                if ($userRole === 'cashier') {
                    AuditLogger::logCashierLogin($user['name'] ?? 'Unknown', $user['username']);
                } else {
                    AuditLogger::log('admin_login', "Admin '{$user['name']}' logged in");
                }
                
                // Role-based redirection
                $userRole = $user['role'] ?? 'admin';
                
                if ($userRole === 'admin') {
                    // Redirect to admin dashboard
                    header('Location: ../../admin/components/AdminDashboard.php');
                    exit();
                } elseif ($userRole === 'cashier') {
                    // Redirect to cashier dashboard
                    header('Location: ../../cashier/components/CashierDashboard.php');
                    exit();
                } else {
                    // Unknown role, default to admin dashboard
                    header('Location: ../../admin/components/AdminDashboard.php');
                    exit();
                }
            } else {
                // Authentication failed - wrong password
                $error = urlencode('Invalid username or password');
                header('Location: login.html?error=' . $error);
                exit();
            }
        } else {
            // Authentication failed - user not found
            $error = urlencode('Invalid username or password');
            header('Location: login.html?error=' . $error);
            exit();
        }
        
    } catch (Exception $e) {
        // Database error
        error_log("Login error: " . $e->getMessage());
        $error = urlencode('Database error. Please try again.');
        header('Location: login.html?error=' . $error);
        exit();
    }
    
} else {
    // Not a POST request
    header('Location: login.html');
    exit();
}
?>
