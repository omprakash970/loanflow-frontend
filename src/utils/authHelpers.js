/**
 * Authentication Helper Functions
 * Provides utilities for auth validation, role checking, and session management
 */

const STORAGE_KEY = "loanflow_auth";

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Failed to get current user:", err);
    return null;
  }
};

/**
 * Check if user has specific role(s)
 * @param {string|string[]} roles - Single role or array of roles
 * @returns {boolean}
 */
export const hasRole = (roles) => {
  const user = getCurrentUser();
  if (!user) return false;

  if (typeof roles === "string") {
    return user.role === roles;
  }

  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }

  return false;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Get user's current role
 * @returns {string|null}
 */
export const getUserRole = () => {
  const user = getCurrentUser();
  return user?.role ?? null;
};

/**
 * Get session login time
 * @returns {number|null} Login timestamp or null
 */
export const getLoginTime = () => {
  const user = getCurrentUser();
  return user?.loginTime ?? null;
};

/**
 * Check if session is still valid (not expired)
 * @param {number} timeout - Session timeout in milliseconds (default 30 minutes)
 * @returns {boolean}
 */
export const isSessionValid = (timeout = 30 * 60 * 1000) => {
  const loginTime = getLoginTime();
  if (!loginTime) return false;
  return Date.now() - loginTime <= timeout;
};

/**
 * Get session time remaining in seconds
 * @param {number} timeout - Session timeout in milliseconds (default 30 minutes)
 * @returns {number} Remaining seconds or 0 if expired
 */
export const getSessionTimeRemaining = (timeout = 30 * 60 * 1000) => {
  const loginTime = getLoginTime();
  if (!loginTime) return 0;
  const remaining = timeout - (Date.now() - loginTime);
  return Math.max(0, Math.floor(remaining / 1000));
};

/**
 * Get user metadata
 * @returns {Object} User object with all metadata
 */
export const getUserMetadata = () => {
  return getCurrentUser() || {};
};

/**
 * Clear auth session (logout)
 * @returns {boolean}
 */
export const clearAuthSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error("Failed to clear auth session:", err);
    return false;
  }
};

/**
 * Role-based permission checker
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
export const canAccess = (requiredRole) => {
  return hasRole(requiredRole);
};

/**
 * Get user display name based on role
 * @returns {string}
 */
export const getUserDisplayName = () => {
  const role = getUserRole();
  const roleNames = {
    ADMIN: "Administrator",
    LENDER: "Lender",
    BORROWER: "Borrower",
    ANALYST: "Analyst",
  };
  return roleNames[role] || "User";
};
