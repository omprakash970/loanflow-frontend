import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DataTable from "../../components/common/Table";
import { apiGet } from "../../utils/apiClient";

const statusColors = {
  COMPLETED: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  PENDING: { color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  FAILED: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const columns = [
  { key: "paymentId", label: "Payment ID" },
  { key: "borrowerName", label: "Borrower" },
  { key: "loanCode", label: "Loan ID" },
  {
    key: "amount",
    label: "Amount Paid",
    render: (val) => (
      <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4f8" }}>
        ${Number(val || 0).toLocaleString()}
      </span>
    ),
  },
  {
    key: "paymentDate",
    label: "Payment Date",
    render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
  },
  { key: "method", label: "Method" },
  {
    key: "status",
    label: "Status",
    render: (val) => {
      const key = String(val || "").toUpperCase();
      const s = statusColors[key] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "3px 9px",
            borderRadius: 6,
            color: s.color,
            background: s.bg,
            border: `1px solid ${s.color}33`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 6px ${s.color}`,
            }}
          />
          {key || "—"}
        </span>
      );
    },
  },
];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/payments/lender/my");
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

  const summaryStats = useMemo(() => {
    const completed = payments.filter((p) => String(p.status).toUpperCase() === "COMPLETED");
    const pending = payments.filter((p) => String(p.status).toUpperCase() === "PENDING");
    const failed = payments.filter((p) => String(p.status).toUpperCase() === "FAILED");

    const totalCollected = completed.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalPending = pending.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return [
      { title: "Total Collected", value: "$" + totalCollected.toLocaleString(), accent: "#34d399", icon: "◈" },
      { title: "Pending Amount", value: "$" + totalPending.toLocaleString(), accent: "#fb923c", icon: "◉" },
      { title: "Completed", value: completed.length, accent: "#2dd4bf", icon: "◐" },
      { title: "Pending / Failed", value: pending.length + failed.length, accent: "#f87171", icon: "◒" },
    ];
  }, [payments]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .pay-root { display:flex; flex-direction:column; gap:32px; }
        .pay-header { display:flex; flex-direction:column; gap:6px; }
        .pay-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#2dd4bf;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .pay-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .pay-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .pay-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .pay-stats { display:grid; gap:12px; grid-template-columns:repeat(4,1fr); }
        @media(max-width:800px) { .pay-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px) { .pay-stats { grid-template-columns:1fr; } }

        .pay-stat {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:18px 20px 14px;
          position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor:default;
        }
        .pay-stat:hover {
          border-color:var(--ac-border);
          transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(0,0,0,0.4), 0 0 20px var(--ac-glow);
        }
        .pay-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--ac),transparent);
          opacity:0.5; transition:opacity 0.2s;
        }
        .pay-stat:hover::before { opacity:1; }
        .pay-stat-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .pay-stat-label {
          font-size:10.5px; font-weight:600; letter-spacing:0.1em;
          text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif;
        }
        .pay-stat-icon { font-size:15px; color:var(--ac); opacity:0.7; }
        .pay-stat-value {
          font-family:'Syne',sans-serif; font-size:28px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.02em;
        }
      `}</style>

      <div className="pay-root">
        <div className="pay-header">
          <div className="pay-eyebrow">Lender Portal</div>
          <h1 className="pay-title">Payments</h1>
          <p className="pay-sub">All payment transactions received from borrowers.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="pay-stats">
              {summaryStats.map((s) => (
                <div
                  key={s.title}
                  className="pay-stat"
                  style={{ "--ac": s.accent, "--ac-border": s.accent + "44", "--ac-glow": s.accent + "18" }}
                >
                  <div className="pay-stat-top">
                    <span className="pay-stat-label">{s.title}</span>
                    <span className="pay-stat-icon">{s.icon}</span>
                  </div>
                  <div className="pay-stat-value">{s.value}</div>
                </div>
              ))}
            </div>

            <DataTable
              columns={columns}
              data={payments}
              filterKey="status"
              filterOptions={["COMPLETED", "PENDING", "FAILED"]}
              pageSize={8}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
