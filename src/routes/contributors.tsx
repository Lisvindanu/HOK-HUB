import { createFileRoute } from '@tanstack/react-router';
import { ContributorsPage } from '../pages/ContributorsPage';

export const Route = createFileRoute('/contributors')({
  component: ContributorsPage,
});
