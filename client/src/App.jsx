import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import { Navbar } from './components/Navbar.jsx';
import { Footer } from './components/Footer.jsx';

import { ExplorePage } from './pages/ExplorePage.jsx';
import { ProjectDetailPage } from './pages/ProjectDetailPage.jsx';
import { InsightsPage } from './pages/InsightsPage.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { NewReportPage } from './pages/NewReportPage.jsx';
import { MyReportsPage } from './pages/MyReportsPage.jsx';
import { ReportDetailPage } from './pages/ReportDetailPage.jsx';
import { AdminOverviewPage } from './pages/AdminOverviewPage.jsx';
import { AdminProjectsPage } from './pages/AdminProjectsPage.jsx';
import { AdminReportsPage } from './pages/AdminReportsPage.jsx';
import { AdminCoordinationPage } from './pages/AdminCoordinationPage.jsx';

function ProtectedResidentRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function ProtectedOfficialRoute({ children }) {
  const { user, isOfficial, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user || !isOfficial) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ExplorePage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Resident Routes */}
              <Route path="/reports/new" element={<NewReportPage />} />
              <Route
                path="/my-reports"
                element={
                  <ProtectedResidentRoute>
                    <MyReportsPage />
                  </ProtectedResidentRoute>
                }
              />
              <Route
                path="/reports/:id"
                element={
                  <ProtectedResidentRoute>
                    <ReportDetailPage />
                  </ProtectedResidentRoute>
                }
              />

              {/* Official Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedOfficialRoute>
                    <AdminOverviewPage />
                  </ProtectedOfficialRoute>
                }
              />
              <Route
                path="/admin/projects"
                element={
                  <ProtectedOfficialRoute>
                    <AdminProjectsPage />
                  </ProtectedOfficialRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedOfficialRoute>
                    <AdminReportsPage />
                  </ProtectedOfficialRoute>
                }
              />
              <Route
                path="/admin/coordination"
                element={
                  <ProtectedOfficialRoute>
                    <AdminCoordinationPage />
                  </ProtectedOfficialRoute>
                }
              />

              {/* Fallback to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
