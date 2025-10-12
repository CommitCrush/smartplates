# Contact Page Setup Guide

## 🚀 Quick Setup Instructions

### 1. Environment Variables Setup

Create or update your `.env.local` file with the following SMTP configuration:

```bash
# SMTP Configuration for Contact Form
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=smartplates.group@gmail.com
SMTP_PASS=your-app-password

# Contact Form Settings
CONTACT_EMAIL=smartplates.group@gmail.com
```

### 2. Gmail App Password Setup

To use Gmail for sending emails:

1. **Enable 2-Factor Authentication** on the Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

### 3. Alternative Email Providers

#### SendGrid (Production Recommended)
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

### 4. Testing the Implementation

1. **Start Development Server**:
   ```bash
   bun run dev
   ```

2. **Navigate to Contact Page**:
   ```
   http://localhost:3000/contact
   ```

3. **Test Form Submission**:
   - Fill out all required fields
   - Submit the form
   - Check for success message
   - Verify email received at `smartplates.group@gmail.com`

### 5. Production Deployment

#### Vercel Environment Variables
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all SMTP configuration variables

#### Environment Variable Security
- ✅ Never commit `.env.local` to version control
- ✅ Use different credentials for development/production
- ✅ Regularly rotate email passwords
- ✅ Monitor email usage for suspicious activity

### 6. Troubleshooting

#### Common Issues

**Problem**: "Authentication failed" error
**Solution**: 
- Verify Gmail 2FA is enabled
- Use App Password instead of regular password
- Check SMTP credentials are correct

**Problem**: Emails not being received
**Solution**:
- Check spam folder
- Verify email delivery logs
- Test with different email provider
- Check DNS settings if using custom domain

**Problem**: Rate limiting errors
**Solution**:
- Increase rate limits in environment variables
- Implement more sophisticated rate limiting
- Use CAPTCHA for additional protection

#### Debug Mode

Enable debug logging by checking the browser console and server logs. The implementation includes comprehensive error logging for troubleshooting.

### 7. Monitoring & Maintenance

#### Regular Checks
- Monitor email delivery rates
- Check form submission success rates
- Review error logs for issues
- Update dependencies regularly

#### Email Templates
- Test email rendering in different clients
- Verify responsive design on mobile
- Check spam score with email testing tools
- Update branding as needed

## 🎯 Success Criteria

Your contact page is working correctly when:

- ✅ Form submits without external popups
- ✅ Success message appears after submission
- ✅ Admin receives email at `smartplates.group@gmail.com`
- ✅ User receives confirmation email (optional)
- ✅ All form validation works properly
- ✅ Responsive design functions on mobile
- ✅ No console errors during submission

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test with a simple email service first
4. Verify all environment variables are set correctly

The implementation is robust and includes fallback logging when email services are unavailable, ensuring the application continues to function even during email service outages.