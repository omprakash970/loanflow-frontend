# Quick Start: Sign In & Sign Out Guide

## 🚀 Quick Overview

The LoanFlow authentication system provides secure sign-in and sign-out functionality with clear role-based authorization.

## 📋 Sign In Process

### Step 1: Navigate to Login
Go to `http://localhost:5173/login` or click the login link.

### Step 2: Select Your Role
Choose from 4 roles:
- **Admin** (System administration)
- **Lender** (Loan management)
- **Borrower** (Loan applications)
- **Analyst** (Analytics & reports)

### Step 3: Wait for Confirmation
A loading spinner appears while the system authenticates your role.

### Step 4: Access Dashboard
You're automatically redirected to your role-specific dashboard at `/app`.

## 🚪 Sign Out Process

### Step 1: Click Logout Button
In the top-right corner of any dashboard page, click the **"Logout"** button.

### Step 2: Confirm Logout
A confirmation modal appears asking you to confirm your logout.

### Step 3: Confirm Action
Click the **"Logout"** button in the modal to complete sign-out.

### Step 4: Return to Login
You're redirected to `/login` and your session is cleared.

## 🔐 Authorization Features

### Role-Based Access Control
- Each role has access to specific pages and features
- Attempting unauthorized access shows an error page
- Only users with correct role can access protected routes

### Session Persistence
- Your session persists even if you refresh the page
- You remain logged in until you explicitly logout
- Sessions automatically expire after 30 minutes of inactivity

### Error Handling
- **Failed Login**: Clear error message appears in the form
- **Unauthorized Access**: Friendly error page with back button
- **Session Expired**: Automatic redirect to login

## 📱 UI Elements

### Role Display Card (Top-Right)
Shows your current signed-in role with:
- Role icon
- "Signed in as" label
- Role name
- Active status indicator (green dot)

### Logout Button (Top-Right)
- Red button with logout icon
- Click to start logout process
- Shows confirmation modal before logging out

### Error Messages
- **Login Errors**: Red box at top of login form
- **Access Denied**: Full-page error with details
- **Success**: Smooth transition to dashboard

## 🧪 Testing Checklist

Use this checklist to verify the authentication system:

- [ ] Can sign in with Admin role
- [ ] Can sign in with Lender role
- [ ] Can sign in with Borrower role
- [ ] Can sign in with Analyst role
- [ ] Logout confirmation modal appears
- [ ] Logout clears session and redirects to login
- [ ] Session persists after page refresh
- [ ] Cannot access other roles' pages
- [ ] Error page shows on unauthorized access
- [ ] Loading spinner shows during sign-in
- [ ] Error message appears on failed login

## 💾 Session Storage

When you sign in, your session is saved with:
- **Role**: Your assigned role (ADMIN, LENDER, BORROWER, ANALYST)
- **Login Time**: When you signed in
- **Session ID**: Unique identifier for this session
- **Login Date**: ISO format timestamp

This data persists in your browser's localStorage and survives page refreshes.

## ⏱️ Session Timeout

- **Duration**: 30 minutes from login
- **Behavior**: Automatic logout when time expires
- **Trigger**: Next page load after timeout
- **Recovery**: Sign in again to get new session

## 🛡️ Security Notes

✅ Sessions stored locally in browser  
✅ Logout confirmation prevents accidents  
✅ Role-based access control enforced  
✅ Session validation on app load  
✅ Automatic timeout after 30 minutes  
✅ Error messages don't expose sensitive info  

## 🐛 Troubleshooting

### "Failed to sign in" Error
- Check your browser console for errors
- Ensure localStorage is enabled
- Try a different role
- Clear browser cache and try again

### Can't Access Protected Pages
- Verify you're signed in (check Topbar)
- Confirm you have the correct role
- Check the error page for required role
- Sign in with correct role if needed

### Session Expired
- Sign in again with your role
- Session will be active for another 30 minutes
- Enable "Remember Me" if available

### Stuck on Loading Screen
- Wait 5-10 seconds for authentication
- If still stuck, refresh the page
- Check browser console for errors
- Ensure JavaScript is enabled

## 📞 API Endpoints (Future)

When connected to backend, authentication will use:
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/verify` - Verify session
- `POST /api/auth/refresh` - Refresh token

## 🎨 Role Colors & Icons

| Role | Icon | Color | Hex |
|------|------|-------|-----|
| Admin | ◈ | Amber | #f59e0b |
| Lender | ◉ | Teal | #2dd4bf |
| Borrower | ◐ | Indigo | #818cf8 |
| Analyst | ◑ | Emerald | #34d399 |

## 📚 Learn More

For detailed technical documentation, see [AUTHENTICATION.md](./AUTHENTICATION.md)

---

**Happy lending! 🎉**
