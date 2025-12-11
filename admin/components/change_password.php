<!DOCTYPE html>
<?php
// Start session and check authentication
require_once __DIR__ . '/../../includes/session.php';

// Require admin login
SessionManager::requireLogin();

// Check if user is admin
if (SessionManager::getUserRole() !== 'admin') {
    SessionManager::setFlashMessage('error', 'Access denied. Admin privileges required.');
    header('Location: ../../public/components/login.html');
    exit();
}

// Get user info
$userEmail = $_SESSION['email'] ?? '';

// Include MongoDB at the top level
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../vendor/autoload.php';
use MongoDB\Client;

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $currentPassword = $_POST['current_password'] ?? '';
    $newPassword = $_POST['new_password'] ?? '';
    $confirmPassword = $_POST['confirm_password'] ?? '';
    
    // Validate inputs
    if (empty($currentPassword) || empty($newPassword) || empty($confirmPassword)) {
        SessionManager::setFlashMessage('error', 'All fields are required.');
    } elseif ($newPassword !== $confirmPassword) {
        SessionManager::setFlashMessage('error', 'New passwords do not match.');
    } elseif (strlen($newPassword) < 8) {
        SessionManager::setFlashMessage('error', 'New password must be at least 8 characters long.');
    } else {
        // Update password in database
        try {
            $client = new Client(DB_URI);
            $database = $client->selectDatabase(DB_NAME);
            $adminsCollection = $database->selectCollection('admins');
            
            // Verify current password
            $admin = $adminsCollection->findOne(['email' => $userEmail]);
            
            if (!$admin) {
                SessionManager::setFlashMessage('error', 'Admin account not found.');
            } else {
                // Check if current password is hashed or plain text
                $currentPasswordValid = false;
                $storedPassword = $admin['password'];
                
                if (strpos($storedPassword, '$2y$') === 0 || strpos($storedPassword, '$2a$') === 0) {
                    // Password is hashed, verify using password_verify
                    $currentPasswordValid = password_verify($currentPassword, $storedPassword);
                } else {
                    // Password is plain text, compare directly
                    $currentPasswordValid = ($storedPassword === $currentPassword);
                }
                
                if (!$currentPasswordValid) {
                    SessionManager::setFlashMessage('error', 'Current password is incorrect.');
                } else {
                    // Update password with plain text (no hashing)
                    $result = $adminsCollection->updateOne(
                        ['email' => $userEmail],
                        ['$set' => ['password' => $newPassword]]
                    );
                
                if ($result->getModifiedCount() > 0) {
                    // Redirect with success parameter
                    header('Location: change_password.php?success=true');
                    exit();
                } else {
                    SessionManager::setFlashMessage('error', 'Failed to update password.');
                }
                }
            }
        } catch (Exception $e) {
            SessionManager::setFlashMessage('error', 'Database error: ' . $e->getMessage());
        }
    }
    
    // Redirect to avoid form resubmission
    header('Location: change_password.php');
    exit();
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Change Password - TESDA POS Admin</title>
    <link rel="icon" href="../../img/TESDAG.png" type="image/png">
    <link rel="stylesheet" href="../assets/css/AdminDashboard.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
    
    <style>
        .change-password-container {
            margin:auto;
            background: var(--white);
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .change-password-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .change-password-header h2 {
            color: var(--tesda-blue);
            margin-bottom: 0.5rem;
        }
        
        .change-password-header p {
            color: #666;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .password-input-wrapper {
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .password-toggle {
            position: absolute;
            right: 10px;
            cursor: pointer;
            color: #666;
            font-size: 1.1rem;
            z-index: 10;
            background: none;
            border: none;
            padding: 5px;
        }
        
        .password-toggle:hover {
            color: var(--tesda-blue);
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 600;
        }
        
        .form-group input {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #ddd;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--tesda-blue);
        }
        
        .btn-submit {
            width: 100%;
            padding: 0.75rem;
            background: var(--tesda-blue);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        }
        
        .btn-submit:hover {
            background: var(--tesda-dark-blue);
        }
        
        .btn-back {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #6c757d;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            transition: background 0.3s ease;
        }
        
        .btn-back:hover {
            background: #5a6268;
        }
        
        .alert {
            padding: 0.75rem;
            border-radius: 6px;
            margin-bottom: 1rem;
        }
        
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .password-requirements {
            font-size: 0.85rem;
            color: #666;
            margin-top: 0.5rem;
        }
        
        /* Toast Notification Styles */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .toast {
            background: white;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-left: 4px solid;
            min-width: 300px;
            max-width: 400px;
            display: flex;
            align-items: center;
            animation: slideIn 0.3s ease-out;
        }
        
        .toast.success {
            border-left-color: #28a745;
        }
        
        .toast.error {
            border-left-color: #dc3545;
        }
        
        .toast.info {
            border-left-color: #17a2b8;
        }
        
        .toast-icon {
            margin-right: 12px;
            font-size: 1.2rem;
        }
        
        .toast.success .toast-icon {
            color: #28a745;
        }
        
        .toast.error .toast-icon {
            color: #dc3545;
        }
        
        .toast.info .toast-icon {
            color: #17a2b8;
        }
        
        .toast-content {
            flex: 1;
        }
        
        .toast-title {
            font-weight: 600;
            margin-bottom: 4px;
            color: #333;
        }
        
        .toast-message {
            font-size: 0.9rem;
            color: #666;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: #999;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            margin-left: 10px;
        }
        
        .toast-close:hover {
            color: #666;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <!-- Sidebar -->
        <nav class="sidebar" id="sidebar">
            <div class="sidebar-logo">
                <img src="../../img/TESDAG.png" alt="TESDA Logo" class="tesda-logo" />
            </div>
            <h2>TESDA POS</h2>
            <ul>
                <li><a href="AdminDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
                <li><a href="Orders.php"><i class="fas fa-receipt"></i><span>Manage Orders</span></a></li>
                <li><a href="CreateProducts.php"><i class="fas fa-cart-plus"></i><span>Create Products</span></a></li>
                <li><a href="Inventory.php"><i class="fas fa-boxes"></i><span>Inventory</span></a></li>
                <li><a href="Transactions.php"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
                <li><a href="Maintenance.php"><i class="fas fa-tools"></i><span>Maintenance</span></a></li>
                <li><a href="change_password.php" class="active"><i class="fas fa-key"></i><span>Change Password</span></a></li>
                <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
            </ul>
        </nav>

        <!-- Main Content -->
        <main class="main">
            <div class="change-password-container">
                <div class="change-password-header">
                    <i class="fas fa-key" style="font-size: 3rem; color: var(--tesda-blue); margin-bottom: 1rem;"></i>
                    <h2>Change Password</h2>
                    <p>Update your admin account password</p>
                </div>

                <?php if (SessionManager::hasFlashMessages()): ?>
                    <?php 
                    $messages = SessionManager::getFlashMessages();
                    foreach ($messages as $msg):
                        $type = $msg['type'];
                        $message = $msg['message'];
                    ?>
                    <div class="alert alert-<?php echo $type; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                    <?php endforeach; ?>
                <?php endif; ?>

                <form method="POST" action="change_password.php">
                    <div class="form-group">
                        <label for="current_password">
                            <i class="fas fa-lock"></i> Current Password
                        </label>
                        <div class="password-input-wrapper">
                            <input type="password" id="current_password" name="current_password" required maxlength="8">
                            <button type="button" class="password-toggle" onclick="togglePassword('current_password', this)">
                                <i class="fas fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="new_password">
                            <i class="fas fa-key"></i> New Password
                        </label>
                        <div class="password-input-wrapper">
                            <input type="password" id="new_password" name="new_password" required minlength="8" maxlength="8">
                            <button type="button" class="password-toggle" onclick="togglePassword('new_password', this)">
                                <i class="fas fa-eye-slash"></i>
                            </button>
                        </div>
                        <div class="password-requirements">
                            Password must be at least 8 characters long
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password">
                            <i class="fas fa-check"></i> Confirm New Password
                        </label>
                        <div class="password-input-wrapper">
                            <input type="password" id="confirm_password" name="confirm_password" required minlength="8" maxlength="8">
                            <button type="button" class="password-toggle" onclick="togglePassword('confirm_password', this)">
                                <i class="fas fa-eye-slash"></i>
                            </button>
                        </div>
                    </div>

                    <button type="submit" class="btn-submit">
                        <i class="fas fa-save"></i> Change Password
                    </button>
                </form>

                            </div>
        </main>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <script>
        // Toast Notification System
        class ToastManager {
            constructor() {
                this.container = document.getElementById('toastContainer');
            }
            
            show(message, type = 'info', title = '', duration = 5000) {
                // Console log for notification
                console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
                
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                
                const icons = {
                    success: 'fas fa-check-circle',
                    error: 'fas fa-exclamation-circle',
                    info: 'fas fa-info-circle'
                };
                
                const titles = {
                    success: title || 'Success',
                    error: title || 'Error',
                    info: title || 'Information'
                };
                
                toast.innerHTML = `
                    <div class="toast-icon">
                        <i class="${icons[type]}"></i>
                    </div>
                    <div class="toast-content">
                        <div class="toast-title">${titles[type]}</div>
                        <div class="toast-message">${message}</div>
                    </div>
                    <button class="toast-close" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                this.container.appendChild(toast);
                
                // Auto remove after duration
                setTimeout(() => {
                    toast.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => toast.remove(), 300);
                }, duration);
            }
        }
        
        const toastManager = new ToastManager();
        
        // Password toggle functionality
        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        }
        
        // Form validation with toast notifications
        document.querySelector('form').addEventListener('submit', function(e) {
            const currentPassword = document.getElementById('current_password').value;
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            // Reset custom validity
            [currentPassword, newPassword, confirmPassword].forEach((val, idx) => {
                const inputs = ['current_password', 'new_password', 'confirm_password'];
                document.getElementById(inputs[idx]).setCustomValidity('');
            });
            
            // Client-side validation with toast notifications
            if (!currentPassword || !newPassword || !confirmPassword) {
                e.preventDefault();
                toastManager.show('All fields are required.', 'error', 'Validation Error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                e.preventDefault();
                toastManager.show('New passwords do not match.', 'error', 'Validation Error');
                document.getElementById('confirm_password').setCustomValidity('Passwords do not match');
                return;
            }
            
            if (newPassword.length < 8) {
                e.preventDefault();
                toastManager.show('Password must be exactly 8 characters long.', 'error', 'Validation Error');
                return;
            }
        });
        
                
        // Password confirmation validation
        document.getElementById('confirm_password').addEventListener('input', function() {
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = this.value;
            
            if (newPassword !== confirmPassword) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Check if password was successfully changed (check URL parameters or page reload)
        function checkPasswordChangeSuccess() {
            // Check if we're coming back from a successful password change
            const urlParams = new URLSearchParams(window.location.search);
            const success = urlParams.get('success');
            
            if (success === 'true') {
                // Show success notification with redirect countdown
                let countdown = 5;
                toastManager.show('Password changed successfully! You will be redirected to the login page in ' + countdown + ' seconds...', 'info', 'Success', 8000);
                
                // Update countdown every second
                const countdownInterval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        // Update the toast message with new countdown
                        const toastMessage = document.querySelector('.toast-message');
                        if (toastMessage) {
                            toastMessage.textContent = 'Password changed successfully! You will be redirected to the login page in ' + countdown + ' seconds...';
                        }
                    } else {
                        clearInterval(countdownInterval);
                    }
                }, 1000);
                
                // Redirect to login page after 5 seconds
                setTimeout(() => {
                    window.location.href = '../../public/components/login.html';
                }, 5000);
                
                // Clean up URL parameter
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
        
        // Check for success on page load
        checkPasswordChangeSuccess();
    </script>
</body>
</html>
