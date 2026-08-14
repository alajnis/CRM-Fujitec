import { useEffect, useState } from 'react';
import { Obra, Cliente, Equipo } from '../types';
import { obrasService, clientesService, equiposService } from '../services';
import { supabaseAdapter } from '../adapters/supabaseAdapter';

interface UseSupabaseDataResult {
  obras: Obra[];
  clientes: Cliente[];
  equipos: Equipo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSupabaseData = (): UseSupabaseDataResult => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [obrasData, clientesData, equiposData] = await Promise.all([
        obrasService.getObras(),
        clientesService.getClientes(),
        equiposService.getEquipos()
      ]);

      // Transform Supabase data to app types using adapter
      const appObras = obrasData.map(o => supabaseAdapter.toAppObra(o));
      const appClientes = clientesData.map(c => supabaseAdapter.toAppCliente(c));
      const appEquipos = equiposData.map(e => supabaseAdapter.toAppEquipo(e));

      setObras(appObras);
      setClientes(appClientes);
      setEquipos(appEquipos);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading data');
      setError(error);
      console.error('Error loading data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    obras,
    clientes,
    equipos,
    isLoading,
    error,
    refetch: loadData
  };
};
