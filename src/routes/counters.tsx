import { createFileRoute } from '@tanstack/react-router';
import { CounterPage } from '../pages/CounterPage';

export const Route = createFileRoute('/counters')({
  component: CounterPage,
});
