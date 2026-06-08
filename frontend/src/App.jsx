import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import useThemeStore from './store/themeStore';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFilieres from './pages/admin/AdminFilieres';
import AdminClasses from './pages/admin/AdminClasses';
import AdminProfesseurs from './pages/admin/AdminProfesseurs';
import AdminMatieres from './pages/admin/AdminMatieres';
import AdminStudents from './pages/admin/AdminStudents';
import AdminInvitations from './pages/admin/AdminInvitations';
import AdminReports from './pages/admin/AdminReports';
import AdminAdmins from './pages/admin/AdminAdmins';
import StudentPortal from './pages/student/StudentPortal';
import EvalEnseignement from './pages/student/EvalEnseignement';
import EvalQualite from './pages/student/EvalQualite';
import EvalFormation from './pages/student/EvalFormation';
import MesEvaluations from './pages/student/MesEvaluations';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-lg w-full shadow-sm">
            <div className="text-red-600 font-bold text-lg mb-2">Erreur de rendu</div>
            <div className="text-slate-600 text-sm mb-4">{this.state.error.message}</div>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
              Recharger
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/portail'} replace />;
  return children;
};

export default function App() {
  const { isDark, init } = useThemeStore();
  useEffect(() => { init(isDark); }, []);
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Segoe UI, sans-serif' },
          success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
          error:   { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<ErrorBoundary><AdminDashboard /></ErrorBoundary>} />
          <Route path="filieres"    element={<ErrorBoundary><AdminFilieres /></ErrorBoundary>} />
          <Route path="classes"     element={<ErrorBoundary><AdminClasses /></ErrorBoundary>} />
          <Route path="professeurs" element={<ErrorBoundary><AdminProfesseurs /></ErrorBoundary>} />
          <Route path="matieres"    element={<ErrorBoundary><AdminMatieres /></ErrorBoundary>} />
          <Route path="students"    element={<ErrorBoundary><AdminStudents /></ErrorBoundary>} />
          <Route path="invitations" element={<ErrorBoundary><AdminInvitations /></ErrorBoundary>} />
          <Route path="reports"     element={<ErrorBoundary><AdminReports /></ErrorBoundary>} />
          <Route path="admins"      element={<ErrorBoundary><AdminAdmins /></ErrorBoundary>} />
        </Route>

        <Route path="/portail" element={<PrivateRoute role="student"><StudentLayout /></PrivateRoute>}>
          <Route index element={<StudentPortal />} />
          <Route path="evaluer/:cmpId" element={<EvalEnseignement />} />
          <Route path="qualite"        element={<EvalQualite />} />
          <Route path="formation"      element={<EvalFormation />} />
          <Route path="mes-evaluations" element={<MesEvaluations />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
