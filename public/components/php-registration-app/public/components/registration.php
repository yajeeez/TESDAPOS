<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>User Registration</title>
  <link rel="stylesheet" href="../assets/css/registration.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
</head>
<body>
  <div class="background-overlay"></div>

  <div class="registration-container">
    <div class="registration-header">
      <h2>Register</h2>
    </div>

    <form method="POST" action="register_handler.php">
      <div class="input-icon-group">
        <i class="fas fa-user"></i>
        <input type="text" id="username" name="username" placeholder="Username" maxlength="10" required>
      </div>

      <div class="input-icon-group">
        <i class="fas fa-lock"></i>
        <input type="password" id="password" name="password" placeholder="Password" maxlength="12" required>
      </div>

      <button type="submit">
        <i class="fas fa-user-plus"></i> Register
      </button>
    </form>
  </div>

  <?php
  require_once '../../src/db/mongodb_connect.php';

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      $username = $_POST['username'];
      $password = $_POST['password'];

      // Insert user into MongoDB
      $collection = $client->your_database_name->users; // Replace with your database and collection name
      $result = $collection->insertOne([
          'username' => $username,
          'password' => password_hash($password, PASSWORD_DEFAULT) // Hash the password
      ]);

      if ($result->getInsertedCount() === 1) {
          echo "<p>Registration successful!</p>";
      } else {
          echo "<p>Registration failed. Please try again.</p>";
      }
  }
  ?>
</body>
</html>