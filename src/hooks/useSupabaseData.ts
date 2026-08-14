import { useEffect, useState } from 'react';
import { Obra, Cliente, Equipo } from '../types';
import { obrasService, clientesService, equiposService, actividadesService } from '../services';
import { supabaseAdapter } from '../adapters/supabaseAdapter';

interface UseSupabaseDataResult {
  obras: Obra[];
  clientes: Cliente[];
  equipos: Equipo[];
  actividades: any[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSupabaseData = (): UseSupabaseDataResult => {
  const [obras, setObras] = useState<Obra[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [actividades, setActividades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📥 Loading data from Supabase...');
      console.log('obrasService:', typeof obrasService);
      console.log('clientesService:', typeof clientesService);
      console.log('equiposService:', typeof equiposService);

      console.log('🔄 Calling obrasService.getObras()...');
      const obrasData = await obrasService.getObras();
      console.log('✅ obrasService.getObras() returned:', obrasData.length, 'items');

      console.log('🔄 Calling clientesService.getClientes()...');
      const clientesData = await clientesService.getClientes();
      console.log('✅ clientesService.getClientes() returned:', clientesData.length, 'items');

      console.log('🔄 Calling equiposService.getEquipos()...');
      const equiposData = await equiposService.getEquipos();
      console.log('✅ equiposService.getEquipos() returned:', equiposData.length, 'items');

      console.log('🔄 Calling actividadesService.getActividades()...');
      const actividadesRaw = await actividadesService.getActividades();
      const actividadesData = (actividadesRaw || []).filter(a => !a.deleted_at);
      console.log('✅ actividadesService.getActividades() returned:', actividadesData.length, 'items');

      console.log(`✅ Loaded: ${obrasData.length} obras, ${clientesData.length} clientes, ${equiposData.length} equipos, ${actividadesData.length} actividades`);

      // Transform Supabase data to app types using adapter
      const appObras = obrasData.map(o => supabaseAdapter.toAppObra(o, actividadesData, equiposData));
      const appClientes = clientesData.map(c => supabaseAdapter.toAppCliente(c));
      const appEquipos = equiposData.map(e => supabaseAdapter.toAppEquipo(e));

      setObras(appObras);
      setClientes(appClientes);
      setEquipos(appEquipos);
      setActividades(actividadesData);
      setHasLoaded(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error loading data');
      setError(error);
      console.error('❌ Error loading data from Supabase:', error);
      setHasLoaded(true);
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
    actividades,
    isLoading,
    error,
    refetch: loadData
  };
};
