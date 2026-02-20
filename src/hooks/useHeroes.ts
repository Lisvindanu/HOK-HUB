import { useQuery } from '@tanstack/react-query';
import { fetchAllHeroes, fetchHeroByName, fetchHeroById } from '../api/heroes';

export function useHeroes() {
  return useQuery({
    queryKey: ['heroes'],
    queryFn: fetchAllHeroes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useHeroByName(name: string) {
  return useQuery({
    queryKey: ['hero', name],
    queryFn: () => fetchHeroByName(name),
    enabled: !!name,
  });
}

export function useHeroById(id: number) {
  return useQuery({
    queryKey: ['hero', id],
    queryFn: () => fetchHeroById(id),
    enabled: !!id,
  });
}
