# 🎨 Authentication System - Visual Overview

## User Flow Diagrams

### Sign-In Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SIGN-IN FLOW                         │
└─────────────────────────────────────────────────────────────┘

    1. Visit Login Page
           ↓
    ┌─────────────────────────────────┐
    │   Select Role                   │
    │ ┌─────────────────────────────┐ │
    │ │ • Admin        (◈ Amber)    │ │
    │ │ • Lender       (◉ Teal)     │ │
    │ │ • Borrower     (◐ Indigo)   │ │
    │ │ • Analyst      (◑ Emerald)  │ │
    │ └─────────────────────────────┘ │
    └─────────────────────────────────┘
           ↓
    Show Loading Spinner
           ↓
    ┌─────────────────────────────────┐
    │  Save to localStorage:          │
    │  • role: "ADMIN"                │
    │  • loginTime: timestamp         │
    │  • sessionId: unique_id         │
    │  • metadata: {...}              │
    └─────────────────────────────────┘
           ↓
    Redirect to Dashboard
           ↓
    ✅ User Logged In
```

### Sign-Out Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   USER SIGN-OUT FLOW                         │
└─────────────────────────────────────────────────────────────┘

    1. Click Logout Button
           ↓
    ┌─────────────────────────────────┐
    │  Confirmation Modal:            │
    │  "Sign out from ADMIN?"         │
    │  👋                              │
    │ ┌──────────────┬──────────────┐ │
    │ │   Cancel     │   Logout     │ │
    │ └──────────────┴──────────────┘ │
    └─────────────────────────────────┘
           ↓
    User Confirms
           ↓
    ┌─────────────────────────────────┐
    │  Clear from localStorage:       │
    │  • Remove "loanflow_auth"       │
    │  • Reset user state             │
    │  • Clear error state            │
    └─────────────────────────────────┘
           ↓
    Redirect to Login
           ↓
    ✅ User Logged Out
```

### Protected Route Access

```
┌─────────────────────────────────────────────────────────────┐
│              PROTECTED ROUTE ACCESS FLOW                     │
└─────────────────────────────────────────────────────────────┘

    User visits /app/admin
           ↓
    ┌─────────────────────────────────┐
    │  Check Authentication           │
    └─────────────────────────────────┘
           ↓
         /    \
        /      \
    Logged In?  Not Logged In?
      /              \
     ✓                ✗
     ↓                ↓
    Check Role    Redirect to
    Permission    /login
     ↓
   /   \
  /     \
Has     No
Role?   Role?
  ✓       ✗
  ↓       ↓
Show    Show
Page    "Access
        Denied"
```

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     APP STRUCTURE                             │
└──────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                      App.jsx                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │          <AuthProvider>                              │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │      <AppRoutes>                                │ │ │
│  │  │  ┌──────────────────────────────────────────┐  │ │ │
│  │  │  │  <Route path="/login">                   │  │ │ │
│  │  │  │    <Login />                             │  │ │ │
│  │  │  └──────────────────────────────────────────┘  │ │ │
│  │  │  ┌──────────────────────────────────────────┐  │ │ │
│  │  │  │  <Route path="/app">                     │  │ │ │
│  │  │  │    <ProtectedRoute>                      │  │ │ │
│  │  │  │      <DashboardLayout>                   │  │ │ │
│  │  │  │        <Topbar />      [Logout Button]  │  │ │ │
│  │  │  │        <RoleContent /> [Page Content]   │  │ │ │
│  │  │  │      </DashboardLayout>                 │  │ │ │
│  │  │  │    </ProtectedRoute>                    │  │ │ │
│  │  │  └──────────────────────────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘

                    Context Layer
┌────────────────────────────────────────────────────────────┐
│                  AuthContext                                │
│  ┌────────────────────────────────────────────────────────┐│
│  │ State:                                                 ││
│  │ • user: {role, loginTime, sessionId, ...}             ││
│  │ • isLoading: boolean                                  ││
│  │ • error: string | null                                ││
│  │                                                        ││
│  │ Methods:                                              ││
│  │ • login(role, metadata)                               ││
│  │ • logout()                                            ││
│  │ • hasRole(roles)                                      ││
│  │ • isAuthenticated                                     ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘

                    Utility Layer
