import { createFileRoute } from '@tanstack/react-router';
import { HeroDetailPage } from '../../pages/HeroDetailPage';

export const Route = createFileRoute('/heroes/$heroId')({
  component: HeroDetailPage,
});
