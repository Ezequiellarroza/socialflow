import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService, { Pago, Agencia } from '../../services/admin';

const AdminPagos: React.FC = () => {
  const { user, logout } = useAuth();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nuevoPago, setNuevoPago] = useState({
    agencia_id: 0,
    monto: '',
    moneda: 'USD',
    estado: 'pendiente',
    fecha_vencimiento: '',
    metodo_pago: '',
    referencia: '',
    notas: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPagos();
  }, [filtroEstado]);

  const loadData = async () => {
    try {
      const [pagosData, agenciasData] = await Promise.all([
        adminService.getPagos(),
        adminService.getAgencias()
      ]);
      setPagos(pagosData);
      setAgencias(agenciasData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPagos = async () => {
    try {
      const filtros = filtroEstado ? { estado: filtroEstado } : undefined;
      const data = await adminService.getPagos(filtros);
      setPagos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pagos');
    }
  };

  const handleCrearPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPago.agencia_id || !nuevoPago.monto || !nuevoPago.fecha_vencimiento) {
      setError('Completá los campos requeridos');
      return;
    }

    setIsSaving(true);
    try {
      await adminService.createPago({
        agencia_id: nuevoPago.agencia_id,
        monto: parseFloat(nuevoPago.monto),
        moneda: nuevoPago.moneda,
        estado: nuevoPago.estado,
        fecha_vencimiento: nuevoPago.fecha_vencimiento,
        metodo_pago: nuevoPago.metodo_pago || undefined,
        referencia: nuevoPago.referencia || undefined,
        notas: nuevoPago.notas || undefined
      });
      setIsModalOpen(false);
      setNuevoPago({
        agencia_id: 0,
        monto: '',
        moneda: 'USD',
        estado: 'pendiente',
        fecha_vencimiento: '',
        metodo_pago: '',
        referencia: '',
        notas: ''
      });
      loadPagos();
    } catch (err: any) {
      setError(err.message || 'Error al crear pago');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarcarPagado = async (pago: Pago) => {
    if (!confirm(`¿Confirmar pago de ${formatCurrency(pago.monto, pago.moneda)} de ${pago.nombre_agencia}?`)) {
      return;
    }

    try {
      await adminService.updatePago(pago.id, { estado: 'pagado' });
      loadPagos();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar pago');
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEstadoStyle = (estado: string) => {
    switch (estado) {
      case 'pagado': return 'bg-green-500/20 text-green-300';
      case 'pendiente': return 'bg-amber-500/20 text-amber-300';
      case 'vencido': return 'bg-red-500/20 text-red-300';
      case 'cancelado': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando pagos...</span>
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
            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/admin/agencias" className="text-gray-400 hover:text-white transition-colors">Agencias</Link>
            <Link to="/admin/pagos" className="text-white font-medium">Pagos</Link>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Pagos</h2>
          <div className="flex items-center gap-4">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="pagado">Pagados</option>
              <option value="vencido">Vencidos</option>
              <option value="cancelado">Cancelados</option>
            </select>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              Nuevo Pago
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Agencia</th>
                <th className="text-right px-6 py-4 text-gray-300 font-medium">Monto</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Estado</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Vencimiento</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Fecha Pago</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Método</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pagos.length > 0 ? pagos.map((pago) => (
                <tr key={pago.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{pago.nombre_agencia}</p>
                    {pago.referencia && <p className="text-gray-400 text-sm">Ref: {pago.referencia}</p>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-white font-semibold">{formatCurrency(pago.monto, pago.moneda)}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoStyle(pago.estado)}`}>
                      {pago.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(pago.fecha_vencimiento)}</td>
                  <td className="px-6 py-4 text-gray-300">{formatDate(pago.fecha_pago)}</td>
                  <td className="px-6 py-4 text-gray-300">{pago.metodo_pago || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    {pago.estado === 'pendiente' && (
                      <button
                        onClick={() => handleMarcarPagado(pago)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Marcar como pagado"
                      >
                        <span className="material-symbols-outlined">check_circle</span>
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No hay pagos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Nuevo Pago */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Registrar Pago</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCrearPago} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agencia *</label>
                <select
                  value={nuevoPago.agencia_id}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, agencia_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value={0}>Seleccionar agencia</option>
                  {agencias.map((a) => (
                    <option key={a.id} value={a.id}>{a.nombre_agencia}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Monto *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoPago.monto}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
                  <select
                    value={nuevoPago.moneda}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, moneda: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha Vencimiento *</label>
                  <input
                    type="date"
                    value={nuevoPago.fecha_vencimiento}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, fecha_vencimiento: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <select
                    value={nuevoPago.estado}
                    onChange={(e) => setNuevoPago({ ...nuevoPago, estado: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="pagado">Pagado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pago</label>
                <input
                  type="text"
                  value={nuevoPago.metodo_pago}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, metodo_pago: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Ej: Transferencia, MercadoPago, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Referencia</label>
                <input
                  type="text"
                  value={nuevoPago.referencia}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, referencia: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  placeholder="Nro. de operación, comprobante, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notas</label>
                <textarea
                  value={nuevoPago.notas}
                  onChange={(e) => setNuevoPago({ ...nuevoPago, notas: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 resize-none"
                  rows={2}
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-xl">sync</span>
                      Guardando...
                    </>
                  ) : (
                    'Registrar Pago'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPagos;