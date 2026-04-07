import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet, apiPost } from "../../utils/apiClient";

const statusCfg = {
  PAID:     { color:"#34d399", bg:"rgba(52,211,153,0.1)",  border:"rgba(52,211,153,0.25)"  },
  UPCOMING: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)",  border:"rgba(245,158,11,0.25)"  },
  PENDING:  { color:"#475569", bg:"rgba(71,85,105,0.08)",  border:"rgba(71,85,105,0.15)"   },
};

export default function EmiSchedule() {
  const [loan, setLoan] = useState(null);
  const [emiSchedule, setEmiSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);

        const loansRes = await apiGet("/loans/my-loans");
        const myLoans = loansRes?.data || [];
        const latest = [...myLoans].sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0))[0];
        setLoan(latest || null);

        if (!latest?.id) {
          setEmiSchedule([]);
          return;
        }

        const emiRes = await apiGet(`/emi-schedule/${latest.id}`);
        setEmiSchedule(emiRes?.data || []);
      } catch (e) {
        console.error("Failed to load EMI schedule", e);
        setError("Failed to load EMI schedule");
        setEmiSchedule([]);
        setLoan(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handlePayEmi = async (emi) => {
    setSelectedEmi(emi);
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedEmi || !loan) return;

    try {
      setPaymentProcessing(true);
      const paymentData = {
        loanId: loan.id,
        emiScheduleId: selectedEmi.id,
        amount: selectedEmi.emiAmount,
        method: "ONLINE",
      };

      const res = await apiPost("/payments/borrower/pay-emi", paymentData);
      if (res.success) {
        // Update EMI status in local state
        setEmiSchedule((prev) =>
          prev.map((e) => (e.id === selectedEmi.id ? { ...e, status: "PAID" } : e))
        );
        setShowPayModal(false);
        setSelectedEmi(null);
        alert("Payment successful!");
      } else {
        alert("Payment failed: " + res.message);
      }
    } catch (e) {
      console.error("Payment error", e);
      alert("Payment processing failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const paid    = useMemo(() => emiSchedule.filter((e) => String(e.status).toUpperCase() === "PAID").length, [emiSchedule]);
  const total   = emiSchedule.length;
  const paidPct = total ? Math.round((paid / total) * 100) : 0;
  const upcoming = useMemo(() => emiSchedule.find((e) => String(e.status).toUpperCase() === "UPCOMING"), [emiSchedule]);

  return (
      <DashboardLayout>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .emi-root { display:flex; flex-direction:column; gap:28px; }
        .emi-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .emi-eyebrow::before { content:''; width:18px; height:1px; background:#818cf8; opacity:0.6; }
        .emi-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .emi-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        /* Progress banner */
        .emi-progress-banner {
          background:rgba(129,140,248,0.06); border:1px solid rgba(129,140,248,0.18);
          border-radius:14px; padding:20px 24px; display:flex; align-items:center; gap:32px; flex-wrap:wrap;
        }
        .prog-left { flex:1; min-width:200px; }
        .prog-label { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; margin-bottom:10px; }
        .prog-track { height:6px; background:rgba(255,255,255,0.06); border-radius:6px; overflow:hidden; width:100%; }
        .prog-fill { height:100%; border-radius:6px; background:linear-gradient(90deg,#818cf8,#6366f1); box-shadow:0 0 12px rgba(129,140,248,0.35); transition:width 0.6s ease; }
        .prog-info { font-size:12px; color:#475569; font-family:'DM Sans',sans-serif; margin-top:7px; }
        .prog-stats { display:flex; gap:24px; flex-shrink:0; }
        .prog-stat { text-align:center; }
        .prog-stat-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }
        .prog-stat-label { font-size:11px; color:#475569; font-family:'DM Sans',sans-serif; margin-top:3px; }

        /* Table */
        .emi-table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.emi-table { width:100%; border-collapse:collapse; }
        .emi-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .emi-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .emi-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .emi-table tbody tr.is-paid { opacity:0.55; }
        .emi-table tbody tr.is-upcoming { background:rgba(129,140,248,0.04); }
        .emi-table tbody tr:last-child { border-bottom:none; }
        .emi-table tbody tr:hover { background:rgba(129,140,248,0.05); }
        .emi-table td { padding:12px 18px; font-size:13px; font-family:'DM Sans',sans-serif; }
        .td-month { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }
        .td-amt { font-family:'Syne',sans-serif; font-weight:700; color:#f0f4f8; }
        .td-num { color:#64748b; font-weight:300; font-size:12.5px; }
        .td-bal { color:#475569; font-weight:300; font-size:12px; }
        .s-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 9px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .s-dot { width:5px; height:5px; border-radius:50%; }
        .pay-btn { padding:5px 12px; font-size:11px; font-weight:600; border:none; border-radius:6px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
        .pay-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .pay-btn-active { color:#f0f4f8; background:rgba(129,140,248,0.2); border:1px solid rgba(129,140,248,0.4); }
        .pay-btn-active:hover { background:rgba(129,140,248,0.3); }
        
        /* Modal */
        .modal-overlay { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-content { background:rgba(13,20,32,0.95); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:28px; max-width:420px; width:90%; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
        .modal-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#f0f4f8; margin-bottom:8px; }
        .modal-sub { font-size:13px; color:#64748b; font-family:'DM Sans',sans-serif; margin-bottom:20px; }
        .modal-info { background:rgba(129,140,248,0.04); border:1px solid rgba(129,140,248,0.1); border-radius:10px; padding:16px; margin-bottom:20px; }
        .modal-info-row { display:flex; justify-content:space-between; margin-bottom:8px; }
        .modal-info-row:last-child { margin-bottom:0; }
        .modal-label { font-size:12px; color:#64748b; font-family:'DM Sans',sans-serif; }
        .modal-value { font-family:'Syne',sans-serif; font-weight:700; color:#f0f4f8; }
        .modal-buttons { display:flex; gap:10px; }
        .modal-btn { flex:1; padding:11px; border:none; border-radius:8px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer; transition:all 0.15s; }
        .modal-btn-cancel { background:rgba(255,255,255,0.06); color:#cbd5e1; border:1px solid rgba(255,255,255,0.08); }
        .modal-btn-cancel:hover { background:rgba(255,255,255,0.1); }
        .modal-btn-confirm { background:rgba(129,140,248,0.3); color:#e0e7ff; border:1px solid rgba(129,140,248,0.5); }
        .modal-btn-confirm:hover { background:rgba(129,140,248,0.4); }
        .modal-btn-confirm:disabled { opacity:0.5; cursor:not-allowed; }
      `}</style>

        <div className="emi-root">
          <div>
            <div className="emi-eyebrow">Borrower Portal</div>
            <h1 className="emi-title">EMI Schedule</h1>
            <p className="emi-sub">{loan ? `Loan ${loan.loanId || loan.id}` : "No loan selected"} · Repayment timeline and installment breakdown.</p>
          </div>

          {loading ? (
            <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
          ) : !loan ? (
            <div style={{ color: "#64748b", padding: 20 }}>No loans found yet. Apply for a loan to generate an EMI schedule.</div>
          ) : (
            <>
              {/* Progress banner */}
              <div className="emi-progress-banner">
                <div className="prog-left">
                  <div className="prog-label">Repayment Progress</div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: `${paidPct}%` }} />
                  </div>
                  <div className="prog-info">{paid} of {total} EMIs paid · {paidPct}% complete</div>
                </div>
                <div className="prog-stats">
                  <div className="prog-stat">
                    <div className="prog-stat-val" style={{ color: "#34d399" }}>{paid}</div>
                    <div className="prog-stat-label">Paid</div>
                  </div>
                  <div className="prog-stat">
                    <div className="prog-stat-val" style={{ color: "#475569" }}>{Math.max(total - paid, 0)}</div>
                    <div className="prog-stat-label">Remaining</div>
                  </div>
                  {upcoming && (
                    <div className="prog-stat">
                      <div className="prog-stat-val" style={{ color: "#f59e0b" }}>${Number(upcoming.emiAmount || 0).toLocaleString()}</div>
                      <div className="prog-stat-label">Next EMI</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="emi-table-wrap">
                <table className="emi-table">
                  <thead>
                  <tr>
                    <th>Month</th>
                    <th>EMI</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {emiSchedule.map(emi => {
                    const statusKey = String(emi.status || "").toUpperCase();
                    const s = statusCfg[statusKey] ?? statusCfg.PENDING;
                    const isPaid = statusKey === "PAID";
                    return (
                        <tr
                          key={emi.id || emi.month}
                          className={isPaid ? "is-paid" : statusKey === "UPCOMING" ? "is-upcoming" : ""}
                        >
                          <td><span className="td-month">{emi.month || "—"}</span></td>
                          <td><span className="td-amt">${Number(emi.emiAmount || 0).toLocaleString()}</span></td>
                          <td><span className="td-num">${Number(emi.principal || 0).toLocaleString()}</span></td>
                          <td><span className="td-num">${Number(emi.interest || 0).toLocaleString()}</span></td>
                          <td><span className="td-bal">${Number(emi.balance || 0).toLocaleString()}</span></td>
                          <td>
                          <span className="s-pill" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                            <span className="s-dot" style={{ background: s.color, boxShadow: `0 0 5px ${s.color}` }} />
                            {statusKey || "—"}
                          </span>
                          </td>
                          <td>
                            <button
                              className="pay-btn pay-btn-active"
                              disabled={isPaid}
                              onClick={() => handlePayEmi(emi)}
                            >
                              {isPaid ? "Paid" : "Pay"}
                            </button>
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

        {/* Payment Modal */}
        {showPayModal && selectedEmi && (
          <div className="modal-overlay" onClick={() => !paymentProcessing && setShowPayModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Confirm Payment</h3>
              <p className="modal-sub">Review and confirm your EMI payment</p>
              <div className="modal-info">
                <div className="modal-info-row">
                  <span className="modal-label">Loan ID</span>
                  <span className="modal-value">{loan?.loanId || loan?.id}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">EMI Month</span>
                  <span className="modal-value">{selectedEmi.month}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">EMI Amount</span>
                  <span className="modal-value" style={{ color: "#818cf8" }}>${Number(selectedEmi.emiAmount || 0).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">Principal</span>
                  <span className="modal-value">${Number(selectedEmi.principal || 0).toLocaleString()}</span>
                </div>
                <div className="modal-info-row">
                  <span className="modal-label">Interest</span>
                  <span className="modal-value">${Number(selectedEmi.interest || 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="modal-buttons">
                <button className="modal-btn modal-btn-cancel" onClick={() => setShowPayModal(false)} disabled={paymentProcessing}>
                  Cancel
                </button>
                <button className="modal-btn modal-btn-confirm" onClick={handleConfirmPayment} disabled={paymentProcessing}>
                  {paymentProcessing ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
  );
}