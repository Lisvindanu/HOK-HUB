import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContributorState {
  contributorId: string | null;
  contributorName: string | null;
  token: string | null;
  setContributor: (id: string, name: string, token: string) => void;
  clearContributor: () => void;
}

export const useContributorStore = create<ContributorState>()(
  persist(
    (set) => ({
      contributorId: null,
      contributorName: null,
      token: null,
      setContributor: (id, name, token) => set({ contributorId: id, contributorName: name, token }),
      clearContributor: () => set({ contributorId: null, contributorName: null, token: null }),
    }),
    {
      name: 'contributor-storage',
    }
  )
);
