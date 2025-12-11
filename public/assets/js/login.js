document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
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
});