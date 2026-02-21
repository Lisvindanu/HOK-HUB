import { createFileRoute, redirect } from '@tanstack/react-router';
import { DashboardPage } from '../pages/DashboardPage';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw redirect({
        to: '/auth',
      });
    }
  },
  component: DashboardPage,
});
