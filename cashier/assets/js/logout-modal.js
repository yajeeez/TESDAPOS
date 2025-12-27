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

// Close modal when clicking outside
document.addEventListener('click', function(e) {
  const modal = document.getElementById('logoutModal');
  if (modal && e.target === modal) {
    closeLogoutModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeLogoutModal();
  }
});
