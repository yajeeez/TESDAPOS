<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Change Password - TESDA POS Cashier</title>
  <link rel="icon" href="../../img/TESDAG.png" type="image/png">
  <link rel="stylesheet" href="../assets/css/CashierDashboard.css">
  <link rel="stylesheet" href="../assets/css/Changepassword.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="dashboard">
    <nav class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <img src="../../img/TESDAG.png" alt="TESDA Logo" class="tesda-logo" />
      </div>
      <h2>TESDA POS</h2>
      <ul>
        <li><a href="CashierDashboard.php"><i class="fas fa-home"></i><span>Dashboard</span></a></li>
        <li><a href="Transactions.php"><i class="fas fa-cash-register"></i><span>Transactions</span></a></li>
        <li><a href="change_password.php" class="active"><i class="fas fa-key"></i><span>Change Password</span></a></li>
        <li><a href="logout.php"><i class="fas fa-sign-out-alt"></i><span>Logout</span></a></li>
      </ul>
    </nav>

    <main class="main">
      <div class="change-password-container" style="max-width: 520px; margin: 0 auto;">
        <div class="change-password-header" style="text-align: center; padding: 1rem;">
          <i class="fas fa-key" style="font-size: 3rem; color: var(--tesda-blue); margin-bottom: 1rem;"></i>
          <h2>Change Password</h2>
          <p>Update your cashier account password</p>
        </div>

        <form method="POST" action="#" id="changePasswordForm">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="current_password"><i class="fas fa-lock"></i> Current Password</label>
            <input type="password" id="current_password" name="current_password" required minlength="8" maxlength="32" style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="new_password"><i class="fas fa-key"></i> New Password</label>
            <input type="password" id="new_password" name="new_password" required minlength="8" maxlength="32" style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
            <div class="password-requirements" style="font-size: 0.85rem; color:#666; margin-top:0.5rem;">
              Password must be at least 8 characters long
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label for="confirm_password"><i class="fas fa-check"></i> Confirm New Password</label>
            <input type="password" id="confirm_password" name="confirm_password" required minlength="8" maxlength="32" style="width:100%; padding:0.6rem; border:1px solid #ddd; border-radius:6px;">
          </div>

          <button type="submit" style="padding:0.7rem 1.2rem; border:none; border-radius:8px; background: var(--tesda-blue); color:#fff; cursor:pointer;">
            <i class="fas fa-save"></i> Save Changes
          </button>
        </form>
      </div>
    </main>
  </div>
  <script src="../assets/js/ChangePassword.js"></script>
</body>
</html>
