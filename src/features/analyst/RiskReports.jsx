import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

function getRisk(score) {
  const s = Number(score) || 0;
  if (s <= 20) return { text: "Low", color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", bar: (s / 20) * 100, glow: "rgba(52,211,153,0.3)" };
  if (s <= 50) return { text: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", bar: (s / 50) * 100, glow: "rgba(245,158,11,0.3)" };
  return { text: "High", color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", bar: Math.min(s, 100), glow: "rgba(248,113,113,0.3)" };
}

export default function RiskReports() {
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("score-desc");
  const [riskReports, setRiskReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/risk-reports/all");
        setRiskReports(res?.data || []);
      } catch (e) {
        console.error("Failed to load risk reports", e);
        setError("Failed to load risk reports");
        setRiskReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const derived = useMemo(() => {
    const low = riskReports.filter((r) => (Number(r.riskScore) || 0) <= 20).length;
    const medium = riskReports.filter((r) => {
      const s = Number(r.riskScore) || 0;
      return s > 20 && s <= 50;
    }).length;
    const high = riskReports.filter((r) => (Number(r.riskScore) || 0) > 50).length;

    const avgScore = riskReports.length
      ? Math.round(riskReports.reduce((a, r) => a + (Number(r.riskScore) || 0), 0) / riskReports.length)
      : 0;

    const avgProb = riskReports.length
      ? (riskReports.reduce((a, r) => a + (Number(r.defaultProbability) || 0), 0) / riskReports.length).toFixed(1)
      : "0.0";

    return { low, medium, high, avgScore, avgProb };
  }, [riskReports]);

  const filtered = useMemo(() => {
    let list = filter === "All" ? [...riskReports] : riskReports.filter((r) => getRisk(r.riskScore).text === filter);
    list.sort((a, b) => {
      const as = Number(a.riskScore) || 0;
      const bs = Number(b.riskScore) || 0;
      const ap = Number(a.defaultProbability) || 0;
      const bp = Number(b.defaultProbability) || 0;
      if (sortBy === "score-desc") return bs - as;
      if (sortBy === "score-asc") return as - bs;
      if (sortBy === "prob-desc") return bp - ap;
      return 0;
    });
    return list;
  }, [filter, riskReports, sortBy]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .rr-root { display:flex; flex-direction:column; gap:28px; }
        .rr-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#f87171; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .rr-eyebrow::before { content:''; width:18px; height:1px; background:#f87171; opacity:0.6; }
        .rr-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .rr-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .rr-summary { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
        @media(max-width:800px){ .rr-summary { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:500px){ .rr-summary { grid-template-columns:repeat(2,1fr); } }
        .rsum { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px 16px; position:relative; overflow:hidden; cursor:pointer; transition:all 0.15s; }
        .rsum::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.5; transition:opacity 0.2s; }
        .rsum.selected { border-color:var(--ac-b); background:var(--ac-bg); }
        .rsum.selected::before { opacity:1; }
        .rsum:hover { border-color:var(--ac-b); }
        .rsum-label { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; margin-bottom:6px; }
        .rsum-value { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; }

        .rr-toolbar { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .rr-sort { background:rgba(8,12,20,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:8px 12px; font-size:12px; color:#94a3b8; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; transition:border-color 0.2s; }
        .rr-sort:focus { border-color:rgba(248,113,113,0.4); }
        .rr-sort option { background:#0d1420; }
        .rr-count { font-size:12px; color:#2e3f52; font-family:'DM Sans',sans-serif; margin-left:auto; }

        .table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.rr-table { width:100%; border-collapse:collapse; }
        .rr-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .rr-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .rr-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .rr-table tbody tr:last-child { border-bottom:none; }
        .rr-table tbody tr:hover { background:rgba(248,113,113,0.02); }
        .rr-table td { padding:13px 18px; font-family:'DM Sans',sans-serif; vertical-align:middle; }
        .td-id { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }

        .score-wrap { display:flex; align-items:center; gap:10px; }
        .score-num { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; min-width:28px; }
        .score-bar-bg { flex:1; height:5px; background:rgba(255,255,255,0.05); border-radius:5px; overflow:hidden; max-width:80px; }
        .score-bar { height:100%; border-radius:5px; }

        .risk-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 10px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .risk-dot { width:5px; height:5px; border-radius:50%; }

        .prob-wrap { display:flex; align-items:center; gap:8px; }
        .prob-num { font-family:'Syne',sans-serif; font-size:14px; font-weight:800; min-width:42px; }
        .prob-gauge { flex:1; height:5px; background:rgba(255,255,255,0.05); border-radius:5px; overflow:hidden; max-width:80px; }
        .prob-fill { height:100%; border-radius:5px; }
      `}</style>

      <div className="rr-root">
        <div>
          <div className="rr-eyebrow">Analyst Portal</div>
          <h1 className="rr-title">Risk Reports</h1>
          <p className="rr-sub">Default probability, risk scoring, and loan exposure analysis.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="rr-summary">
              {[
                { key: "All", label: "All Loans", value: riskReports.length, accent: "#64748b", accentBg: "rgba(100,116,139,0.06)", accentBorder: "rgba(100,116,139,0.2)" },
                { key: "Low", label: "Low Risk", value: derived.low, accent: "#34d399", accentBg: "rgba(52,211,153,0.06)", accentBorder: "rgba(52,211,153,0.25)" },
                { key: "Medium", label: "Medium Risk", value: derived.medium, accent: "#f59e0b", accentBg: "rgba(245,158,11,0.06)", accentBorder: "rgba(245,158,11,0.25)" },
                { key: "High", label: "High Risk", value: derived.high, accent: "#f87171", accentBg: "rgba(248,113,113,0.06)", accentBorder: "rgba(248,113,113,0.25)" },
                { key: "_avg", label: "Avg Risk Score", value: derived.avgScore, accent: "#818cf8", accentBg: "rgba(129,140,248,0.06)", accentBorder: "rgba(129,140,248,0.25)", noFilter: true },
              ].map((s) => (
                <div
                  key={s.key}
                  className={`rsum ${filter === s.key && !s.noFilter ? "selected" : ""}`}
                  style={{ "--ac": s.accent, "--ac-b": s.accentBorder, "--ac-bg": s.accentBg, cursor: s.noFilter ? "default" : "pointer" }}
                  onClick={() => !s.noFilter && setFilter(filter === s.key ? "All" : s.key)}
                >
                  <div className="rsum-label">{s.label}</div>
                  <div className="rsum-value" style={{ color: s.accent }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div className="rr-toolbar">
              <select className="rr-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="score-desc">Sort: Highest Risk First</option>
                <option value="score-asc">Sort: Lowest Risk First</option>
                <option value="prob-desc">Sort: Default Prob ↓</option>
              </select>
              <span className="rr-count">{filtered.length} records · avg default prob {derived.avgProb}%</span>
            </div>

            <div className="table-wrap">
              <table className="rr-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Default Probability</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const risk = getRisk(r.riskScore);
                    const prob = Number(r.defaultProbability) || 0;
                    const probColor = prob > 15 ? "#f87171" : prob > 8 ? "#f59e0b" : "#34d399";
                    const loanLabel = r.loanCode || r.loanId;

                    return (
                      <tr key={r.id || loanLabel}>
                        <td><span className="td-id">{loanLabel}</span></td>
                        <td>
                          <div className="score-wrap">
                            <span className="score-num" style={{ color: risk.color }}>{Number(r.riskScore || 0)}</span>
                            <div className="score-bar-bg">
                              <div className="score-bar" style={{ width: `${risk.bar}%`, background: risk.color, boxShadow: `0 0 6px ${risk.glow}` }} />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="risk-pill" style={{ color: risk.color, background: risk.bg, border: `1px solid ${risk.border}` }}>
                            <span className="risk-dot" style={{ background: risk.color, boxShadow: `0 0 5px ${risk.color}` }} />
                            {risk.text}
                          </span>
                        </td>
                        <td>
                          <div className="prob-wrap">
                            <span className="prob-num" style={{ color: probColor }}>{prob}%</span>
                            <div className="prob-gauge">
                              <div className="prob-fill" style={{ width: `${Math.min(prob * 4, 100)}%`, background: probColor }} />
                            </div>
                          </div>
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