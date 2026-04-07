import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0d1420 0%, #1a2633 100%)",
        color: "#cbd5e1",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 50,
            height: 50,
            border: "2px solid rgba(45,212,191,0.2)",
            borderTop: "2px solid #2dd4bf",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px",
          }}></div>
          <p>Verifying credentials...</p>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role - show error
  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #0d1420 0%, #1a2633 100%)",
      }}>
        <div style={{
          textAlign: "center",
          padding: "40px",
          background: "rgba(248,113,113,0.05)",
          border: "1px solid rgba(248,113,113,0.2)",
          borderRadius: "12px",
          maxWidth: "400px",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⛔</div>
          <h1 style={{
            color: "#f87171",
            fontFamily: "'Syne', sans-serif",
            fontSize: "24px",
            marginBottom: "12px",
          }}>Access Denied</h1>
          <p style={{
            color: "#cbd5e1",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            marginBottom: "24px",
            lineHeight: "1.6",
          }}>
            Your role ({user?.role}) does not have permission to access this page.
            <br />
            Required roles: <strong>{allowedRoles.join(", ")}</strong>
          </p>
          <button
            onClick={() => window.location.href = "/app"}
            style={{
              padding: "10px 20px",
              background: "#2dd4bf",
              color: "#0d1420",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => e.target.style.opacity = "0.85"}
            onMouseLeave={(e) => e.target.style.opacity = "1"}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
