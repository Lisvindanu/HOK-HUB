import { createFileRoute } from '@tanstack/react-router';
import { HeroesPage } from '../../pages/HeroesPage';

export const Route = createFileRoute('/heroes/')({
  component: HeroesPage,
});
