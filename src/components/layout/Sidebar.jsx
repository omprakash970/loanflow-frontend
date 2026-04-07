import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";
const menuByRole = {
  ADMIN: [
    { label: "Dashboard", to: "/app", icon: "◈" },
    { label: "Users", to: "/app/users", icon: "◉" },
    { label: "Loans Overview", to: "/app/loans-overview", icon: "◐" },
    { label: "Security Logs", to: "/app/security", icon: "◑" },
    { label: "Settings", to: "/app/settings", icon: "◒" },
  ],
  LENDER: [
    { label: "Dashboard", to: "/app", icon: "◈" },
    { label: "Create Loan", to: "/app/create-loan", icon: "◉" },
    { label: "Open Requests", to: "/app/open-requests", icon: "◒" },
    { label: "Active Loans", to: "/app/active-loans", icon: "◐" },
    { label: "Borrowers", to: "/app/borrowers", icon: "◑" },
    { label: "Payments", to: "/app/payments", icon: "◒" },
  ],
  BORROWER: [
    { label: "Dashboard", to: "/app", icon: "◈" },
    { label: "Loan Offers", to: "/app/loan-offers", icon: "◉" },
    { label: "Apply for Loan", to: "/app/apply-loan", icon: "◐" },
    { label: "My Loans", to: "/app/my-loans", icon: "◐" },
    { label: "EMI Schedule", to: "/app/emi-schedule", icon: "◑" },
    { label: "Profile", to: "/app/profile", icon: "◒" },
  ],
  ANALYST: [
    { label: "Dashboard", to: "/app", icon: "◈" },
    { label: "Analytics", to: "/app/analytics", icon: "◉" },
    { label: "Risk Reports", to: "/app/risk-reports", icon: "◐" },
    { label: "Trends", to: "/app/trends", icon: "◑" },
    { label: "Exports", to: "/app/exports", icon: "◒" },
  ],
};
const roleColors = {
  ADMIN:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
  LENDER:   { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.25)"  },
  BORROWER: { color: "#818cf8", bg: "rgba(129,140,248,0.1)",border: "rgba(129,140,248,0.25)" },
  ANALYST:  { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)"  },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role ?? "BORROWER";
  const menu = menuByRole[role] ?? menuByRole.BORROWER;
  const roleStyle = roleColors[role] ?? roleColors.LENDER;

  return (
      <>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .sb-item {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 10px;
          padding: 9px 12px;
          font-size: 13.5px;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.15s ease;
          color: rgba(100,116,139,1);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: 1px solid transparent;
          position: relative;
        }
        .sb-item:hover {
          color: #f0f4f8;
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }
        .sb-item.active {
          color: #f0f4f8;
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.08);
        }
        .sb-item.active .sb-dot {
          box-shadow: 0 0 7px var(--rc);
          opacity: 1;
        }
        .sb-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.25;
          transition: all 0.15s;
          background: var(--rc);
        }
        .sb-item:hover .sb-dot { opacity: 0.6; }
        .sb-item-icon {
          font-size: 13px;
          opacity: 0.4;
          transition: opacity 0.15s;
        }
        .sb-item:hover .sb-item-icon,
        .sb-item.active .sb-item-icon { opacity: 0.9; }
        .sb-active-bar {
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 2px;
          border-radius: 2px;
          background: var(--rc);
          box-shadow: 0 0 8px var(--rc);
        }
      `}</style>

        {/* Mobile overlay */}
        {isOpen && (
            <div
                className="fixed inset-0 z-20 md:hidden"
                style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                onClick={onClose}
            />
        )}

        <aside
            className={`
          fixed inset-y-0 left-0 z-30
          flex w-60 flex-col
          md:static md:z-auto md:translate-x-0
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
            style={{
              borderRight: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(8,12,20,0.97)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              paddingTop: "20px",
              paddingBottom: "16px",
              paddingLeft: "12px",
              paddingRight: "12px",
            }}
        >
          {/* Role badge */}
          <div className="mb-5 px-2">
          <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{
                color: roleStyle.color,
                background: roleStyle.bg,
                border: `1px solid ${roleStyle.border}`,
                fontFamily: "'Syne', sans-serif",
              }}
          >
            <span
                style={{
                  width: 5, height: 5,
                  borderRadius: "50%",
                  background: roleStyle.color,
                  boxShadow: `0 0 6px ${roleStyle.color}`,
                  display: "inline-block",
                }}
            />
            {role}
          </span>
          </div>

          {/* Section label */}
          <p
              className="mb-2 px-3 text-[10px] uppercase tracking-[0.14em]"
              style={{ color: "rgba(45,62,84,1)", fontFamily: "'DM Sans', sans-serif" }}
          >
            Navigation
          </p>

          {/* Menu */}
            <nav className="flex flex-1 flex-col gap-0.5">
                {menu.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end={item.to === "/app"}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sb-item${isActive ? " active" : ""}`
                        }
                        style={{ "--rc": roleStyle.color }}
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && <span className="sb-active-bar" />}
                                <span className="sb-dot" />
                                <span
                                    className="sb-item-icon"
                                    style={{ color: roleStyle.color }}
                                >
            {item.icon}
          </span>
                                {item.label}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

          {/* Footer */}
          <div
              className="mt-auto px-3 pt-3 text-[11px]"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                color: "rgba(30,42,58,1)",
                fontFamily: "'DM Sans', sans-serif",
              }}
          >
            LoanFlow <span style={{ color: "rgba(22,30,42,1)" }}>v1.0</span>
          </div>
        </aside>
      </>
  );
}