import { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiPost } from "../../utils/apiClient";

const purposes = ["Home Renovation", "Education", "Medical", "Vehicle Purchase", "Business Expansion", "Personal"];
const tenures = ["12", "24", "36", "48"];

function calcEMI(amount, months, rate) {
  if (!amount || !months) return 0;
  const r = rate / 12 / 100;
  return Math.round((amount * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
}

export default function ApplyLoan() {
  const [form, setForm] = useState({ amount: "", tenure: "24", purpose: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const interestRate = 10.5;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiPost("/marketplace/requests", {
        amount: parseFloat(form.amount),
        tenure: parseInt(form.tenure),
        purpose: form.purpose,
        interestRate: interestRate,
      });

      if (response && response.data) {
        setSubmitted(true);
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting your request.");
    } finally {
      setLoading(false);
    }
  };

  const emi = calcEMI(Number(form.amount), Number(form.tenure), interestRate);
  const totalPayable = emi * Number(form.tenure);
  const totalInterest = totalPayable - Number(form.amount);

  if (submitted) {
    return (
        <DashboardLayout>
          <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
          <div style={{ display:"flex", flexDirection:"column", gap:28, maxWidth:560 }}>
            <div>
              <div style={styles.eyebrow("#818cf8")}>Borrower Portal</div>
              <h1 style={styles.title}>Application Submitted</h1>
              <p style={styles.sub}>Your request is under review. We'll update you within 24–48 hours.</p>
            </div>

            <div style={styles.successCard}>
              <div style={styles.successIcon}>✓</div>
              <div style={{ ...styles.sField, paddingTop: 20 }}>
                {[
                  ["Loan Amount", `$${Number(form.amount).toLocaleString()}`],
                  ["Tenure", `${form.tenure} months`],
                  ["Interest Rate", `${interestRate}% p.a. fixed`],
                  ["Purpose", form.purpose],
                  ["Monthly EMI", `$${emi.toLocaleString()}`],
                ].map(([k, v]) => (
                    <div key={k} style={styles.detailRow}>
                      <span style={styles.detailKey}>{k}</span>
                      <span style={styles.detailVal}>{v}</span>
                    </div>
                ))}
              </div>
              <div style={{ paddingTop:16 }}>
                <span style={styles.pendingBadge}>⏳ Pending Review</span>
              </div>
            </div>

            <button
                type="button"
                onClick={() => { setSubmitted(false); setForm({ amount: "", tenure: "24", purpose: "" }); }}
                style={styles.ctaBtn}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              Apply for Another Loan →
            </button>
          </div>
        </DashboardLayout>
    );
  }

  return (
      <DashboardLayout>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .al-input, .al-select {
          width:100%; background:rgba(8,12,20,0.9); border:1px solid rgba(255,255,255,0.08);
          border-radius:10px; padding:11px 14px; font-size:14px; color:#f0f4f8;
          font-family:'DM Sans',sans-serif; outline:none; font-weight:400;
          transition:border-color 0.2s, box-shadow 0.2s; box-sizing:border-box;
        }
        .al-input::placeholder { color:#2e3f52; }
        .al-input:focus, .al-select:focus {
          border-color:rgba(129,140,248,0.5);
          box-shadow:0 0 0 3px rgba(129,140,248,0.1);
        }
        .al-select option { background:#0d1420; color:#f0f4f8; }
        .al-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:7px; display:block; }
        .al-disabled { background:rgba(255,255,255,0.02) !important; border-color:rgba(255,255,255,0.04) !important; color:#334155 !important; cursor:not-allowed; }
        .al-submit {
          width:100%; background:#818cf8; color:#080c14; font-family:'Syne',sans-serif;
          font-size:14px; font-weight:800; letter-spacing:0.03em; padding:13px;
          border:none; border-radius:10px; cursor:pointer;
          box-shadow:0 0 24px rgba(129,140,248,0.3);
          transition:opacity 0.2s, box-shadow 0.2s;
        }
        .al-submit:hover { opacity:0.88; box-shadow:0 0 36px rgba(129,140,248,0.45); }
        .al-submit:active { transform:scale(0.98); }
      `}</style>

        <div style={{ display:"flex", gap:28, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Left: Form */}
          <div style={{ flex:"1 1 340px", minWidth:300 }}>
            <div style={{ marginBottom:24 }}>
              <div style={styles.eyebrow("#818cf8")}>Borrower Portal</div>
              <h1 style={styles.title}>Apply for Loan</h1>
              <p style={styles.sub}>Fill in the details below to submit your application.</p>
            </div>

            <div style={styles.panel}>
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                {error && (
                  <div style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.3)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#f87171",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="al-label">Loan Amount ($)</label>
                  <input className="al-input" type="number" name="amount" value={form.amount} onChange={handleChange} required min="1000" max="100000" placeholder="e.g. 25,000" disabled={loading} />
                </div>

                <div>
                  <label className="al-label">Tenure</label>
                  <select className="al-select" name="tenure" value={form.tenure} onChange={handleChange} disabled={loading}>
                    {tenures.map(t => <option key={t} value={t}>{t} months</option>)}
                  </select>
                </div>

                <div>
                  <label className="al-label">Interest Rate</label>
                  <input className="al-input al-disabled" type="text" value={`${interestRate}% p.a. (fixed)`} disabled />
                </div>

                <div>
                  <label className="al-label">Purpose</label>
                  <select className="al-select" name="purpose" value={form.purpose} onChange={handleChange} required disabled={loading}>
                    <option value="">Select a purpose…</option>
                    {purposes.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <button type="submit" className="al-submit" style={{ marginTop:6, opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Application →"}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Live calculator */}
          <div style={{ flex:"0 0 260px", minWidth:240 }}>
            <div style={{ ...styles.panel, position:"sticky", top:20 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#334155", fontFamily:"'DM Sans',sans-serif", marginBottom:4 }}>EMI Calculator</div>
                <div style={{ fontSize:13, color:"#2e3f52", fontFamily:"'DM Sans',sans-serif", fontWeight:300 }}>Updates as you type</div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:1, borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.05)" }}>
                {[
                  ["Monthly EMI", emi ? `$${emi.toLocaleString()}` : "—", "#818cf8"],
                  ["Total Payable", totalPayable ? `$${totalPayable.toLocaleString()}` : "—", "#f0f4f8"],
                  ["Total Interest", totalInterest > 0 ? `$${totalInterest.toLocaleString()}` : "—", "#f87171"],
                ].map(([label, value, color]) => (
                    <div key={label} style={{ background:"rgba(13,20,32,0.9)", padding:"14px 16px", borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize:10.5, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"#334155", fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>{label}</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color }}>{value}</div>
                    </div>
                ))}
              </div>

              {emi > 0 && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:11, color:"#2e3f52", fontFamily:"'DM Sans',sans-serif", marginBottom:6 }}>Principal vs Interest</div>
                    <div style={{ height:6, borderRadius:6, background:"rgba(255,255,255,0.05)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.round((Number(form.amount)/totalPayable)*100)}%`, background:"linear-gradient(90deg,#818cf8,#6366f1)", borderRadius:6 }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                      <span style={{ fontSize:10, color:"#818cf8", fontFamily:"'DM Sans',sans-serif" }}>Principal {Math.round((Number(form.amount)/totalPayable)*100)}%</span>
                      <span style={{ fontSize:10, color:"#f87171", fontFamily:"'DM Sans',sans-serif" }}>Interest {Math.round((totalInterest/totalPayable)*100)}%</span>
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
  eyebrow: (color) => ({
    fontSize:10.5, fontWeight:600, letterSpacing:"0.14em", textTransform:"uppercase",
    color, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", gap:8, marginBottom:8,
  }),
  title: { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#f0f4f8", letterSpacing:"-0.02em", margin:"4px 0" },
  sub:   { fontSize:13.5, fontWeight:300, color:"#64748b", fontFamily:"'DM Sans',sans-serif" },
  panel: {
    background:"rgba(13,20,32,0.85)", border:"1px solid rgba(255,255,255,0.06)",
    borderRadius:14, padding:"24px",
  },
  successCard: {
    background:"rgba(13,20,32,0.85)", border:"1px solid rgba(129,140,248,0.2)",
    borderRadius:14, padding:"24px", position:"relative", overflow:"hidden",
  },
  successIcon: {
    width:40, height:40, borderRadius:"50%", background:"rgba(129,140,248,0.15)",
    border:"1px solid rgba(129,140,248,0.3)", display:"flex", alignItems:"center",
    justifyContent:"center", fontSize:18, color:"#818cf8", marginBottom:4,
  },
  sField: { display:"flex", flexDirection:"column", gap:0 },
  detailRow: {
    display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.04)",
  },
  detailKey: { fontSize:12, color:"#475569", fontFamily:"'DM Sans',sans-serif", fontWeight:400 },
  detailVal: { fontSize:13, color:"#f0f4f8", fontFamily:"'Syne',sans-serif", fontWeight:700 },
  pendingBadge: {
    fontSize:11, fontWeight:700, letterSpacing:"0.06em", color:"#f59e0b",
    background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)",
    padding:"5px 12px", borderRadius:20, fontFamily:"'DM Sans',sans-serif",
  },
  ctaBtn: {
    background:"#818cf8", color:"#080c14", fontFamily:"'Syne',sans-serif",
    fontSize:14, fontWeight:800, letterSpacing:"0.03em", padding:"13px 24px",
    border:"none", borderRadius:10, cursor:"pointer", width:"fit-content",
    boxShadow:"0 0 24px rgba(129,140,248,0.3)", transition:"opacity 0.2s",
  },
};