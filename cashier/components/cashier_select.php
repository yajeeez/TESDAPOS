<!DOCTYPE html>
<?php
require_once __DIR__ . '/cashier_auth.php';

// Get all cashiers
$cashierAuth = new CashierAuth();
$result = $cashierAuth->getAllCashiers();
$cashiers = $result['success'] ? $result['cashiers'] : [];
?>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TESDA POS - Select Cashier</title>
    <link rel="icon" href="../../img/TESDAG.png" type="image/png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', sans-serif;
        }

        body {
            background: linear-gradient(135deg, #004aad, #002b80);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            text-align: center;
            min-width: 400px;
        }

        .logo {
            width: 100px;
            margin-bottom: 1rem;
        }

        h1 {
            margin-bottom: 2rem;
            color: #ffc107;
        }

        .cashier-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .cashier-card {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid transparent;
            border-radius: 12px;
            padding: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            color: white;
        }

        .cashier-card:hover {
            border-color: #ffc107;
            background: rgba(255, 193, 7, 0.2);
            transform: translateY(-5px);
        }

        .cashier-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            color: #ffc107;
        }

        .cashier-name {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .cashier-username {
            font-size: 0.85rem;
            opacity: 0.8;
        }

        .note {
            background: rgba(255, 193, 7, 0.2);
            border-radius: 8px;
            padding: 1rem;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="../../img/TESDAG.png" alt="TESDA Logo" class="logo">
        <h1><i class="fas fa-cash-register"></i> Select Cashier</h1>
        
        <div class="cashier-grid">
            <?php foreach ($cashiers as $cashier): ?>
                <a href="CashierDashboard.php?username=<?php echo urlencode($cashier['username']); ?>" class="cashier-card">
                    <div class="cashier-icon">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="cashier-name"><?php echo htmlspecialchars($cashier['name']); ?></div>
                    <div class="cashier-username">@<?php echo htmlspecialchars($cashier['username']); ?></div>
                </a>
            <?php endforeach; ?>
        </div>

        <div class="note">
            <i class="fas fa-info-circle"></i>
            Select a cashier to access the POS system. Your actions will be tracked under the selected cashier account.
        </div>
    </div>
</body>
</html>