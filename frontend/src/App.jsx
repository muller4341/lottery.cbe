import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HousesPage from './pages/HousesPage.jsx';
import ApplicantsPage from './pages/ApplicantsPage.jsx';
import LotteryPage from './pages/LotteryPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import AppLayout from './layouts/AppLayout.jsx';

function ProtectedRoute({ children }) {
  const { admin } = useAuth();
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="houses" element={<HousesPage />} />
        <Route path="applicants" element={<ApplicantsPage />} />
        <Route path="lottery" element={<LotteryPage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/:id" element={<ResultsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
