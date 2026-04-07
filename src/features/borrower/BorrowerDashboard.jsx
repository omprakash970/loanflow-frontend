import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { apiGet } from "../../utils/apiClient";

export default function BorrowerDashboard() {
	const [loans, setLoans] = useState([]);
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch borrower's loans
				const loansRes = await apiGet("/loans/my-loans");
				setLoans(loansRes?.data || []);

				// Fetch payment history (if endpoint exists)
				try {
					const paymentsRes = await apiGet("/borrower/payments");
					setPayments(paymentsRes?.data || []);
				} catch {
					console.log("Payments endpoint not available yet");
					setPayments([]);
				}
			} catch (err) {
				console.error("Failed to fetch borrower data:", err);
				setLoans([]);
				setPayments([]);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);


	const upcomingEMIs = loans.length > 0 && loans[0].emiSchedule 
		? loans[0].emiSchedule.filter(e => e.status === "upcoming" || e.status === "scheduled").slice(0, 5)
		: [];

	const paymentHistory = payments.slice(0, 5).map((p) => ({
		date: new Date(p.paymentDate).toLocaleDateString(),
		amount: `$${p.amount}`,
		method: p.paymentMethod || "Auto-Pay",
		status: p.status || "paid",
	}));
	return (
		<DashboardLayout>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .br-root { display:flex; flex-direction:column; gap:32px; }
        .br-header { display:flex; flex-direction:column; gap:6px; }
        .br-eyebrow { font-size:10.5px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; display:flex; align-items:center; gap:8px; }
        .br-eyebrow::before { content:''; width:18px; height:1px; background:#818cf8; opacity:0.6; }
        .br-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .br-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .empty-state { 
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:60px 20px; text-align:center;
          background:rgba(13,20,32,0.5); border:1px dashed rgba(255,255,255,0.1);
          border-radius:14px;
        }
        .empty-icon { font-size:48px; opacity:0.6; margin-bottom:16px; }
        .empty-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:700; color:#cbd5e1; margin-bottom:8px; }
        .empty-sub { font-size:13px; color:#64748b; margin-bottom:24px; max-width:400px; }

        /* Loan progress banner */
        .loan-banner {
          background:rgba(129,140,248,0.07);
          border:1px solid rgba(129,140,248,0.2);
          border-radius:14px; padding:20px 24px;
          display:flex; align-items:center; gap:24px;
          flex-wrap:wrap;
        }
        .loan-banner-left { flex:1; min-width:200px; }
        .loan-banner-label { font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#818cf8; font-family:'DM Sans',sans-serif; margin-bottom:6px; }
        .loan-banner-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#f0f4f8; margin-bottom:12px; }
        .progress-track { height:6px; background:rgba(255,255,255,0.06); border-radius:6px; overflow:hidden; width:100%; }
        .progress-fill { height:100%; border-radius:6px; background:linear-gradient(90deg,#818cf8,#6366f1); box-shadow:0 0 12px rgba(129,140,248,0.4); }
        .progress-label { font-size:11.5px; color:#475569; font-family:'DM Sans',sans-serif; margin-top:6px; }
        .loan-banner-right { display:flex; gap:20px; }
        .loan-stat { text-align:center; }
        .loan-stat-val { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#f0f4f8; }
        .loan-stat-label { font-size:11px; color:#475569; font-family:'DM Sans',sans-serif; margin-top:3px; }

        /* Stats */
        .br-stats { display:grid; gap:12px; grid-template-columns:repeat(3,1fr); }
        @media(max-width:900px) { .br-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:560px) { .br-stats { grid-template-columns:1fr; } }

        .bstat { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:14px; padding:18px 20px 14px; position:relative; overflow:hidden; transition:border-color 0.2s,transform 0.2s,box-shadow 0.2s; cursor:default; }
        .bstat:hover { border-color:var(--ac-b); transform:translateY(-2px); box-shadow:0 12px 36px rgba(0,0,0,0.4),0 0 18px var(--ac-g); }
        .bstat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--ac),transparent); opacity:0.4; transition:opacity 0.2s; }
        .bstat:hover::before { opacity:1; }
        .bstat-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .bstat-label { font-size:10.5px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif; }
        .bstat-icon { font-size:15px; color:var(--ac); opacity:0.7; }
        .bstat-value { font-family:'Syne',sans-serif; font-size:26px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; margin-bottom:5px; }
        .bstat-meta { font-size:12px; font-weight:300; color:#334155; font-family:'DM Sans',sans-serif; }

        /* Bottom */
        .br-bottom { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media(max-width:780px) { .br-bottom { grid-template-columns:1fr; } }

        .panel { background:rgba(13,20,32,0.85); border:1px solid rgba(255,255,255,0.06); border-radius:14px; overflow:hidden; }
        .panel-head { padding:16px 20px 12px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; }
        .panel-title { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#f0f4f8; }
        .panel-sub { font-size:10.5px; color:#2e3f52; font-family:'DM Sans',sans-serif; text-transform:uppercase; letter-spacing:0.08em; }

        .emi-row { display:flex; align-items:center; gap:12px; padding:11px 20px; border-bottom:1px solid rgba(255,255,255,0.03); }
        .emi-row:last-child { border-bottom:none; }
        .emi-month { font-size:13px; font-weight:500; color:#cbd5e1; font-family:'DM Sans',sans-serif; flex:1; }
        .emi-amt { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#f0f4f8; }
        .emi-badge { font-size:9.5px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:3px 8px; border-radius:6px; }
        .badge-upcoming { color:#818cf8; background:rgba(129,140,248,0.12); border:1px solid rgba(129,140,248,0.25); }
        .badge-sched { color:#2e3f52; background:rgba(255,255,255,0.03); }

        .pay-row { display:flex; align-items:center; gap:12px; padding:11px 20px; border-bottom:1px solid rgba(255,255,255,0.03); }
        .pay-row:last-child { border-bottom:none; }
        .pay-date { font-size:12px; color:#64748b; font-family:'DM Sans',sans-serif; flex:1; }
        .pay-method { font-size:11px; color:#334155; font-family:'DM Sans',sans-serif; }
        .pay-amt { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#34d399; }
        .pay-dot { width:7px; height:7px; border-radius:50%; background:#34d399; box-shadow:0 0 6px #34d399; flex-shrink:0; }
      `}</style>

			<div className="br-root">
				<div className="br-header">
					<div className="br-eyebrow">Borrower Portal</div>
					<h1 className="br-title">My Loan Account</h1>
					<p className="br-sub">Balances, EMI schedule, and payment history at a glance.</p>
				</div>

				{loading ? (
					<div style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>Loading...</div>
				) : loans.length === 0 ? (
					<div className="empty-state">
						<div className="empty-icon">◈</div>
						<div className="empty-title">No Loans Yet</div>
						<div className="empty-sub">You don't have any active loans. Start by applying for a loan to get organized.</div>
					</div>
				) : (
					<>
						{/* Loan progress banner */}
						{loans[0] && (
							<div className="loan-banner">
								<div className="loan-banner-left">
									<div className="loan-banner-label">Loan Repayment Progress</div>
									<div className="loan-banner-val">{loans[0].loanType || "Loan"} · ${loans[0].amount?.toLocaleString() || 0}</div>
									<div className="progress-track">
										<div className="progress-fill" style={{ width: `${Math.round(((loans[0].totalEmis - loans[0].emisPending) / loans[0].totalEmis) * 100) || 0}%` }} />
									</div>
									<div className="progress-label">{Math.round(((loans[0].totalEmis - loans[0].emisPending) / loans[0].totalEmis) * 100) || 0}% paid · {loans[0].emisPaid || 0} of {loans[0].totalEmis || 0} EMIs completed</div>
								</div>
								<div className="loan-banner-right">
									<div className="loan-stat">
										<div className="loan-stat-val" style={{ color: "#818cf8" }}>${(loans[0].outstandingAmount || 0).toLocaleString()}</div>
										<div className="loan-stat-label">Remaining</div>
									</div>
									<div className="loan-stat">
										<div className="loan-stat-val" style={{ color: "#34d399" }}>${(loans[0].amountPaid || 0).toLocaleString()}</div>
										<div className="loan-stat-label">Paid</div>
									</div>
									<div className="loan-stat">
										<div className="loan-stat-val" style={{ color: "#fb923c" }}>{loans[0].daysTillNextEMI || 0} days</div>
										<div className="loan-stat-label">Next EMI</div>
									</div>
								</div>
							</div>
						)}

						{/* Bottom panels */}
						<div className="br-bottom">
							<div className="panel">
								<div className="panel-head">
									<span className="panel-title">Upcoming EMIs</span>
									<span className="panel-sub">${(loans[0]?.monthlyEMI || 0).toLocaleString()} / mo</span>
								</div>
								{upcomingEMIs.length > 0 ? (
									upcomingEMIs.map((e, idx) => (
										<div key={idx} className="emi-row">
											<div className="emi-month">{new Date(e.dueDate).toLocaleDateString("en", { month: "short", year: "numeric" })}</div>
											<div className="emi-amt">${e.amount}</div>
											<span className={`emi-badge ${e.status === "upcoming" ? "badge-upcoming" : "badge-sched"}`}>
												{e.status === "upcoming" ? `Due in ${e.daysLeft || 0}d` : "Scheduled"}
											</span>
										</div>
									))
								) : (
									<div style={{ padding: "20px", textAlign: "center", color: "#475569" }}>No upcoming EMIs</div>
								)}
							</div>

							<div className="panel">
								<div className="panel-head">
									<span className="panel-title">Payment History</span>
									<span className="panel-sub">{payments.length > 0 ? "Latest" : "None"}</span>
								</div>
								{paymentHistory.length > 0 ? (
									paymentHistory.map((p, idx) => (
										<div key={idx} className="pay-row">
											<div>
												<div className="pay-date">{p.date}</div>
												<div className="pay-method">{p.method}</div>
											</div>
											<div className="pay-amt">{p.amount}</div>
											<div className="pay-dot" />
										</div>
									))
								) : (
									<div style={{ padding: "20px", textAlign: "center", color: "#475569" }}>No payments yet</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</DashboardLayout>
	);
}