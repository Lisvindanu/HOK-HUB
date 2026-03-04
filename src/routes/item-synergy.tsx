import { createFileRoute } from '@tanstack/react-router';
import { ItemSynergyPage } from '../pages/ItemSynergyPage';

export const Route = createFileRoute('/item-synergy')({
  component: ItemSynergyPage,
});
