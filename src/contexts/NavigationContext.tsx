// src/contexts/NavigationContext.tsx

/**
 * Navigation History Context
 * Tracks up to 15 pages of navigation history for contextual back buttons
 */

"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface HistoryEntry {
  path: string; // pathname only (for label matching)
  fullUrl: string; // pathname + search params (for navigation)
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
  const searchParams = useSearchParams();
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

    // Build full URL with search params
    const search = searchParams.toString();
    const fullUrl = search ? `${pathname}?${search}` : pathname;

    setHistory((prev) => {
      // Check if the last entry is the same pathname (but maybe different search params)
      const lastEntry = prev.length > 0 ? prev[prev.length - 1] : null;

      // If same pathname but different search params, UPDATE the last entry instead of adding new
      if (lastEntry && lastEntry.path === pathname) {
        if (lastEntry.fullUrl === fullUrl) {
          console.log("NavigationContext: Skipping duplicate path", fullUrl);
          return prev;
        }

        // Don't update if we're losing search params (could be a temporary state during navigation)
        const hadSearchParams = lastEntry.fullUrl.includes('?');
        const hasSearchParams = fullUrl.includes('?');

        if (hadSearchParams && !hasSearchParams) {
          console.log("NavigationContext: Skipping update - would lose search params", {
            oldUrl: lastEntry.fullUrl,
            newUrl: fullUrl,
          });
          return prev;
        }

        // Update the last entry with new search params
        const updatedHistory = [...prev];
        updatedHistory[updatedHistory.length - 1] = {
          ...lastEntry,
          fullUrl,
          timestamp: Date.now(),
        };

        console.log("NavigationContext: Updating last entry with new params", {
          pathname,
          oldUrl: lastEntry.fullUrl,
          newUrl: fullUrl,
        });

        return updatedHistory;
      }

      // Don't add utility pages to history (edit, new, roster, etc.)
      const isUtilityPage =
        pathname.includes("/edit") ||
        pathname.includes("/new") ||
        pathname.includes("/roster") ||
        pathname.endsWith("/edit") ||
        pathname.endsWith("/new");

      if (isUtilityPage) {
        console.log("NavigationContext: Skipping utility page", fullUrl);
        return prev;
      }

      const label = getLabelForPath(pathname);
      const newEntry: HistoryEntry = {
        path: pathname,
        fullUrl,
        label,
        timestamp: Date.now(),
      };

      // Add to history and keep only last MAX_HISTORY entries
      const newHistory = [...prev, newEntry].slice(-MAX_HISTORY);

      console.log("NavigationContext: Adding to history", {
        pathname,
        fullUrl,
        label,
        historyLength: newHistory.length,
        fullHistory: newHistory,
      });

      return newHistory;
    });
  }, [pathname, searchParams]);

  const goBack = useCallback(() => {
    // Use browser's native back navigation which preserves search params
    router.back();
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
