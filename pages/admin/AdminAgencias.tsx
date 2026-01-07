import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService, { Agencia } from '../../services/admin';

const AdminAgencias: React.FC = () => {
  const { user, logout } = useAuth();
  const [agencias, setAgencias] = useState<Agencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgencia, setSelectedAgencia] = useState<Agencia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadAgencias();
  }, []);

  const loadAgencias = async () => {
    try {
      const data = await adminService.getAgencias();
      setAgencias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar agencias');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = async (id: number) => {
    try {
      const agencia = await adminService.getAgencia(id);
      setSelectedAgencia(agencia);
      setIsModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Error al cargar agencia');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgencia) return;

    setIsSaving(true);
    try {
      await adminService.updateAgencia(selectedAgencia.id, {
        plan: selectedAgencia.plan,
        activa: selectedAgencia.activa,
        max_clientes: selectedAgencia.max_clientes,
        max_publicaciones_mes: selectedAgencia.max_publicaciones_mes,
        fecha_vencimiento_plan: selectedAgencia.fecha_vencimiento_plan
      });
      setIsModalOpen(false);
      loadAgencias();
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (fecha: string | null) => {
    if (!fecha) return false;
    return new Date(fecha) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <span className="animate-spin material-symbols-outlined">sync</span>
          <span>Cargando agencias...</span>
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
            <Link to="/admin/agencias" className="text-white font-medium">Agencias</Link>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Agencias</h2>
          <span className="text-gray-400">{agencias.length} agencias registradas</span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Agencia</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Plan</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Clientes</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Publicaciones</th>
                <th className="text-left px-6 py-4 text-gray-300 font-medium">Vencimiento</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Estado</th>
                <th className="text-center px-6 py-4 text-gray-300 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {agencias.map((agencia) => (
                <tr key={agencia.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{agencia.nombre_agencia}</p>
                      <p className="text-gray-400 text-sm">{agencia.email_contacto}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      agencia.plan === 'enterprise' ? 'bg-purple-500/20 text-purple-300' :
                      agencia.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-300' :
                      agencia.plan === 'basic' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {agencia.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-300">{agencia.total_clientes || 0}</td>
                  <td className="px-6 py-4 text-center text-gray-300">{agencia.total_publicaciones || 0}</td>
                  <td className="px-6 py-4">
                    <span className={isExpired(agencia.fecha_vencimiento_plan) ? 'text-red-400' : 'text-gray-300'}>
                      {formatDate(agencia.fecha_vencimiento_plan)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {agencia.activa ? (
                      <span className="inline-flex items-center gap-1 text-green-400">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openEditModal(agencia.id)}
                      className="text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal Editar */}
      {isModalOpen && selectedAgencia && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-lg border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Editar Agencia</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Agencia</label>
                <p className="text-white">{selectedAgencia.nombre_agencia}</p>
                <p className="text-gray-400 text-sm">{selectedAgencia.email_contacto}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
                <select
                  value={selectedAgencia.plan}
                  onChange={(e) => setSelectedAgencia({ ...selectedAgencia, plan: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Máx. Clientes</label>
                  <input
                    type="number"
                    value={selectedAgencia.max_clientes}
                    onChange={(e) => setSelectedAgencia({ ...selectedAgencia, max_clientes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Máx. Publicaciones/Mes</label>
                  <input
                    type="number"
                    value={selectedAgencia.max_publicaciones_mes}
                    onChange={(e) => setSelectedAgencia({ ...selectedAgencia, max_publicaciones_mes: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vencimiento del Plan</label>
                <input
                  type="date"
                  value={selectedAgencia.fecha_vencimiento_plan?.split('T')[0] || ''}
                  onChange={(e) => setSelectedAgencia({ ...selectedAgencia, fecha_vencimiento_plan: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="activa"
                  checked={selectedAgencia.activa === 1}
                  onChange={(e) => setSelectedAgencia({ ...selectedAgencia, activa: e.target.checked ? 1 : 0 })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="activa" className="text-gray-300">Agencia activa</label>
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
                    'Guardar Cambios'
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

export default AdminAgencias;