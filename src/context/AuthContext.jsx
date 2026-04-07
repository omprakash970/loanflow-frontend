import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../utils/apiClient";

const AuthContext = createContext();

const STORAGE_KEY = "loanflow_auth";
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          const loginTime = userData.loginTime || Date.now();
          const isExpired = Date.now() - loginTime > SESSION_TIMEOUT;

          if (isExpired) {
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          } else {
            setUser(userData);
          }
        }
      } catch (err) {
        console.error("Failed to restore auth state:", err);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (role, metadata = {}) => {
    try {
      setError(null);
      const userData = {
        role,
        loginTime: Date.now(),
        ...metadata,
      };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return true;
    } catch (err) {
      const errMsg = "Failed to login";
      setError(errMsg);
      console.error(errMsg, err);
      return false;
    }
  };

  const loginWithEmail = async (email, password, recaptchaToken) => {
    try {
      setError(null);
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          recaptchaToken,
        }),
      });

      if (response && response.data) {
        const userData = {
          email,
          role: response.data.role || "BORROWER",
          token: response.data.token,
          userId: response.data.userId,
          loginTime: Date.now(),
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.message || "Login failed";
      setError(errMsg);
      console.error("Login error:", err);
      return false;
    }
  };

  const registerUser = async (fullName, email, password, role, recaptchaToken) => {
    try {
      setError(null);
      const response = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          password,
          role,
          recaptchaToken,
        }),
      });

      if (response && response.data) {
        const userData = {
          email,
          role,
          token: response.data.token,
          userId: response.data.userId,
          loginTime: Date.now(),
        };
        setUser(userData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (err) {
      const errMsg = err.message || "Registration failed";
      setError(errMsg);
      console.error("Register error:", err);
      return false;
    }
  };

  const sendOtp = async (email) => {
    try {
      setError(null);
      const response = await apiRequest("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      if (response && response.success) {
        return true;
      }
      setError(response?.message || "Failed to send OTP");
      return false;
    } catch (err) {
      const errMsg = err.message || "Failed to send OTP";
      setError(errMsg);
      console.error("Send OTP error:", err);
      return false;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });

      if (response && response.data && response.data.verified) {
        return true;
      }
      setError(response?.data?.message || "Failed to verify OTP");
      return false;
    } catch (err) {
      const errMsg = err.message || "Failed to verify OTP";
      setError(errMsg);
      console.error("Verify OTP error:", err);
      return false;
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      setError(null);
      return true;
    } catch (err) {
      const errMsg = "Failed to logout";
      setError(errMsg);
      console.error(errMsg, err);
      return false;
    }
  };

  const isAuthenticated = !!user;
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === "string") return user.role === roles;
    return Array.isArray(roles) && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      error,
      login,
      loginWithEmail,
      registerUser,
      sendOtp,
      verifyOtp,
      logout,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
