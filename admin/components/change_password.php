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
    } elseif (strlen($newPassword) < 6) {
        SessionManager::setFlashMessage('error', 'New password must be at least 6 characters long.');
    } else {
        // Update password in database
        try {
            $client = new Client(DB_URI);
            $database = $client->selectDatabase(DB_NAME);
            $adminsCollection = $database->selectCollection('admins');
            
            // Verify current password
            $admin = $adminsCollection->findOne(['email' => $userEmail]);
            
            if (!$admin || $admin['password'] !== $currentPassword) {
                SessionManager::setFlashMessage('error', 'Current password is incorrect.');
            } else {
                // Update password
                $result = $adminsCollection->updateOne(
                    ['email' => $userEmail],
                    ['$set' => ['password' => $newPassword]]
                );
                
                if ($result->getModifiedCount() > 0) {
                    SessionManager::setFlashMessage('success', 'Password changed successfully!');
                } else {
                    SessionManager::setFlashMessage('error', 'Failed to update password.');
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
            max-width: 500px;
            margin: 2rem auto;
            background: var(--white);
            padding: 2rem;
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

                <?php if (SessionManager::hasFlashMessage()): ?>
                    <?php 
                    $message = SessionManager::getFlashMessage();
                    $type = strpos($message, 'error') !== false ? 'error' : 'success';
                    ?>
                    <div class="alert alert-<?php echo $type; ?>">
                        <?php echo htmlspecialchars($message); ?>
                    </div>
                <?php endif; ?>

                <form method="POST" action="change_password.php">
                    <div class="form-group">
                        <label for="current_password">
                            <i class="fas fa-lock"></i> Current Password
                        </label>
                        <input type="password" id="current_password" name="current_password" required>
                    </div>

                    <div class="form-group">
                        <label for="new_password">
                            <i class="fas fa-key"></i> New Password
                        </label>
                        <input type="password" id="new_password" name="new_password" required minlength="6">
                        <div class="password-requirements">
                            Password must be at least 6 characters long
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password">
                            <i class="fas fa-check"></i> Confirm New Password
                        </label>
                        <input type="password" id="confirm_password" name="confirm_password" required minlength="6">
                    </div>

                    <button type="submit" class="btn-submit">
                        <i class="fas fa-save"></i> Change Password
                    </button>
                </form>

                <div style="text-align: center;">
                    <a href="AdminDashboard.php" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Back to Dashboard
                    </a>
                </div>
            </div>
        </main>
    </div>

    <script>
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

        // Clear flash messages after 5 seconds
        setTimeout(() => {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => alert.style.display = 'none');
        }, 5000);
    </script>
</body>
</html>
