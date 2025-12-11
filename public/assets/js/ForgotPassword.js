document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('toggle-password');
    const passwordInput = document.getElementById('password');
    
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
                alert('Please enter your email address first.');
                emailInput.focus();
                return;
            }

            if (!isValidGmailEmail(email)) {
                alert('Please enter a valid Gmail address.');
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
                    
                    alert('Verification code has been sent to your Gmail address.');
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
                
                alert('Failed to send verification code. Please check your Gmail and try again.');
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

    async function sendVerificationCode(email) {
        // This is a mock function - replace with actual API call
        // Simulate API call with timeout
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate success (90% success rate for demo)
                // In production, this would be an actual API call
                const mockSuccess = Math.random() > 0.1;
                resolve(mockSuccess);
            }, 2000); // 2 second delay to simulate network request
        });
    }
});