import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { statsService, AgenciaStats, ClienteResumen } from '../services/stats';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AgenciaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.getAgenciaStats();
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.nombre?.split(' ')[0] || 'Usuario';

  const getClienteStatus = (cliente: ClienteResumen) => {
    if (cliente.requieren_modificacion > 0) return 'urgent';
    if (cliente.pendientes > 0) return 'pending';
    return 'active';
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'urgent':
        return { label: 'Requiere atención', color: 'text-red-500 bg-red-500/10', dot: 'bg-red-500' };
      case 'pending':
        return { label: 'Pendientes', color: 'text-yellow-500 bg-yellow-500/10', dot: 'bg-yellow-500' };
      default:
        return { label: 'Al día', color: 'text-emerald-500 bg-emerald-500/10', dot: 'bg-emerald-500' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-[#9da8b9] text-sm">Cargando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const resumen = stats?.resumen;
  const clientes = stats?.clientes || [];

  const statsCards = [
    { 
      label: 'Requieren Atención', 
      value: (resumen?.requieren_modificacion || 0).toString(), 
      icon: 'priority_high', 
      color: 'text-red-500',
      description: 'Con feedback de clientes'
    },
    { 
      label: 'Pendientes de Aprobación', 
      value: (resumen?.pendientes_aprobacion || 0).toString(), 
      icon: 'pending_actions', 
      color: 'text-amber-500',
      description: 'Esperando revisión'
    },
    { 
      label: 'Clientes Activos', 
      value: (resumen?.clientes_activos || 0).toString(), 
      icon: 'groups', 
      color: 'text-emerald-500',
      description: `de ${resumen?.total_clientes || 0} totales`
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-white text-3xl font-black leading-tight tracking-tight">
          {getGreeting()}, {firstName} 👋
        </h2>
        <p className="text-[#9da8b9] text-sm">
          Aquí está el resumen de tu agencia para hoy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statsCards.map((stat, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl p-5 bg-[#1a1d23] border border-border-dark hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className={`material-symbols-outlined text-6xl ${stat.color}`}>{stat.icon}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
              </div>
              <div>
                <p className="text-[#9da8b9] text-xs font-medium">{stat.label}</p>
                <h3 className="text-white text-2xl font-bold tracking-tight">{stat.value}</h3>
              </div>
            </div>
            <p className="text-[#5c6670] text-xs">{stat.description}</p>
          </div>
        ))}
      </div>

      {user?.plan && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-xl font-bold tracking-tight">Tu Plan</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
              </span>
            </div>
            {user.plan !== 'agencia' && (
              <Link to="/pricing" className="text-sm text-primary hover:text-primary/80 transition-colors">
                Mejorar plan →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#1a1d23] border border-border-dark rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-[#9da8b9]">Clientes activos</span>
                <span className="text-sm font-semibold text-white">
                  {user.plan_usage?.clientes || 0}
                  {' / '}
                  {(user.plan_limits?.max_clientes || 0) >= 999999 ? '∞' : user.plan_limits?.max_clientes}
                </span>
              </div>
              <div className="w-full bg-[#2a2d35] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (user.plan_limits?.max_clientes || 0) >= 999999
                      ? 'bg-primary'
                      : (user.plan_usage?.clientes || 0) >= (user.plan_limits?.max_clientes || 1)
                        ? 'bg-red-500'
                        : (user.plan_usage?.clientes || 0) / (user.plan_limits?.max_clientes || 1) > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                  }`}
                  style={{
                    width: (user.plan_limits?.max_clientes || 0) >= 999999
                      ? '15%'
                      : `${Math.min(((user.plan_usage?.clientes || 0) / (user.plan_limits?.max_clientes || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
            <div className="bg-[#1a1d23] border border-border-dark rounded-xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-[#9da8b9]">Publicaciones este mes</span>
                <span className="text-sm font-semibold text-white">
                  {user.plan_usage?.publicaciones_mes || 0}
                  {' / '}
                  {(user.plan_limits?.max_publicaciones_mes || 0) >= 999999 ? '∞' : user.plan_limits?.max_publicaciones_mes}
                </span>
              </div>
              <div className="w-full bg-[#2a2d35] rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    (user.plan_limits?.max_publicaciones_mes || 0) >= 999999
                      ? 'bg-primary'
                      : (user.plan_usage?.publicaciones_mes || 0) >= (user.plan_limits?.max_publicaciones_mes || 1)
                        ? 'bg-red-500'
                        : (user.plan_usage?.publicaciones_mes || 0) / (user.plan_limits?.max_publicaciones_mes || 1) > 0.8
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                  }`}
                  style={{
                    width: (user.plan_limits?.max_publicaciones_mes || 0) >= 999999
                      ? '15%'
                      : `${Math.min(((user.plan_usage?.publicaciones_mes || 0) / (user.plan_limits?.max_publicaciones_mes || 1)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white text-xl font-bold tracking-tight">Mis Clientes</h2>
          <Link 
            to="/clients"
            className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
          >
            Ver todos
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        {clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-[#1a1d23] border border-dashed border-border-dark rounded-xl">
            <div className="size-16 rounded-full bg-border-dark flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-[#9da8b9]">group_add</span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Sin clientes aún</h3>
            <p className="text-[#9da8b9] text-sm mb-4">Creá tu primer cliente para empezar.</p>
            <Link 
              to="/clients?new=true"
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Nuevo Cliente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {clientes.slice(0, 6).map((cliente) => {
              const status = getClienteStatus(cliente);
              const statusConfig = getStatusConfig(status);
              
              return (
                <div key={cliente.id} className="flex flex-col bg-[#1a1d23] rounded-xl border border-border-dark overflow-hidden hover:border-primary/30 transition-all">
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {cliente.nombre_cliente.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{cliente.nombre_cliente}</h3>
                        <p className="text-[#9da8b9] text-xs">{cliente.empresa || 'Sin empresa'}</p>
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded ${statusConfig.color}`}>
                      <span className={`size-2 rounded-full ${statusConfig.dot}`}></span>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <div className="px-5 pb-4 flex gap-4 text-xs">
                    <div className="flex items-center gap-1 text-[#9da8b9]">
                      <span className="material-symbols-outlined text-base">pending_actions</span>
                      <span>{cliente.pendientes} pendientes</span>
                    </div>
                    {cliente.requieren_modificacion > 0 && (
                      <div className="flex items-center gap-1 text-red-500">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                        <span>{cliente.requieren_modificacion} a revisar</span>
                      </div>
                    )}
                  </div>

                  <div className="px-5 pb-5 mt-auto">
                    <Link 
                      to={`/calendar?cliente_id=${cliente.id}`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-border-dark hover:bg-primary text-white text-sm font-bold transition-colors"
                    >
                      <span>Ver Calendario</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            <Link 
              to="/clients?new=true"
              className="flex flex-col items-center justify-center min-h-45 bg-[#111418] rounded-xl border border-dashed border-[#3b4554] hover:border-primary/50 hover:bg-[#1a1d23] transition-all group"
            >
              <div className="size-12 rounded-full bg-border-dark group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                <span className="material-symbols-outlined text-2xl text-[#9da8b9] group-hover:text-primary transition-colors">add</span>
              </div>
              <h3 className="text-white font-bold mb-1">Nuevo Cliente</h3>
              <p className="text-[#9da8b9] text-xs">Agregar cliente</p>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;