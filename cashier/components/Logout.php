<?php
// No session manager, perform a raw logout
@session_start();

// Clear all session data completely
$_SESSION = array();

// Destroy the session
@session_destroy();

// Clear session cookie if set
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

// Redirect to login page
header('Location: ../../public/components/login.html');
exit();
