document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    const loginForm = document.querySelector('form');
    
    // Check for flash messages from session
    function checkFlashMessages() {
        // Try to get flash messages from URL parameters or session storage
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const error = urlParams.get('error');
        
        if (success) {
            showFlashMessage('success', decodeURIComponent(success));
        } else if (error) {
            showFlashMessage('error', decodeURIComponent(error));
        }
    }
    
    // Flash message function
    window.showFlashMessage = function(type, message) {
        const flashElement = document.getElementById('flash-message');
        if (flashElement) {
            flashElement.className = 'flash-message ' + type;
            flashElement.textContent = message;
            flashElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                flashElement.style.display = 'none';
            }, 5000);
        }
    };
    
    if (togglePassword && passwordInput) {
        // Start with eye-slash icon since password is initially hidden
        togglePassword.classList.remove('fa-eye');
        togglePassword.classList.add('fa-eye-slash');
        
        togglePassword.addEventListener('click', function() {
            // Toggle password visibility
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                togglePassword.classList.remove('fa-eye-slash');
                togglePassword.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                togglePassword.classList.remove('fa-eye');
                togglePassword.classList.add('fa-eye-slash');
            }
        });
    }
    
    // Check for flash messages on page load
    checkFlashMessages();
    
    // Add form validation
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value.trim();
            
            // Clear previous flash messages
            const flashElement = document.getElementById('flash-message');
            if (flashElement) {
                flashElement.style.display = 'none';
            }
            
            let hasError = false;
            
            if (!username || !password) {
                e.preventDefault();
                showFlashMessage('error', 'Invalid username or password');
                return false;
            }
            
            if (password.length < 4) {
                e.preventDefault();
                showFlashMessage('error', 'Invalid username or password');
                return false;
            }
        });
    }
});