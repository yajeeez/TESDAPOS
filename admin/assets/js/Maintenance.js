// ==========================
// Maintenance Management
// ==========================

// ==========================
// Logout Function
// ==========================
function logout(e) {
  if (e) e.preventDefault();
  window.location.href = "../../public/components/login.html"; 
}

// ==========================
// System Check Functions
// ==========================
function runSystemCheck() {
  showConfirmModal(
    'System Check',
    'Are you sure you want to run a system health check?',
    () => {
      showNotification('Running system health check...', 'info');
      
      fetch('Maintenance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=system_check'
      })
      .then(response => {
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          displaySystemCheckResults(data.checks, data.overall_status);
          updateSystemStatus(data.overall_status);
          showNotification('System check completed', 'success');
        } else {
          showNotification('System check failed: ' + (data.message || 'Unknown error'), 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('System check failed: ' + error.message, 'error');
      });
    },
    'fa-heartbeat',
    'modal-system'
  );
}

function displaySystemCheckResults(checks, overallStatus) {
  const resultsDiv = document.getElementById('checkResults');
  const panelDiv = document.getElementById('systemCheckResults');
  
  let html = '';
  for (const [key, check] of Object.entries(checks)) {
    const statusClass = check.status;
    const icon = statusClass === 'healthy' ? 'fa-check-circle' : 
                 statusClass === 'warning' ? 'fa-exclamation-triangle' : 
                 'fa-times-circle';
    
    html += `
      <div class="check-item ${statusClass}">
        <div class="check-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="check-details">
          <strong>${key.replace('_', ' ').toUpperCase()}</strong>
          <span>${check.message}</span>
        </div>
      </div>
    `;
  }
  
  resultsDiv.innerHTML = html;
  panelDiv.style.display = 'block';
}

function updateSystemStatus(status) {
  const statusElement = document.getElementById('healthStatus');
  const statusCard = document.getElementById('systemStatus');
  
  if (status === 'healthy') {
    statusElement.textContent = 'All systems operational';
    statusCard.style.borderLeftColor = '#28a745';
  } else if (status === 'warning') {
    statusElement.textContent = 'Some issues detected';
    statusCard.style.borderLeftColor = '#ffc107';
  } else {
    statusElement.textContent = 'Critical issues found';
    statusCard.style.borderLeftColor = 'var(--danger)';
  }
}

// ==========================
// Backup Functions
// ==========================
function performBackup() {
  showConfirmModal(
    'Create Backup',
    'Are you sure you want to create a system backup?',
    () => {
      showNotification('Starting system backup...', 'info');
      
      fetch('Maintenance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=backup'
      })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          showNotification(`Backup completed: ${data.file} (${formatFileSize(data.size)})`, 'success');
          updateBackupStatus();
          loadBackupHistory();
        } else {
          showNotification(`Backup failed: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('Backup failed: ' + error.message, 'error');
      });
    },
    'fa-database',
    'modal-backup'
  );
}

function updateBackupStatus() {
  const statusElement = document.getElementById('backupStatus');
  statusElement.textContent = 'Last backup: ' + new Date().toLocaleString();
}

function loadBackupHistory() {
  // Load actual backup files from server
  fetch('Maintenance.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=list_backups'
  })
  .then(response => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    return response.json();
  })
  .then(data => {
    displayBackupHistory(data.backups || []);
  })
  .catch(error => {
    console.error('Error loading backup history:', error);
    // Fallback to showing recent backup if any
    const backupList = document.getElementById('backupList');
    backupList.innerHTML = '<p style="text-align: center; padding: 1rem; color: #666;">Unable to load backup history</p>';
  });
}

function displayBackupHistory(backups) {
  const backupList = document.getElementById('backupList');
  const panelDiv = document.getElementById('backupHistory');
  
  if (backups.length === 0) {
    backupList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No backups found</p>';
  } else {
    let html = '';
    backups.forEach(backup => {
      html += `
        <div class="backup-item">
          <div class="backup-info">
            <strong>${backup.name}</strong>
            <span>Created: ${backup.timestamp} | Size: ${backup.size}</span>
          </div>
          <div class="backup-actions">
            <button class="btn btn-info" onclick="downloadBackup('${backup.name}')">
              <i class="fas fa-download"></i> Download
            </button>
            <button class="btn btn-danger" onclick="deleteBackup('${backup.name}')">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    });
    backupList.innerHTML = html;
  }
  
  panelDiv.style.display = 'block';
}

