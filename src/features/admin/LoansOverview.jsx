import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const statusCfg = {
  ACTIVE: { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)", border: "rgba(45,212,191,0.25)", dot: "#2dd4bf" },
  PENDING: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", dot: "#f59e0b" },
  OVERDUE: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", dot: "#f87171" },
  REJECTED: { color: "#475569", bg: "rgba(71,85,105,0.1)", border: "rgba(71,85,105,0.2)", dot: "#475569" },
  CLOSED: { color: "#475569", bg: "rgba(71,85,105,0.1)", border: "rgba(71,85,105,0.2)", dot: "#475569" },
};

export default function LoansOverview() {
  const [search, setSearch] = useState("");
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/loans/all");
        setLoans(res?.data || []);
      } catch (e) {
        console.error("Failed to load loans", e);
        setError("Failed to load loans");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return loans.filter((l) => {
      const loanId = String(l.loanId || l.id || "").toLowerCase();
      const borrower = String(l.borrowerName || "").toLowerCase();
      const lender = String(l.lenderName || "").toLowerCase();
      return loanId.includes(q) || borrower.includes(q) || lender.includes(q);
    });
  }, [loans, search]);

  const summaryStats = useMemo(() => {
    const total = loans.length;
    const active = loans.filter((l) => String(l.status).toUpperCase() === "ACTIVE").length;
    const overdue = loans.filter((l) => String(l.status).toUpperCase() === "OVERDUE").length;
    const totalVolume = loans.reduce((a, l) => a + (Number(l.amount) || 0), 0);
    return [
      { label: "Total Loans", value: total, accent: "#2dd4bf" },
      { label: "Active", value: active, accent: "#34d399" },
      { label: "Overdue", value: overdue, accent: "#f87171" },
      { label: "Total Volume", value: "$" + (totalVolume / 1e6).toFixed(1) + "M", accent: "#818cf8" },
    ];
  }, [loans]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .lov-root { display:flex; flex-direction:column; gap:28px; }
        .lov-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#2dd4bf; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .lov-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .lov-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .lov-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .lov-summaries { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        @media(max-width:700px) { .lov-summaries { grid-template-columns:repeat(2,1fr); } }
        .sum-card { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 18px; position:relative; overflow:hidden; }
        .sum-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.5; }
        .sum-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:8px; }
        .sum-value { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#f0f4f8; }

        .lov-toolbar { display:flex; align-items:center; gap:12px; }
        .lov-search {
          flex:1; max-width:320px;
          background:rgba(13,20,32,0.9); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:9px 14px; font-size:13px; color:#f0f4f8;
          font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .lov-search::placeholder { color:#2e3f52; }
        .lov-search:focus { border-color:rgba(45,212,191,0.4); box-shadow:0 0 0 3px rgba(45,212,191,0.08); }
        .lov-count { font-size:12px; color:#2e3f52; font-family:'DM Sans',sans-serif; margin-left:auto; }

        .table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.lov-table { width:100%; border-collapse:collapse; }
        .lov-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .lov-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .lov-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .lov-table tbody tr:last-child { border-bottom:none; }
        .lov-table tbody tr:hover { background:rgba(45,212,191,0.03); }
        .lov-table td { padding:13px 18px; font-size:13px; font-family:'DM Sans',sans-serif; }
        .td-id { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }
        .td-name { color:#e2e8f0; font-weight:400; }
        .td-muted { color:#64748b; font-weight:300; }
        .td-amount { font-family:'Syne',sans-serif; font-weight:700; color:#f0f4f8; }
        .status-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 9px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
      `}</style>

      <div className="lov-root">
        <div>
          <div className="lov-eyebrow">Admin · All Records</div>
          <h1 className="lov-title">Loans Overview</h1>
          <p className="lov-sub">Platform-wide loan records — full history and status tracking.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="lov-summaries">
              {summaryStats.map((s) => (
                <div key={s.label} className="sum-card" style={{ "--ac": s.accent }}>
                  <div className="sum-label">{s.label}</div>
                  <div className="sum-value" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="lov-toolbar">
              <input
                className="lov-search"
                placeholder="Search by ID, borrower, or lender…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="lov-count">{filtered.length} records</span>
            </div>

            <div className="table-wrap">
              <table className="lov-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Borrower</th>
                    <th>Lender</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((loan) => {
                    const s = statusCfg[String(loan.status).toUpperCase()] ?? statusCfg.CLOSED;
                    return (
                      <tr key={loan.id}>
                        <td><span className="td-id">{loan.loanId || loan.id}</span></td>
                        <td><span className="td-name">{loan.borrowerName || "—"}</span></td>
                        <td><span className="td-muted">{loan.lenderName || "—"}</span></td>
                        <td><span className="td-amount">${Number(loan.amount || 0).toLocaleString()}</span></td>
                        <td>
                          <span className="status-pill" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="status-dot" style={{ background: s.dot, boxShadow: `0 0 5px ${s.dot}` }} />
                            {String(loan.status || "").toUpperCase() || "—"}
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