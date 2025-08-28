<?php
require_once __DIR__ . '/../config/database.php';

class SessionManager {
    
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_start();
        }
    }
    
    public static function isLoggedIn() {
        self::start();
        return isset($_SESSION['user_id']) && isset($_SESSION['user_role']);
    }
    
    public static function requireLogin() {
        if (!self::isLoggedIn()) {
            header('Location: ' . APP_URL . '/LandingPage/LandingPage.html');
            exit();
        }
    }
    
    public static function requireRole($requiredRole) {
        self::requireLogin();
        
        if ($_SESSION['user_role'] !== $requiredRole) {
            header('Location: ' . APP_URL . '/LandingPage/LandingPage.html');
            exit();
        }
    }
    
    public static function getUserRole() {
        self::start();
        return $_SESSION['user_role'] ?? null;
    }
    
    public static function getUserId() {
        self::start();
        return $_SESSION['user_id'] ?? null;
    }
    
    public static function getUsername() {
        self::start();
        return $_SESSION['username'] ?? null;
    }
    
    public static function getFullName() {
        self::start();
        return $_SESSION['full_name'] ?? $_SESSION['username'] ?? 'Unknown User';
    }
    
    public static function logout() {
        self::start();
        session_unset();
        session_destroy();
        
        // Clear session cookie
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
    }
    
    public static function regenerateId() {
        self::start();
        session_regenerate_id(true);
    }
    
    public static function setFlashMessage($type, $message) {
        self::start();
        $_SESSION['flash_messages'][] = [
            'type' => $type,
            'message' => $message,
            'timestamp' => time()
        ];
    }
    
    public static function getFlashMessages() {
        self::start();
        $messages = $_SESSION['flash_messages'] ?? [];
        unset($_SESSION['flash_messages']);
        return $messages;
    }
    
    public static function hasFlashMessages() {
        self::start();
        return !empty($_SESSION['flash_messages']);
    }
}

// Auto-start session for all pages that include this file
SessionManager::start();
?> 