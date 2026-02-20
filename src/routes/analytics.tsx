import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsPage } from '../pages/AnalyticsPage';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
});
