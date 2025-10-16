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
 * All admins now have access to all locations
 */
export function hasLocationAccess(
  session: Session | null,
  locationId: string
): boolean {
  if (!session?.user) return false;

  // All authenticated admins have access to all locations
  return true;
}

/**
 * Get accessible location IDs for filtering queries
 * All admins now have access to all locations
 */
export function getAccessibleLocationIds(
  session: Session | null,
  allLocationsInCity: string[]
): string[] {
  if (!session?.user) return [];

  // All authenticated admins see all locations
  return allLocationsInCity;
}
