import { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DataTable from "../../components/common/Table";
import { apiGet } from "../../utils/apiClient";

const roleColors = {
  Admin:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  Lender:   { color: "#2dd4bf", bg: "rgba(45,212,191,0.1)" },
  Borrower: { color: "#818cf8", bg: "rgba(129,140,248,0.1)" },
  Analyst:  { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
};

const statusColors = {
  Active:   { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  Disabled: { color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

const columns = [
  { key: "id", label: "User ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  {
    key: "role",
    label: "Role",
    render: (val) => {
      const s = roleColors[val] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
      return (
        <span
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "3px 9px",
            borderRadius: 6,
            color: s.color,
            background: s.bg,
            border: `1px solid ${s.color}33`,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {val}
        </span>
      );
    },
  },
  {
    key: "status",
    label: "Status",
    render: (val) => {
      const s = statusColors[val] || { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: "11px",
            fontWeight: 500,
            color: s.color,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: s.color,
              boxShadow: `0 0 6px ${s.color}`,
            }}
          />
          {val}
        </span>
      );
    },
  },
  { key: "joinDate", label: "Joined" },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiGet("/admin/users/list");
        if (response && response.data && Array.isArray(response.data)) {
          // Map backend users to table format
          const mappedUsers = response.data.map((user, index) => ({
            id: `USR${String(index + 1).padStart(3, "0")}`,
            name: user.fullName || "N/A",
            email: user.email,
            role: user.role.charAt(0) + user.role.slice(1).toLowerCase(),
            status: "Active",
            joinDate: new Date(user.createdAt).toISOString().split('T')[0],
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalActive = users.filter((u) => u.status === "Active").length;
  const totalDisabled = users.filter((u) => u.status === "Disabled").length;

  const summaryStats = [
    { title: "Total Users", value: users.length, accent: "#f59e0b", icon: "◑" },
    { title: "Active", value: totalActive, accent: "#34d399", icon: "◈" },
    { title: "Disabled", value: totalDisabled, accent: "#f87171", icon: "◐" },
    { title: "Roles", value: "4", accent: "#818cf8", icon: "◒" },
  ];

  return (
    <DashboardLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .usr-root { display:flex; flex-direction:column; gap:32px; }
        .usr-header { display:flex; flex-direction:column; gap:6px; }
        .usr-eyebrow {
          font-size:10.5px; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:#f59e0b;
          font-family:'DM Sans',sans-serif;
          display:flex; align-items:center; gap:8px;
        }
        .usr-eyebrow::before { content:''; width:18px; height:1px; background:#f59e0b; opacity:0.6; }
        .usr-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#f0f4f8; letter-spacing:-0.02em; }
        .usr-sub { font-size:13.5px; font-weight:300; color:#64748b; font-family:'DM Sans',sans-serif; }

        .usr-stats { display:grid; gap:12px; grid-template-columns:repeat(4,1fr); }
        @media(max-width:800px) { .usr-stats { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px) { .usr-stats { grid-template-columns:1fr; } }

        .usr-stat {
          background:rgba(13,20,32,0.85);
          border:1px solid rgba(255,255,255,0.06);
          border-radius:14px; padding:18px 20px 14px;
          position:relative; overflow:hidden;
          transition:border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          cursor:default;
        }
        .usr-stat:hover {
          border-color:var(--ac-border);
          transform:translateY(-2px);
          box-shadow:0 12px 40px rgba(0,0,0,0.4), 0 0 20px var(--ac-glow);
        }
        .usr-stat::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--ac),transparent);
          opacity:0.5; transition:opacity 0.2s;
        }
        .usr-stat:hover::before { opacity:1; }
        .usr-stat-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
        .usr-stat-label {
          font-size:10.5px; font-weight:600; letter-spacing:0.1em;
          text-transform:uppercase; color:#475569; font-family:'DM Sans',sans-serif;
        }
        .usr-stat-icon { font-size:15px; color:var(--ac); opacity:0.7; }
        .usr-stat-value {
          font-family:'Syne',sans-serif; font-size:28px; font-weight:800;
          color:#f0f4f8; letter-spacing:-0.02em;
        }
      `}</style>

      <div className="usr-root">
        <div className="usr-header">
          <div className="usr-eyebrow">Admin Portal</div>
          <h1 className="usr-title">Users Management</h1>
          <p className="usr-sub">Platform users across all roles — read-only view.</p>
        </div>

        {/* Summary stats */}
        <div className="usr-stats">
          {summaryStats.map((s) => (
            <div
              key={s.title}
              className="usr-stat"
              style={{ "--ac": s.accent, "--ac-border": s.accent + "44", "--ac-glow": s.accent + "18" }}
            >
              <div className="usr-stat-top">
                <span className="usr-stat-label">{s.title}</span>
                <span className="usr-stat-icon">{s.icon}</span>
              </div>
              <div className="usr-stat-value">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Users table */}
        {loading ? (
          <div style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>Loading users...</div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            filterKey="role"
            filterOptions={["Admin", "Lender", "Borrower", "Analyst"]}
            pageSize={8}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
