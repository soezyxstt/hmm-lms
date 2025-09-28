import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import EventForm from '../../event-form';

export const metadata = {
  title: 'Admin: Edit Event',
};

export default async function AdminEditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [event, courses] = await Promise.all([
    api.event.getEventById({ id }),
    api.course.getCoursesForSelection(),
  ]);

  if (!event) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">
          Update the details for the event: &quot;{event.title}&quot;.
        </p>
      </div>
      <div className="mt-8">
        <EventForm existingEvent={event} courses={courses} />
      </div>
    </div>
  );
}
