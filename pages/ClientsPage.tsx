import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { clientesService, ClienteAPI, CreateClienteData, UpdateClienteData } from '../services/clientes';

// =====================================================
// TYPES
// =====================================================

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  cliente: ClienteAPI | null;
}

interface DeleteModalState {
  isOpen: boolean;
  cliente: ClienteAPI | null;
}

interface SuccessModalState {
  isOpen: boolean;
  cliente: ClienteAPI | null;
}

interface FormData {
  nombre_cliente: string;
  email: string;
  password: string;
  empresa: string;
  telefono: string;
  notas: string;
}

const initialFormData: FormData = {
  nombre_cliente: '',
  email: '',
  password: '',
  empresa: '',
  telefono: '',
  notas: '',
};

// =====================================================
// COMPONENT
// =====================================================

const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  
  // State
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [modal, setModal] = useState<ModalState>({ isOpen: false, mode: 'create', cliente: null });
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ isOpen: false, cliente: null });
  const [successModal, setSuccessModal] = useState<SuccessModalState>({ isOpen: false, cliente: null });
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  // =====================================================
  // DATA FETCHING
  // =====================================================

  const fetchClientes = async (searchTerm?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await clientesService.getAll({ 
        search: searchTerm,
        per_page: 50
      });
      setClientes(result.clientes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClientes(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // MODAL HANDLERS
  // =====================================================

  const openCreateModal = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setModal({ isOpen: true, mode: 'create', cliente: null });
  };

  const openEditModal = (cliente: ClienteAPI) => {
    setFormData({
      nombre_cliente: cliente.nombre_cliente,
      email: cliente.email,
      password: '',
      empresa: cliente.empresa || '',
      telefono: cliente.telefono || '',
      notas: cliente.notas || '',
    });
    setFormErrors({});
    setModal({ isOpen: true, mode: 'edit', cliente });
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: 'create', cliente: null });
    setFormData(initialFormData);
    setFormErrors({});
  };

  const openDeleteModal = (cliente: ClienteAPI) => {
    setDeleteModal({ isOpen: true, cliente });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, cliente: null });
  };

  // =====================================================
  // FORM HANDLERS
  // =====================================================

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof FormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    if (!formData.nombre_cliente.trim()) {
      errors.nombre_cliente = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (modal.mode === 'create') {
      if (!formData.password.trim()) {
        errors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 8) {
        errors.password = 'Mínimo 8 caracteres';
      }
    } else if (formData.password && formData.password.length < 8) {
      errors.password = 'Mínimo 8 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      setError(null);

      if (modal.mode === 'create') {
        const createData: CreateClienteData = {
          nombre_cliente: formData.nombre_cliente.trim(),
          email: formData.email.trim(),
          password: formData.password,
          empresa: formData.empresa.trim() || undefined,
          telefono: formData.telefono.trim() || undefined,
          notas: formData.notas.trim() || undefined,
        };
        const nuevoCliente = await clientesService.create(createData);
        closeModal();
        fetchClientes(search);
        // Mostrar modal de éxito con la URL
        setSuccessModal({ isOpen: true, cliente: nuevoCliente });
      } else if (modal.cliente) {
        const updateData: UpdateClienteData = {
          nombre_cliente: formData.nombre_cliente.trim(),
          email: formData.email.trim(),
          empresa: formData.empresa.trim() || undefined,
          telefono: formData.telefono.trim() || undefined,
          notas: formData.notas.trim() || undefined,
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await clientesService.update(modal.cliente.id, updateData);
        closeModal();
        fetchClientes(search);
      }
    } catch (err: any) {
      setError(err.message || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.cliente) return;

    try {
      setSaving(true);
      setError(null);
      await clientesService.delete(deleteModal.cliente.id);
      closeDeleteModal();
      fetchClientes(search);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar cliente');
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (cliente: ClienteAPI) => {
    try {
      setError(null);
      const currentActivo = typeof cliente.activo === 'number' ? cliente.activo === 1 : cliente.activo;
      await clientesService.update(cliente.id, { activo: !currentActivo });
      fetchClientes(search);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar estado');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // =====================================================
  // RENDER HELPERS
  // =====================================================

  const getInitials = (nombre: string): string => {
    return nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (id: number): string => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-purple-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-cyan-500',
      'bg-indigo-500',
    ];
    return colors[id % colors.length];
  };

  const isActivo = (cliente: ClienteAPI): boolean => {
    return typeof cliente.activo === 'number' ? cliente.activo === 1 : Boolean(cliente.activo);
  };

  const getPortalUrl = (): string => {
    if (user?.slug) {
      return `${window.location.origin}/#/portal/${user.slug}/login`;
    }
    return '';
  };

  // =====================================================
  // RENDER: LOADING STATE
  // =====================================================

  if (loading && clientes.length === 0) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Mis Clientes</h2>
            <p className="text-[#9da8b9] text-sm">Gestiona el acceso y la configuración de cada cuenta.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#9da8b9] text-sm">Cargando clientes...</span>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER: MAIN
  // =====================================================

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-white text-3xl font-black leading-tight tracking-tight">Mis Clientes</h2>
          <p className="text-[#9da8b9] text-sm">Gestiona el acceso y la configuración de cada cuenta.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span>
          Nuevo Cliente
        </button>
      </div>

      {/* URL del Portal - Info */}
      {user?.slug && (
        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary">link</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium">URL del portal para tus clientes</p>
            <p className="text-[#9da8b9] text-xs truncate">{getPortalUrl()}</p>
          </div>
          <button
            onClick={() => copyToClipboard(getPortalUrl())}
            className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copiar
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#5c6670]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o empresa..."
          className="w-full pl-12 pr-4 py-3 bg-surface-dark border border-border-dark rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5c6670] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-500">error</span>
          <span className="text-red-500 text-sm">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-400"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {clientes.length === 0 ? (
        <div className="bg-surface-dark border border-border-dark rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
          <div className="size-16 rounded-full bg-[#111418] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#9da8b9] text-3xl">group</span>
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold text-lg">
              {search ? 'No se encontraron clientes' : 'No tienes clientes aún'}
            </h3>
            <p className="text-[#9da8b9] text-sm mt-1">
              {search 
                ? 'Intenta con otros términos de búsqueda.' 
                : 'Crea tu primer cliente para empezar a gestionar su contenido.'}
            </p>
          </div>
          {!search && (
            <button 
              onClick={openCreateModal}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Crear Cliente
            </button>
          )}
        </div>
      ) : (
        /* Table */
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-dark bg-[#111418]/50">
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Empresa</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider text-center">Pendientes</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider text-center">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#9da8b9] uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-[#111418]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`size-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getAvatarColor(cliente.id)}`}>
                          {getInitials(cliente.nombre_cliente)}
                        </div>
                        <span className="text-white font-bold">{cliente.nombre_cliente}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#9da8b9] text-sm">
                      {cliente.empresa || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white text-sm">{cliente.email}</span>
                        {cliente.telefono && (
                          <span className="text-[#9da8b9] text-xs">{cliente.telefono}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-lg text-sm font-bold ${
                        (cliente.stats?.pendientes || 0) > 0
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-[#111418] text-[#9da8b9] border border-border-dark'
                      }`}>
                        {cliente.stats?.pendientes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleActivo(cliente)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer transition-all ${
                          isActivo(cliente)
                            ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20'
                        }`}
                      >
                        {isActivo(cliente) ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(cliente)}
                          className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-border-dark hover:text-white transition-all"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-border-dark hover:text-white transition-all"
                          title="Ver calendario"
                        >
                          <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                        </button>
                        <button 
                          onClick={() => openDeleteModal(cliente)}
                          className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-red-500/10 hover:text-red-500 transition-all"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
              <h3 className="text-white font-bold text-lg">
                {modal.mode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
              </h3>
              <button 
                onClick={closeModal}
                className="size-8 rounded-lg flex items-center justify-center text-[#9da8b9] hover:bg-border-dark hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {/* Nombre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleInputChange}
                  placeholder="Nombre del cliente"
                  className={`w-full px-4 py-2.5 bg-[#111418] border rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    formErrors.nombre_cliente ? 'border-red-500' : 'border-border-dark'
                  }`}
                />
                {formErrors.nombre_cliente && (
                  <span className="text-red-500 text-xs">{formErrors.nombre_cliente}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@ejemplo.com"
                  className={`w-full px-4 py-2.5 bg-[#111418] border rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    formErrors.email ? 'border-red-500' : 'border-border-dark'
                  }`}
                />
                {formErrors.email && (
                  <span className="text-red-500 text-xs">{formErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">
                  Contraseña {modal.mode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={modal.mode === 'create' ? 'Mínimo 8 caracteres' : 'Dejar vacío para no cambiar'}
                  className={`w-full px-4 py-2.5 bg-[#111418] border rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                    formErrors.password ? 'border-red-500' : 'border-border-dark'
                  }`}
                />
                {formErrors.password && (
                  <span className="text-red-500 text-xs">{formErrors.password}</span>
                )}
                {modal.mode === 'edit' && (
                  <span className="text-[#5c6670] text-xs">Solo completa si deseas cambiar la contraseña</span>
                )}
              </div>

              {/* Empresa */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">Empresa</label>
                <input
                  type="text"
                  name="empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  placeholder="Nombre de la empresa"
                  className="w-full px-4 py-2.5 bg-[#111418] border border-border-dark rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Teléfono */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  placeholder="+54 11 1234-5678"
                  className="w-full px-4 py-2.5 bg-[#111418] border border-border-dark rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Notas */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#9da8b9]">Notas</label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleInputChange}
                  placeholder="Notas internas sobre el cliente..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#111418] border border-border-dark rounded-xl text-white placeholder-[#5c6670] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-[#9da8b9] hover:text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-blue-600 disabled:bg-primary/50 text-white rounded-xl font-bold transition-all"
                >
                  {saving ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      {modal.mode === 'create' ? 'Crear Cliente' : 'Guardar Cambios'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.cliente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-500 text-3xl">warning</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">¿Eliminar cliente?</h3>
                <p className="text-[#9da8b9] text-sm mt-2">
                  Estás por eliminar a <strong className="text-white">{deleteModal.cliente.nombre_cliente}</strong>. 
                  Esta acción eliminará todos sus calendarios y publicaciones asociadas.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2 w-full">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 px-5 py-2.5 border border-border-dark text-[#9da8b9] hover:text-white hover:border-[#3d4654] rounded-xl font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl font-bold transition-all"
                >
                  {saving ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Mostrar URL del portal */}
      {successModal.isOpen && successModal.cliente && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-border-dark rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">¡Cliente creado!</h3>
                <p className="text-[#9da8b9] text-sm mt-2">
                  <strong className="text-white">{successModal.cliente.nombre_cliente}</strong> ya puede acceder al portal.
                </p>
              </div>
              
              {/* URL del portal */}
              {user?.slug && (
                <div className="w-full mt-2">
                  <label className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider block mb-2 text-left">
                    URL de acceso al portal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getPortalUrl()}
                      className="flex-1 px-3 py-2.5 bg-[#111418] border border-border-dark rounded-lg text-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(getPortalUrl())}
                      className="px-3 py-2.5 bg-primary hover:bg-blue-600 text-white rounded-lg transition-all"
                      title="Copiar URL"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                  </div>
                  <p className="text-[#5c6670] text-xs mt-2 text-left">
                    Compartí esta URL con tu cliente para que pueda iniciar sesión.
                  </p>
                </div>
              )}

              {/* Credenciales */}
              <div className="w-full bg-[#111418] border border-border-dark rounded-lg p-4 text-left">
                <p className="text-xs font-bold text-[#9da8b9] uppercase tracking-wider mb-2">Credenciales</p>
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-[#9da8b9]">Email: <span className="text-white">{successModal.cliente.email}</span></p>
                  <p className="text-[#9da8b9]">Contraseña: <span className="text-white">La que definiste al crear</span></p>
                </div>
              </div>

              <button
                onClick={() => setSuccessModal({ isOpen: false, cliente: null })}
                className="w-full mt-2 px-5 py-2.5 bg-border-dark hover:bg-[#3b4554] text-white rounded-xl font-bold transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;