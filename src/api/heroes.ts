import type { ApiResponse, Hero } from '../types/hero';

// In development use Vite proxy (to avoid CORS), in production use direct VPS URL
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

export async function fetchAllHeroes(): Promise<Hero[]> {
  const response = await fetch(`${API_BASE_URL}/api/hok`);

  if (!response.ok) {
    throw new Error('Failed to fetch heroes');
  }

  const data: ApiResponse = await response.json();

  // Convert main object to array
  return Object.values(data.main);
}

export async function fetchHeroByName(name: string): Promise<Hero | null> {
  const heroes = await fetchAllHeroes();
  return heroes.find(hero => hero.name === name) || null;
}

export async function fetchHeroById(id: number): Promise<Hero | null> {
  const heroes = await fetchAllHeroes();
  return heroes.find(hero => hero.heroId === id) || null;
}

export async function fetchApiStatus(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/status`);

  if (!response.ok) {
    throw new Error('Failed to fetch API status');
  }

  return response.json();
}

export async function fetchHealthCheck(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Failed to fetch health status');
  }

  return response.json();
}
