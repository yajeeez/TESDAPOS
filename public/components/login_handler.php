<?php
require_once __DIR__ . '/../../includes/session.php';
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
        
        // Find admin by username
        $admin = $collection->findOne(['username' => $username]);
        
        if ($admin && password_verify($password, $admin['password'])) {
            // Authentication successful - set session variables
            $_SESSION['user_id'] = (string) $admin['_id'];
            $_SESSION['username'] = $admin['username'];
            $_SESSION['full_name'] = $admin['full_name'];
            $_SESSION['email'] = $admin['email'];
            $_SESSION['user_role'] = 'admin';
            $_SESSION['login_time'] = time();
            
            // Regenerate session ID for security
            SessionManager::regenerateId();
            
            // Set success message
            SessionManager::setFlashMessage('success', 'Login successful! Welcome, ' . $admin['full_name']);
            
            // Redirect to admin dashboard
            header('Location: ../../admin/components/AdminDashboard.php');
            exit();
            
        } else {
            // Authentication failed
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
