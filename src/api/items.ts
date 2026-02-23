import type { Item, Arcana } from '../types/hero';

const API_BASE_URL = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

export async function fetchAllItems(): Promise<Item[]> {
  const response = await fetch(`${API_BASE_URL}/api/items`);

  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }

  return response.json();
}

export async function fetchAllArcana(): Promise<Arcana[]> {
  const response = await fetch(`${API_BASE_URL}/api/arcana`);

  if (!response.ok) {
    throw new Error('Failed to fetch arcana');
  }

  return response.json();
}
