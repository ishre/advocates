import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tenant isolation utilities
export function getTenantId(user: any): string | null {
  // If user is a main advocate, use their own ID (id from session or _id from DB)
  const id = user.id || (user._id && user._id.toString());
  if (user.isMainAdvocate || (!user.advocateId && user.roles.includes('advocate'))) {
    return id;
  }
  // If user is a team member or client, use their advocate's ID
  return user.advocateId || null;
}

export function canAccessTenant(user: any, tenantId: string): boolean {
  const userTenantId = getTenantId(user);
  return userTenantId === tenantId;
}

export function isMainAdvocate(user: any): boolean {
  return user.isMainAdvocate || (!user.advocateId && user.roles.includes('advocate'));
}

export function isTeamMember(user: any): boolean {
  return user.roles.includes('team_member');
}

export function isClient(user: any): boolean {
  return user.roles.includes('client');
}

export function hasRole(user: any, role: string): boolean {
  return user.roles.includes(role);
}
