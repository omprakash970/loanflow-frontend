import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const { loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const success = await loginWithEmail(formData.email, formData.password, "temp_token");
      if (success) {
        setTimeout(() => navigate("/app"), 400);
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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
          <div className="lg-head">
            <div className="lg-eyebrow">🔐 Secure Login</div>
            <h1 className="lg-title">Welcome Back</h1>
            <p className="lg-sub">Sign in to access your LoanFlow account</p>
          </div>

          {error && (
            <div style={styles.alert}>
              <span style={styles.alertIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                disabled={isLoading}
              />
            </div>

            {/* reCAPTCHA */}
            {/* reCAPTCHA will be added later - temporarily disabled */}

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
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Links */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{" "}
              <Link to="/register" style={styles.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
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
  max-width: 440px;
  background: rgba(13,20,32,0.85);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 36px 32px 28px;
  backdrop-filter: blur(20px);
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
  animation: fadeUp 0.5s ease both;
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
  margin-bottom: 32px;
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
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-bottom: 8px;
}

.lg-sub {
  font-size: 13.5px;
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
  box-shadow: 0 8px 24px rgba(45, 212, 191, 0.3);
}

.g-recaptcha {
  display: flex;
  justify-content: center;
}

.g-recaptcha iframe {
  border-radius: 10px;
}
`;