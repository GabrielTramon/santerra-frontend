import { CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';

import { DeleteRecordButton } from '@/components/crud/delete-record-button';
import { RecordDetails } from '@/components/crud/record-details';
import { RecordPageLayout } from '@/components/layout/record-page-layout';
import { getRecordOrNotFound } from '@/lib/api';
import { authOptions } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { hasPermission, requireSession } from '@/lib/session';
import type { Event } from '@/types/event';

import EventForm from '../event-form';
import { EVENT_DELETE_TEXTS } from '../events-config';

type EventPageProps = {
  params: Promise<{ id: string }>;
};

function getEvent(id: string, token: string): Promise<Event> {
  return getRecordOrNotFound<Event>(`/events/${id}`, token);
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session || !hasPermission(session, 'events.read')) {
    return { title: 'Evento' };
  }

  const { id } = await params;
  const event = await getEvent(id, session.accessToken);

  return { title: event.name };
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await requireSession('events.read');
  const { id } = await params;
  const event = await getEvent(id, session.accessToken);
  const canUpdate = hasPermission(session, 'events.update');
  const canDelete = hasPermission(session, 'events.delete');

  return (
    <RecordPageLayout
      backHref='/admin/events'
      backLabel='Eventos'
      icon={CalendarDays}
      title={event.name}
      description={`Cadastro criado em ${formatDate(event.createdAt, 'long')}`}
      actions={
        canDelete && (
          <DeleteRecordButton
            {...EVENT_DELETE_TEXTS}
            recordName={event.name}
            deletePath={`/events/${event.id}`}
            listHref='/admin/events'
          />
        )
      }
    >
      {canUpdate ? (
        <EventForm event={event} />
      ) : (
        <RecordDetails
          title='Dados do evento'
          fields={[
            { label: 'Nome', value: event.name },
            { label: 'Descrição', value: event.description, wide: true },
          ]}
        />
      )}
    </RecordPageLayout>
  );
}
