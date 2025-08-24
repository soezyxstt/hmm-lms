import { api } from '~/trpc/server';
import { notFound } from 'next/navigation';
import EventDetailView from './event-detail-view';

interface EventDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  try {
    const { id } = await params;
    const event = await api.event.getEventById({ id });
    return <EventDetailView event={event} />;
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  try {
    const { id } = await params;
    const event = await api.event.getEventById({ id });
    return {
      title: event.title,
      description: event.description,
    };
  } catch {
    return {
      title: 'Event Not Found',
    };
  }
}