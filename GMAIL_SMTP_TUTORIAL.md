# Gmail SMTP Setup Tutorial for TESDA POS

## Overview
This tutorial will guide you through setting up Gmail SMTP for the TESDA POS password reset functionality.

## Prerequisites
- A Gmail account
- Access to TESDA POS server files
- Basic understanding of web configuration

---

## Step 1: Enable 2-Factor Authentication (2FA)

1. **Sign in to your Google Account**
   - Go to [https://myaccount.google.com/](https://myaccount.google.com/)
   - Sign in with your Gmail account

2. **Enable 2-Factor Authentication**
   - Navigate to **Security** tab (left sidebar)
   - Find **2-Step Verification** section
   - Click **Get Started**
   - Follow the setup process:
     - Enter your phone number
     - Verify with code sent to your phone
     - Enable 2FA

---

## Step 2: Generate App Password

1. **Go to App Passwords Page**
   - Still in Google Account Security section
   - Click **App Passwords** (you'll only see this after 2FA is enabled)
   - You may need to sign in again

2. **Create New App Password**
   - Under **Select app**, choose **Mail**
   - Under **Select device**, choose **Other (Custom name)**
   - Enter: `TESDA POS System`
   - Click **Generate**

3. **Copy Your App Password**
   - Google will display a **16-character password**
   - **Important:** Copy this password immediately
   - This password will only be shown once
   - Save it in a secure location

---

## Step 3: Configure TESDA POS SMTP Settings

1. **Open the Email Configuration File**
   - Navigate to: `public/components/send_verification_email.php`
   - Open the file in your code editor

2. **Update Gmail Credentials**
   Find these lines (around lines 59-60 and 65):

   ```php
   $mail->Username   = 'your-email@gmail.com'; // Replace with your Gmail
   $mail->Password   = 'your-app-password';     // Replace with your Gmail app password
   
   // And later:
   $mail->setFrom('your-email@gmail.com', 'TESDA POS System');
   ```

3. **Replace with Your Credentials**
   ```php
   $mail->Username   = 'your-actual-gmail@gmail.com'; // Your Gmail address
   $mail->Password   = 'the-16-character-app-password'; // The app password you copied
   
   // And later:
   $mail->setFrom('your-actual-gmail@gmail.com', 'TESDA POS System');
   ```

---

## Step 4: Test the Configuration

1. **Save the File**
   - Save your changes to `send_verification_email.php`

2. **Test the Email Function**
   - Go to: `http://localhost/TESDAPOS/public/components/ForgotPassword.html`
   - Enter your Gmail address
   - Click "Get Code"
   - Check your Gmail inbox for the verification code

---

## Step 5: Troubleshooting

### Common Issues and Solutions

#### 1. "SMTP Error: Could not authenticate"
**Cause:** Incorrect Gmail credentials
**Solution:**
- Double-check your Gmail address
- Ensure you're using the App Password, NOT your regular Gmail password
- Regenerate the App Password if needed

#### 2. "SMTP connect() failed"
**Cause:** Network or firewall issues
**Solution:**
- Ensure your server can access Gmail SMTP (smtp.gmail.com:465)
- Check if firewall blocks outbound connections
- Try with different ports if needed

#### 3. "Email not received"
**Cause:** Email in spam folder or delivery delay
**Solution:**
- Check Gmail spam folder
- Wait 5-10 minutes for delivery
- Try sending to a different Gmail address

#### 4. "App Password not working"
**Cause:** 2FA not properly enabled or password expired
**Solution:**
- Verify 2FA is enabled on your Google Account
- Generate a new App Password
- Delete old App Passwords if you have too many

---

## Step 6: Security Best Practices

### Email Security
- **Never** commit your Gmail credentials to version control
- Store credentials securely (environment variables recommended)
- Use a dedicated Gmail account for the system
- Regularly rotate App Passwords

### Production Considerations
```php
// Recommended: Use environment variables
$mail->Username   = getenv('GMAIL_USERNAME');
$mail->Password   = getenv('GMAIL_APP_PASSWORD');
```

### Monitoring
- Monitor email delivery rates
- Set up error logging for failed sends
- Consider using a transactional email service for production

---

## Step 7: Alternative Solutions

If Gmail SMTP doesn't work for your environment:

### Option 1: Use SMTP Relay Service
- SendGrid, Mailgun, or Amazon SES
- Better for production environments
- Higher deliverability rates

### Option 2: Use Local SMTP Server
- Set up Postfix or Exim on your server
- More complex but full control
- Requires server administration knowledge

---

## Step 8: Verification

Once configured, verify everything works:

1. **Test Email Sending**
   - Send a test verification code
   - Confirm email arrives within 2 minutes

2. **Test Code Validation**
   - Enter the received code
   - Verify it accepts the correct code

3. **Test Error Handling**
   - Try invalid email addresses
   - Verify error messages display properly

---

## Quick Reference

### Required Information:
- **Gmail Address:** `your-email@gmail.com`
- **App Password:** `16-character password`
- **SMTP Host:** `smtp.gmail.com`
- **SMTP Port:** `465`
- **Encryption:** `SSL/TLS`

### File to Edit:
- **Location:** `public/components/send_verification_email.php`
- **Lines:** 59-60 and 65

### Test URL:
- **Forgot Password:** `http://localhost/TESDAPOS/public/components/ForgotPassword.html`

---

## Support

If you encounter issues:

1. Check the PHP error logs: `C:\xampp\apache\logs\error.log`
2. Test with the debug script: `http://localhost/TESDAPOS/public/components/debug_email.php`
3. Verify MongoDB is running: Check XAMPP control panel
4. Ensure all composer dependencies are installed

---

## Next Steps

After Gmail SMTP is working:

1. Consider setting up email logging
2. Implement rate limiting for verification requests
3. Add email template customization
4. Set up monitoring for email delivery

---

**Tutorial Complete!** Your TESDA POS system should now be able to send verification emails via Gmail SMTP.
