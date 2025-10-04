// src/hooks/useAuth.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Auth hook provides session access ONLY
 */

/**
 * Design Pattern - Adapter Pattern
 * Wraps NextAuth's useSession for type safety
 */

"use client";

import { useSession } from "next-auth/react";
import { AdminRole } from "@/models/Admin";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isExecutive: session?.user?.role === "EXECUTIVE",
    isCommissioner: session?.user?.role === "COMMISSIONER",
    hasFullAccess: session?.user?.allLocations === true,
  };
}
