import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const statusCfg = {
  ACTIVE: { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.25)" },
  PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  OVERDUE: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
  REJECTED: { color: "#475569", bg: "rgba(71,85,105,0.08)", border: "rgba(71,85,105,0.15)" },
  CLOSED: { color: "#475569", bg: "rgba(71,85,105,0.08)", border: "rgba(71,85,105,0.15)" },
};

const purposeIcon = {
  "Home Renovation": "🏠",
  Education: "🎓",
  Medical: "🏥",
  "Vehicle Purchase": "🚗",
  "Business Expansion": "💼",
  Personal: "👤",
};

export default function MyLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/loans/my-loans");
        setLoans(res?.data || []);
      } catch (e) {
        console.error("Failed to fetch loans", e);
        setError("Failed to load loans");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const summary = useMemo(() => {
    const total = loans.length;
    const active = loans.filter((l) => String(l.status).toUpperCase() === "ACTIVE").length;
    const outstanding = loans
      .filter((l) => String(l.status).toUpperCase() !== "CLOSED")
      .reduce((a, l) => a + (Number(l.amount) || 0), 0);
    return { total, active, outstanding };
  }, [loans]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .ml-root { display:flex; flex-direction:column; gap:28px; }
        .ml-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .ml-eyebrow::before { content:''; width:18px; height:1px; background:#818cf8; opacity:0.6; }
        .ml-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .ml-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .ml-summaries { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:600px) { .ml-summaries { grid-template-columns:1fr 1fr; } }
        .ml-sum { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 18px; position:relative; overflow:hidden; }
        .ml-sum::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.5; }
        .ml-sum-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:7px; }
        .ml-sum-value { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }

        .ml-cards { display:flex; flex-direction:column; gap:10px; }
        .loan-card {
          background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:20px 22px;
          display:flex; align-items:center; gap:18px; flex-wrap:wrap;
          transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor:default; position:relative; overflow:hidden;
        }
        .loan-card::before { content:''; position:absolute; left:0; top:15%; bottom:15%; width:2px; border-radius:2px; background:var(--sc); box-shadow:0 0 8px var(--sc); }
        .loan-card:hover { border-color:rgba(255,255,255,0.12); transform:translateX(3px); }
        .lc-icon { font-size:24px; flex-shrink:0; }
        .lc-main { flex:1; min-width:140px; }
        .lc-id { font-family:'Syne',sans-serif; font-size:12px; font-weight:700; color:#334155; margin-bottom:4px; }
        .lc-purpose { font-size:14px; font-weight:500; color:#e2e8f0; font-family:'DM Sans',sans-serif; margin-bottom:3px; }
        .lc-date { font-size:11.5px; color:#334155; font-family:'DM Sans',sans-serif; }
        .lc-amount { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#f0f4f8; flex-shrink:0; }
        .lc-status { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 10px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .lc-dot { width:5px; height:5px; border-radius:50%; }
      `}</style>

      <div className="ml-root">
        <div>
          <div className="ml-eyebrow">Borrower Portal</div>
          <h1 className="ml-title">My Loans</h1>
          <p className="ml-sub">All your active and past loan accounts in one place.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="ml-summaries">
              {[
                { label: "Total Loans", value: summary.total, accent: "#818cf8" },
                { label: "Active", value: summary.active, accent: "#34d399" },
                { label: "Outstanding", value: `$${summary.outstanding.toLocaleString()}`, accent: "#f59e0b" },
              ].map((s) => (
                <div key={s.label} className="ml-sum" style={{ "--ac": s.accent }}>
                  <div className="ml-sum-label">{s.label}</div>
                  <div className="ml-sum-value" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="ml-cards">
              {loans.length === 0 ? (
                <div style={{ color: "#64748b", padding: 20 }}>No loans yet.</div>
              ) : (
                loans.map((loan) => {
                  const statusKey = String(loan.status || "").toUpperCase();
                  const s = statusCfg[statusKey] ?? statusCfg.CLOSED;

                  return (
                    <div key={loan.id} className="loan-card" style={{ "--sc": s.color }}>
                      <div className="lc-icon">{purposeIcon[loan.purpose] ?? "◈"}</div>
                      <div className="lc-main">
                        <div className="lc-id">{loan.loanId || loan.id}</div>
                        <div className="lc-purpose">{loan.purpose || "Loan"}</div>
                        <div className="lc-date">Applied {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="lc-amount">${Number(loan.amount || 0).toLocaleString()}</div>
                        <div style={{ marginTop: 6 }}>
                          <span className="lc-status" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="lc-dot" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                            {statusKey || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}