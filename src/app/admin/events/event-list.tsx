'use client';

import { useState } from 'react';
import { api, type RouterOutputs } from '~/trpc/react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash, Eye, Loader2, CalendarX2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';

type EventAdmin = RouterOutputs['event']['getAllEventsAdmin']['items'][number];
type InitialEvents = RouterOutputs['event']['getAllEventsAdmin'];

export default function EventList({ initialEvents }: { initialEvents: InitialEvents }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventAdmin | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.event.getAllEventsAdmin.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialData: { pages: [initialEvents], pageParams: [undefined] },
    }
  );

  const deleteEventMutation = api.event.deleteEvent.useMutation({
    onSuccess: async () => {
      toast.success("Event deleted successfully.");
      await refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSettled: () => {
      setEventToDelete(null);
      setShowDeleteDialog(false);
    }
  });

  const allEvents = data?.pages.flatMap((page) => page.items) ?? [];

  const getEventScope = (event: EventAdmin) => {
    if (event.courseId) return { text: 'Course', variant: 'secondary' as const, detail: event.course?.title };
    if (event.userId) return { text: 'Personal', variant: 'outline' as const, detail: event.user?.name };
    return { text: 'Global', variant: 'default' as const, detail: 'All users' };
  };

  const getEventStatus = (event: EventAdmin) => {
    const now = new Date();
    const start = new Date(event.start);
    const end = new Date(event.end);
    if (end < now) return { text: 'Past', color: 'bg-muted text-muted-foreground' };
    if (start <= now && end >= now) return { text: 'Live', color: 'bg-green-500 text-white' };
    return { text: 'Upcoming', color: 'bg-primary text-primary-foreground' };
  };

  const handleDeleteClick = (event: EventAdmin) => {
    setEventToDelete(event);
    setShowDeleteDialog(true);
  };

  if (allEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 border rounded-lg">
        <CalendarX2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">No Events Found</h2>
        <p className="text-muted-foreground mt-2">
          There are no events in the system yet. Try creating one!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allEvents.map((event) => {
          const scope = getEventScope(event);
          const status = getEventStatus(event);

          return (
            <Card key={event.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Badge className={`${status.color}`}>{status.text}</Badge>
                    <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}`)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/admin/events/${event.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(event)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm">
                <div>
                  <p className="font-semibold">Date</p>
                  <p className="text-muted-foreground">
                    {format(new Date(event.start), 'MMM d, yyyy')} - {format(new Date(event.end), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <Badge variant={scope.variant}>{scope.text}</Badge>
                  <p className="text-muted-foreground mt-1 truncate">{scope.detail}</p>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Created by {event.createdBy.name}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center mt-8">
        {hasNextPage && (
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        )}
        {!hasNextPage && allEvents.length > 0 && (
          <p className="text-muted-foreground">You&apos;ve reached the end of the list.</p>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              <span className="font-bold"> &quot;{eventToDelete?.title}&quot; </span>
              and all of its associated RSVP and attendance data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEventMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEventMutation.isPending}
              onClick={() => {
                if (eventToDelete) {
                  deleteEventMutation.mutate({ id: eventToDelete.id });
                }
              }}
            >
              {deleteEventMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
