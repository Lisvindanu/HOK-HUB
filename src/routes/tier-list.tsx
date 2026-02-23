import { createFileRoute } from '@tanstack/react-router';
import { TierListPage } from '../pages/TierListPage';

type TierListSearch = {
  id?: string;
};

export const Route = createFileRoute('/tier-list')({
  component: TierListPage,
  validateSearch: (search: Record<string, unknown>): TierListSearch => {
    return {
      id: typeof search.id === 'string' ? search.id : undefined,
    };
  },
});
