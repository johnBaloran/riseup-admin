// src/components/providers/SessionProvider.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Wraps NextAuth SessionProvider ONLY
 */

/**
 * Design Pattern - Provider Pattern
 * Makes auth session available to all client components
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
