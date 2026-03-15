import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { NewService } from './pages/NewService';
import { Staff } from './pages/Staff';
import { Tickets } from './pages/Tickets';
import { Payroll } from './pages/Payroll';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { appRole, isAdminAuthenticated } = useStore();
  
  if (appRole !== 'admin' || !isAdminAuthenticated) {
    return <Navigate to="/service" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const { fetchInitialData } = useStore();

  useEffect(() => {
    fetchInitialData();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#C8B560',
              secondary: '#111',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#111',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="service" element={<NewService />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="payroll" element={<AdminRoute><Payroll /></AdminRoute>} />
          <Route path="staff" element={<AdminRoute><Staff /></AdminRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
