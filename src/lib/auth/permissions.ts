// src/lib/auth/permissions.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Permission checking utilities ONLY
 */

/**
 * DRY Principle
 * Centralized permission logic used across the app
 */

import { Session } from "next-auth";
import { AdminRole } from "@/models/Admin";
import { Permission, ROLE_PERMISSIONS } from "@/constants/permissions";

/**
 * Check if session has specific permission
 */
export function hasPermission(
  session: Session | null,
  permission: Permission
): boolean {
  if (!session?.user?.role) return false;

  const permissions = ROLE_PERMISSIONS[session.user.role];

  return permissions.includes(permission);
}

/**
 * Check if session has any of the specified permissions
 */
export function hasAnyPermission(
  session: Session | null,
  permissions: Permission[]
): boolean {
  if (!session?.user?.role) return false;

  const userPermissions = ROLE_PERMISSIONS[session.user.role];
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if session has all specified permissions
 */
export function hasAllPermissions(
  session: Session | null,
  permissions: Permission[]
): boolean {
  if (!session?.user?.role) return false;

  const userPermissions = ROLE_PERMISSIONS[session.user.role];
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Check if admin has access to specific location
 */
export function hasLocationAccess(
  session: Session | null,
  locationId: string
): boolean {
  if (!session?.user) return false;

  // EXECUTIVE and COMMISSIONER have access to all locations
  if (session.user.allLocations) return true;

  // Check if location is in assigned locations
  return session.user.assignedLocations.includes(locationId);
}

/**
 * Get accessible location IDs for filtering queries
 */
export function getAccessibleLocationIds(
  session: Session | null,
  allLocationsInCity: string[]
): string[] {
  if (!session?.user) return [];

  // EXECUTIVE and COMMISSIONER see all locations
  if (session.user.allLocations) return allLocationsInCity;

  // Return intersection of assigned locations and locations in the city
  return session.user.assignedLocations.filter((loc) =>
    allLocationsInCity.includes(loc)
  );
}
