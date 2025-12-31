
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import ContentCreation from './pages/ContentCreation';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import LoginPage from './pages/LoginPage';
import ClientsPage from './pages/ClientsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import SettingsPage from './pages/SettingsPage';

// Layout para las páginas internas (Dashboard)
const DashboardLayout: React.FC<{ children: React.ReactNode, onLogout: () => void }> = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden font-display antialiased">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
        <header className="flex items-center justify-between border-b border-border-dark bg-[#111418]/95 backdrop-blur-md px-6 py-4 z-10 sticky top-0">
           <div className="flex flex-col lg:hidden">
              <h1 className="text-white text-lg font-bold">Agencia Panel</h1>
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-[#9da8b9] text-xs font-medium">Portal de Agencia</span>
           </div>
           <div className="flex items-center gap-4 flex-1 justify-end">
              <div className="hidden md:flex w-full max-w-sm items-center rounded-xl bg-[#1a1d23] border border-transparent focus-within:border-primary/50 transition-colors h-10 px-3 gap-2">
                 <span className="material-symbols-outlined text-[#9da8b9] text-[20px]">search</span>
                 <input className="bg-transparent border-none text-white placeholder-[#9da8b9] text-sm w-full focus:ring-0 p-0" placeholder="Buscar clientes..." />
              </div>
              <div className="flex items-center gap-2 border-l border-[#282f39] pl-4">
                 <button onClick={onLogout} className="text-[#9da8b9] hover:text-white text-xs font-bold uppercase tracking-wider">Salir</button>
                 <button className="size-10 rounded-full hover:bg-[#282f39] text-[#9da8b9] flex items-center justify-center">
                    <span className="material-symbols-outlined">notifications</span>
                 </button>
                 <div className="size-10 rounded-full border-2 border-[#282f39] bg-cover bg-center cursor-pointer" style={{backgroundImage: 'url(https://picsum.photos/seed/user/100/100)'}}></div>
              </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth scrollbar-hide">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/checkout" element={<Checkout onComplete={handleLogin} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Rutas Privadas */}
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><Dashboard /></DashboardLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/clients" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><ClientsPage /></DashboardLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/calendar" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><CalendarView /></DashboardLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/approvals" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><ApprovalsPage /></DashboardLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/settings" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><SettingsPage /></DashboardLayout> : <Navigate to="/login" />} 
        />
        <Route 
          path="/content/new" 
          element={isLoggedIn ? <DashboardLayout onLogout={handleLogout}><ContentCreation /></DashboardLayout> : <Navigate to="/login" />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
