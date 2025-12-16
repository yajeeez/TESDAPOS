function confirmLogout() {
  if (confirm('Logout now?')) {
    window.location.href = 'logout.php'
  }
}
