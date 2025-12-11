<?php
require_once __DIR__ . '/../../includes/session.php';

// Logout the user
SessionManager::logout();

// Set success message (though it won't be seen since we're redirecting)
SessionManager::setFlashMessage('success', 'You have been logged out successfully.');

// Redirect to login page
header('Location: ../public/components/login.html');
exit();
?>
