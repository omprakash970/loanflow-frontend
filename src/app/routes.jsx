import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import NotFound from "../pages/NotFound";

// Dashboards
import AdminDashboard from "../features/admin/AdminDashboard";
import LenderDashboard from "../features/lender/LenderDashboard";
import BorrowerDashboard from "../features/borrower/BorrowerDashboard";
import AnalystDashboard from "../features/analyst/AnalystDashboard";

// Borrower features
import ApplyLoan from "../features/borrower/ApplyLoan";
import MyLoans from "../features/borrower/MyLoans";
import EmiSchedule from "../features/borrower/EmiSchedule";
import Profile from "../features/borrower/Profile";
import LoanOffers from "../features/borrower/LoanOffers";

// Lender features
import CreateLoan from "../features/lender/CreateLoan";
import ActiveLoans from "../features/lender/ActiveLoans";
import Borrowers from "../features/lender/Borrowers";
import Payments from "../features/lender/Payments";
import OpenRequests from "../features/lender/OpenRequests";

// Admin features
import LoansOverview from "../features/admin/LoansOverview";
import Users from "../features/admin/Users";
import SecurityLogs from "../features/admin/SecurityLogs";
import Settings from "../features/admin/Settings";

// Analyst features
import RiskReports from "../features/analyst/RiskReports";
import Analytics from "../features/analyst/Analytics";
import Trends from "../features/analyst/Trends";
import Exports from "../features/analyst/Exports";

function RoleDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "LENDER":
      return <LenderDashboard />;
    case "ANALYST":
      return <AnalystDashboard />;
    case "BORROWER":
      return <BorrowerDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <RoleDashboard />
            </ProtectedRoute>
          }
        />

        {/* Borrower routes */}
        <Route
          path="/app/apply-loan"
          element={
            <ProtectedRoute allowedRoles={["BORROWER"]}>
              <ApplyLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/loan-offers"
          element={
            <ProtectedRoute allowedRoles={["BORROWER"]}>
              <LoanOffers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/my-loans"
          element={
            <ProtectedRoute allowedRoles={["BORROWER"]}>
              <MyLoans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/emi-schedule"
          element={
            <ProtectedRoute allowedRoles={["BORROWER"]}>
              <EmiSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/profile"
          element={
            <ProtectedRoute allowedRoles={["BORROWER"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Lender routes */}
        <Route
          path="/app/create-loan"
          element={
            <ProtectedRoute allowedRoles={["LENDER"]}>
              <CreateLoan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/open-requests"
          element={
            <ProtectedRoute allowedRoles={["LENDER"]}>
              <OpenRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/active-loans"
          element={
            <ProtectedRoute allowedRoles={["LENDER"]}>
              <ActiveLoans />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/borrowers"
          element={
            <ProtectedRoute allowedRoles={["LENDER"]}>
              <Borrowers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/payments"
          element={
            <ProtectedRoute allowedRoles={["LENDER"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/app/loans-overview"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <LoansOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/security"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SecurityLogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/settings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Analyst routes */}
        <Route
          path="/app/risk-reports"
          element={
            <ProtectedRoute allowedRoles={["ANALYST"]}>
              <RiskReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/analytics"
          element={
            <ProtectedRoute allowedRoles={["ANALYST"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/trends"
          element={
            <ProtectedRoute allowedRoles={["ANALYST"]}>
              <Trends />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/exports"
          element={
            <ProtectedRoute allowedRoles={["ANALYST"]}>
              <Exports />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}