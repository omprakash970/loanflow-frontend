import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiGet } from "../../utils/apiClient";

export default function Trends() {
  const [quarterlyData, setQuarterlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({
    lastQuarterLoans: 0,
    totalDisbursed: 0,
    avgLoansPerQuarter: 0,
    growthRate: 0,
  });

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        const trendsRes = await apiGet("/analytics/quarterly-trends");

        if (trendsRes.success && trendsRes.data) {
          const data = trendsRes.data;
          setQuarterlyData(data);

          // Calculate KPIs
          if (data.length > 0) {
            const lastQuarter = data[data.length - 1];
            const firstQuarter = data[0];

            const totalDisbursed = data.reduce((sum, q) => sum + q.volume, 0);
            const totalLoans = data.reduce((sum, q) => sum + q.loans, 0);
            const avgLoans = totalLoans / data.length;
            const growthRate =
              firstQuarter.loans > 0
                ? ((lastQuarter.loans - firstQuarter.loans) / firstQuarter.loans) * 100
                : 0;

            setKpis({
              lastQuarterLoans: lastQuarter.loans,
              totalDisbursed: totalDisbursed,
              avgLoansPerQuarter: Math.round(avgLoans),
              growthRate: Math.round(growthRate),
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch trends data:", err);
        setError("Failed to load trends data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendsData();
  }, []);

  const tooltipStyle = {
    background: "rgba(13,20,32,0.95)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#cbd5e1",
    fontFamily: "'DM Sans',sans-serif",
    fontSize: 12,
  };

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .trd-root { display:flex; flex-direction:column; gap:32px; }
        .trd-header { display:flex; flex-direction:column; gap:6px; }
        .trd-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#34d399;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .trd-eyebrow::before { content:''; width:18px; height:1px; background:#34d399; opacity:0.6; }
        .trd-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .trd-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .trd-charts { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:860px) { .trd-charts { grid-template-columns:1fr; } }

        .chart-panel {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; overflow:hidden;
        }
        .chart-panel-head {
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(255,255,255,0.05);
          display:flex; align-items:center; justify-content:space-between;
        }
        .chart-panel-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f0f4f8; }
        .chart-panel-sub { font-size:10.5px; color:#2e3f52; font-family:'DM Sans',sans-serif; text-transform:uppercase; letter-spacing:0.08em; }
        .chart-body { padding:20px; }

        /* KPI row */
        .trd-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        @media(max-width:700px) { .trd-kpis { grid-template-columns:repeat(2,1fr); } }

        .trd-kpi {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:18px 20px 14px;
          position:relative; overflow:hidden;
        }
        .trd-kpi::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--ac),transparent);
          opacity:0.5;
        }
        .trd-kpi-label {
          font-size:10.5px; font-weight:600; letter-spacing:0.1em;
          text-transform:uppercase; color:#475569;
          font-family:'DM Sans',sans-serif; margin-bottom:8px;
        }
        .trd-kpi-value {
          font-family:'Syne',sans-serif; font-size:24px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.02em; margin-bottom:4px;
        }
        .trd-kpi-meta { font-size:12px; font-weight:300; color:#334155; font-family:'DM Sans',sans-serif; }
      `}</style>

      <div className="trd-root">
        <div className="trd-header">
          <div className="trd-eyebrow">Analyst Portal</div>
          <h1 className="trd-title">Trends</h1>
          <p className="trd-sub">Quarterly loan growth and disbursement volume over time.</p>
        </div>

        {/* KPIs */}
        <div className="trd-kpis">
          <div className="trd-kpi" style={{ "--ac": "#2dd4bf" }}>
            <div className="trd-kpi-label">Total Loans (Latest)</div>
            <div className="trd-kpi-value">{loading ? "..." : kpis.lastQuarterLoans}</div>
            <div className="trd-kpi-meta">{loading ? "Loading..." : `Latest Quarter`}</div>
          </div>
          <div className="trd-kpi" style={{ "--ac": "#818cf8" }}>
            <div className="trd-kpi-label">Total Disbursed</div>
            <div className="trd-kpi-value">{loading ? "..." : `$${(kpis.totalDisbursed / 1000000).toFixed(2)}M`}</div>
            <div className="trd-kpi-meta">Cumulative</div>
          </div>
          <div className="trd-kpi" style={{ "--ac": "#34d399" }}>
            <div className="trd-kpi-label">Avg Loans / Quarter</div>
            <div className="trd-kpi-value">{loading ? "..." : kpis.avgLoansPerQuarter}</div>
            <div className="trd-kpi-meta">Over all quarters</div>
          </div>
          <div className="trd-kpi" style={{ "--ac": "#fb923c" }}>
            <div className="trd-kpi-label">Growth Rate</div>
            <div className="trd-kpi-value">{loading ? "..." : `+${kpis.growthRate}%`}</div>
            <div className="trd-kpi-meta">First → Latest</div>
          </div>
        </div>

        <div className="trd-charts">
          {/* Loan Count Trend */}
          <div className="chart-panel">
            <div className="chart-panel-head">
              <span className="chart-panel-title">Quarterly Loan Count</span>
              <span className="chart-panel-sub">{loading ? "..." : quarterlyData.length} quarters</span>
            </div>
            <div className="chart-body">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="quarter"
                      tick={{ fill: "#475569", fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#334155", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="loans"
                      stroke="#2dd4bf"
                      strokeWidth={2.5}
                      dot={{ fill: "#2dd4bf", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#2dd4bf", stroke: "rgba(45,212,191,0.3)", strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Volume Trend */}
          <div className="chart-panel">
            <div className="chart-panel-head">
              <span className="chart-panel-title">Disbursement Volume</span>
              <span className="chart-panel-sub">Cumulative</span>
            </div>
            <div className="chart-body">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="quarter"
                      tick={{ fill: "#475569", fontSize: 10, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#334155", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(val) => `$${Number(val).toLocaleString()}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#818cf8"
                      strokeWidth={2.5}
                      dot={{ fill: "#818cf8", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#818cf8", stroke: "rgba(129,140,248,0.3)", strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
