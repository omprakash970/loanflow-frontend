import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const statusColors = {
  COMPLETED: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  PENDING: { color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  FAILED: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
  CANCELLED: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/payments/all");
        setPayments(res?.data || []);
      } catch (e) {
        console.error("Failed to load payments", e);
        setError("Failed to load payments");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return payments.filter((p) => {
      const paymentId = String(p.paymentId || "").toLowerCase();
      const borrower = String(p.borrowerName || "").toLowerCase();
      const lender = String(p.lenderName || "").toLowerCase();
      const loanCode = String(p.loanCode || "").toLowerCase();
      return paymentId.includes(q) || borrower.includes(q) || lender.includes(q) || loanCode.includes(q);
    });
  }, [payments, search]);

  const summaryStats = useMemo(() => {
    const completed = payments.filter((p) => String(p.status).toUpperCase() === "COMPLETED");
    const pending = payments.filter((p) => String(p.status).toUpperCase() === "PENDING");
    const failed = payments.filter((p) => String(p.status).toUpperCase() === "FAILED");

    const totalCollected = completed.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPending = pending.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return [
      { label: "Total Collected", value: "$" + totalCollected.toLocaleString(), accent: "#34d399" },
      { label: "Total Pending", value: "$" + totalPending.toLocaleString(), accent: "#fb923c" },
      { label: "Completed", value: completed.length, accent: "#2dd4bf" },
      { label: "Failed/Pending", value: failed.length + pending.length, accent: "#f87171" },
    ];
  }, [payments]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .pay-root { display:flex; flex-direction:column; gap:28px; }
        .pay-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#2dd4bf; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .pay-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .pay-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .pay-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .pay-summaries { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
        @media(max-width:700px) { .pay-summaries { grid-template-columns:repeat(2,1fr); } }
        .sum-card { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:16px 18px; position:relative; overflow:hidden; }
        .sum-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.5; }
        .sum-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:8px; }
        .sum-value { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; color:#f0f4f8; }

        .pay-toolbar { display:flex; align-items:center; gap:12px; }
        .pay-search {
          flex:1; max-width:320px;
          background:rgba(13,20,32,0.9); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:9px 14px; font-size:13px; color:#f0f4f8;
          font-family:'DM Sans',sans-serif; outline:none;
          transition:border-color 0.2s, box-shadow 0.2s;
        }
        .pay-search::placeholder { color:#2e3f52; }
        .pay-search:focus { border-color:rgba(45,212,191,0.4); box-shadow:0 0 0 3px rgba(45,212,191,0.08); }
        .pay-count { font-size:12px; color:#2e3f52; font-family:'DM Sans',sans-serif; margin-left:auto; }

        .table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.pay-table { width:100%; border-collapse:collapse; }
        .pay-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .pay-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .pay-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .pay-table tbody tr:last-child { border-bottom:none; }
        .pay-table tbody tr:hover { background:rgba(45,212,191,0.03); }
        .pay-table td { padding:13px 18px; font-size:13px; font-family:'DM Sans',sans-serif; }
        .td-id { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }
        .td-name { color:#e2e8f0; font-weight:400; }
        .td-muted { color:#64748b; font-weight:300; }
        .td-amount { font-family:'Syne',sans-serif; font-weight:700; color:#f0f4f8; }
        .status-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 9px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
      `}</style>

      <div className="pay-root">
        <div>
          <div className="pay-eyebrow">Admin · Payment Records</div>
          <h1 className="pay-title">All Payments</h1>
          <p className="pay-sub">Platform-wide payment history and transaction tracking.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="pay-summaries">
              {summaryStats.map((s) => (
                <div key={s.label} className="sum-card" style={{ "--ac": s.accent }}>
                  <div className="sum-label">{s.label}</div>
                  <div className="sum-value" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="pay-toolbar">
              <input
                className="pay-search"
                placeholder="Search by Payment ID, borrower, lender, or loan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="pay-count">{filtered.length} records</span>
            </div>

            <div className="table-wrap">
              <table className="pay-table">
                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Borrower</th>
                    <th>Lender</th>
                    <th>Loan ID</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment) => {
                    const s = statusColors[String(payment.status).toUpperCase()] ?? { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
                    return (
                      <tr key={payment.id}>
                        <td><span className="td-id">{payment.paymentId || payment.id}</span></td>
                        <td><span className="td-name">{payment.borrowerName || "—"}</span></td>
                        <td><span className="td-muted">{payment.lenderName || "—"}</span></td>
                        <td><span className="td-muted">{payment.loanCode || "—"}</span></td>
                        <td><span className="td-amount">${Number(payment.amount || 0).toLocaleString()}</span></td>
                        <td><span className="td-muted">{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "—"}</span></td>
                        <td><span className="td-muted">{payment.method || "—"}</span></td>
                        <td>
                          <span className="status-pill" style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33` }}>
                            <span className="status-dot" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                            {String(payment.status || "").toUpperCase() || "—"}
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

