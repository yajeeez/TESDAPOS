// ==========================
// Admin Login Management
// ==========================

// Initialize login functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initLoginForm();
});

// ==========================
// Initialize Login Form
// ==========================
function initLoginForm() {
    const loginForm = document.querySelector('form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Basic client-side validation
            if (!validateLoginForm()) {
                e.preventDefault();
                return false;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;
            
            // Reset button after a delay (form will submit)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 3000);
        });
    }
    
    // Add enter key functionality
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginForm.submit();
            }
        });
    }
}

// ==========================
// Validate Login Form
// ==========================
function validateLoginForm() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username) {
        alert('Please enter your username');
        document.getElementById('username').focus();
        return false;
    }
    
    if (!password) {
        alert('Please enter your password');
        document.getElementById('password').focus();
        return false;
    }
    
    if (username.length > 11) {
        alert('Username must not exceed 11 characters');
        document.getElementById('username').focus();
        return false;
    }
    
    if (password.length > 8) {
        alert('Password must not exceed 8 characters');
        document.getElementById('password').focus();
        return false;
    }
    
    return true;
}

// ==========================
// Show/Hide Password Toggle (optional)
// ==========================
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        if (toggleIcon) toggleIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        if (toggleIcon) toggleIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}