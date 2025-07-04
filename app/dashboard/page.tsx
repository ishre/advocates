import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const userRoles = session.user.roles || [];
  
  // Check if user has both advocate and client roles
  const hasAdvocateRole = userRoles.includes('advocate') || userRoles.includes('admin');
  const hasClientRole = userRoles.includes('client');
  
  // If user has both roles, redirect to advocates (priority)
  if (hasAdvocateRole) {
    redirect('/dashboard/advocates');
  }
  
  // If user only has client role, redirect to clients
  if (hasClientRole) {
    redirect('/dashboard/clients');
  }
  
  // Default fallback to advocates if no specific role is found
  redirect('/dashboard/advocates');
} 