import { createFileRoute } from '@tanstack/react-router';
import { TierListPage } from '../pages/TierListPage';

export const Route = createFileRoute('/tier-list')({
  component: TierListPage,
});
