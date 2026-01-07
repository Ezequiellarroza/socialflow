import React, { useState } from 'react';
import { calendariosService, CalendarioAPI, CreateCalendarioData } from '../services/calendarios';
import { ClienteAPI } from '../services/clientes';

// =====================================================
// TYPES
// =====================================================

interface CrearCalendarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (calendario: CalendarioAPI) => void;
  clientes: ClienteAPI[];
  defaultClienteId?: number | null;
  defaultMes?: number;
  defaultAnio?: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const MESES = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

// =====================================================
// COMPONENT
// =====================================================

const CrearCalendarioModal: React.FC<CrearCalendarioModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  clientes,
  defaultClienteId,
  defaultMes,
  defaultAnio,
}) => {
  const currentDate = new Date();
  
  const [formData, setFormData] = useState<CreateCalendarioData>({
    cliente_id: defaultClienteId || (clientes[0]?.id || 0),
    mes: defaultMes ?? (currentDate.getMonth() + 1),
    anio: defaultAnio ?? currentDate.getFullYear(),
  });
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Actualizar defaults cuando cambian
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        cliente_id: defaultClienteId || (clientes[0]?.id || 0),
        mes: defaultMes ?? (currentDate.getMonth() + 1),
        anio: defaultAnio ?? currentDate.getFullYear(),
      });
      setError(null);
    }
  }, [isOpen, defaultClienteId, defaultMes, defaultAnio, clientes]);

  // =====================================================
  // HANDLERS
  // =====================================================
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: Number(value) 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente_id) {
      setError('Selecciona un cliente');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const nuevoCalendario = await calendariosService.create(formData);
      onCreated(nuevoCalendario);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear calendario');
    } finally {
      setSaving(false);
    }
  };

  // Generar opciones de año (actual y próximos 2)
  const anios = [
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
    currentDate.getFullYear() + 2,
  ];

  const clienteSeleccionado = clientes.find(c => c.id === formData.cliente_id);
  const mesSeleccionado = MESES.find(m => m.value === formData.mes);

  // =====================================================
  // RENDER
  // =====================================================
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111418] border border-border-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">calendar_add_on</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Crear Calendario</h3>
              <p className="text-[#9da8b9] text-sm">Nuevo calendario editorial</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-border-dark text-[#9da8b9] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-[#9da8b9] text-sm font-medium mb-1">
              Cliente
            </label>
            <select
              name="cliente_id"
              value={formData.cliente_id}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre_cliente}
                </option>
              ))}
            </select>
          </div>

          {/* Mes y Año */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Mes
              </label>
              <select
                name="mes"
                value={formData.mes}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {MESES.map(mes => (
                  <option key={mes.value} value={mes.value}>{mes.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[#9da8b9] text-sm font-medium mb-1">
                Año
              </label>
              <select
                name="anio"
                value={formData.anio}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-surface-dark border border-border-dark rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {anios.map(anio => (
                  <option key={anio} value={anio}>{anio}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-surface-dark rounded-lg border border-border-dark">
            <p className="text-[#9da8b9] text-sm">
              Se creará el calendario de <span className="text-white font-medium">{mesSeleccionado?.label} {formData.anio}</span> para <span className="text-white font-medium">{clienteSeleccionado?.nombre_cliente || 'el cliente seleccionado'}</span>.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[#9da8b9] hover:text-white rounded-lg text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !formData.cliente_id}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>}
              {saving ? 'Creando...' : 'Crear Calendario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearCalendarioModal;