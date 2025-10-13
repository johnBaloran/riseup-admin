// src/contexts/NavigationContext.tsx

/**
 * Navigation History Context
 * Tracks up to 15 pages of navigation history for contextual back buttons
 */

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface HistoryEntry {
  path: string;
  label: string;
  timestamp: number;
}

interface NavigationContextType {
  canGoBack: boolean;
  previousLabel: string | null;
  goBack: () => void;
  clearHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

const MAX_HISTORY = 15;
const STORAGE_KEY = "nav_history";

// Map of routes to their labels
const routeLabels: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/games": "Game Schedule",
  "/admin/payments": "Payments",
  // League routes
  "/admin/league/divisions": "Divisions",
  "/admin/league/teams": "Teams",
  "/admin/league/players": "Players",
  "/admin/league/locations": "Locations",
};

// Get label for a path
function getLabelForPath(path: string): string {
  // Check exact match first
  if (routeLabels[path]) {
    return routeLabels[path];
  }

  // Check dynamic routes - support both /admin/league/... and /admin/{cityId}/league/... patterns

  // Division details: /admin/league/divisions/{id} or /admin/{cityId}/league/divisions/{id}
  if (path.match(/^\/admin\/(league\/divisions\/[^/]+|[^/]+\/league\/divisions\/[^/]+)$/)) {
    return "Division Details";
  }

  // Team details: /admin/league/teams/{id} or /admin/{cityId}/league/teams/{id}
  if (path.match(/^\/admin\/(league\/teams\/[^/]+|[^/]+\/league\/teams\/[^/]+)$/)) {
    return "Team Details";
  }

  // Player details: /admin/league/players/{id} or /admin/{cityId}/league/players/{id}
  if (path.match(/^\/admin\/(league\/players\/[^/]+|[^/]+\/league\/players\/[^/]+)$/)) {
    return "Player Details";
  }

  // Division schedule: /admin/games/{divisionId}
  if (path.match(/^\/admin\/games\/[^/]+$/)) {
    return "Division Schedule";
  }

  // List pages
  if (path.match(/^\/admin\/(league\/divisions|[^/]+\/league\/divisions)$/)) {
    return "Divisions";
  }
  if (path.match(/^\/admin\/(league\/teams|[^/]+\/league\/teams)$/)) {
    return "Teams";
  }
  if (path.match(/^\/admin\/(league\/players|[^/]+\/league\/players)$/)) {
    return "Players";
  }

  return "Back";
}

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Load history from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load navigation history:", error);
    }
  }, []);

  // Save history to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save navigation history:", error);
    }
  }, [history]);

  // Track page changes
  useEffect(() => {
    if (!pathname) return;

    setHistory((prev) => {
      // Don't add if it's the same as the last entry
      if (prev.length > 0 && prev[prev.length - 1].path === pathname) {
        console.log("NavigationContext: Skipping duplicate path", pathname);
        return prev;
      }

      // Don't add utility pages to history (edit, new, roster, etc.)
      const isUtilityPage =
        pathname.includes("/edit") ||
        pathname.includes("/new") ||
        pathname.includes("/roster") ||
        pathname.endsWith("/edit") ||
        pathname.endsWith("/new");

      if (isUtilityPage) {
        console.log("NavigationContext: Skipping utility page", pathname);
        return prev;
      }

      const label = getLabelForPath(pathname);
      const newEntry: HistoryEntry = {
        path: pathname,
        label,
        timestamp: Date.now(),
      };

      // Add to history and keep only last MAX_HISTORY entries
      const newHistory = [...prev, newEntry].slice(-MAX_HISTORY);

      console.log("NavigationContext: Adding to history", {
        pathname,
        label,
        historyLength: newHistory.length,
        fullHistory: newHistory,
      });

      return newHistory;
    });
  }, [pathname]);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length < 2) return prev;

      // Remove current page (last entry)
      const newHistory = prev.slice(0, -1);

      // Navigate to previous page
      const previousPage = newHistory[newHistory.length - 1];
      if (previousPage) {
        router.push(previousPage.path);
      }

      return newHistory;
    });
  }, [router]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear navigation history:", error);
    }
  }, []);

  // Get previous page info (second to last in history)
  const canGoBack = history.length >= 2;
  const previousLabel = canGoBack ? history[history.length - 2].label : null;

  return (
    <NavigationContext.Provider
      value={{
        canGoBack,
        previousLabel,
        goBack,
        clearHistory,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
