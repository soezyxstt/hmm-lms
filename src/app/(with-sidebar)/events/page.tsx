'use client';

import React, { Suspense, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  Globe,
  Link as LinkIcon,
  MapPin,
  Users,
  User,
} from 'lucide-react';
import type { Course, Event, User as PrismaUser } from '@prisma/client';

// --- TRPC & AUTH IMPORTS ---
import { api } from '~/trpc/react';
import { useSession } from 'next-auth/react';

// --- SHADCN UI IMPORTS ---
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { Skeleton } from '~/components/ui/skeleton';

// --- TYPE DEFINITIONS for Component Props ---
type EventWithRelations = Event & {
  rsvp?: string | null;
};
type CurrentUser = Pick<PrismaUser, 'id' | 'role'>;

interface EventCardProps {
  event: EventWithRelations;
}

function EventCard({ event }: EventCardProps) {
  const { data: myCourses } = api.course.getMyCourses.useQuery();

  const eventType = useMemo(() => {
    if (event.userId) {
      return {
        type: 'Personal',
        icon: <User className="h-4 w-4" />,
        courseName: null,
        badgeVariant: 'secondary' as const,
        accentColor: 'bg-accent/20 border-accent/30',
      };
    }
    if (event.courseId) {
      const course = myCourses?.find((c: Course) => c.id === event.courseId);
      return {
        type: 'Course',
        icon: <Users className="h-4 w-4" />,
        courseName: course?.title ?? 'Course Event',
        badgeVariant: 'default' as const,
        accentColor: 'bg-primary/10 border-primary/20',
      };
    }
    return {
      type: 'Global',
      icon: <Globe className="h-4 w-4" />,
      courseName: null,
      badgeVariant: 'outline' as const,
      accentColor: 'bg-muted/50 border-border',
    };
  }, [event, myCourses]);

  const formatDateRange = () => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const startDate = format(start, 'eee, MMM d');
    const endDate = format(end, 'eee, MMM d');

    if (startDate === endDate) {
      return `${startDate} · ${format(start, 'p')} – ${format(end, 'p')}`;
    }
    return `${startDate}, ${format(start, 'p')} – ${endDate}, ${format(end, 'p')}`;
  };

  const hasRsvp =
    typeof event.rsvp === 'string' && event.rsvp.trim().length > 0;

  return (
    <Card className="group relative overflow-hidden border-0 bg-card shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:shadow-lg hover:ring-border">
      {/* Modern gradient accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 ${eventType.accentColor.split(' ')[0]} opacity-80`} />

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/50 via-transparent to-muted/20 opacity-60" />

      <div className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              {/* Badge with improved styling */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={eventType.badgeVariant}
                  className="flex items-center gap-2 px-3 py-1 text-xs font-medium"
                >
                  {eventType.icon}
                  <span className="truncate">
                    {eventType.courseName ?? eventType.type}
                  </span>
                </Badge>
              </div>

              {/* Title with better typography */}
              <CardTitle className="text-xl font-bold leading-tight tracking-tight text-foreground">
                {event.title}
              </CardTitle>

              {/* Event details with improved layout */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/50">
                    <Clock className="h-3 w-3" />
                  </div>
                  <span className="font-medium">{formatDateRange()}</span>
                </div>

                {event.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted/50">
                      <MapPin className="h-3 w-3" />
                    </div>
                    <span className="truncate font-medium">{event.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RSVP Button with modern styling */}
            {hasRsvp && (
              <div className="shrink-0">
                <Button
                  asChild
                  size="sm"
                  className="bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  <a
                    href={event.rsvp!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="RSVP to event"
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    RSVP
                  </a>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Description with modern card design */}
        {event.description && (
          <>
            <Separator className="opacity-30" />
            <CardContent className="pt-4">
              <div className="rounded-lg border bg-muted/30 p-4 backdrop-blur-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </div>
    </Card>
  );
}

function EventsList() {
  const [data] = api.event.getAll.useSuspenseQuery();

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-12 text-center">
        <div className="rounded-full bg-muted/50 p-4">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">No Upcoming Events</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {data.map((event) => (
        <EventCard key={event.id} event={event as EventWithRelations} />
      ))}
    </div>
  );
}

function EventsPageSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader className="pb-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-7 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function EventsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as CurrentUser | undefined;

  if (!currentUser) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <EventsPageSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsList />
      </Suspense>
    </div>
  );
}