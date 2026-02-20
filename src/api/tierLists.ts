// TODO: Backend will be implemented in hokapi VPS
// Temporarily disabled until VPS endpoint is ready
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://hokapi.project-n.site';

export interface TierListData {
  'S+': number[];
  'S': number[];
  'A': number[];
  'B': number[];
  'C': number[];
  'D': number[];
}

export interface TierList {
  id: string;
  title: string;
  creatorName: string;
  creatorId: string | null;
  tiers: TierListData;
  votes: number;
  votedBy: string[];
  createdAt: string;
}

export interface Contributor {
  id: string;
  name: string;
  email: string | null;
  createdAt: string;
  totalTierLists: number;
  totalVotes: number;
  totalContributions?: number; // For skin/data contributions
}

// Tier Lists
export async function fetchTierLists(): Promise<TierList[]> {
  // TODO: Enable when hokapi has this endpoint
  // const response = await fetch(`${API_BASE_URL}/api/tier-lists`);
  // if (!response.ok) throw new Error('Failed to fetch tier lists');
  // const data = await response.json();
  // return data.tierLists;

  // Temporary: return empty array
  return [];
}

export async function createTierList(params: {
  title: string;
  creatorName: string;
  creatorId?: string | null;
  tiers: TierListData;
}): Promise<TierList> {
  // TODO: Enable when hokapi has this endpoint
  // const response = await fetch(`${API_BASE_URL}/api/tier-lists`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(params),
  // });
  // if (!response.ok) {
  //   const error = await response.json();
  //   throw new Error(error.error || 'Failed to create tier list');
  // }
  // const data = await response.json();
  // return data.tierList;

  // Temporary: return mock data
  throw new Error('Tier list submission will be available soon!');
}

export async function voteTierList(tierListId: string, voterId?: string): Promise<TierList> {
  // TODO: Enable when hokapi has this endpoint
  throw new Error('Voting will be available soon!');
}

// Contributors
export async function fetchContributors(): Promise<Contributor[]> {
  // TODO: Enable when hokapi has this endpoint
  // const response = await fetch(`${API_BASE_URL}/api/contributors`);
  // if (!response.ok) throw new Error('Failed to fetch contributors');
  // const data = await response.json();
  // return data.contributors;

  // Temporary: return empty array
  return [];
}

export async function registerContributor(params: {
  name: string;
  email?: string;
}): Promise<Contributor> {
  // TODO: Enable when hokapi has this endpoint
  throw new Error('Contributor registration will be available soon!');
}
