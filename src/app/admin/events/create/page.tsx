// app/admin/events/create/page.tsx
import EventForm from '../event-form';

export default function CreateEventPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <EventForm mode="create" />
    </div>
  );
}
