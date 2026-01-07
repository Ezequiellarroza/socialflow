import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';

// Páginas de Agencia
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import CalendarView from './pages/CalendarView';
import ContentCreation from './pages/ContentCreation';
import ApprovalsPage from './pages/ApprovalsPage';
import SettingsPage from './pages/SettingsPage';
import Sidebar from './components/Sidebar';
import MobileHeader from './components/MobileHeader';

// Páginas de Cliente
import { ClienteLoginPage, ClienteDashboard } from './pages/cliente';

// Páginas de Admin
import { AdminLoginPage, AdminDashboard, AdminAgencias, AdminPagos } from './pages/admin';

// Layout para páginas de Agencia (con Sidebar)
// Layout para páginas de Agencia (con Sidebar)
const AgenciaLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background-dark flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <MobileHeader onMenuToggle={() => setSidebarOpen(true)} />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

// Componente para rutas protegidas de AGENCIA
const AgenciaRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.user_type === 'cliente') {
    return <Navigate to="/cliente/dashboard" replace />;
  }

  if (user?.user_type === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AgenciaLayout>{children}</AgenciaLayout>;
};

// Componente para rutas protegidas de CLIENTE
const ClienteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cliente/login" replace />;
  }

  if (user?.user_type === 'agencia') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.user_type === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas protegidas de SUPER ADMIN
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user?.user_type !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Componente para rutas del PORTAL (marca blanca)
const PortalRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#9da8b9]">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/portal/${slug}/login`} replace />;
  }

  if (user?.user_type === 'agencia') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Wrapper para login del portal (carga branding)
const PortalLoginWrapper: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user?.user_type === 'cliente') {
    return <Navigate to={`/portal/${slug}/dashboard`} replace />;
  }

  return <ClienteLoginPage />;
};

// Redirige /portal/:slug a /portal/:slug/login
const PortalRedirect: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/portal/${slug}/login`} replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Login Agencia */}
      <Route 
        path="/login" 
        element={
          isAuthenticated && user?.user_type === 'agencia' 
            ? <Navigate to="/dashboard" replace /> 
            : <LoginPage />
        } 
      />

      {/* Login Cliente */}
      <Route 
        path="/cliente/login" 
        element={
          isAuthenticated && user?.user_type === 'cliente' 
            ? <Navigate to="/cliente/dashboard" replace /> 
            : <ClienteLoginPage />
        } 
      />

      {/* ========== RUTAS DE AGENCIA ========== */}
      <Route path="/dashboard" element={<AgenciaRoute><Dashboard /></AgenciaRoute>} />
      <Route path="/clients" element={<AgenciaRoute><ClientsPage /></AgenciaRoute>} />
      <Route path="/calendar" element={<AgenciaRoute><CalendarView /></AgenciaRoute>} />
      <Route path="/create" element={<AgenciaRoute><ContentCreation /></AgenciaRoute>} />
      <Route path="/approvals" element={<AgenciaRoute><ApprovalsPage /></AgenciaRoute>} />
      <Route path="/settings" element={<AgenciaRoute><SettingsPage /></AgenciaRoute>} />

      {/* ========== RUTAS DE CLIENTE (legacy) ========== */}
      <Route path="/cliente/dashboard" element={<ClienteRoute><ClienteDashboard /></ClienteRoute>} />

      {/* ========== PORTAL MARCA BLANCA ========== */}
      <Route path="/portal/:slug/login" element={<PortalLoginWrapper />} />
      <Route path="/portal/:slug/dashboard" element={<PortalRoute><ClienteDashboard /></PortalRoute>} />
      <Route path="/portal/:slug" element={<PortalRedirect />} />

      {/* ========== RUTAS DE SUPER ADMIN ========== */}
      <Route 
        path="/admin/login" 
        element={
          isAuthenticated && user?.user_type === 'super_admin'
            ? <Navigate to="/admin/dashboard" replace />
            : <AdminLoginPage />
        } 
      />
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/agencias" element={<AdminRoute><AdminAgencias /></AdminRoute>} />
      <Route path="/admin/pagos" element={<AdminRoute><AdminPagos /></AdminRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrandingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </BrandingProvider>
    </AuthProvider>
  );
};

export default App;
