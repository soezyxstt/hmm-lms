import { api } from '~/trpc/server';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import EventList from './event-list';

export const metadata = {
  title: 'Admin: Manage Events',
};

export default async function AdminEventsPage() {
  const initialEvents = await api.event.getAllEventsAdmin({ limit: 20 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground">
            View, create, and manage all events in the system.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <EventList initialEvents={initialEvents} />
    </div>
  );
}
