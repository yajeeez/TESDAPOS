/**
 * Shared Logout Confirmation Modal for Cashier
 * Include this file in all cashier pages that need logout functionality
 */

// Create and inject logout modal HTML
function createLogoutModal() {
  const modalHTML = `
    <div id="logoutModal" class="logout-modal-overlay">
      <div class="logout-modal-content">
        <div class="logout-modal-icon">
          <i class="fas fa-sign-out-alt"></i>
        </div>
        <h3 class="logout-modal-title">Confirm Logout</h3>
        <p class="logout-modal-message">Are you sure you want to logout?</p>
        <div class="logout-modal-actions">
          <button class="logout-modal-btn logout-cancel" onclick="closeLogoutModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="logout-modal-btn logout-confirm" onclick="confirmLogout()">
            <i class="fas fa-check"></i> Yes, Logout
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Inject modal into body if it doesn't exist
  if (!document.getElementById('logoutModal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// Create and inject change password modal HTML
function createChangePasswordModal() {
  const modalHTML = `
    <div id="changePasswordModal" class="logout-modal-overlay">
      <div class="logout-modal-content">
        <div class="logout-modal-icon" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
          <i class="fas fa-key"></i>
        </div>
        <h3 class="logout-modal-title">Change Password</h3>
        <p class="logout-modal-message">Do you want to change your password?</p>
        <div class="logout-modal-actions">
          <button class="logout-modal-btn logout-cancel" onclick="closeChangePasswordModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button class="logout-modal-btn" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);" onclick="confirmChangePassword()">
            <i class="fas fa-check"></i> Yes, Continue
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Inject modal into body if it doesn't exist
  if (!document.getElementById('changePasswordModal')) {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }
}

// Show logout modal
function showLogoutModal(e) {
  if (e) e.preventDefault();
  
  // Create modal if it doesn't exist
  createLogoutModal();
  
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Close logout modal
function closeLogoutModal() {
  const modal = document.getElementById('logoutModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Confirm logout and redirect
function confirmLogout() {
  // Redirect to logout.php to properly destroy session
  window.location.href = 'logout.php';
}

// Show change password modal
function showChangePasswordModal(e) {
  if (e) e.preventDefault();
  
  // Create modal if it doesn't exist
  createChangePasswordModal();
  
  const modal = document.getElementById('changePasswordModal');
  if (modal) {
    modal.classList.add('active');
  }
}

// Close change password modal
function closeChangePasswordModal() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

// Confirm change password and redirect
function confirmChangePassword() {
  // Redirect to change password page
  window.location.href = 'change_password.php';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const logoutModal = document.getElementById('logoutModal');
  const changePasswordModal = document.getElementById('changePasswordModal');
  
  if (logoutModal && e.target === logoutModal) {
    closeLogoutModal();
  }
  
  if (changePasswordModal && e.target === changePasswordModal) {
    closeChangePasswordModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLogoutModal();
    closeChangePasswordModal();
  }
});
