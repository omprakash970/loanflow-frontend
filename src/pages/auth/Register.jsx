import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import OtpVerification from "../../components/OtpVerification";

const ROLES = [
  { key: "BORROWER", label: "Borrower", color: "#818cf8" },
  { key: "LENDER", label: "Lender", color: "#2dd4bf" },
  { key: "ANALYST", label: "Analyst", color: "#34d399" },
];

export default function Register() {
  const { registerUser, sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("register"); // "register" | "otp" | "verify"
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.role) {
      setError("Please select a role");
      return false;
    }
    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const success = await sendOtp(formData.email);
      if (success) {
        setStep("otp");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP");
      console.error("Send OTP error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      const success = await verifyOtp(email, otp);
      if (success) {
        setStep("verify");
        // Auto-proceed to registration after short delay
        setTimeout(() => completeRegistration(), 1500);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Verify OTP error:", err);
      return false;
    }
  };

  const completeRegistration = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await registerUser(
        formData.fullName,
        formData.email,
        formData.password,
        formData.role,
        "temp_token"
      );
      if (success) {
        setTimeout(() => navigate("/login"), 400);
      } else {
        setError("Registration failed. Please try again.");
        setStep("register");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      console.error("Register error:", err);
      setStep("register");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setStep("register");
    setError(null);
  };

  const handleResendOtp = async () => {
    try {
      const success = await sendOtp(formData.email);
      return success;
    } catch (err) {
      console.error("Resend OTP error:", err);
      return false;
    }
  };

  return (
    <div style={styles.root}>
      <style>{stylesCSS}</style>

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <nav className="lg-nav">
        <a href="/" className="lg-logo">
          Loan<span>Flow</span>
        </a>
      </nav>

      <main className="lg-main">
        <div className="lg-card">
          {step === "register" && (
            <>
              <div className="lg-head">
                <div className="lg-eyebrow">📝 Create Account</div>
                <h1 className="lg-title">Join LoanFlow</h1>
                <p className="lg-sub">Set up your account to get started</p>
              </div>

              {error && (
                <div style={styles.alert}>
                  <span style={styles.alertIcon}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSendOtp}>
                {/* Full Name Field */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={isLoading}
                  />
                </div>

                {/* Email Field */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={isLoading}
                  />
                </div>

                {/* Password Field */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={isLoading}
                  />
                </div>

                {/* Confirm Password Field */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={styles.input}
                    disabled={isLoading}
                  />
                </div>

                {/* Role Selection */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Type</label>
                  <div style={styles.roleGrid}>
                    {ROLES.map((role) => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, role: role.key }))
                        }
                        disabled={isLoading}
                        style={{
                          ...styles.roleButton,
                          borderColor:
                            formData.role === role.key
                              ? role.color
                              : "transparent",
                          background:
                            formData.role === role.key
                              ? `rgba(${hexToRgb(role.color)}, 0.15)`
                              : "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    ...styles.submitBtn,
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {isLoading ? "Sending OTP..." : "Continue"}
                </button>
              </form>

              {/* Links */}
              <div style={styles.footer}>
                <p style={styles.footerText}>
                  Already have an account?{" "}
                  <Link to="/login" style={styles.link}>
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <OtpVerification
                email={formData.email}
                onVerified={handleVerifyOtp}
                onBack={handleBackToRegister}
                isLoading={isLoading}
              />
            </>
          )}

          {step === "verify" && (
            <div style={styles.verifyContainer}>
              <div style={styles.successIcon}>✓</div>
              <h2 style={styles.successTitle}>Email Verified!</h2>
              <p style={styles.successMessage}>
                Completing your registration...
              </p>
              <div style={styles.spinner}></div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "255, 255, 255";
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#080c14",
    color: "#f0f4f8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "13px",
  },
  alertIcon: {
    fontSize: "16px",
  },
  formGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f0f4f8",
    fontSize: "14px",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
  },
  roleButton: {
    padding: "10px 12px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f0f4f8",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  recaptchaContainer: {
    marginBottom: "18px",
    display: "flex",
    justifyContent: "center",
  },
  submitBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #2dd4bf 0%, #06b6d4 100%)",
    color: "#080c14",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
  },
  footerText: {
    fontSize: "13px",
    color: "#94a3b8",
  },
  link: {
    color: "#2dd4bf",
    textDecoration: "none",
    fontWeight: "600",
  },
  verifyContainer: {
    textAlign: "center",
    padding: "32px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
  },
  successIcon: {
    fontSize: "64px",
    color: "#34d399",
    marginBottom: "16px",
    animation: "scaleIn 0.5s ease-out",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f0f4f8",
    margin: "0 0 8px 0",
  },
  successMessage: {
    fontSize: "13.5px",
    color: "#94a3b8",
    margin: "0 0 24px 0",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255, 255, 255, 0.1)",
    borderTopColor: "#818cf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

const stylesCSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

:root {
  --bg: #080c14;
  --surface: #0d1420;
  --border: rgba(255,255,255,0.07);
  --teal: #2dd4bf;
  --text: #f0f4f8;
  --muted: #64748b;
  --font-head: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}

.blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

.blob-1 {
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(45,212,191,0.07) 0%, transparent 70%);
  top: -100px;
  right: -60px;
}

.blob-2 {
  width: 360px;
  height: 360px;
  background: radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%);
  bottom: 60px;
  left: -60px;
}

.lg-nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid var(--border);
  background: rgba(8,12,20,0.6);
  backdrop-filter: blur(16px);
}

.lg-logo {
  font-family: var(--font-head);
  font-size: 17px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--text);
  text-decoration: none;
}

.lg-logo span {
  color: var(--teal);
}

.lg-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
}

.lg-card {
  width: 100%;
  max-width: 480px;
  background: rgba(13,20,32,0.85);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px 32px 28px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
  animation: fadeUp 0.5s ease both;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lg-head {
  text-align: center;
  margin-bottom: 24px;
}

.lg-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 14px;
}

.lg-title {
  font-family: var(--font-head);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 8px;
}

.lg-sub {
  font-size: 12.5px;
  font-weight: 300;
  color: var(--muted);
  line-height: 1.5;
}

input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(45, 212, 191, 0.5);
  box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.1);
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.g-recaptcha {
  display: flex;
  justify-content: center;
}

.g-recaptcha iframe {
  border-radius: 10px;
}

.lg-card::-webkit-scrollbar {
  width: 6px;
}

.lg-card::-webkit-scrollbar-track {
  background: transparent;
}

.lg-card::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.lg-card::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;
