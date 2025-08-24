import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import EventItem from './event-item';
import { api } from '~/trpc/server';
import { auth } from '~/server/auth';
import { Role } from '@prisma/client';
import { Button } from '~/components/ui/button';
import Link from 'next/link';
import { CalendarDays, Plus } from 'lucide-react';
import { type RouterOutputs } from '~/trpc/react';

export default async function EventsPage() {
  const session = await auth();
  const myEvents = await api.event.getMyEvents();
  const allEvents = await api.event.getAllEvents();
  const courseEvents = await api.event.getCourseEvents();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Events</h1>
        </div>
        {session?.user.role === Role.ADMIN && (
          <Button asChild>
            <Link href="/admin/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="my-events" className="w-full">
        <TabsList className="text-foreground h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 mb-6">
          <TabsTrigger
            value="my-events"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            My Events
          </TabsTrigger>
          <TabsTrigger
            value="course-events"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Course Events
          </TabsTrigger>
          <TabsTrigger
            value="all-events"
            className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            All Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-events">
          <div className="w-full">
            {myEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  You don&apos;t have any personal events yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {myEvents.map((event: RouterOutputs['event']['getMyEvents'][number]) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    href={`/events/${event.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="course-events">
          <div className="w-full">
            {courseEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  No course events available.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courseEvents.map((event: RouterOutputs['event']['getCourseEvents'][number]) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    href={`/events/${event.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all-events">
          <div className="w-full">
            {allEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">
                  No events available.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allEvents.map((event: RouterOutputs['event']['getAllEvents'][number]) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    href={`/events/${event.id}`}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const metadata = {
  title: 'Events',
};