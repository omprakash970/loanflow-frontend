import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const riskCfg = {
  LOW: { color: "#34d399", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.25)", bar: 60 },
  MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", bar: 40 },
  HIGH: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)", bar: 20 },
};

export default function Borrowers() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiGet("/borrowers/summary");
        setBorrowers(res?.data || []);
      } catch (e) {
        console.error("Failed to load borrowers", e);
        setError("Failed to load borrowers");
        setBorrowers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowers();
  }, []);

  const filtered = useMemo(() => {
    return borrowers.filter((b) => {
      const name = String(b.name || "").toLowerCase();
      const id = String(b.idCode || b.borrowerId || "").toLowerCase();
      const matchSearch = name.includes(search.toLowerCase()) || id.includes(search.toLowerCase());
      const rl = String(b.riskLevel || "").toUpperCase();
      const matchRisk = riskFilter === "All" || rl === riskFilter.toUpperCase();
      return matchSearch && matchRisk;
    });
  }, [borrowers, riskFilter, search]);

  const counts = useMemo(() => {
    const low = borrowers.filter((b) => String(b.riskLevel).toUpperCase() === "LOW").length;
    const med = borrowers.filter((b) => String(b.riskLevel).toUpperCase() === "MEDIUM").length;
    const high = borrowers.filter((b) => String(b.riskLevel).toUpperCase() === "HIGH").length;
    return { low, med, high, total: borrowers.length };
  }, [borrowers]);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .bo-root { display:flex; flex-direction:column; gap:28px; }
        .bo-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#2dd4bf; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .bo-eyebrow::before { content:''; width:18px; height:1px; background:#2dd4bf; opacity:0.6; }
        .bo-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .bo-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .bo-risks { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
        @media(max-width:600px){ .bo-risks { grid-template-columns:1fr; } }
        .risk-card { background:rgba(13,20,32,0.85); border:1px solid var(--rc-border); border-radius:12px; padding:16px 18px; cursor:pointer; transition:all 0.15s; }
        .risk-card:hover, .risk-card.selected { background:var(--rc-bg); box-shadow:0 0 14px var(--rc-glow); }
        .risk-card-label { font-size:10.5px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--rc); font-family:'DM Sans',sans-serif; margin-bottom:7px; }
        .risk-card-val { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; margin-bottom:8px; }
        .risk-bar-bg { height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden; }
        .risk-bar { height:100%; border-radius:4px; }

        .bo-toolbar { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .bo-search { flex:1; max-width:280px; background:rgba(8,12,20,0.9); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:9px 14px; font-size:13px; color:#f0f4f8; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s, box-shadow 0.2s; }
        .bo-search::placeholder { color:#2e3f52; }
        .bo-search:focus { border-color:rgba(45,212,191,0.4); box-shadow:0 0 0 3px rgba(45,212,191,0.08); }
        .bo-count { font-size:12px; color:#2e3f52; font-family:'DM Sans',sans-serif; margin-left:auto; }

        .table-wrap { border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        table.bo-table { width:100%; border-collapse:collapse; }
        .bo-table thead tr { background:rgba(13,20,32,0.95); border-bottom:1px solid rgba(255,255,255,0.06); }
        .bo-table th { padding:13px 18px; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#334155; font-family:'DM Sans',sans-serif; text-align:left; }
        .bo-table tbody tr { border-bottom:1px solid rgba(255,255,255,0.03); background:rgba(13,20,32,0.6); transition:background 0.15s; }
        .bo-table tbody tr:last-child { border-bottom:none; }
        .bo-table tbody tr:hover { background:rgba(45,212,191,0.03); }
        .bo-table td { padding:13px 18px; font-family:'DM Sans',sans-serif; }
        .td-id { font-family:'Syne',sans-serif; font-weight:700; color:#94a3b8; font-size:12px; }
        .b-avatar { width:32px; height:32px; border-radius:9px; display:inline-flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; font-family:'Syne',sans-serif; margin-right:10px; vertical-align:middle; flex-shrink:0; }
        .b-name { font-size:13px; color:#e2e8f0; font-weight:400; vertical-align:middle; }
        .td-loans { font-family:'Syne',sans-serif; font-size:14px; font-weight:800; color:#f0f4f8; }
        .risk-pill { display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:4px 9px; border-radius:20px; font-family:'DM Sans',sans-serif; }
        .risk-dot { width:5px; height:5px; border-radius:50%; }
        .risk-mini-bar { width:60px; height:4px; background:rgba(255,255,255,0.05); border-radius:4px; overflow:hidden; display:inline-block; vertical-align:middle; margin-left:8px; }
        .risk-mini-fill { height:100%; border-radius:4px; }
      `}</style>

      <div className="bo-root">
        <div>
          <div className="bo-eyebrow">Lender Portal</div>
          <h1 className="bo-title">Borrowers</h1>
          <p className="bo-sub">All registered borrowers, their portfolios, and risk classification.</p>
        </div>

        {loading ? (
          <div style={{ color: "#64748b", padding: 20 }}>Loading...</div>
        ) : error ? (
          <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
        ) : (
          <>
            <div className="bo-risks">
              {[
                {
                  level: "LOW",
                  count: counts.low,
                  color: "#34d399",
                  bg: "rgba(52,211,153,0.06)",
                  border: "rgba(52,211,153,0.2)",
                  glow: "rgba(52,211,153,0.12)",
                  bar: counts.total ? (counts.low / counts.total) * 100 : 0,
                },
                {
                  level: "MEDIUM",
                  count: counts.med,
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.06)",
                  border: "rgba(245,158,11,0.2)",
                  glow: "rgba(245,158,11,0.12)",
                  bar: counts.total ? (counts.med / counts.total) * 100 : 0,
                },
                {
                  level: "HIGH",
                  count: counts.high,
                  color: "#f87171",
                  bg: "rgba(248,113,113,0.06)",
                  border: "rgba(248,113,113,0.2)",
                  glow: "rgba(248,113,113,0.12)",
                  bar: counts.total ? (counts.high / counts.total) * 100 : 0,
                },
              ].map((r) => (
                <div
                  key={r.level}
                  className={`risk-card ${riskFilter === r.level ? "selected" : ""}`}
                  style={{ "--rc": r.color, "--rc-bg": r.bg, "--rc-border": r.border, "--rc-glow": r.glow }}
                  onClick={() => setRiskFilter(riskFilter === r.level ? "All" : r.level)}
                >
                  <div className="risk-card-label">{r.level.toLowerCase()} risk</div>
                  <div className="risk-card-val" style={{ color: r.color }}>{r.count}</div>
                  <div className="risk-bar-bg">
                    <div className="risk-bar" style={{ width: `${r.bar}%`, background: r.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bo-toolbar">
              <input
                className="bo-search"
                placeholder="Search by name or ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="bo-count">{filtered.length} borrowers</span>
            </div>

            <div className="table-wrap">
              <table className="bo-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Active Loans</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const r = riskCfg[String(b.riskLevel).toUpperCase()] ?? riskCfg.LOW;
                    const initials = String(b.name || "?")
                      .split(" ")
                      .filter(Boolean)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("");

                    return (
                      <tr key={b.borrowerId}>
                        <td><span className="td-id">{b.idCode || b.borrowerId}</span></td>
                        <td>
                          <span className="b-avatar" style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color }}>{initials}</span>
                          <span className="b-name">{b.name || "—"}</span>
                        </td>
                        <td><span className="td-loans">{Number(b.activeLoans || 0)}</span></td>
                        <td>
                          <span className="risk-pill" style={{ color: r.color, background: r.bg, border: `1px solid ${r.border}` }}>
                            <span className="risk-dot" style={{ background: r.color, boxShadow: `0 0 5px ${r.color}` }} />
                            {String(b.riskLevel || "LOW").toUpperCase()}
                          </span>
                          <span className="risk-mini-bar">
                            <span className="risk-mini-fill" style={{ width: `${r.bar}%`, background: r.color, display: "block" }} />
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