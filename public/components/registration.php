<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Admin Login</title>
  <link rel="stylesheet" href="./assets/css/registration.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <div class="background-overlay"></div>
  <div class="login-container">
    <div class="login-header">
      <img src="./img/TESDALOGO.png" alt="TESDA Logo">
      <h2>Admin</h2>
    </div>

    <form method="POST" action="login_handler.php">
      <div class="input-icon-group">
        <i class="fas fa-user"></i>
        <input type="text" name="username" placeholder="Username" required>
      </div>
      <div class="input-icon-group">
        <i class="fas fa-lock"></i>
        <input type="password" name="password" placeholder="Password" required>
      </div>
      <button type="submit"><i class="fas fa-sign-in-alt"></i> Login</button>
    </form>

    <button class="register-btn" onclick="window.location.href='register.php'">
      <i class="fas fa-user-plus"></i> Register
    </button>
    <button class="back-btn" onclick="window.location.href='index.php'">
      <i class="fas fa-arrow-left"></i> Back
    </button>
  </div>
</body>
</html>
