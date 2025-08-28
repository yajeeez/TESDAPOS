<?php
session_start();

// Include MongoDB connection
require_once '../connection/mongo/connection.php';

// Handle login form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';

    // Basic validation
    if (empty($username) || empty($password) || empty($role)) {
        $error = "All fields are required";
        header("Location: " . $_SERVER['HTTP_REFERER'] . "&error=" . urlencode($error));
        exit();
    }

    try {
        $manager = MongoConnection::getClient();
        
        // Find user by username and role
        $query = new MongoDB\Driver\Query([
            'username' => $username,
            'role' => $role
        ]);
        $cursor = $manager->executeQuery('tesdapos.users', $query);
        $users = iterator_to_array($cursor);
        $user = !empty($users) ? $users[0] : null;

        if ($user && password_verify($password, $user->password)) {
            // Login successful
            $_SESSION['user_id'] = (string)$user->_id;
            $_SESSION['username'] = $user->username;
            $_SESSION['user_role'] = $user->role;
            $_SESSION['full_name'] = $user->full_name ?? $username;

            // Redirect based on role
            switch ($role) {
                case 'admin':
                    header('Location: ../admin/dashboard.php');
                    break;
                case 'manager':
                    header('Location: ../manager/dashboard.php');
                    break;
                case 'cashier':
                    header('Location: ../cashier/dashboard.php');
                    break;
                case 'inventory':
                    header('Location: ../inventory/dashboard.php');
                    break;
                case 'customer':
                    header('Location: ../menu/menu.html');
                    break;
                default:
                    header('Location: LandingPage.html');
            }
            exit();
        } else {
            // Login failed
            $error = "Invalid username, password, or role";
            header("Location: " . $_SERVER['HTTP_REFERER'] . "&error=" . urlencode($error));
            exit();
        }
    } catch (Exception $e) {
        $error = "Database connection error: " . $e->getMessage();
        header("Location: " . $_SERVER['HTTP_REFERER'] . "&error=" . urlencode($error));
        exit();
    }
} else {
    // Not a POST request
    header('Location: LandingPage.html');
    exit();
}
?> 