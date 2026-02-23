import { createFileRoute } from '@tanstack/react-router';
import { ArcanaPage } from '../pages/ArcanaPage';

export const Route = createFileRoute('/arcana')({
  component: ArcanaPage,
});
