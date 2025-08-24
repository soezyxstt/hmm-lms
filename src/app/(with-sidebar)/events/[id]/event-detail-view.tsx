'use client';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  User,
  GraduationCap,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';
import { type RouterOutputs } from '~/trpc/react';
import Link from 'next/link';

interface EventDetailViewProps {
  event: RouterOutputs['event']['getEventById'];
}

// Better contrast color system
const colorThemes = {
  SKY: {
    badge: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-300 dark:border-blue-400/20',
    accent: 'border-l-blue-500 bg-blue-500/5 dark:bg-blue-400/5',
    timeline: 'bg-blue-500 dark:bg-blue-400',
    timelineText: 'text-blue-700 dark:text-blue-300',
  },
  AMBER: {
    badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20',
    accent: 'border-l-amber-500 bg-amber-500/5 dark:bg-amber-400/5',
    timeline: 'bg-amber-500 dark:bg-amber-400',
    timelineText: 'text-amber-700 dark:text-amber-300',
  },
  VIOLET: {
    badge: 'bg-violet-500/10 text-violet-700 border-violet-500/20 dark:bg-violet-400/10 dark:text-violet-300 dark:border-violet-400/20',
    accent: 'border-l-violet-500 bg-violet-500/5 dark:bg-violet-400/5',
    timeline: 'bg-violet-500 dark:bg-violet-400',
    timelineText: 'text-violet-700 dark:text-violet-300',
  },
  ROSE: {
    badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20',
    accent: 'border-l-rose-500 bg-rose-500/5 dark:bg-rose-400/5',
    timeline: 'bg-rose-500 dark:bg-rose-400',
    timelineText: 'text-rose-700 dark:text-rose-300',
  },
  EMERALD: {
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20',
    accent: 'border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-400/5',
    timeline: 'bg-emerald-500 dark:bg-emerald-400',
    timelineText: 'text-emerald-700 dark:text-emerald-300',
  },
  ORANGE: {
    badge: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-300 dark:border-orange-400/20',
    accent: 'border-l-orange-500 bg-orange-500/5 dark:bg-orange-400/5',
    timeline: 'bg-orange-500 dark:bg-orange-400',
    timelineText: 'text-orange-700 dark:text-orange-300',
  },
};

export default function EventDetailView({ event }: EventDetailViewProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const isMultiDay = startDate.toDateString() !== endDate.toDateString();

  const timeline = event.timeline as Array<{
    time: string;
    title: string;
    description?: string;
    isCompleted?: boolean;
  }> | null;

  const getEventScope = () => {
    if (event.courseId) return { type: 'course', label: 'Course Event', icon: GraduationCap };
    if (event.userId) return { type: 'personal', label: 'Personal Event', icon: User };
    return { type: 'global', label: 'Global Event', icon: Globe };
  };

  const scope = getEventScope();
  const ScopeIcon = scope.icon;
  const colorTheme = colorThemes[event.color];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with RSVP */}
      <Card className={`${colorTheme.accent} border-l-4`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
                <Badge className={colorTheme.badge}>
                  {event.color.toLowerCase()}
                </Badge>
                {event.hasTimeline && (
                  <Badge variant="outline" className="border-border">Timeline Available</Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <ScopeIcon className="h-4 w-4" />
                <span className="text-sm">{scope.label}</span>
                {event.course && (
                  <>
                    <span>•</span>
                    <span className="text-sm">{event.course.title}</span>
                  </>
                )}
              </div>
            </div>

            {event.rsvp && (
              <Button asChild size="lg" className="shrink-0">
                <Link href={event.rsvp} target="_blank" rel="noopener noreferrer">
                  RSVP <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline - Completely redesigned */}
          {event.hasTimeline && timeline && timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Clock className="h-5 w-5" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {timeline.map((item, index) => {
                    const itemTime = new Date(item.time);
                    const isCompleted = item.isCompleted ?? false;
                    const isLast = index === timeline.length - 1;

                    return (
                      <div key={index} className="p-6 relative">
                        {/* Timeline connector line */}
                        {!isLast && (
                          <div className="absolute left-9 top-16 bottom-0 w-px bg-border"></div>
                        )}

                        <div className="flex gap-4">
                          {/* Timeline indicator */}
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div className={`w-6 h-6 rounded-full ${colorTheme.timeline}`}></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h4 className={`font-semibold text-lg leading-tight ${isCompleted
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-foreground'
                                }`}>
                                {item.title}
                              </h4>
                              <Badge
                                variant="secondary"
                                className="text-xs font-medium shrink-0"
                              >
                                {format(itemTime, 'MMM d, h:mm a')}
                              </Badge>
                            </div>

                            {item.description && (
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date & Time */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  Date
                </div>
                <p className="text-sm pl-6 text-muted-foreground">
                  {event.allDay ? (
                    isMultiDay ? (
                      `${format(startDate, 'EEEE, MMMM d')} - ${format(endDate, 'EEEE, MMMM d, yyyy')}`
                    ) : (
                      format(startDate, 'EEEE, MMMM d, yyyy')
                    )
                  ) : (
                    isMultiDay ? (
                      <>
                        {format(startDate, 'EEEE, MMMM d, yyyy')}
                        <br />
                        {format(startDate, 'h:mm a')} - {format(endDate, 'EEEE, MMMM d, yyyy • h:mm a')}
                      </>
                    ) : (
                      <>
                        {format(startDate, 'EEEE, MMMM d, yyyy')}
                        <br />
                        {format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                      </>
                    )
                  )}
                </p>
              </div>

              {!event.allDay && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Duration
                    </div>
                    <p className="text-sm pl-6 text-muted-foreground">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hours
                    </p>
                  </div>
                </>
              )}

              {event.location && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Location
                    </div>
                    <p className="text-sm pl-6 text-muted-foreground">{event.location}</p>
                  </div>
                </>
              )}

              {event.course && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      Course
                    </div>
                    <p className="text-sm pl-6 text-muted-foreground">
                      {event.course.title}
                      <br />
                      <span className="text-muted-foreground/70">{event.course.classCode}</span>
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Created by
                </div>
                <p className="text-sm pl-6 text-muted-foreground">{event.createdBy.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {event.rsvp && (
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href={event.rsvp} target="_blank" rel="noopener noreferrer">
                    Open RSVP Link <ExternalLink className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}