import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const statusCfg = {
  ACTIVE: { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.25)" },
  PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  OVERDUE: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

export default function ActiveLoans() {
  const [filter, setFilter] = useState("All");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/loans/lender/my-loans");
        setLoans(res?.data || []);
      } catch (e) {
        console.error("Failed to load lender loans", e);
        setError("Failed to load loans");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const activeLoans = useMemo(
    () => loans.filter((l) => String(l.status).toUpperCase() !== "CLOSED"),
    [loans]
  );

  const filtered = useMemo(() => {
    if (filter === "All") return activeLoans;
    return activeLoans.filter((l) => String(l.status).toUpperCase() === filter.toUpperCase());
  }, [activeLoans, filter]);

  const stats = useMemo(() => {
    const overdue = activeLoans.filter((l) => String(l.status).toUpperCase() === "OVERDUE").length;
    const exposure = activeLoans.reduce((a, l) => a + (Number(l.amount) || 0), 0);
    return [
      { label: "Total Active", value: activeLoans.length, accent: "#2dd4bf" },
      { label: "Overdue", value: overdue, accent: "#f87171" },
      { label: "Total Exposure", value: "$" + exposure.toLocaleString(), accent: "#818cf8" },
    ];
  }, [activeLoans]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .al2-root { display:flex; flex-direction:column; gap:28px; }
        .al2-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#2dd4bf; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .al2-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .al2-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .al2-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .al2-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:600px) { .al2-stats { grid-template-columns:1fr; } }
        .a2stat { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 18px; position:relative; overflow:hidden; }
        .a2stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.5; }
        .a2stat-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:7px; }
        .a2stat-val { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; }

        .filter-row { display:flex; align-items:center; gap:6px; }
        .filter-tab { font-size:12px; font-weight:600; letter-spacing:0.06em; font-family:'DM Sans',sans-serif; padding:7px 14px; border-radius:8px; cursor:pointer; border:1px solid transparent; transition:all 0.15s; }
        .filter-tab.active { background:rgba(45,212,191,0.1); color:#2dd4bf; border-color:rgba(45,212,191,0.3); }
        .filter-tab.inactive { color:#475569; border-color:rgba(255,255,255,0.06); background:rgba(13,20,32,0.5); }
        .filter-tab.inactive:hover { color:#94a3b8; border-color:rgba(255,255,255,0.1); }

        .table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.al2-table { width:100%; border-collapse:collapse; }
        .al2-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .al2-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .al2-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .al2-table tbody tr:last-child { border-bottom:none; }
        .al2-table tbody tr:hover { background:rgba(45,212,191,0.03); }
        .al2-table td { padding:13px 18px; font-family:'DM Sans',sans-serif; }
        .td-id { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }
        .td-avatar { width:30px; height:30px; border-radius:8px; background:rgba(45,212,191,0.08); border:1px solid rgba(45,212,191,0.12); display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; color:#2dd4bf; font-family:'Syne',sans-serif; margin-right:8px; vertical-align:middle; }
        .td-name { font-size:13px; color:#e2e8f0; vertical-align:middle; }
        .td-amount { font-family:'Syne',sans-serif; font-weight:700; color:#f0f4f8; font-size:13px; }
        .td-rate { font-size:12.5px; color:#64748b; font-weight:300; }
        .s-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 9px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .s-dot { width:5px; height:5px; border-radius:50%; }
      `}</style>

      <div className="al2-root">
        <div>
          <div className="al2-eyebrow">Lender Portal</div>
          <h1 className="al2-title">Active Loans</h1>
          <p className="al2-sub">All outstanding loans across your borrower portfolio.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="al2-stats">
              {stats.map((s) => (
                <div key={s.label} className="a2stat" style={{ "--ac": s.accent }}>
                  <div className="a2stat-label">{s.label}</div>
                  <div className="a2stat-val" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="filter-row">
              {["All", "ACTIVE", "PENDING", "OVERDUE"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f === "All" ? "All" : f)}
                  className={`filter-tab ${filter === f ? "active" : "inactive"}`}
                >
                  {f === "All" ? "All" : f[0] + f.slice(1).toLowerCase()}
                </button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#2e3f52", fontFamily: "'DM Sans',sans-serif" }}>
                {filtered.length} loans
              </span>
            </div>

            <div className="table-wrap">
              <table className="al2-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Borrower</th>
                    <th>Amount</th>
                    <th>Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan) => {
                    const statusKey = String(loan.status).toUpperCase();
                    const s = statusCfg[statusKey] ?? statusCfg.ACTIVE;
                    const initials = (loan.borrowerName || "?")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("");

                    return (
                      <tr key={loan.id}>
                        <td><span className="td-id">{loan.loanId || loan.id}</span></td>
                        <td>
                          <span className="td-avatar">{initials}</span>
                          <span className="td-name">{loan.borrowerName || "—"}</span>
                        </td>
                        <td><span className="td-amount">${Number(loan.amount || 0).toLocaleString()}</span></td>
                        <td><span className="td-rate">{Number(loan.interestRate || 0)}% p.a.</span></td>
                        <td>
                          <span className="s-pill" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="s-dot" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                            {statusKey}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}