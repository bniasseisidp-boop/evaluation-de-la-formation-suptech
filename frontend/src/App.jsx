import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
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
import StudentPortal from './pages/student/StudentPortal';
import EvalEnseignement from './pages/student/EvalEnseignement';
import EvalQualite from './pages/student/EvalQualite';
import EvalFormation from './pages/student/EvalFormation';
import MesEvaluations from './pages/student/MesEvaluations';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

const PrivateRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to={user?.role === 'admin' ? '/admin' : '/portail'} replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Segoe UI, sans-serif' },
          success: { style: { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' } },
          error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="filieres" element={<AdminFilieres />} />
          <Route path="classes" element={<AdminClasses />} />
          <Route path="professeurs" element={<AdminProfesseurs />} />
          <Route path="matieres" element={<AdminMatieres />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="invitations" element={<AdminInvitations />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>

        {/* Student */}
        <Route path="/portail" element={<PrivateRoute role="student"><StudentLayout /></PrivateRoute>}>
          <Route index element={<StudentPortal />} />
          <Route path="evaluer/:cmpId" element={<EvalEnseignement />} />
          <Route path="qualite" element={<EvalQualite />} />
          <Route path="formation" element={<EvalFormation />} />
          <Route path="mes-evaluations" element={<MesEvaluations />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
