import { createFileRoute } from '@tanstack/react-router';
import { ContributePage } from '../pages/ContributePage';

export const Route = createFileRoute('/contribute')({
  component: ContributePage,
});
