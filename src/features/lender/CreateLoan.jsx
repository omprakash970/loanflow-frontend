import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiPost } from "../../utils/apiClient";

const tenures = ["12","24","36","48","60"];

export default function CreateLoan() {
  const [form, setForm] = useState({ minAmount:"", maxAmount:"", interestRate:"", tenure:"24" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiPost("/marketplace/offers", {
        minAmount: Number(form.minAmount),
        maxAmount: Number(form.maxAmount),
        interestRate: Number(form.interestRate),
        tenure: Number(form.tenure),
      });

      if (!res?.data) {
        throw new Error("Failed to publish offer");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || "Failed to publish offer");
    } finally {
      setLoading(false);
    }
  };

  const previewEMI = (amt) => {
    if (!amt || !form.interestRate || !form.tenure) return null;
    const r = Number(form.interestRate) / 12 / 100;
    const n = Number(form.tenure);
    return Math.round((amt * r * Math.pow(1+r,n)) / (Math.pow(1+r,n)-1));
  };

  if (submitted) {
    return (
        <DashboardLayout>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
          <div style={{ display:"flex", flexDirection:"column", gap:28, maxWidth:520 }}>
            <div>
              <div style={styles.eyebrow}>Lender Portal</div>
              <h1 style={styles.title}>Offer Published!</h1>
              <p style={styles.sub}>Your loan offer is now live and visible to eligible borrowers.</p>
            </div>

            <div style={styles.successCard}>
              <div style={styles.checkIcon}>✓</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0, paddingTop:20 }}>
                {[
                  ["Amount Range",   `$${Number(form.minAmount).toLocaleString()} – $${Number(form.maxAmount).toLocaleString()}`],
                  ["Interest Rate",  `${form.interestRate}% p.a.`],
                  ["Tenure",         `${form.tenure} months`],
                  ["Min EMI (est.)", previewEMI(Number(form.minAmount)) ? `$${previewEMI(Number(form.minAmount)).toLocaleString()}/mo` : "—"],
                  ["Max EMI (est.)", previewEMI(Number(form.maxAmount)) ? `$${previewEMI(Number(form.maxAmount)).toLocaleString()}/mo` : "—"],
                ].map(([k,v]) => (
                    <div key={k} style={styles.detailRow}>
                      <span style={styles.detailKey}>{k}</span>
                      <span style={styles.detailVal}>{v}</span>
                    </div>
                ))}
              </div>
              <div style={{ paddingTop:16 }}>
                <span style={styles.publishedBadge}>◉ Published</span>
              </div>
            </div>

            <button type="button" onClick={() => { setSubmitted(false); setForm({ minAmount:"", maxAmount:"", interestRate:"", tenure:"24" }); }} style={styles.ctaBtn}
                    onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity="1"}
            >
              Create Another Offer →
            </button>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .cl-input, .cl-select {
          width:100%; background:rgba(8,12,20,0.9); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:11px 14px; font-size:14px; color:#f0f4f8;
          font-family:'DM Sans',sans-serif; outline:none; font-weight:400;
          transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box;
        }
        .cl-input::placeholder { color:#2e3f52; }
        .cl-input:focus, .cl-select:focus { border-color:rgba(45,212,191,0.5); box-shadow:0 0 0 3px rgba(45,212,191,0.08); }
        .cl-select option { background:#0d1420; }
        .cl-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:7px; display:block; }
        .cl-hint { font-size:11px; color:#2e3f52; font-family:'DM Sans',sans-serif; margin-top:5px; }
        .cl-submit {
          width:100%; background:#2dd4bf; color:#080c14; font-family:'Syne',sans-serif;
          font-size:14px; font-weight:800; letter-spacing:0.03em; padding:13px;
          border:none; border-radius:10px; cursor:pointer;
          box-shadow:0 0 24px rgba(45,212,191,0.28);
          transition:opacity 0.2s, box-shadow 0.2s;
        }
        .cl-submit:hover { opacity:0.88; box-shadow:0 0 36px rgba(45,212,191,0.45); }
      `}</style>

        <div style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Form */}
          <div style={{ flex:"1 1 340px", minWidth:300 }}>
            <div style={{ marginBottom:24 }}>
              <div style={styles.eyebrow}>Lender Portal</div>
              <h1 style={styles.title}>Create Loan Offer</h1>
              <p style={styles.sub}>Define the terms for a new loan product available to borrowers.</p>
            </div>

            <div style={styles.panel}>
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {/* Amount range row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label className="cl-label">Min Amount ($)</label>
                    <input className="cl-input" type="number" name="minAmount" value={form.minAmount} onChange={handleChange} required min="1000" placeholder="5,000" />
                  </div>
                  <div>
                    <label className="cl-label">Max Amount ($)</label>
                    <input className="cl-input" type="number" name="maxAmount" value={form.maxAmount} onChange={handleChange} required min="1000" placeholder="50,000" />
                  </div>
                </div>
                <p className="cl-hint">Set the lending range borrowers can apply within.</p>

                <div>
                  <label className="cl-label">Interest Rate (% p.a.)</label>
                  <input className="cl-input" type="number" name="interestRate" value={form.interestRate} onChange={handleChange} required min="1" max="30" step="0.1" placeholder="10.5" />
                  <p className="cl-hint">Annual interest rate applied to issued loans.</p>
                </div>

                <div>
                  <label className="cl-label">Tenure</label>
                  <select className="cl-select" name="tenure" value={form.tenure} onChange={handleChange}>
                    {tenures.map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>

                <button type="submit" className="cl-submit" style={{ marginTop:6 }} disabled={loading}>
                  {loading ? "Publishing..." : "Publish Loan Offer →"}
                </button>

                {error && <div style={{ color:"red", marginTop:12, fontSize:14 }}>{error}</div>}
              </form>
            </div>
          </div>

          {/* Preview card */}
          <div style={{ flex:"0 0 240px", minWidth:220 }}>
            <div style={{ ...styles.panel, position:"sticky", top:20 }}>
              <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#2dd4bf", fontFamily:"'DM Sans',sans-serif", marginBottom:14 }}>Offer Preview</div>

              {[
                { label:"Range", value: form.minAmount && form.maxAmount ? `$${Number(form.minAmount).toLocaleString()} – $${Number(form.maxAmount).toLocaleString()}` : "—" },
                { label:"Rate",  value: form.interestRate ? `${form.interestRate}% p.a.` : "—" },
                { label:"Term",  value: `${form.tenure} months` },
              ].map(r => (
                  <div key={r.label} style={{ padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#334155", fontFamily:"'DM Sans',sans-serif", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{r.label}</span>
                    <span style={{ fontSize:14, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f4f8" }}>{r.value}</span>
                  </div>
              ))}

              {/* EMI range preview */}
              {previewEMI(Number(form.minAmount)) && (
                  <div style={{ marginTop:16, background:"rgba(45,212,191,0.06)", border:"1px solid rgba(45,212,191,0.15)", borderRadius:10, padding:"14px" }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#2dd4bf", fontFamily:"'DM Sans',sans-serif", marginBottom:10 }}>Est. EMI Range</div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <div>
                        <div style={{ fontSize:18, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f4f8" }}>${previewEMI(Number(form.minAmount))?.toLocaleString()}</div>
                        <div style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif" }}>Min loan</div>
                      </div>
                      <div style={{ color:"#334155", fontFamily:"'Syne',sans-serif", alignSelf:"center" }}>→</div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:18, fontFamily:"'Syne',sans-serif", fontWeight:800, color:"#f0f4f8" }}>${previewEMI(Number(form.maxAmount))?.toLocaleString()}</div>
                        <div style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif" }}>Max loan</div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
}

const styles = {
  eyebrow: { fontSize:10.5, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase", color:"#2dd4bf", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8, marginBottom:8 },
  title: { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#f0f4f8", letterSpacing:"-0.02em", margin:"4px 0" },
  sub:   { fontSize:13.5, fontWeight:300, color:"#64748b", fontFamily:"'DM Sans',sans-serif" },
  panel: { background:"rgba(13,20,32,0.85)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14, padding:"24px" },
  successCard: { background:"rgba(13,20,32,0.85)", border:"1px solid rgba(45,212,191,0.2)", borderRadius:14, padding:"24px" },
  checkIcon: { width:40, height:40, borderRadius:"50%", background:"rgba(45,212,191,0.12)", border:"1px solid rgba(45,212,191,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, color:"#2dd4bf" },
  detailRow: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)" },
  detailKey: { fontSize:12, color:"#475569", fontFamily:"'DM Sans',sans-serif" },
  detailVal: { fontSize:13, fontFamily:"'Syne',sans-serif", fontWeight:700, color:"#f0f4f8" },
  publishedBadge: { fontSize:11, fontWeight:700, color:"#2dd4bf", background:"rgba(45,212,191,0.1)", border:"1px solid rgba(45,212,191,0.25)", padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif" },
  ctaBtn: { background:"#2dd4bf", color:"#080c14", fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, letterSpacing:"0.03em", padding:"13px 24px", border:"none", borderRadius:10, cursor:"pointer", width:"fit-content", boxShadow:"0 0 24px rgba(45,212,191,0.3)", transition:"opacity 0.2s" },
};