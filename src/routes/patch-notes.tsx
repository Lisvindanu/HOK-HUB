import { createFileRoute } from '@tanstack/react-router';
import { PatchNotesPage } from '../pages/PatchNotesPage';

export const Route = createFileRoute('/patch-notes')({
  component: PatchNotesPage,
});