┌────────────────────────────────────────────────────────────┐
│                  authHelpers.js                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ Functions:                                             ││
│  │ • getCurrentUser()                                     ││
│  │ • hasRole(roles)                                       ││
│  │ • isAuthenticated()                                    ││
│  │ • getSessionTimeRemaining()                            ││
│  │ • clearAuthSession()                                   ││
│  │ • getUserDisplayName()                                 ││
│  │ • ... and more                                         ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘

                  Storage Layer
┌────────────────────────────────────────────────────────────┐
│            Browser localStorage                             │
│  Key: "loanflow_auth"                                      │
│  Value: {                                                  │
│    role: "ADMIN",                                          │
│    loginTime: 1711446000000,                               │
│    sessionId: "session_1711446000000",                     │
│    loginedAt: "2026-03-26T12:00:00Z"                       │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
```

## Component Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                   COMPONENT HIERARCHY                         │
└──────────────────────────────────────────────────────────────┘

App (root)
├── AuthProvider (provides context)
│   └── AppRoutes (routing logic)
│       ├── /login
│       │   └── Login (role selection)
│       │
│       └── /app (protected)
│           └── ProtectedRoute (auth check)
│               └── DashboardLayout
│                   ├── Topbar
│                   │   └── Logout Modal
│                   ├── Sidebar
│                   └── PageContent
│                       ├── RoleDashboard (dynamic)
│                       ├── AdminDashboard
│                       ├── LenderDashboard
│                       ├── BorrowerDashboard
│                       └── AnalystDashboard

useAuth() Hook
├── Used in: Login.jsx
├── Used in: Topbar.jsx
├── Used in: ProtectedRoute.jsx
└── Can be used in: Any component
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                STATE LIFECYCLE                                │
└──────────────────────────────────────────────────────────────┘

Initial Load
├── isLoading = true
├── user = null
├── error = null
└── Check localStorage...

Restore Session
├── Valid session? ✓
│   ├── user = restored data
│   ├── isLoading = false
│   └── error = null
└── Expired/Invalid? ✗
    ├── user = null
    ├── localStorage.clear()
    ├── isLoading = false
    └── error = null

User Logs In
├── login(role) called
├── user = {role, loginTime, ...}
├── localStorage.setItem("loanflow_auth", ...)
├── isLoading = false
└── Redirect to /app

User Logs Out
├── logout() called
├── user = null
├── localStorage.removeItem("loanflow_auth")
├── error = null
└── Redirect to /login

Error Occurs
├── error = error message
├── user = unchanged
└── Display error to user
```

## Role System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   ROLE HIERARCHY                              │
└──────────────────────────────────────────────────────────────┘

All Roles
├── ADMIN (◈ Amber #f59e0b)
│   ├── Access: /app/admin/*
│   ├── Permissions:
│   │   ├── User management
│   │   ├── System configuration
│   │   ├── Security logs
│   │   └── Platform settings
│   └── Dashboard: AdminDashboard
│
├── LENDER (◉ Teal #2dd4bf)
│   ├── Access: /app/lender/*
│   ├── Permissions:
│   │   ├── Create loans
│   │   ├── Manage active loans
│   │   ├── View borrowers
│   │   └── Process payments
│   └── Dashboard: LenderDashboard
│
├── BORROWER (◐ Indigo #818cf8)
│   ├── Access: /app/borrower/*
│   ├── Permissions:
│   │   ├── Apply for loans
│   │   ├── View my loans
│   │   ├── View EMI schedule
│   │   └── Update profile
│   └── Dashboard: BorrowerDashboard
│
└── ANALYST (◑ Emerald #34d399)
    ├── Access: /app/analyst/*
    ├── Permissions:
    │   ├── View analytics
    │   ├── Generate reports
    │   ├── Analyze trends
    │   └── Export data
    └── Dashboard: AnalystDashboard
```

## Session Timeline

```
┌──────────────────────────────────────────────────────────────┐
│              SESSION TIMELINE (30 MINUTES)                    │
└──────────────────────────────────────────────────────────────┘

Login         Active        Active        Active        Expired
  │───────────────────────────────────────────────────────────│
  0 min        10 min       20 min       30 min

✓ Active      ✓ Active     ✓ Active    ✗ Expired
  Can access   Can access   Warning     Redirect to
  all routes   all routes   30 sec to    login
  Normal       Normal       go           Auto-logout
  operation    operation    Last chance

Timeline:
• 0:00  - Login starts session
• 0:01  - Session stored in localStorage
• 10:00 - User still active
• 20:00 - User still active
• 29:00 - Session about to expire (show warning)
• 30:00 - Session expired (auto logout)
```

## Error Scenarios Diagram

```
┌──────────────────────────────────────────────────────────────┐
│              ERROR HANDLING FLOW                              │
└──────────────────────────────────────────────────────────────┘

Login Error
├── API failure
│   └── Show: "Failed to sign in"
├── Invalid credentials
│   └── Show: "Invalid credentials"
└── System error
    └── Show: "An error occurred"

Access Denied Error
├── Not authenticated
│   └── Redirect to /login
├── Wrong role
│   └── Show: "Access Denied" page
└── Role not in allowedRoles
    └── Show error with required roles

Session Error
├── Expired session
│   ├── Clear localStorage
│   └── Redirect to /login
├── Corrupted data
│   ├── Clear localStorage
│   └── Redirect to /login
└── Invalid user
    ├── Clear localStorage
    └── Redirect to /login

Logout Error
├── Storage error
│   └── Attempt retry
└── Redirect fails
    └── Manual page navigation
```

## UI Component Locations

```
┌──────────────────────────────────────────────────────────────┐
│              UI ELEMENTS MAP                                  │
└──────────────────────────────────────────────────────────────┘

TOPBAR
├── Left Side
│   ├── Menu toggle (mobile only)
│   ├── Logo (clickable)
│   └── Breadcrumb
└── Right Side
    ├── Role card
    │   ├── Icon (◈, ◉, ◐, ◑)
    │   ├── "Signed in as"
    │   ├── Role name
    │   └── Status dot (pulsing)
    ├── Divider
    └── Logout button
        └── Logout Modal (on click)
            ├── Confirmation message
            ├── Role shown
            ├── Cancel button
            └── Logout button

LOGIN PAGE
├── Canvas background
├── Animated blobs
├── Card (centered)
│   ├── Eyebrow ("Demo Access")
│   ├── Title ("Select your role")
│   ├── Description
│   ├── Error box (if error)
│   ├── Role buttons (4)
│   │   ├── Icon
│   │   ├── Name
│   │   ├── Description
│   │   └── Arrow
│   └── Footer text

PROTECTED ROUTE
├── Loading state
│   └── Loading spinner
├── Unauthorized state
│   └── Access Denied page
│       ├── Icon
│       ├── Title
│       ├── Message
│       └── Back button
└── Authorized state
    └── Protected content
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│              DATA FLOW                                        │
└──────────────────────────────────────────────────────────────┘

User Input (Login)
       ↓
Login Component
       ↓
useAuth().login(role)
       ↓
AuthContext.login()
       ↓
Update State
├── user = {role, loginTime, ...}
└── localStorage.setItem("loanflow_auth", ...)
       ↓
Context Updates
       ↓
All Consuming Components
├── Topbar (re-render with role)
├── ProtectedRoute (allow access)
└── Other useAuth() hooks
       ↓
User Redirected to Dashboard
       ↓
✅ Session Active


User Input (Logout)
       ↓
Topbar Logout Modal
       ↓
useAuth().logout()
       ↓
AuthContext.logout()
       ↓
Update State
├── user = null
├── localStorage.removeItem("loanflow_auth")
└── error = null
       ↓
Context Updates
       ↓
All Consuming Components
├── Topbar (re-render)
├── ProtectedRoute (deny access)
└── Other useAuth() hooks
       ↓
User Redirected to Login
       ↓
✅ Session Cleared
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** March 26, 2026
