import { useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "loanflow_borrower_profile";

/* Static borrower profile data */
const docStatusStyle = {
  Verified: { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  Pending: { color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
  "Not Uploaded": { color: "#475569", bg: "rgba(255,255,255,0.04)" },
};

export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { phone: "", address: "" };
    } catch {
      return { phone: "", address: "" };
    }
  });
  const [saved, setSaved] = useState(false);

  const displayName = user?.fullName || user?.email?.split("@")[0] || "Borrower";
  const memberId = useMemo(() => {
    if (user?.userId) return `BRW-${user.userId}`;
    return "BRW-—";
  }, [user?.userId]);

  // Documents are placeholders for now; backend model can be added later.
  const documents = useMemo(
    () => [
      { name: "Identity Proof", status: "Not Uploaded", uploadDate: "—" },
      { name: "Income Proof", status: "Not Uploaded", uploadDate: "—" },
      { name: "Address Proof", status: "Not Uploaded", uploadDate: "—" },
    ],
    []
  );

  const onChange = (key) => (e) => {
    setSaved(false);
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const onSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .prf-root { display:flex; flex-direction:column; gap:32px; }
        .prf-header { display:flex; flex-direction:column; gap:6px; }
        .prf-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#818cf8;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .prf-eyebrow::before { content:''; width:18px; height:1px; background:#818cf8; opacity:0.6; }
        .prf-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .prf-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .prf-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:760px) { .prf-grid { grid-template-columns:1fr; } }

        .prf-panel {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; overflow:hidden;
        }
        .prf-panel-head {
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(255,255,255,0.05);
          display:flex; align-items:center; justify-content:space-between;
        }
        .prf-panel-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f0f4f8; }
        .prf-panel-sub {
          font-size:10.5px; color:#2e3f52; font-family:'DM Sans',sans-serif;
          text-transform:uppercase; letter-spacing:0.08em;
        }

        /* Profile card */
        .prf-card-top {
          display:flex; align-items:center; gap:18px;
          padding:24px 20px 20px;
          border-bottom:1px solid rgba(255,255,255,0.04);
        }
        .prf-avatar {
          width:56px; height:56px; border-radius:14px;
          background:rgba(129,140,248,0.1);
          border:1px solid rgba(129,140,248,0.25);
          display:flex; align-items:center; justify-content:center;
          font-family:'Syne',sans-serif; font-size:20px; font-weight:800;
          color:#818cf8; flex-shrink:0;
        }
        .prf-avatar-name {
          font-family:'Syne',sans-serif; font-size:20px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.01em; margin-bottom:4px;
        }
        .prf-avatar-id {
          font-size:11px; color:#475569; font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .prf-status-dot {
          width:6px; height:6px; border-radius:50%;
          background:#34d399; box-shadow:0 0 6px #34d399;
          display:inline-block;
        }

        /* Info rows */
        .prf-info-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 20px; gap:12px;
          border-bottom:1px solid rgba(255,255,255,0.03);
          transition:background 0.12s;
        }
        .prf-info-row:last-child { border-bottom:none; }
        .prf-info-row:hover { background:rgba(255,255,255,0.015); }
        .prf-info-label {
          font-size:11px; font-weight:600; letter-spacing:0.08em;
          text-transform:uppercase; color:#475569;
          font-family:'DM Sans',sans-serif; flex-shrink:0;
        }
        .prf-info-value {
          font-size:13.5px; font-weight:400; color:#e2e8f0;
          font-family:'DM Sans',sans-serif; text-align:right;
        }

        .field {
          width:100%;
          background:rgba(255,255,255,0.03);
          border:1px solid rgba(255,255,255,0.06);
          color:#e2e8f0;
          padding:10px 12px;
          border-radius:10px;
          outline:none;
          font-family:'DM Sans',sans-serif;
          font-size:13px;
        }
        .field::placeholder { color:#334155; }

        /* Document rows */
        .prf-doc-row {
          display:flex; align-items:center; gap:14px;
          padding:13px 20px;
          border-bottom:1px solid rgba(255,255,255,0.03);
          transition:background 0.12s;
        }
        .prf-doc-row:last-child { border-bottom:none; }
        .prf-doc-row:hover { background:rgba(255,255,255,0.015); }
        .prf-doc-icon {
          width:34px; height:34px; border-radius:9px;
          background:rgba(129,140,248,0.06);
          border:1px solid rgba(129,140,248,0.12);
          display:flex; align-items:center; justify-content:center;
          font-size:14px; color:#818cf8; flex-shrink:0;
        }
        .prf-doc-info { flex:1; }
        .prf-doc-name {
          font-size:13px; font-weight:500; color:#e2e8f0;
          font-family:'DM Sans',sans-serif; margin-bottom:2px;
        }
        .prf-doc-date {
          font-size:11px; color:#475569; font-family:'DM Sans',sans-serif;
        }
        .prf-doc-badge {
          font-size:10px; font-weight:600; letter-spacing:0.06em;
          text-transform:uppercase; padding:3px 9px; border-radius:6px;
          font-family:'DM Sans',sans-serif; flex-shrink:0;
        }

        /* Save button */
        .prf-save-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 18px; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
          color:#818cf8; background:rgba(129,140,248,0.08);
          border:1px solid rgba(129,140,248,0.2);
          cursor:pointer; transition:all 0.15s;
        }
        .prf-save-btn:hover { background:rgba(129,140,248,0.14); border-color:rgba(129,140,248,0.35); }
      `}</style>

      <div className="prf-root">
        <div className="prf-header">
          <div className="prf-eyebrow">Borrower Portal</div>
          <h1 className="prf-title">Profile</h1>
          <p className="prf-sub">Your registered details are shown below. Add more info anytime.</p>
        </div>

        <div className="prf-grid">
          {/* Personal Information */}
          <div className="prf-panel">
            <div className="prf-panel-head">
              <span className="prf-panel-title">Personal Information</span>
              <span className="prf-panel-sub">{memberId}</span>
            </div>

            <div className="prf-card-top">
              <div className="prf-avatar">
                {displayName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase())
                  .join("")}
              </div>
              <div>
                <div className="prf-avatar-name">{displayName}</div>
                <div className="prf-avatar-id">
                  <span className="prf-status-dot" />
                  Active
                </div>
              </div>
            </div>

            <div className="prf-info-row">
              <span className="prf-info-label">Email</span>
              <span className="prf-info-value">{user?.email || "—"}</span>
            </div>

            <div className="prf-info-row" style={{ alignItems: "flex-start" }}>
              <span className="prf-info-label">Phone</span>
              <div style={{ width: "60%" }}>
                <input className="field" value={form.phone} onChange={onChange("phone")} placeholder="Add phone (optional)" />
              </div>
            </div>

            <div className="prf-info-row" style={{ alignItems: "flex-start" }}>
              <span className="prf-info-label">Address</span>
              <div style={{ width: "60%" }}>
                <textarea className="field" rows={3} value={form.address} onChange={onChange("address")} placeholder="Add address (optional)" />
              </div>
            </div>

            <div style={{ padding: "14px 20px" }}>
              <button type="button" className="prf-save-btn" onClick={onSave}>
                ◈ {saved ? "Saved" : "Save Profile"}
              </button>
            </div>
          </div>

          {/* Documents */}
          <div className="prf-panel">
            <div className="prf-panel-head">
              <span className="prf-panel-title">Documents</span>
              <span className="prf-panel-sub">0 verified</span>
            </div>

            {documents.map((doc) => {
              const ds = docStatusStyle[doc.status] || docStatusStyle["Not Uploaded"];
              return (
                <div key={doc.name} className="prf-doc-row">
                  <div className="prf-doc-icon">◫</div>
                  <div className="prf-doc-info">
                    <div className="prf-doc-name">{doc.name}</div>
                    <div className="prf-doc-date">{doc.uploadDate !== "—" ? `Uploaded ${doc.uploadDate}` : "Not uploaded yet"}</div>
                  </div>
                  <span
                    className="prf-doc-badge"
                    style={{ color: ds.color, background: ds.bg, border: `1px solid ${ds.color}33` }}
                  >
                    {doc.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
