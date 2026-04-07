import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet, apiPost } from "../../utils/apiClient";

export default function OpenRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/marketplace/requests/open");
        setRequests(res?.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load requests");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const sorted = useMemo(() => {
    return [...requests].sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  }, [requests]);

  const approve = async (r) => {
    setApprovingId(r.id);
    setError(null);
    try {
      const res = await apiPost(`/marketplace/requests/${r.id}/approve`, {});
      if (!res?.data) throw new Error("Approve failed");
      setRequests((prev) => prev.filter((x) => x.id !== r.id));
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to approve request");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .rq-root { display:flex; flex-direction:column; gap:24px; }
        .rq-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#2dd4bf; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .rq-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .rq-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .rq-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(max-width:900px){ .grid{ grid-template-columns:1fr; } }
        .card { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; }
        .row { display:flex; justify-content:space-between; gap:10px; align-items:center; }
        .label { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; }
        .val { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#f0f4f8; }
        .muted { font-size:12.5px; color:#64748b; font-family:'DM Sans',sans-serif; }

        .btn { background:#2dd4bf; border:none; color:#080c14; border-radius:10px; padding:10px 14px; font-family:'Syne',sans-serif; font-weight:800; cursor:pointer; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      <div className="rq-root">
        <div>
          <div className="rq-eyebrow">Lender Portal</div>
          <h1 className="rq-title">Open Borrower Requests</h1>
          <p className="rq-sub">Approve a borrower request to sanction a loan. Only one lender can approve each request.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 12 }}>{error}</div>
        ) : sorted.length === 0 ? (
          <div style={{ color: "#64748b", padding: 20 }}>No open requests right now.</div>
        ) : (
          <div className="grid">
            {sorted.map((r) => (
              <div key={r.id} className="card">
                <div className="row" style={{ marginBottom: 10 }}>
                  <div>
                    <div className="label">Request</div>
                    <div className="val">{r.requestCode || `#${r.id}`}</div>
                    <div className="muted">Borrower: {r.borrowerName || "—"}</div>
                  </div>
                  <button className="btn" disabled={approvingId === r.id} onClick={() => approve(r)}>
                    {approvingId === r.id ? "Approving..." : "Approve"}
                  </button>
                </div>

                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="label">Amount</span>
                  <span className="val">${Number(r.amount || 0).toLocaleString()}</span>
                </div>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="label">Rate</span>
                  <span className="val">{Number(r.interestRate || 0)}% p.a.</span>
                </div>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="label">Tenure</span>
                  <span className="val">{Number(r.tenure || 0)} months</span>
                </div>
                <div className="row">
                  <span className="label">Purpose</span>
                  <span className="val" style={{ fontSize: 14 }}>{r.purpose || "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

