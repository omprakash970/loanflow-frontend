import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

const sevMap = {
	high:  { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "HIGH" },
	med:   { color: "#fb923c", bg: "rgba(251,146,60,0.1)",  label: "MED"  },
	low:   { color: "#facc15", bg: "rgba(250,204,21,0.1)",  label: "LOW"  },
	info:  { color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  label: "INFO" },
};

export default function AnalystDashboard() {
	const [stats, setStats] = useState([]);
	const [riskSegments, setRiskSegments] = useState([]);
	const [alerts, setAlerts] = useState([]);
	const [sparklines, setSparklines] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setLoading(true);
				setError(null);

				// Fetch all loans (approved ones)
				const loansRes = await apiGet("/loans/all");
				const loans = loansRes?.data || [];

				// Fetch risk distribution
				const riskRes = await apiGet("/analytics/risk-distribution");
				const riskData = riskRes?.data || [];

				// Fetch portfolio exposure
				const exposureRes = await apiGet("/analytics/portfolio-exposure");
				const exposureData = exposureRes?.data || [];

				// Calculate stats
				const activeLoans = loans.filter(l => String(l.status).toUpperCase() === "ACTIVE").length;
				const totalVolume = loans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
				const pendingLoans = loans.filter(l => String(l.status).toUpperCase() === "PENDING").length;
				const overdueLoans = loans.filter(l => String(l.status).toUpperCase() === "OVERDUE").length;

				const calculatedStats = [
					{ title: "Default Probability", value: overdueLoans > 0 ? ((overdueLoans / loans.length) * 100).toFixed(1) + "%" : "0%", meta: "Loan overdue rate", icon: "◈", accent: "#34d399" },
					{ title: "Portfolio Exposure", value: "$" + (totalVolume / 1e6).toFixed(1) + "M", meta: "Total active volume", icon: "◉", accent: "#2dd4bf" },
					{ title: "Active Loans", value: activeLoans.toString(), meta: "Currently active", icon: "◐", accent: "#34d399" },
					{ title: "Avg Risk Score", value: "68", meta: "Moderate band", icon: "◑", accent: "#fb923c" },
					{ title: "Pending Review", value: pendingLoans.toString(), meta: "Awaiting approval", icon: "◒", accent: "#818cf8" },
					{ title: "Total Loans", value: loans.length.toString(), meta: "All records", icon: "⬡", accent: "#38bdf8" },
				];

				setStats(calculatedStats);

				// Map risk data to segments
				const riskSegmentsData = riskData.map((item, idx) => ({
					label: item.band || "Band " + (idx + 1),
					pct: Math.round((item.count / loans.length) * 100) || 0,
					count: item.count || 0,
					color: ["#34d399", "#fb923c", "#f87171", "#e11d48", "#7c3aed"][idx % 5]
				}));
				setRiskSegments(riskSegmentsData);

				// Create mock alerts from loans
				const mockAlerts = loans.filter(l => String(l.status).toUpperCase() === "OVERDUE" || String(l.status).toUpperCase() === "PENDING").slice(0, 5).map((loan, idx) => ({
					id: "ALT-" + (100 - idx),
					msg: `Loan ${loan.loanId} - ${loan.borrowerName}`,
					severity: String(loan.status).toUpperCase() === "OVERDUE" ? "high" : "low",
					time: "recently"
				}));
				setAlerts(mockAlerts);

				// Create mock sparklines
				const sparklineData = {
					"Default Probability": [55,52,60,58,48,44,42,45,40,38,35,36],
					"Portfolio Exposure": [60,62,65,70,72,74,73,78,80,81,80,82],
				};
				setSparklines(sparklineData);
			} catch (err) {
				console.error("Failed to load dashboard data:", err);
				setError("Failed to load dashboard data");
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	return (
		<DashboardLayout>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .an-root { display:flex; flex-direction:column; gap:32px; }
        .an-header { display:flex; flex-direction:column; gap:6px; }
        .an-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#34d399;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .an-eyebrow::before { content:''; width:18px; height:1px; background:#34d399; opacity:0.6; }
        .an-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .an-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        /* Stats */
        .an-stats { display:grid; gap:12px; grid-template-columns:repeat(3,1fr); }
        @media(max-width:900px) { .an-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:560px) { .an-stats { grid-template-columns:1fr; } }

        .astat {
          background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:20px 20px 14px; position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s; cursor:default;
        }
        .astat:hover { border-color:var(--ac-b); transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,0,0,0.4),0 0 18px var(--ac-g); }
        .astat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.45; transition:opacity 0.2s; }
        .astat:hover::before { opacity:1; }
        .astat-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .astat-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; }
        .astat-icon { font-size:15px; color:var(--ac); opacity:0.7; }
        .astat-value { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; margin-bottom:6px; }
        .astat-meta { font-size:12px; font-weight:300; color:#334155; font-family:'DM Sans',sans-serif; }

        /* Sparkline */
        .sparkline { display:flex; align-items:flex-end; gap:2px; height:28px; margin-top:10px; }
        .spark-bar { flex:1; border-radius:2px; transition:height 0.3s; min-height:3px; }

        /* Bottom row */
        .an-bottom { display:grid; grid-template-columns:1fr 300px; gap:16px; }
        @media(max-width:900px) { .an-bottom { grid-template-columns:1fr; } }

        .panel { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        .panel-head { padding:16px 20px 12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:space-between; }
        .panel-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f0f4f8; }
        .panel-sub { font-size:10.5px; color:#2e3f52; font-family:'DM Sans',sans-serif; text-transform:uppercase; letter-spacing:0.08em; }

        /* Alert rows */
        .alert-row { display:flex; align-items:flex-start; gap:12px; padding:12px 20px; border-bottom:1px solid rgba(255,255,255,0.03); transition:background 0.15s; }
        .alert-row:last-child { border-bottom:none; }
        .alert-row:hover { background:rgba(255,255,255,0.02); }
        .alert-sev { font-size:9px; font-weight:700; letter-spacing:0.1em; padding:3px 7px; border-radius:5px; flex-shrink:0; margin-top:1px; font-family:'DM Sans',sans-serif; }
        .alert-id { font-size:10.5px; color:#2e3f52; font-family:'Syne',sans-serif; margin-bottom:2px; }
        .alert-msg { font-size:12.5px; color:#94a3b8; font-weight:300; font-family:'DM Sans',sans-serif; }
        .alert-time { font-size:10.5px; color:#2e3f52; font-family:'DM Sans',sans-serif; flex-shrink:0; margin-top:2px; }

        /* Risk segment */
        .seg-row { padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.03); }
        .seg-row:last-child { border-bottom:none; }
        .seg-info { display:flex; justify-content:space-between; align-items:center; margin-bottom:7px; }
        .seg-label { font-size:12.5px; font-weight:400; color:#cbd5e1; font-family:'DM Sans',sans-serif; }
        .seg-count { font-size:12px; font-weight:700; font-family:'Syne',sans-serif; }
        .seg-pct { font-size:11px; color:#475569; font-family:'DM Sans',sans-serif; }
        .seg-bar-bg { height:5px; background:rgba(255,255,255,0.05); border-radius:5px; overflow:hidden; }
        .seg-bar { height:100%; border-radius:5px; }
        
        .empty-state { text-align:center; padding:40px 20px; color:#64748b; }
      `}</style>

			<div className="an-root">
				<div className="an-header">
					<div className="an-eyebrow">Analyst Portal</div>
					<h1 className="an-title">Risk & Analytics</h1>
					<p className="an-sub">Portfolio risk metrics, cohort analysis, and report generation.</p>
				</div>

			{loading ? (
				<div className="empty-state">Loading dashboard data...</div>
			) : error ? (
				<div style={{ textAlign: "center", padding: "40px 20px", color: "#ef4444" }}>{error}</div>
				) : (
					<>
						{/* Stats */}
						<div className="an-stats">
							{stats.map((s) => {
								const spark = sparklines[s.title];
								const max = spark ? Math.max(...spark) : 1;
								return (
									<div
										key={s.title}
										className="astat"
										style={{ "--ac": s.accent, "--ac-b": s.accent + "44", "--ac-g": s.accent + "18" }}
									>
										<div className="astat-head">
											<span className="astat-label">{s.title}</span>
											<span className="astat-icon">{s.icon}</span>
										</div>
										<div className="astat-value">{s.value}</div>
										<div className="astat-meta">{s.meta}</div>
										{spark && (
											<div className="sparkline">
												{spark.map((v, i) => (
													<div
														key={i}
														className="spark-bar"
														style={{ height: `${(v / max) * 100}%`, background: s.accent + (i === spark.length - 1 ? "ff" : "44") }}
													/>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>

						{/* Bottom row */}
						<div className="an-bottom">
							{/* Alert feed */}
							<div className="panel">
								<div className="panel-head">
									<span className="panel-title">Active Alerts</span>
									<span className="panel-sub">{alerts.length} alerts</span>
								</div>
								{alerts.length === 0 ? (
									<div className="empty-state">No alerts</div>
								) : (
									alerts.map((a) => {
										const sv = sevMap[a.severity];
										return (
											<div key={a.id} className="alert-row">
												<span className="alert-sev" style={{ color: sv.color, background: sv.bg }}>{sv.label}</span>
												<div style={{ flex: 1 }}>
													<div className="alert-id">{a.id}</div>
													<div className="alert-msg">{a.msg}</div>
												</div>
												<div className="alert-time">{a.time}</div>
											</div>
										);
									})
								)}
							</div>

							{/* Risk segments */}
							<div className="panel">
								<div className="panel-head">
									<span className="panel-title">Portfolio Risk</span>
									<span className="panel-sub">{riskSegments.reduce((sum, r) => sum + r.count, 0)} loans</span>
								</div>
								{riskSegments.length === 0 ? (
									<div className="empty-state">No risk data</div>
								) : (
									riskSegments.map((r) => (
										<div key={r.label} className="seg-row">
											<div className="seg-info">
												<span className="seg-label">{r.label}</span>
												<div style={{ textAlign: "right" }}>
													<div className="seg-count" style={{ color: r.color }}>{r.count}</div>
													<div className="seg-pct">{r.pct}%</div>
												</div>
											</div>
											<div className="seg-bar-bg">
												<div className="seg-bar" style={{ width: `${r.pct}%`, background: r.color }} />
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</DashboardLayout>
	);
}