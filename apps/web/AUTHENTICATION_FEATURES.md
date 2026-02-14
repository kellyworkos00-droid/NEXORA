# Authentication System - New Features

## Overview
Added production-ready authentication features to enhance security and user experience.

## Features Implemented

### 1. Email Verification System ✅

**Purpose**: Verify user email addresses to ensure account authenticity.

**Database Changes**:
- Added `email_verified` column to users table (BOOLEAN, default: false)
- Created `email_verification_tokens` table:
  - Stores verification tokens with 24-hour expiration
  - Indexes on user_id and token for fast lookups

**API Endpoints**:

#### POST `/api/auth/send-verification`
- Sends verification email to user
- Rate limited: 3 requests per hour
- Requires authentication (access token)
- Returns: Success message with user's email

**Request**: No body required (uses access token from cookies)
```typescript
// Response
{
  "message": "Verification email sent successfully",
  "email": "user@example.com"
}
```

#### GET `/api/auth/verify-email?token=xxx`
- Verifies email with token from email link
- Automatically logs user in after successful verification
- Redirects to dashboard with verified=true query param
- Token expires after 24 hours

**Email Template**:
- Professional gradient design
- Clear call-to-action button
- Manual entry fallback link
- Expiration warning

---

### 2. Two-Factor Authentication (2FA) ✅

**Purpose**: Add extra security layer with TOTP (Time-based One-Time Password).

**Database Changes**:
- Added `two_factor_secret` column to users table (VARCHAR(255))
- Added `two_factor_enabled` column to users table (BOOLEAN, default: false)

**Dependencies**:
- `speakeasy@2.0.0` - TOTP token generation
- `qrcode@1.5.3` - QR code generation for authenticator apps

**API Endpoints**:

#### POST `/api/auth/2fa/setup`
- Generates 2FA secret and QR code
- Requires authentication
- Does NOT enable 2FA yet (user must verify first)

**Request**: No body required
```typescript
// Response
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "manualEntryKey": "JBSWY3DPEHPK3PXP"
}
```

#### POST `/api/auth/2fa/enable`
- Verifies TOTP code and enables 2FA
- Requires authentication
- Saves secret to database

**Request**:
```typescript
{
  "secret": "JBSWY3DPEHPK3PXP",
  "code": "123456"
}
```

**Response**:
```typescript
{
  "message": "Two-factor authentication enabled successfully"
}
```

#### POST `/api/auth/2fa/disable`
- Disables 2FA for user
- Requires password confirmation for security
- Clears secret from database

**Request**:
```typescript
{
  "password": "user-password"
}
```

**Response**:
```typescript
{
  "message": "Two-factor authentication disabled successfully"
}
```

#### POST `/api/auth/2fa/verify`
- Verifies 2FA code during login
- Rate limited: 5 attempts per 15 minutes
- Creates session and sets cookies on success

**Request**:
```typescript
{
  "userId": "user-uuid",
  "code": "123456"
}
```

**Response**:
```typescript
{
  "message": "Two-factor authentication successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": true,
    "twoFactorEnabled": true
  }
}
```

**Login Flow Update**:
The `/api/auth/login` endpoint now checks if user has 2FA enabled:
- If 2FA is enabled: Returns `requiresTwoFactor: true` with `userId` (no session created)
- If 2FA is disabled: Normal login flow (creates session immediately)

---

### 3. Password Reset Flow ✅

**Purpose**: Allow users to securely reset forgotten passwords.

**Database Changes**:
- Created `password_reset_tokens` table:
  - Stores reset tokens with 1-hour expiration
  - `used` flag prevents token reuse
  - Indexes on user_id and token

**API Endpoints**:

#### POST `/api/auth/forgot-password`
- Sends password reset email
- Rate limited: 3 requests per hour
- Always returns success to prevent email enumeration
- Doesn't work for OAuth users (no password)

