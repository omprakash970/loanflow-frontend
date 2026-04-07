import { useState, useEffect } from "react";

export default function OtpVerification({ email, onVerified, onBack, isLoading: parentLoading }) {
  const [otp, setOtp] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);

  // Timer for OTP expiry
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Timer for resend button
  useEffect(() => {
    if (resendTimeLeft > 0) {
      const timer = setTimeout(() => setResendTimeLeft(resendTimeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [resendTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpDigitChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setOtp(newDigits.join(""));
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a complete OTP");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onVerified(email, otp);
      if (!success) {
        setError("Invalid or expired OTP. Please try again.");
        // Clear OTP inputs on error
        setOtpDigits(["", "", "", "", "", ""]);
        setOtp("");
      }
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setResendDisabled(true);
    setResendTimeLeft(60);

    try {
      // Assume parent component has sendOtp function
      // We'll need to pass it as a prop
      setError("Resend OTP not implemented yet");
    } catch (err) {
      setError("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.length === 6;
  const isExpired = timeLeft === 0;

  return (
    <div style={styles.container}>
      <style>{stylesCSS}</style>

      <div style={styles.header}>
        <h2 style={styles.title}>Verify Your Email</h2>
        <p style={styles.subtitle}>
          We've sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div style={styles.alert}>
          <span style={styles.alertIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} style={styles.form}>
        {/* OTP Input Fields */}
        <div style={styles.otpContainer}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              disabled={isLoading || parentLoading || isExpired}
              style={{
                ...styles.otpInput,
                borderColor: digit ? "#818cf8" : "rgba(255, 255, 255, 0.1)",
              }}
              autoComplete="off"
            />
          ))}
        </div>

        {/* Timer */}
        <div style={styles.timerContainer}>
          {isExpired ? (
            <p style={styles.expiredText}>⏰ OTP has expired. Please resend.</p>
          ) : (
            <p style={styles.timerText}>
              ⏱️ Code expires in <strong>{formatTime(timeLeft)}</strong>
            </p>
          )}
        </div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={
            !isOtpComplete || isLoading || parentLoading || isExpired
          }
          style={{
            ...styles.verifyBtn,
            opacity:
              !isOtpComplete || isLoading || parentLoading || isExpired
                ? 0.5
                : 1,
            cursor:
              !isOtpComplete || isLoading || parentLoading || isExpired
                ? "not-allowed"
                : "pointer",
          }}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Resend & Back Links */}
      <div style={styles.footerActions}>
        <p style={styles.footerText}>
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendDisabled || isLoading || parentLoading}
            style={{
              ...styles.linkButton,
              opacity: resendDisabled || isLoading ? 0.6 : 1,
              cursor:
                resendDisabled || isLoading ? "not-allowed" : "pointer",
            }}
          >
            {resendDisabled
              ? `Resend in ${resendTimeLeft}s`
              : "Resend Code"}
          </button>
        </p>
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading || parentLoading}
          style={styles.backButton}
        >
          ← Back to Email
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
  },
  header: {
    marginBottom: "28px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#f0f4f8",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "13.5px",
    color: "#94a3b8",
    margin: "0",
    lineHeight: "1.5",
  },
  form: {
    marginBottom: "24px",
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
    fontSize: "12.5px",
  },
  alertIcon: {
    fontSize: "16px",
  },
  otpContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "8px",
    marginBottom: "16px",
  },
  otpInput: {
    width: "100%",
    padding: "14px 8px",
    background: "rgba(255, 255, 255, 0.05)",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "10px",
    color: "#f0f4f8",
    fontSize: "18px",
    fontWeight: "600",
    textAlign: "center",
    transition: "all 0.2s",
    boxSizing: "border-box",
  },
  timerContainer: {
    textAlign: "center",
    marginBottom: "16px",
  },
  timerText: {
    fontSize: "12.5px",
    color: "#cbd5e1",
    margin: "0",
  },
  expiredText: {
    fontSize: "12.5px",
    color: "#fca5a5",
    margin: "0",
  },
  verifyBtn: {
    width: "100%",
    padding: "11px 16px",
    background: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    marginBottom: "16px",
  },
  footerActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
  },
  footerText: {
    fontSize: "12.5px",
    color: "#cbd5e1",
    margin: "0",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#818cf8",
    fontSize: "12.5px",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
    padding: "0",
  },
  backButton: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#cbd5e1",
    padding: "8px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

const stylesCSS = `
  #otp-input-0:focus,
  #otp-input-1:focus,
  #otp-input-2:focus,
  #otp-input-3:focus,
  #otp-input-4:focus,
  #otp-input-5:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }
`;

