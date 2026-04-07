import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet, apiPatch } from "../../utils/apiClient";


export default function AdminDashboard() {
	const [pendingLoans, setPendingLoans] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);

	useEffect(() => {
		const fetchPendingLoans = async () => {
			try {
				const response = await apiGet("/loans/pending");
				setPendingLoans(response?.data || []);
			} catch (err) {
				console.error("Failed to fetch pending loans:", err);
				setPendingLoans([]);
			} finally {
				setLoading(false);
			}
		};
		fetchPendingLoans();
	}, []);

	const handleApproveLoan = async (loanId) => {
		setActionLoading(loanId);
		try {
			await apiPatch(`/loans/${loanId}/approve`, {});
			setPendingLoans(pendingLoans.filter(l => l.id !== loanId));
		} catch (err) {
			console.error("Failed to approve loan:", err);
		} finally {
			setActionLoading(null);
		}
	};

	const handleRejectLoan = async (loanId) => {
		setActionLoading(loanId);
		try {
			await apiPatch(`/loans/${loanId}/reject`, {});
			setPendingLoans(pendingLoans.filter(l => l.id !== loanId));
		} catch (err) {
			console.error("Failed to reject loan:", err);
		} finally {
			setActionLoading(null);
		}
	};

	const dynamicStats = [
		{ title: "Total Loans Issued", value: "$0",   meta: "+0% vs last month",   icon: "◈", accent: "#f59e0b", trend: "up" },
		{ title: "Active Borrowers",   value: "0",    meta: "+0 new this week",    icon: "◉", accent: "#2dd4bf", trend: "up" },
		{ title: "Delinquency Rate",   value: "0%",   meta: "Down 0%",             icon: "◐", accent: "#34d399", trend: "down-good" },
		{ title: "Platform Users",     value: "1",    meta: "1 admin",             icon: "◑", accent: "#818cf8", trend: "neutral" },
		{ title: "Pending Approvals",  value: `${pendingLoans.length}`,    meta: pendingLoans.length > 0 ? `${pendingLoans.length} awaiting review` : "None",           icon: "◒", accent: "#f87171", trend: "warn" },
		{ title: "Monthly Revenue",    value: "$0",   meta: "+0% from last month", icon: "⬡", accent: "#fb923c", trend: "up" },
	];

	return (
		<DashboardLayout>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .adm-root { display:flex; flex-direction:column; gap:32px; }
        .adm-header { display:flex; flex-direction:column; gap:6px; }
        .adm-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#f59e0b;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .adm-eyebrow::before {
          content:''; width:18px; height:1px; background:#f59e0b; opacity:0.6;
        }
        .adm-title {
          font-family:'Syne',sans-serif; font-size:28px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.02em; line-height:1.1;
        }
        .adm-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        /* Stat grid */
        .adm-stats { display:grid; gap:12px; grid-template-columns:repeat(3,1fr); }
        @media(max-width:900px) { .adm-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:560px) { .adm-stats { grid-template-columns:1fr; } }

        .stat-card {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:20px 20px 16px;
          position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor:default;
        }
        .stat-card:hover {
          border-color:var(--ac-border);
          transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(0,0,0,0.4), 0 0 20px var(--ac-glow);
        }
        .stat-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--ac),transparent);
          opacity:0.5; transition:opacity 0.2s;
        }
        .stat-card:hover::before { opacity:1; }
        .stat-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .stat-label {
          font-size:10.5px; font-weight:600; letter-spacing:0.1em;
          text-transform:uppercase; color:#475569;
          font-family:'DM Sans',sans-serif;
        }
        .stat-icon { font-size:16px; color:var(--ac); opacity:0.7; }
        .stat-value {
          font-family:'Syne',sans-serif; font-size:30px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.02em; margin-bottom:8px;
        }
        .stat-meta {
          font-size:12px; font-weight:300; color:#334155;
          font-family:'DM Sans',sans-serif;
        }
        .stat-trend { display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:500; padding:2px 7px; border-radius:20px; margin-top:6px; }
        .trend-up    { color:#34d399; background:rgba(52,211,153,0.1); }
        .trend-down  { color:#f87171; background:rgba(248,113,113,0.1); }
        .trend-good  { color:#34d399; background:rgba(52,211,153,0.1); }
        .trend-warn  { color:#f59e0b; background:rgba(245,158,11,0.1); }

        /* Pending loans panel */
        .adm-pending { margin-top: 16px; }
        .panel {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; overflow:hidden;
        }
        .panel-head {
          padding:16px 20px 12px;
          border-bottom:1px solid rgba(255,255,255,0.05);
          display:flex; align-items:center; justify-content:space-between;
        }
        .panel-title {
          font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f0f4f8;
        }
        .panel-badge {
          font-size:10px; font-weight:600; letter-spacing:0.08em;
          text-transform:uppercase; padding:3px 8px; border-radius:6px;
          color:#64748b; background:rgba(255,255,255,0.04); font-family:'DM Sans',sans-serif;
        }

        .loan-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 20px;
          border-bottom:1px solid rgba(255,255,255,0.03);
        }
        .loan-row:last-child { border-bottom:none; }
        .loan-info { flex:1; }
        .loan-borrower { font-size:13px; font-weight:500; color:#e2e8f0; font-family:'DM Sans',sans-serif; }
        .loan-details { font-size:11px; color:#475569; font-family:'DM Sans',sans-serif; margin-top:3px; }
        .loan-amount { font-size:14px; font-weight:700; color:#818cf8; font-family:'Syne',sans-serif; }
        .loan-actions { display:flex; gap:8px; flex-shrink:0; }
        .loan-btn {
          padding:6px 12px; border:none; border-radius:6px;
          font-size:11px; font-weight:600; cursor:pointer;
          font-family:'DM Sans',sans-serif; transition:opacity 0.2s;
        }
        .loan-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .loan-btn:hover:not(:disabled) { opacity:0.85; }
        .btn-approve {
          background:#34d399; color:#0d1420;
        }
        .btn-reject {
          background:#f87171; color:#0d1420;
        }

        .empty-state {
          padding:24px; text-align:center; color:#475569;
          font-family:'DM Sans',sans-serif; font-size:13px;
        }
      `}</style>

			<div className="adm-root">
				{/* Header */}
				<div className="adm-header">
					<div className="adm-eyebrow">Admin Portal</div>
					<h1 className="adm-title">System Dashboard</h1>
					<p className="adm-sub">Platform-wide activity, compliance, and user management overview.</p>
				</div>

				{/* Stat cards */}
				<div className="adm-stats">
					{dynamicStats.map((s) => (
						<div
							key={s.title}
							className="stat-card"
							style={{ "--ac": s.accent, "--ac-border": s.accent + "44", "--ac-glow": s.accent + "18" }}
						>
							<div className="stat-top">
								<span className="stat-label">{s.title}</span>
								<span className="stat-icon">{s.icon}</span>
							</div>
							<div className="stat-value">{s.value}</div>
							<div className="stat-meta">{s.meta}</div>
							{s.trend === "up" && <div className="stat-trend trend-up">↑ Increasing</div>}
							{s.trend === "down-good" && <div className="stat-trend trend-good">↓ Improving</div>}
							{s.trend === "warn" && <div className="stat-trend trend-warn">⚠ Attention</div>}
						</div>
					))}
				</div>

				{/* Pending Loans Panel */}
				<div className="adm-pending">
					<div className="panel">
						<div className="panel-head">
							<span className="panel-title">Pending Loan Applications</span>
							<span className="panel-badge">{pendingLoans.length} pending</span>
						</div>
						{loading ? (
							<div className="empty-state">Loading...</div>
						) : pendingLoans.length === 0 ? (
							<div className="empty-state">No pending loan applications</div>
						) : (
							pendingLoans.map((loan) => (
								<div key={loan.id} className="loan-row">
									<div className="loan-info">
										<div className="loan-borrower">{loan.borrowerName}</div>
										<div className="loan-details">
											{loan.purpose} • {loan.tenure} months • Applied {new Date(loan.createdAt).toLocaleDateString()}
										</div>
									</div>
									<div className="loan-amount">${loan.amount?.toLocaleString()}</div>
									<div className="loan-actions">
										<button 
											className="loan-btn btn-approve"
											onClick={() => handleApproveLoan(loan.id)}
											disabled={actionLoading === loan.id}
										>
											{actionLoading === loan.id ? "..." : "Approve"}
										</button>
										<button 
											className="loan-btn btn-reject"
											onClick={() => handleRejectLoan(loan.id)}
											disabled={actionLoading === loan.id}
										>
											{actionLoading === loan.id ? "..." : "Reject"}
										</button>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}