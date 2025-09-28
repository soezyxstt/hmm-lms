import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import EventDetailView from '~/app/(with-sidebar)/events/[id]/event-detail-view';
import EventAdminDashboard from './event-admin-dashboard';

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = await api.event.getEventById({ id });

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <EventDetailView event={event} />
      <EventAdminDashboard eventId={event.id} />
    </div>
  );
}