function downloadBackup(filename) {
  showConfirmModal(
    'Download Backup',
    `Are you sure you want to download ${filename}?`,
    () => {
      showNotification(`Downloading ${filename}...`, 'info');
      
      fetch('Maintenance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=download_backup&filename=${encodeURIComponent(filename)}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          // Create a temporary link to download the file
          const link = document.createElement('a');
          link.href = data.download_url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          showNotification(`Downloaded ${filename}`, 'success');
        } else {
          showNotification(`Download failed: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('Download failed', 'error');
      });
    },
    'fa-download',
    'modal-download'
  );
}

function deleteBackup(filename) {
  showConfirmModal(
    'Delete Backup',
    `Are you sure you want to delete ${filename}? This action cannot be undone.`,
    () => {
      showNotification(`Deleting ${filename}...`, 'info');
      
      fetch('Maintenance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=delete_backup&filename=${encodeURIComponent(filename)}`
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          showNotification(`Deleted ${filename}`, 'success');
          loadBackupHistory(); // Refresh the backup list
        } else {
          showNotification(`Delete failed: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('Delete failed', 'error');
      });
    },
    'fa-trash',
    'modal-confirm'
  );
}

function deleteAuditEntry(entryId) {
  if (!entryId) {
    showNotification('Cannot delete entry: No ID found', 'error');
    return;
  }
  
  showConfirmModal(
    'Delete Audit Entry',
    'Are you sure you want to delete this audit entry? This action cannot be undone.',
    () => {
      showNotification('Deleting audit entry...', 'info');
      
      fetch('Maintenance.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=delete_audit_entry&entry_id=${encodeURIComponent(entryId)}`
      })
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned non-JSON response');
        }
        return response.json();
      })
      .then(data => {
        console.log('Delete response:', data);
        if (data.success) {
          showNotification('Audit entry deleted successfully', 'success');
          // Refresh the audit trail after a short delay
          setTimeout(() => {
            viewAuditTrail();
          }, 500);
        } else {
          showNotification(`Delete failed: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error('Error deleting audit entry:', error);
        showNotification('Delete failed: ' + error.message, 'error');
      });
    },
    'fa-trash',
    'modal-confirm'
  );
}

// ==========================
// Audit Trail Functions
// ==========================
function viewAuditTrail() {
  showNotification('Loading audit trail...', 'info');
  
  fetch('Maintenance.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'action=audit_trail'
  })
  .then(response => {
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response');
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      displayAuditTrail(data.data);
      showNotification('Audit trail loaded', 'success');
    } else {
      showNotification('Failed to load audit trail: ' + (data.message || 'Unknown error'), 'error');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showNotification('Failed to load audit trail: ' + error.message, 'error');
  });
}

function displayAuditTrail(auditData) {
  const auditList = document.getElementById('auditList');
  const panelDiv = document.getElementById('auditTrailDisplay');
  
  console.log('Total audit entries received:', auditData.length);
  
  if (auditData.length === 0) {
    auditList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">No audit records found</p>';
  } else {
    let html = '';
    auditData.forEach(entry => {
      const entryId = entry.id || '';
      const role = entry.role || 'N/A';
      const user = entry.user || 'Unknown User';
      
      // Hide the action text for page_access, audit_view, and system_check
      let actionText = entry.action;
      if (actionText === 'page_access' || actionText === 'audit_view' || actionText === 'system_check') {
        actionText = ''; // Don't show these action names
      }
      
      // Only show delete button if entry has an ID
      const deleteButton = entryId ? `
        <div class="audit-actions">
          <button class="btn-delete-audit" onclick="deleteAuditEntry('${entryId}')" title="Delete entry" style="background: linear-gradient(135deg, #ff4757 0%, #e63946 100%); border: 2px solid rgba(255, 255, 255, 0.2); box-shadow: 0 3px 12px rgba(230, 57, 70, 0.3);">
            <i class="fas fa-trash-alt" style="color: #ffffff !important;"></i>
          </button>
        </div>
      ` : '';
      
      html += `
        <div class="audit-item">
          <div class="audit-time">${entry.timestamp}</div>
          <div class="audit-details">
            ${actionText ? `<div class="audit-action">${actionText}</div>` : ''}
            <div class="audit-description">${entry.details}</div>
            <div class="audit-meta">User: ${user} | Role: ${role}</div>
          </div>
          ${deleteButton}
        </div>
      `;
    });
    auditList.innerHTML = html;
  }
  
  panelDiv.style.display = 'block';
  
  // Setup search functionality
  setupAuditSearch();
}

function setupAuditSearch() {
  const searchInput = document.getElementById('auditSearch');
  const filterSelect = document.getElementById('auditFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', filterAuditTrail);
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', filterAuditTrail);
  }
}

function filterAuditTrail() {
  const searchTerm = document.getElementById('auditSearch').value.toLowerCase();
  const filterValue = document.getElementById('auditFilter').value;
  const auditItems = document.querySelectorAll('.audit-item');
  
  auditItems.forEach(item => {
    const action = item.querySelector('.audit-action').textContent.toLowerCase();
    const details = item.querySelector('.audit-description').textContent.toLowerCase();
    
    const matchesSearch = !searchTerm || action.includes(searchTerm) || details.includes(searchTerm);
    const matchesFilter = !filterValue || action.includes(filterValue.toLowerCase());
    
    // Show/hide item based on filters
    item.style.display = matchesSearch && matchesFilter ? 'block' : 'none';
  });
}

// ==========================
// Modal Functions
// ==========================
function showConfirmModal(title, message, onConfirm, iconClass = 'fa-question-circle', confirmBtnClass = 'modal-confirm') {
const modal = document.getElementById('confirmModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const confirmBtn = document.getElementById('modalConfirmBtn');
const modalIcon = modal.querySelector('.modal-icon i');

modalTitle.textContent = title;
modalMessage.textContent = message;

// Update icon
modalIcon.className = `fas ${iconClass}`;

// Update confirm button class
confirmBtn.className = `modal-btn ${confirmBtnClass}`;

// Remove any existing event listeners
const newConfirmBtn = confirmBtn.cloneNode(true);
confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

// Add new event listener
newConfirmBtn.addEventListener('click', () => {
onConfirm();
closeModal();
});

// Show modal with animation
modal.classList.add('active');
}

function closeModal() {
const modal = document.getElementById('confirmModal');
modal.classList.remove('active');
}

// ==========================
// Utility Functions
// ==========================
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
  // System check will only run when user clicks the button
  // No automatic execution on page load
  
  // Setup automatic refresh for system status (optional - comment out if not needed)
  // setInterval(() => {
  //   runSystemCheck();
  // }, 300000); // Check every 5 minutes
});