import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContributorState {
  contributorId: string | null;
  contributorName: string | null;
  setContributor: (id: string, name: string) => void;
  clearContributor: () => void;
}

export const useContributorStore = create<ContributorState>()(
  persist(
    (set) => ({
      contributorId: null,
      contributorName: null,
      setContributor: (id, name) => set({ contributorId: id, contributorName: name }),
      clearContributor: () => set({ contributorId: null, contributorName: null }),
    }),
    {
      name: 'contributor-storage',
    }
  )
);