**Request**:
```typescript
{
  "email": "user@example.com"
}
```

**Response**:
```typescript
{
  "message": "If a matching account exists, a password reset link has been sent to your email."
}
```

#### POST `/api/auth/reset-password`
- Resets password with token
- Validates password strength
- Marks token as "used" to prevent reuse
- Deletes all user sessions (forces re-login everywhere)

**Request**:
```typescript
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123"
}
```

**Response**:
```typescript
{
  "message": "Password has been reset successfully. Please log in with your new password."
}
```

**Email Template**:
- Security-focused design (red gradient)
- Clear warning about expiration
- Security notice with bullet points
- Manual entry fallback link

---

## Email Service Configuration

**File**: `apps/web/src/app/api/utils/email.ts`

**Features**:
- Nodemailer integration for email sending
- Production SMTP configuration
- Development mode: Ethereal email (test service)
- HTML email templates with professional styling
- Text version fallback (auto-generated)

**Environment Variables Needed**:
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                      # Usually 587 for TLS
SMTP_SECURE=false                  # true for port 465, false for other ports
SMTP_USER=your-email@gmail.com     # Your email
SMTP_PASS=your-app-password        # App-specific password
EMAIL_FROM=NEXORA <noreply@nexora.ai>  # From address
APP_URL=http://localhost:3000      # Your app URL for links

# Already configured
DATABASE_URL=postgresql://...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
```

**Email Templates**:
All templates include:
- Responsive design (max-width: 600px)
- Gradient headers matching brand
- Clear call-to-action buttons
- Manual entry fallbacks
- Professional footer
- Security notices

---

## Database Schema Updates

**Users Table** - New columns:
```sql
email_verified BOOLEAN DEFAULT FALSE,
two_factor_secret VARCHAR(255),
two_factor_enabled BOOLEAN DEFAULT FALSE
```

**Email Verification Tokens Table**:
```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_email_verification_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token ON email_verification_tokens(token);
```

**Password Reset Tokens Table**:
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
```

**To initialize new tables**:
```bash
# Make a POST request to initialize database
curl -X POST http://localhost:3000/api/admin/init-db
```

---

## Auth Store Functions Added

**File**: `apps/web/src/app/api/data/auth-store.ts`

### Email Verification
- `createVerificationToken(userId)` - Generates 24-hour token
- `verifyEmailToken(token)` - Validates token and marks email as verified

### Password Reset
- `createPasswordResetToken(userId)` - Generates 1-hour token
- `verifyPasswordResetToken(token)` - Validates token (checks expiration and used status)
- `resetPassword(token, newPassword)` - Resets password and invalidates all sessions

### Two-Factor Authentication
- `updateUser2FA(userId, secret, enabled)` - Updates 2FA settings in database

---

## Security Features

### Rate Limiting
- **Email Verification**: 3 sends per hour per IP
- **Password Reset**: 3 requests per hour per IP
- **2FA Verification**: 5 attempts per 15 minutes per IP

### Token Expiration
- **Email Verification**: 24 hours
- **Password Reset**: 1 hour
- **2FA Window**: 2 time steps (±60 seconds) for clock drift

### Security Measures
1. **Email Enumeration Prevention**: Forgot password always returns success
2. **Token Reuse Prevention**: Password reset tokens marked as "used"
3. **Password Validation**: Enforces strength requirements
4. **Session Invalidation**: Password reset clears all sessions
5. **OAuth Protection**: Can't reset password for OAuth users
6. **2FA Secret Verification**: Must verify code before enabling

---

## User Interface Components Needed

### 1. Email Verification Banner
Display on dashboard when `emailVerified` is false:
```typescript
// Show after login if not verified
if (!user.emailVerified) {
  // Show banner: "Please verify your email"
  // Button: "Resend Verification Email"
  // Calls: POST /api/auth/send-verification
}
```

### 2. Two-Factor Authentication Setup Page
Location: Settings > Security > Two-Factor Authentication

