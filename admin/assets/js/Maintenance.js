// ==========================
// ==========================
// Maintenance Management
// ==========================

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  if (confirm("Are you sure you want to logout?")) {
    window.location.href = "/TESDAPOS/LandingPage/LandingPage.html"; 
  }
}

// ==========================
// Show Maintenance Content
// ==========================
function showMaintenance() {
  const section = document.getElementById('maintenance');
  if (!section) {
    // If no section element, create content in maintenanceContent div
    const maintenanceContent = document.getElementById('maintenanceContent');
    if (maintenanceContent) {
      maintenanceContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h2>Maintenance Module</h2>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
            <button onclick="performBackup()" class="maintenance-btn">
              <i class="fas fa-database"></i> Backup Data
            </button>
            <button onclick="viewAuditTrail()" class="maintenance-btn">
              <i class="fas fa-list"></i> View Audit Trail
            </button>
          </div>
        </div>
      `;
    }
    return;
  }
  
  section.innerHTML = `
    <h2>Maintenance Module</h2>
    <div class="maintenance-actions">
      <button onclick="performBackup()" class="maintenance-btn">
        <i class="fas fa-database"></i> Backup Data
      </button>
      <button onclick="viewAuditTrail()" class="maintenance-btn">
        <i class="fas fa-list"></i> View Audit Trail
      </button>
    </div>
  `;
}

// ==========================
// Perform System Backup
// ==========================
function performBackup() {
  showNotification('Starting system backup...', 'info');
  
  // Simulate backup process
  setTimeout(() => {
    showNotification('System backup completed successfully!');
    console.log('System backup completed at:', new Date().toLocaleString());
  }, 2000);
}

// ==========================
// View Audit Trail
// ==========================
function viewAuditTrail() {
  showNotification('Loading audit trail...', 'info');
  
  // Simulate audit trail loading
  setTimeout(() => {
    showNotification('Audit trail loaded. Check console for details.');
    console.log('=== AUDIT TRAIL ===');
    console.log('2024-01-15 10:30:00 - Admin logged in');
    console.log('2024-01-15 10:32:15 - Product "Chicken Adobo" updated');
    console.log('2024-01-15 10:35:20 - Order #1001 status changed to Approved');
    console.log('2024-01-15 10:40:10 - Inventory updated for product ID: 123');
    console.log('=== END AUDIT TRAIL ===');
  }, 1500);
}

// ==========================
// Notification System
// ==========================
function showNotification(message, type = 'success') {
  // Create toast if it doesn't exist
  let toast = document.getElementById('notificationToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notificationToast';
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-check-circle"></i>
        <span id="toastMessage"></span>
      </div>
    `;
    document.body.appendChild(toast);
  }
  
  const toastMessage = document.getElementById('toastMessage');
  const icon = toast.querySelector('i');
  
  toastMessage.textContent = message;
  
  // Update icon and color based on type
  if (type === 'error') {
    toast.style.background = '#dc3545';
    icon.className = 'fas fa-exclamation-circle';
  } else if (type === 'info') {
    toast.style.background = '#17a2b8';
    icon.className = 'fas fa-info-circle';
  } else {
    toast.style.background = '#28a745';
    icon.className = 'fas fa-check-circle';
  }
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ==========================
// Initialize on page load
// ==========================
document.addEventListener('DOMContentLoaded', () => {
  showMaintenance();
});