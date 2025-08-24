import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import Link from 'next/link';
import { CalendarDays, Plus, Edit, Eye } from 'lucide-react';
import { api } from '~/trpc/server';
import { format } from 'date-fns';
import DeleteEventButton from './delete-event-button';

export default async function AdminEventsPage() {
  const events = await api.event.getAllEventsAdmin();

  const colorMap = {
    SKY: 'bg-sky-100 text-sky-800 border-sky-200',
    AMBER: 'bg-amber-100 text-amber-800 border-amber-200',
    VIOLET: 'bg-violet-100 text-violet-800 border-violet-200',
    ROSE: 'bg-rose-100 text-rose-800 border-rose-200',
    EMERALD: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ORANGE: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Manage Events</h1>
        </div>
        <Button asChild>
          <Link href="/admin/events/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium mb-4">
              No events created yet.
            </p>
            <Button asChild>
              <Link href="/admin/events/create">Create Your First Event</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => {
            const startDate = new Date(event.start);
            const endDate = new Date(event.end);
            const isMultiDay = startDate.toDateString() !== endDate.toDateString();

            return (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge className={colorMap[event.color]}>
                          {event.color.toLowerCase()}
                        </Badge>
                        {event.hasTimeline && (
                          <Badge variant="outline">Timeline</Badge>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteEventButton eventId={event.id} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Date:</span>
                      <p>
                        {event.allDay ? (
                          isMultiDay ? (
                            `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
                          ) : (
                            format(startDate, 'MMM d, yyyy')
                          )
                        ) : (
                          isMultiDay ? (
                            `${format(startDate, 'MMM d, h:mm a')} - ${format(endDate, 'MMM d, h:mm a')}`
                          ) : (
                            `${format(startDate, 'MMM d, yyyy')} • ${format(startDate, 'h:mm a')} - ${format(endDate, 'h:mm a')}`
                          )
                        )}
                      </p>
                    </div>

                    {event.location && (
                      <div>
                        <span className="font-medium text-muted-foreground">Location:</span>
                        <p>{event.location}</p>
                      </div>
                    )}

                    <div>
                      <span className="font-medium text-muted-foreground">Scope:</span>
                      <p>
                        {event.courseId ? (
                          <span>Course: {event.course?.title}</span>
                        ) : event.userId ? (
                          <span>Personal: {event.user?.name}</span>
                        ) : (
                          <span>Global</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="font-medium text-muted-foreground">Created:</span>
                      <p>{format(new Date(event.createdAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Manage Events - Admin',
};