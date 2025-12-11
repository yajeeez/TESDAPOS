document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
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
    
    // Forgot Password functionality
    const getCodeText = document.querySelector('.get-code-text');
    const emailInput = document.getElementById('email');
    const verificationCodeInput = document.getElementById('verification-code');
    const submitButton = document.querySelector('button[type="submit"]');

    // Disable verification code input initially
    if (verificationCodeInput) {
        verificationCodeInput.disabled = true;
        verificationCodeInput.style.opacity = '0.5';
        verificationCodeInput.style.cursor = 'not-allowed';
    }

    // Disable Get Code button initially
    if (getCodeText) {
        getCodeText.style.color = '#ccc';
        getCodeText.style.cursor = 'not-allowed';
        getCodeText.style.pointerEvents = 'none';
    }

    // Check email validity on input
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = emailInput.value.trim();
            
            if (isValidGmailEmail(email)) {
                // Enable Get Code button for Gmail addresses
                getCodeText.style.color = '#007bff';
                getCodeText.style.cursor = 'pointer';
                getCodeText.style.pointerEvents = 'auto';
            } else {
                // Disable Get Code button for non-Gmail addresses
                getCodeText.style.color = '#ccc';
                getCodeText.style.cursor = 'not-allowed';
                getCodeText.style.pointerEvents = 'none';
                
                // Also disable verification code input if email becomes invalid
                if (!verificationCodeInput.disabled) {
                    verificationCodeInput.disabled = true;
                    verificationCodeInput.style.opacity = '0.5';
                    verificationCodeInput.style.cursor = 'not-allowed';
                    getCodeText.textContent = 'Get Code';
                    getCodeText.style.color = '#007bff';
                }
            }
        });
    }

    if (getCodeText && emailInput) {
        getCodeText.addEventListener('click', async function() {
            const email = emailInput.value.trim();
            
            if (!email) {
                showFlashMessage('error', 'Please enter your email address first.');
                emailInput.focus();
                return;
            }

            if (!isValidGmailEmail(email)) {
                showFlashMessage('error', 'Please enter a valid Gmail address.');
                emailInput.focus();
                return;
            }

            // Show loading state
            getCodeText.textContent = 'Sending...';
            getCodeText.style.cursor = 'wait';
            getCodeText.style.pointerEvents = 'none';

            try {
                // Simulate sending verification code (replace with actual API call)
                const success = await sendVerificationCode(email);
                
                if (success) {
                    // Enable verification code input
                    verificationCodeInput.disabled = false;
                    verificationCodeInput.style.opacity = '1';
                    verificationCodeInput.style.cursor = 'text';
                    verificationCodeInput.focus();
                    
                    getCodeText.textContent = 'Code Sent!';
                    getCodeText.style.color = '#28a745';
                    getCodeText.style.cursor = 'default';
                    getCodeText.style.pointerEvents = 'none';
                    
                    showFlashMessage('success', 'Verification code has been sent to your Gmail address.');
                } else {
                    throw new Error('Failed to send verification code');
                }
            } catch (error) {
                // Keep verification code input disabled
                verificationCodeInput.disabled = true;
                verificationCodeInput.style.opacity = '0.5';
                verificationCodeInput.style.cursor = 'not-allowed';
                
                getCodeText.textContent = 'Get Code';
                getCodeText.style.color = '#007bff';
                getCodeText.style.cursor = 'pointer';
                getCodeText.style.pointerEvents = 'auto';
                
                showFlashMessage('error', 'Failed to send verification code. Please check your Gmail and try again.');
                console.error('Error sending verification code:', error);
            }
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidGmailEmail(email) {
        // Check if it's a valid email and ends with @gmail.com
        const gmailRegex = /^[^\s@]+@gmail\.com$/;
        return gmailRegex.test(email);
    }

    // Add form submission handler for verification code
    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            const verificationCode = verificationCodeInput.value.trim();
            
            if (!email || !verificationCode) {
                showFlashMessage('error', 'Please enter both email and verification code');
                return;
            }
            
            if (!isValidGmailEmail(email)) {
                showFlashMessage('error', 'Please enter a valid Gmail address');
                return;
            }
            
            if (!/^\d{6}$/.test(verificationCode)) {
                showFlashMessage('error', 'Verification code must be 6 digits');
                return;
            }
            
            // Verify code and reset password
            verifyCodeAndResetPassword(email, verificationCode);
        });
    }
    
    async function verifyCodeAndResetPassword(email, code) {
        try {
            // Show loading state
            const submitButton = document.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            submitButton.disabled = true;
            
            const response = await fetch('verify_code_and_reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showFlashMessage('success', result.message);
                
                // Clear form
                emailInput.value = '';
                verificationCodeInput.value = '';
                
                // Reset UI state
                if (verificationCodeInput) {
                    verificationCodeInput.disabled = true;
                    verificationCodeInput.style.opacity = '0.5';
                    verificationCodeInput.style.cursor = 'not-allowed';
                }
                
                if (getCodeText) {
                    getCodeText.textContent = 'Get Code';
                    getCodeText.style.color = '#007bff';
                    getCodeText.style.cursor = 'pointer';
                    getCodeText.style.pointerEvents = 'auto';
                }
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                
            } else {
                showFlashMessage('error', result.message);
            }
            
        } catch (error) {
            console.error('Network error:', error);
            showFlashMessage('error', 'Network error. Please try again.');
        } finally {
            // Reset button state
            const submitButton = document.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
            submitButton.disabled = false;
        }
    }

    // Add form submission handler for direct password reset
    const loginFormDirect = document.querySelector('form');
    if (loginFormDirect) {
        loginFormDirect.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = emailInput.value.trim();
            
            if (!email) {
                showFlashMessage('error', 'Please enter your email address');
                return;
            }
            
            if (!isValidGmailEmail(email)) {
                showFlashMessage('error', 'Please enter a valid Gmail address');
                return;
            }
            
            // Reset password directly
            resetPasswordDirectly(email);
        });
    }
    
    async function resetPasswordDirectly(email) {
        try {
            // Show loading state
            const submitButton = document.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
            submitButton.disabled = true;
            
            const response = await fetch('simple_password_reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showFlashMessage('success', result.message);
                
                // Clear form
                emailInput.value = '';
                
                // Redirect to login page after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                
            } else {
                showFlashMessage('error', result.message);
            }
            
        } catch (error) {
            console.error('Network error:', error);
            showFlashMessage('error', 'Network error. Please try again.');
        } finally {
            // Reset button state
            const submitButton = document.querySelector('button[type="submit"]');
            submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit';
            submitButton.disabled = false;
        }
    }

    async function sendVerificationCode(email) {
        try {
            const response = await fetch('send_verification_email.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                return true;
            } else {
                console.error('Server error:', result.message);
                return false;
            }
            
        } catch (error) {
            console.error('Network error:', error);
            return false;
        }
    }
});