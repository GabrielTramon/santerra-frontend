import { notFound, redirect } from 'next/navigation';
import { getServerSession, type Session } from 'next-auth';

import { authOptions } from './auth';

export async function requireSession(permission?: string | string[]): Promise<Session> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  if ([permission ?? []].flat().some((required) => !hasPermission(session, required))) {
    notFound();
  }

  return session;
}

export function hasPermission(session: Session, permission: string): boolean {
  return session.permissions.includes(permission);
}
