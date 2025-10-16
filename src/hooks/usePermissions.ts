// src/hooks/usePermissions.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Permission checking hook ONLY
 */

/**
 * Performance Optimization
 * Memoized permission checks
 */

"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { Permission, ROLE_PERMISSIONS } from "@/constants/permissions";

export function usePermissions() {
  const { data: session } = useSession();

  const permissions = useMemo(() => {
    if (!session?.user?.role) return [];
    return ROLE_PERMISSIONS[session.user.role];
  }, [session?.user?.role]);

  const hasPermission = useMemo(
    () => (permission: Permission) => permissions.includes(permission),
    [permissions]
  );

  const hasAnyPermission = useMemo(
    () => (perms: Permission[]) =>
      perms.some((permission) => permissions.includes(permission)),
    [permissions]
  );

  const hasLocationAccess = useMemo(
    () => (locationId: string) => {
      if (!session?.user) return false;
      // All authenticated admins have access to all locations
      return true;
    },
    [session?.user]
  );

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasLocationAccess,
  };
}