**Flow**:
1. User clicks "Enable 2FA"
2. Call `POST /api/auth/2fa/setup` to get QR code
3. Display QR code and manual entry key
4. User scans with authenticator app (Google Authenticator, Authy, etc.)
5. User enters 6-digit code
6. Call `POST /api/auth/2fa/enable` with secret and code
7. Show success message

**Disable Flow**:
1. User clicks "Disable 2FA"
2. Show password confirmation modal
3. Call `POST /api/auth/2fa/disable` with password
4. Show success message

### 3. Password Reset Pages

**Forgot Password Page** (`/forgot-password`):
- Email input field
- Submit button
- Link back to login
- Calls: `POST /api/auth/forgot-password`

**Reset Password Page** (`/reset-password?token=xxx`):
- New password input (with strength indicator)
- Confirm password input
- Submit button
- Calls: `POST /api/auth/reset-password`
- Redirect to login on success

### 4. 2FA Verification Page
Show during login when `requiresTwoFactor: true` is returned:
- 6-digit code input
- Submit button
- "Use backup code" link (future feature)
- Calls: `POST /api/auth/2fa/verify`

---

## Testing Checklist

### Email Verification
- [ ] Send verification email
- [ ] Click verification link
- [ ] Check email is marked as verified
- [ ] Try expired token (24+ hours old)
- [ ] Try invalid token

### Two-Factor Authentication
- [ ] Setup 2FA with QR code
- [ ] Verify code works in authenticator app
- [ ] Enable 2FA with valid code
- [ ] Try login with 2FA enabled
- [ ] Disable 2FA with password
- [ ] Try invalid code (should fail)

### Password Reset
- [ ] Request password reset
- [ ] Check email received
- [ ] Reset password with token
- [ ] Try logging in with new password
- [ ] Try reusing reset token (should fail)
- [ ] Try expired token (1+ hour old)
- [ ] Test rate limiting (4th request should fail)

---

## Production Deployment Notes

### SMTP Configuration
**Gmail** (for small scale):
1. Enable 2FA on Google account
2. Generate App Password
3. Use app password in SMTP_PASS

**SendGrid** (recommended for production):
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**AWS SES** (scalable):
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### Database Migration
Run initialization endpoint or execute migration:
```sql
-- Run the SQL from db.ts to create new tables
-- Or call POST /api/admin/init-db
```

### Environment Variables
Ensure all required variables are set in production:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- EMAIL_FROM
- APP_URL (production URL)

---

## Dependencies Installed

```json
{
  "nodemailer": "^6.9.9",
  "@types/nodemailer": "^6.4.14",
  "speakeasy": "^2.0.0",
  "@types/speakeasy": "^2.0.10",
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| `/api/auth/send-verification` | POST | Send verification email | 3/hour |
| `/api/auth/verify-email` | GET | Verify email token | None |
| `/api/auth/forgot-password` | POST | Request password reset | 3/hour |
| `/api/auth/reset-password` | POST | Reset password | None |
| `/api/auth/2fa/setup` | POST | Generate 2FA secret | None |
| `/api/auth/2fa/enable` | POST | Enable 2FA | None |
| `/api/auth/2fa/disable` | POST | Disable 2FA | None |
| `/api/auth/2fa/verify` | POST | Verify 2FA code | 5/15min |

---

## Next Steps

1. **Configure SMTP**: Set up email provider (Gmail, SendGrid, or AWS SES)
2. **Initialize Database**: Run database migration to create new tables
3. **Build UI Components**: Create pages for email verification, 2FA setup, and password reset
4. **Testing**: Test all flows end-to-end
5. **Update User Flow**: Add email verification banner and 2FA prompts
6. **Documentation**: Add user guides for enabling 2FA

---

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify environment variables are configured
- Test email delivery in development (check Ethereal email preview URLs)
- Ensure database tables are created (call init-db endpoint)
