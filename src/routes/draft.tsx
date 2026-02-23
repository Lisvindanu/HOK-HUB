import { createFileRoute } from '@tanstack/react-router';
import { DraftPage } from '../pages/DraftPage';

export const Route = createFileRoute('/draft')({
  component: DraftPage,
});
