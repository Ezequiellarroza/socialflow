// =====================================================
// SOCIALFLOW - useClientes Hook
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { clientesService, ClienteAPI, CreateClienteData, UpdateClienteData } from '../services/clientes';

interface UseClientesReturn {
  clientes: ClienteAPI[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCliente: (data: CreateClienteData) => Promise<ClienteAPI>;
  updateCliente: (id: number, data: UpdateClienteData) => Promise<ClienteAPI>;
  deleteCliente: (id: number) => Promise<void>;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<ClienteAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClientes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientesService.getAll();
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const createCliente = useCallback(async (data: CreateClienteData): Promise<ClienteAPI> => {
    const newCliente = await clientesService.create(data);
    setClientes(prev => [...prev, newCliente]);
    return newCliente;
  }, []);

  const updateCliente = useCallback(async (id: number, data: UpdateClienteData): Promise<ClienteAPI> => {
    const updatedCliente = await clientesService.update(id, data);
    setClientes(prev => prev.map(c => c.id === id ? updatedCliente : c));
    return updatedCliente;
  }, []);

  const deleteCliente = useCallback(async (id: number): Promise<void> => {
    await clientesService.delete(id);
    setClientes(prev => prev.filter(c => c.id !== id));
  }, []);

  return {
    clientes,
    isLoading,
    error,
    refresh: fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
  };
};

export default useClientes;
