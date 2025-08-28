<?php
require_once '../../includes/session.php';
SessionManager::logout();
header("Location: ../../LandingPage/LandingPage.html");
exit();
?>
