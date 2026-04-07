import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { CHART_COLORS } from "../../utils/constants";
import { apiGet } from "../../utils/apiClient";

export default function Analytics() {
  const [riskBands, setRiskBands] = useState([]);
  const [exposureData, setExposureData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const riskRes = await apiGet("/analytics/risk-distribution");
        const exposureRes = await apiGet("/analytics/portfolio-exposure");

        if (riskRes?.success) {
          setRiskBands(riskRes.data || []);
        } else {
          setRiskBands([]);
        }

        if (exposureRes?.success) {
          setExposureData(exposureRes.data || []);
        } else {
          setExposureData([]);
        }
      } catch (err) {
        console.error("Failed to fetch analytics data:", err);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleExport = async () => {
    try {
      const summary = await apiGet("/analytics/summary");
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `loanflow-analytics-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Export failed");
    }
  };

  const getTotalLoans = () => riskBands.reduce((sum, band) => sum + band.count, 0);

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .anl-root { display:flex; flex-direction:column; gap:32px; }
        .anl-header { display:flex; flex-direction:column; gap:6px; }
        .anl-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#34d399;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .anl-eyebrow::before { content:''; width:18px; height:1px; background:#34d399; opacity:0.6; }
        .anl-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .anl-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .anl-charts { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:860px) { .anl-charts { grid-template-columns:1fr; } }

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

        .export-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px; border-radius:10px;
          font-family:'DM Sans',sans-serif; font-size:12.5px; font-weight:500;
          color:#34d399; background:rgba(52,211,153,0.08);
          border:1px solid rgba(52,211,153,0.2);
          cursor:pointer; transition:all 0.15s;
        }
        .export-btn:hover {
          background:rgba(52,211,153,0.14);
          border-color:rgba(52,211,153,0.35);
        }

        .recharts-default-tooltip {
          background: rgba(13,20,32,0.95) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 10px !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: 12px !important;
        }
      `}</style>

      <div className="anl-root">
        <div className="anl-header">
          <div className="anl-eyebrow">Analyst Portal</div>
          <h1 className="anl-title">Analytics</h1>
          <p className="anl-sub">Risk score distribution and portfolio exposure breakdown.</p>
        </div>

        <div className="anl-charts">
          {/* Risk Score Distribution */}
          <div className="chart-panel">
            <div className="chart-panel-head">
              <span className="chart-panel-title">Risk Score Distribution</span>
              <span className="chart-panel-sub">{loading ? "..." : getTotalLoans()} loans</span>
            </div>
            <div className="chart-body">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ffffff" }}>Loading...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={riskBands} barSize={32}>
                    <XAxis
                      dataKey="band"
                      tick={{ fill: "#ffffff", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#334155", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(0,93,255,0.95)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        color: "#cbd5e1",
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {riskBands.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Portfolio Exposure by Segment */}
          <div className="chart-panel">
            <div className="chart-panel-head">
              <span className="chart-panel-title">Portfolio Exposure</span>
              <span className="chart-panel-sub">By status</span>
            </div>
            <div className="chart-body">
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ffffff" }}>Loading...</div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>
              ) : exposureData.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#ffffff" }}>No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={exposureData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {exposureData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      formatter={(val) => <span style={{ color: "#94a3b8", fontSize: 11, fontFamily: "'DM Sans',sans-serif" }}>{val}</span>}
                    />
                    <Tooltip
                      formatter={(val) => `$${Number(val).toLocaleString()}`}
                      contentStyle={{
                        background: "rgba(228,229,234,0.95)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 10,
                        color: "#cbd5e1",
                        fontFamily: "'DM Sans',sans-serif",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Export button */}
        <div>
          <button type="button" className="export-btn" onClick={handleExport}>
            ◈ Export Report
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
