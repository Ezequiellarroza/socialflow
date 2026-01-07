import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService, { AdminStats } from '../../services/admin';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white">shield_person</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Super Admin</h1>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link to="/admin/dashboard" className="text-white font-medium">Dashboard</Link>
            <Link to="/admin/agencias" className="text-gray-400 hover:text-white transition-colors">Agencias</Link>
            <Link to="/admin/pagos" className="text-gray-400 hover:text-white transition-colors">Pagos</Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-indigo-400 text-3xl">business</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Total</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.resumen.total_agencias}</p>
                <p className="text-gray-400 text-sm mt-1">Agencias registradas</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="text-green-400">{stats.resumen.agencias_activas} activas</span>
                  <span className="text-gray-500">{stats.resumen.agencias_inactivas} inactivas</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-green-400 text-3xl">payments</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Ingresos</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.ingresos.total)}</p>
                <p className="text-gray-400 text-sm mt-1">Total recaudado</p>
                <div className="mt-3 text-xs">
                  <span className="text-green-400">{formatCurrency(stats.ingresos.mes_actual)} este mes</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-amber-400 text-3xl">pending_actions</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Pendiente</span>
                </div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.ingresos.pendientes_monto)}</p>
                <p className="text-gray-400 text-sm mt-1">Por cobrar</p>
                <div className="mt-3 text-xs">
                  <span className="text-amber-400">{stats.ingresos.pendientes_cantidad} pagos pendientes</span>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <span className="material-symbols-outlined text-purple-400 text-3xl">group</span>
                  <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">Usuarios</span>
                </div>
                <p className="text-3xl font-bold text-white">{stats.resumen.total_clientes}</p>
                <p className="text-gray-400 text-sm mt-1">Clientes totales</p>
                <div className="mt-3 text-xs">
                  <span className="text-purple-400">{stats.resumen.total_publicaciones} publicaciones</span>
                </div>
              </div>
            </div>

            {/* Agencias por Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Agencias por Plan</h2>
                <div className="space-y-3">
                  {stats.agencias_por_plan.map((item) => (
                    <div key={item.plan} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${
                          item.plan === 'enterprise' ? 'bg-purple-500' :
                          item.plan === 'pro' ? 'bg-indigo-500' :
                          item.plan === 'basic' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="text-gray-300 capitalize">{item.plan || 'Sin plan'}</span>
                      </div>
                      <span className="text-white font-semibold">{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Alertas</h2>
                <div className="space-y-3">
                  {stats.resumen.agencias_vencidas > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <span className="material-symbols-outlined text-red-400">warning</span>
                      <span className="text-red-300">{stats.resumen.agencias_vencidas} agencias con plan vencido</span>
                    </div>
                  )}
                  {stats.ingresos.pendientes_cantidad > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <span className="material-symbols-outlined text-amber-400">schedule</span>
                      <span className="text-amber-300">{stats.ingresos.pendientes_cantidad} pagos pendientes de confirmación</span>
                    </div>
                  )}
                  {stats.resumen.agencias_vencidas === 0 && stats.ingresos.pendientes_cantidad === 0 && (
                    <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="material-symbols-outlined text-green-400">check_circle</span>
                      <span className="text-green-300">Todo en orden</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Últimas Agencias y Pagos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Últimas Agencias</h2>
                  <Link to="/admin/agencias" className="text-indigo-400 hover:text-indigo-300 text-sm">Ver todas</Link>
                </div>
                <div className="space-y-3">
                  {stats.ultimas_agencias.map((agencia) => (
                    <div key={agencia.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{agencia.nombre_agencia}</p>
                        <p className="text-gray-400 text-sm">{formatDate(agencia.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        agencia.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                        agencia.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300' :
                        agencia.plan === 'basic' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                      }`}>
                        {agencia.plan}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Últimos Pagos</h2>
                  <Link to="/admin/pagos" className="text-indigo-400 hover:text-indigo-300 text-sm">Ver todos</Link>
                </div>
                <div className="space-y-3">
                  {stats.ultimos_pagos.length > 0 ? stats.ultimos_pagos.map((pago) => (
                    <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{pago.nombre_agencia}</p>
                        <p className="text-gray-400 text-sm">{formatDate(pago.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{formatCurrency(pago.monto, pago.moneda)}</p>
                        <span className={`text-xs ${
                          pago.estado === 'pagado' ? 'text-green-400' :
                          pago.estado === 'pendiente' ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {pago.estado}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500 text-center py-4">No hay pagos registrados</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;