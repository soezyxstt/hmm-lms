import Link from 'next/link';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { CalendarDays, Clock, MapPin, User, GraduationCap, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { type RouterOutputs } from '~/trpc/react';

interface EventItemProps {
  event: RouterOutputs['event']['getAllEvents'][number];
  href: string;
}

// Theme-adaptive color system for cards
const colorThemes = {
  SKY: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-700',
  AMBER: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  VIOLET: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
  ROSE: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700',
  EMERALD: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  ORANGE: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
};

export default function EventItem({ event, href }: EventItemProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();
  const isUpcoming = startDate > new Date();
  const isOngoing = startDate <= new Date() && endDate >= new Date();

  const getEventScope = () => {
    if (event.course) return { type: 'course', label: event.course.title, icon: GraduationCap };
    if (event.userId) return { type: 'personal', label: 'Personal', icon: User };
    return { type: 'global', label: 'Global', icon: Globe };
  };

  const scope = getEventScope();
  const ScopeIcon = scope.icon;

  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {event.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={colorThemes[event.color]}>
                  {event.color.toLowerCase()}
                </Badge>
                {isOngoing && (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                    Live
                  </Badge>
                )}
                {isUpcoming && (
                  <Badge variant="outline">
                    Upcoming
                  </Badge>
                )}
                {event.hasTimeline && (
                  <Badge variant="secondary" className="text-xs">
                    Timeline
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
              {event.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">
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
                  format(startDate, 'MMM d, yyyy')
                )
              )}
            </span>
          </div>

          {!event.allDay && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span>
                {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <ScopeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="line-clamp-1">{scope.label}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}