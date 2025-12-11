# SMTP Email Setup Instructions for TESDA POS

## Overview
The forgot password functionality now uses SMTP to send verification codes to users' Gmail addresses.

## Required Setup

### 1. Install PHPMailer
PHPMailer should already be installed via Composer in your project. If not, run:
```bash
composer require phpmailer/phpmailer
```

### 2. Create Database Table
Run the following script to create the verification codes table:
```bash
http://localhost/TESDAPOS/connection/create_verification_codes_table.php
```

### 3. Configure Gmail SMTP Settings

In `public/components/send_verification_email.php`, update these lines:

```php
// Replace with your Gmail credentials
$mail->Username   = 'your-email@gmail.com';     // Your Gmail address
$mail->Password   = 'your-app-password';         // Your Gmail App Password
$mail->setFrom('your-email@gmail.com', 'TESDA POS System'); // From address
```

### 4. Get Gmail App Password

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security
3. Click on "App passwords"
4. Generate a new app password for "Mail" on "Windows Computer"
5. Use this 16-character password in the configuration above

## Features

### Email Template
- Professional HTML email template with TESDA POS branding
- 6-digit verification code displayed prominently
- Auto-expiration after 15 minutes
- Fallback plain text version

### Database Storage
- Verification codes stored in `verification_codes` table
- Automatic cleanup of codes older than 15 minutes
- Indexes for optimal performance

### Error Handling
- Comprehensive error logging
- User-friendly error messages via flash notifications
- Network and server error handling

## Security Features

1. **Gmail-only validation**: Only accepts @gmail.com addresses
2. **Code expiration**: Codes expire after 15 minutes
3. **Rate limiting**: Old codes are automatically cleaned up
4. **Input validation**: Server-side email validation
5. **Secure SMTP**: Uses TLS/SSL encryption

## Testing

1. Visit: `http://localhost/TESDAPOS/public/components/ForgotPassword.html`
2. Enter a valid Gmail address
3. Click "Get Code"
4. Check your Gmail for the verification code
5. Enter the code in the verification field

## Troubleshooting

### Common Issues

1. **"SMTP Error: Could not authenticate"**
   - Check Gmail username and app password
   - Ensure 2FA is enabled on Gmail account
   - Generate a new app password if needed

2. **"Failed to connect to server"**
   - Check internet connection
   - Verify SMTP settings (host, port, encryption)

3. **"Database error storing verification code"**
   - Run the table creation script
   - Check database connection settings

### Debug Mode
To enable detailed error logging, uncomment these lines in `send_verification_email.php`:
```php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

## File Locations

- **Email sending**: `public/components/send_verification_email.php`
- **Database setup**: `connection/create_verification_codes_table.php`
- **Frontend**: `public/components/ForgotPassword.html`
- **JavaScript**: `public/assets/js/ForgotPassword.js`

## Production Considerations

1. Move Gmail credentials to environment variables
2. Set up proper email logging
3. Consider using a transactional email service (SendGrid, Mailgun)
4. Implement rate limiting on the API endpoint
5. Add CSRF protection for the form submission
