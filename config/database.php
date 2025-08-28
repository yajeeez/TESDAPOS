<?php
// Database Configuration
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_PORT')) define('DB_PORT', '27017');
if (!defined('DB_NAME')) define('DB_NAME', 'tesdapos');
if (!defined('DB_URI')) define('DB_URI', 'mongodb://' . DB_HOST . ':' . DB_PORT);

// Application Configuration
if (!defined('APP_NAME')) define('APP_NAME', 'TESDA POS System');
if (!defined('APP_VERSION')) define('APP_VERSION', '1.0.0');
if (!defined('APP_URL')) define('APP_URL', 'http://localhost/TESDAPOS');

// Session Configuration
if (!defined('SESSION_LIFETIME')) define('SESSION_LIFETIME', 3600); // 1 hour
if (!defined('SESSION_NAME')) define('SESSION_NAME', 'TESDAPOS_SESSION');

// Security Configuration
if (!defined('PASSWORD_MIN_LENGTH')) define('PASSWORD_MIN_LENGTH', 8);
if (!defined('MAX_LOGIN_ATTEMPTS')) define('MAX_LOGIN_ATTEMPTS', 5);
if (!defined('LOGIN_TIMEOUT')) define('LOGIN_TIMEOUT', 900); // 15 minutes

// File Upload Configuration
if (!defined('MAX_FILE_SIZE')) define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
if (!defined('ALLOWED_IMAGE_TYPES')) define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif']);
if (!defined('UPLOAD_PATH')) define('UPLOAD_PATH', __DIR__ . '/../uploads/');

// Error Reporting (set to false in production)
if (!defined('DEBUG_MODE')) define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set session configuration
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);
ini_set('session.cookie_lifetime', SESSION_LIFETIME);
ini_set('session.name', SESSION_NAME);

// Timezone
date_default_timezone_set('Asia/Manila');
?> 