import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Tenant isolation utilities
export function getTenantId(user: unknown): string | null {
  const u = user as { id?: string; _id?: string; isMainAdvocate?: boolean; advocateId?: string; roles: string[] };
  const id = u.id || (u._id && u._id.toString());
  if (u.isMainAdvocate || (!u.advocateId && u.roles.includes('advocate'))) {
    return id || null;
  }
  return u.advocateId || null;
}

export function canAccessTenant(user: unknown, tenantId: string): boolean {
  const u = user as { id?: string; _id?: string; isMainAdvocate?: boolean; advocateId?: string; roles: string[] };
  const userTenantId = getTenantId(u);
  return userTenantId === tenantId;
}

export function isMainAdvocate(user: unknown): boolean {
  const u = user as { isMainAdvocate?: boolean; advocateId?: string; roles: string[] };
  return u.isMainAdvocate || (!u.advocateId && u.roles.includes('advocate'));
}

export function isTeamMember(user: unknown): boolean {
  const u = user as { roles: string[] };
  return u.roles.includes('team_member');
}

export function isClient(user: unknown): boolean {
  const u = user as { roles: string[] };
  return u.roles.includes('client');
}

export function hasRole(user: unknown, role: string): boolean {
  const u = user as { roles: string[] };
  return u.roles.includes(role);
}
