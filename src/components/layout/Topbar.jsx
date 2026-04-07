import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const roleColors = {
    ADMIN:    { color: "#f59e0b", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  glow: "rgba(245,158,11,0.15)"  },
    LENDER:   { color: "#2dd4bf", bg: "rgba(45,212,191,0.08)",  border: "rgba(45,212,191,0.25)",  glow: "rgba(45,212,191,0.15)"  },
    BORROWER: { color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.25)", glow: "rgba(129,140,248,0.15)" },
    ANALYST:  { color: "#34d399", bg: "rgba(52,211,153,0.08)",  border: "rgba(52,211,153,0.25)",  glow: "rgba(52,211,153,0.15)"  },
};

const roleIcon = {
    ADMIN: "◈", LENDER: "◉", BORROWER: "◐", ANALYST: "◑",
}
export default function Topbar({ onToggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const role = user?.role ?? "GUEST";
    const rs = roleColors[role] ?? roleColors.LENDER;

    const handleLogoutConfirm = () => {
        const success = logout();
        if (success) {
            setShowLogoutConfirm(false);
            navigate("/login", { replace: true });
        }
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        .tb-root {
          position: sticky;
          top: 0;
          z-index: 40;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 68px;
          border-bottom: 1px solid rgba(255,255,255,0.055);
          background: rgba(6,10,18,0.92);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.03), 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
        }

        .tb-root::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 100%);
          pointer-events: none;
        }

        .tb-left { display: flex; align-items: center; gap: 14px; }

        .tb-hamburger {
          display: none;
          align-items: center; justify-content: center;
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.03);
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        @media(max-width:768px){ .tb-hamburger { display: flex; } }
        .tb-hamburger:hover {
          border-color: rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.07);
          color: #f0f4f8;
        }

        .tb-vsep {
          width: 1px; height: 24px;
          background: rgba(255,255,255,0.06);
        }
        .tb-vsep.mobile-only { display: none; }
        @media(max-width:768px){ .tb-vsep.mobile-only { display: block; } }

        .tb-logo {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: #f0f4f8;
          cursor: pointer;
          user-select: none;
          transition: opacity 0.15s;
          display: flex; align-items: center;
        }
        .tb-logo:hover { opacity: 0.82; }
        .tb-logo-teal { color: #2dd4bf; }

        .tb-logo-node {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #2dd4bf;
          box-shadow: 0 0 8px rgba(45,212,191,0.6);
          margin: 0 12px;
          flex-shrink: 0;
          animation: tb-glow 3s ease-in-out infinite;
        }
        @keyframes tb-glow {
          0%,100%{ box-shadow:0 0 6px rgba(45,212,191,0.5); }
          50%{ box-shadow:0 0 14px rgba(45,212,191,0.9); }
        }

        .tb-crumb {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 400;
          color: #263345;
          letter-spacing: 0.05em;
          display: none;
        }
        @media(min-width:640px){ .tb-crumb { display: block; } }

        .tb-right { display: flex; align-items: center; gap: 10px; }

        /* Role card */
        .tb-role {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px 8px 10px;
          border-radius: 11px;
          border: 1px solid var(--rs-border);
          background: var(--rs-bg);
          cursor: default;
          transition: box-shadow 0.25s;
          position: relative;
          overflow: hidden;
        }
        .tb-role::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 0% 50%, var(--rs-glow) 0%, transparent 60%);
          pointer-events: none;
        }
        .tb-role:hover { box-shadow: 0 0 20px var(--rs-glow); }

        .tb-role-icon { font-size: 14px; color: var(--rs-color); line-height: 1; flex-shrink: 0; position: relative; }

        .tb-role-stack { display: flex; flex-direction: column; gap: 2px; position: relative; }
        .tb-role-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px; font-weight: 600;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #2e3f52; line-height: 1;
        }
        .tb-role-name {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: var(--rs-color);
          line-height: 1; letter-spacing: 0.04em;
        }

        .tb-role-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--rs-color);
          box-shadow: 0 0 8px var(--rs-color);
          flex-shrink: 0; position: relative;
          animation: tb-pulse 2.5s ease-in-out infinite;
        }
        @keyframes tb-pulse {
          0%,100%{ opacity:1; transform:scale(1); }
          50%{ opacity:0.35; transform:scale(0.8); }
        }

        /* Logout */
        .tb-logout {
          display: inline-flex;
          align-items: center; gap: 7px;
          padding: 9px 18px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #4a6070;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .tb-logout:hover {
          border-color: rgba(248,113,113,0.35);
          color: #f87171;
          background: rgba(248,113,113,0.06);
          box-shadow: 0 0 14px rgba(248,113,113,0.1);
        }
        .tb-logout:active { transform: scale(0.97); }
        .tb-logout-icon { transition: transform 0.15s; flex-shrink: 0; }
        .tb-logout:hover .tb-logout-icon { transform: translateX(2px); }

        @media(max-width:480px){ .tb-root { padding: 0 16px; } }
      `}</style>

            <header className="tb-root" style={{ position: "sticky", top: 0, zIndex: 40 }}>
                {/* Left */}
                <div className="tb-left">
                    <button type="button" onClick={onToggleSidebar} className="tb-hamburger" aria-label="Toggle sidebar">
                        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
                            <path d="M1 1h14M1 7h14M1 13h9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                    </button>

                    <div className="tb-vsep mobile-only" />

                    <span className="tb-logo" onClick={() => navigate("/")}>
            Loan<span className="tb-logo-teal">Flow</span>
          </span>

                    <div className="tb-logo-node" />

                    <span className="tb-crumb">Dashboard</span>
                </div>

                {/* Right */}
                <div className="tb-right">
                    {/* Role card */}
                    <div
                        className="tb-role"
                        style={{
                            "--rs-color":  rs.color,
                            "--rs-bg":     rs.bg,
                            "--rs-border": rs.border,
                            "--rs-glow":   rs.glow,
                        }}
                    >
                        <span className="tb-role-icon">{roleIcon[role] ?? "◈"}</span>
                        <div className="tb-role-stack">
                            <span className="tb-role-label">Signed in as</span>
                            <span className="tb-role-name">{role}</span>
                        </div>
                        <div className="tb-role-dot" />
                    </div>

                    <div className="tb-vsep" />

                    {/* Logout */}
                    <button
                        type="button"
                        className="tb-logout"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        Logout
                        <svg className="tb-logout-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <>
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                            zIndex: 999,
                            animation: "fadeIn 0.2s ease-out",
                        }}
                        onClick={() => setShowLogoutConfirm(false)}
                    />
                    <div
                        style={{
                            position: "fixed",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(13,20,32,0.95)",
                            border: "1px solid rgba(248,113,113,0.25)",
                            borderRadius: "14px",
                            padding: "28px",
                            maxWidth: "380px",
                            width: "90%",
                            zIndex: 1000,
                            animation: "slideUp 0.3s ease-out",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div style={{
                                fontSize: "40px",
                                marginBottom: "16px",
                            }}>👋</div>
                            <h2 style={{
                                fontFamily: "'Syne', sans-serif",
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "#f0f4f8",
                                marginBottom: "8px",
                            }}>Confirm Logout</h2>
                            <p style={{
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "13px",
                                color: "#cbd5e1",
                                marginBottom: "24px",
                                lineHeight: "1.5",
                            }}>
                                You are about to sign out from your <strong>{role}</strong> account. You'll need to sign in again to continue.
                            </p>

                            <div style={{
                                display: "flex",
                                gap: "12px",
                                justifyContent: "center",
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutConfirm(false)}
                                    style={{
                                        padding: "10px 20px",
                                        background: "rgba(255,255,255,0.06)",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        color: "#cbd5e1",
                                        borderRadius: "8px",
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "13px",
                                        fontWeight: "500",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        minWidth: "100px",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "rgba(255,255,255,0.1)";
                                        e.target.style.borderColor = "rgba(255,255,255,0.2)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "rgba(255,255,255,0.06)";
                                        e.target.style.borderColor = "rgba(255,255,255,0.12)";
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLogoutConfirm}
                                    style={{
                                        padding: "10px 20px",
                                        background: "#f87171",
                                        border: "1px solid #f87171",
                                        color: "#fff",
                                        borderRadius: "8px",
                                        fontFamily: "'DM Sans', sans-serif",
                                        fontSize: "13px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                        minWidth: "100px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = "#ef4444";
                                        e.target.style.borderColor = "#ef4444";
                                        e.target.style.boxShadow = "0 0 20px rgba(248,113,113,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = "#f87171";
                                        e.target.style.borderColor = "#f87171";
                                        e.target.style.boxShadow = "none";
                                    }}
                                >
                                    <span>Logout</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; }
                            to { opacity: 1; }
                        }
                        @keyframes slideUp {
                            from { opacity: 0; transform: translate(-50%, -45%); }
                            to { opacity: 1; transform: translate(-50%, -50%); }
                        }
                    `}</style>
                </>
            )}
        </>
    );
}
