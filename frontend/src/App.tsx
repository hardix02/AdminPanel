import { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { getCurrentUser } from './services/authService';
import Login from './pages/auth/Login';
import AlgoAccess from './pages/AlgoAccess';

function App() {
  const { isAuthenticated, token, isBootstrapping, setUser, finishBootstrap, logout } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!token) {
        finishBootstrap();
        return;
      }

      try {
        const user = await getCurrentUser();
        if (isMounted) {
          setUser(user);
          finishBootstrap();
        }
      } catch {
        if (isMounted) {
          logout();
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [finishBootstrap, logout, setUser, token]);

  if (isBootstrapping) {
    return <div className="app-loading-screen">Loading dashboard...</div>;
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? <AlgoAccess /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
