import { createFileRoute } from '@tanstack/react-router';
import { SkinsPage } from '../pages/SkinsPage';

export const Route = createFileRoute('/skins')({
  component: SkinsPage,
});
