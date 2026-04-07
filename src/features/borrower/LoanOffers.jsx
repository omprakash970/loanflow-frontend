import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet, apiPost } from "../../utils/apiClient";

export default function LoanOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  // Simple accept modal state
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/marketplace/offers/open");
        setOffers(res?.data || []);
      } catch (e) {
        console.error(e);
        setError("Failed to load offers");
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const sorted = useMemo(() => {
    return [...offers].sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  }, [offers]);

  const onOpenAccept = (offer) => {
    setSelected(offer);
    setAmount("");
    setPurpose("Loan from offer");
  };

  const onAccept = async () => {
    if (!selected?.id) return;
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter an amount to accept");
      return;
    }

    setAcceptingId(selected.id);
    setError(null);
    try {
      const res = await apiPost(`/marketplace/offers/${selected.id}/accept`, {
        amount: amt,
        purpose,
      });

      if (!res?.data) throw new Error("Accept failed");

      // Remove accepted offer from list (it's now closed)
      setOffers((prev) => prev.filter((o) => o.id !== selected.id));
      setSelected(null);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to accept offer");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .of-root { display:flex; flex-direction:column; gap:24px; }
        .of-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .of-eyebrow::before { content:''; width:18px; height:1px; background:#818cf8; opacity:0.6; }
        .of-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .of-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .of-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(max-width:900px){ .of-grid{ grid-template-columns:1fr; } }
        .card { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px; }
        .row { display:flex; justify-content:space-between; gap:10px; align-items:center; }
        .label { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; }
        .val { font-family:'Syne',sans-serif; font-size:16px; font-weight:800; color:#f0f4f8; }
        .muted { font-size:12.5px; color:#64748b; font-family:'DM Sans',sans-serif; }

        .btn { background:#818cf8; border:none; color:#080c14; border-radius:10px; padding:10px 14px; font-family:'Syne',sans-serif; font-weight:800; cursor:pointer; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; }

        .modal-back { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:50; padding:16px; }
        .modal { width:100%; max-width:520px; background:rgba(8,12,20,0.98); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:18px 18px 16px; }
        .in { width:100%; background:rgba(13,20,32,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px; color:#f0f4f8; outline:none; font-family:'DM Sans',sans-serif; }
        .in:focus { border-color: rgba(129,140,248,0.5); box-shadow: 0 0 0 3px rgba(129,140,248,0.1); }
      `}</style>

      <div className="of-root">
        <div>
          <div className="of-eyebrow">Borrower Portal</div>
          <h1 className="of-title">Loan Offers</h1>
          <p className="of-sub">Browse lender offers and accept one to get instant sanctioning.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 12 }}>{error}</div>
        ) : sorted.length === 0 ? (
          <div style={{ color: "#64748b", padding: 20 }}>No open offers right now.</div>
        ) : (
          <div className="of-grid">
            {sorted.map((o) => (
              <div key={o.id} className="card">
                <div className="row" style={{ marginBottom: 10 }}>
                  <div>
                    <div className="label">Offer</div>
                    <div className="val">{o.offerCode || `#${o.id}`}</div>
                    <div className="muted">Lender: {o.lenderName || "—"}</div>
                  </div>
                  <button className="btn" onClick={() => onOpenAccept(o)}>Accept</button>
                </div>

                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="label">Range</span>
                  <span className="val">${Number(o.minAmount || 0).toLocaleString()} – ${Number(o.maxAmount || 0).toLocaleString()}</span>
                </div>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="label">Rate</span>
                  <span className="val">{Number(o.interestRate || 0)}% p.a.</span>
                </div>
                <div className="row">
                  <span className="label">Tenure</span>
                  <span className="val">{Number(o.tenure || 0)} months</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="modal-back" onClick={() => setSelected(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f0f4f8" }}>
                  Accept {selected.offerCode || `Offer #${selected.id}`}
                </div>
                <button className="btn" style={{ background: "rgba(255,255,255,0.06)", color: "#f0f4f8" }} onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Amount (must be within range)</div>
                  <input
                    className="in"
                    type="number"
                    value={amount}
                    min={selected.minAmount}
                    max={selected.maxAmount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${selected.minAmount} - ${selected.maxAmount}`}
                  />
                </div>

                <div>
                  <div className="label" style={{ marginBottom: 6 }}>Purpose</div>
                  <input className="in" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
                </div>

                <button className="btn" disabled={acceptingId === selected.id} onClick={onAccept}>
                  {acceptingId === selected.id ? "Accepting..." : "Accept & Sanction Loan"}
                </button>

                <div className="muted">
                  Once accepted, this offer will close and the loan will be sanctioned to your account.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

