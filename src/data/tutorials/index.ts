// src/data/tutorials/index.ts

/**
 * Central tutorial aggregator
 * Combines all tutorials from different role files and provides helper functions
 */

import { Tutorial, Role, TutorialCategory } from "@/types/tutorial";
import { allRolesTutorials } from "./all-roles";
import { executiveDashboardTutorials } from "./executive-dashboard";
import { executivePaymentTutorials } from "./executive-payments";
import { executiveLeagueSetupTutorials } from "./executive-league-setup";
import { executiveLeagueOperationsTutorials } from "./executive-league-operations";
import { executiveOperationsTutorials } from "./executive-operations";
import { commissionerTutorials } from "./commissioner";
import { scorekeeperTutorials } from "./scorekeeper";
import { photographerTutorials } from "./photographer";

/**
 * All tutorials combined
 */
export const allTutorials: Tutorial[] = [
  ...allRolesTutorials,
  ...executiveDashboardTutorials,
  ...executivePaymentTutorials,
  ...executiveLeagueSetupTutorials,
  ...executiveLeagueOperationsTutorials,
  ...executiveOperationsTutorials,
  ...commissionerTutorials,
  ...scorekeeperTutorials,
  ...photographerTutorials,
];

/**
 * Get tutorials filtered by user role
 */
export function getTutorialsByRole(userRole: Role): Tutorial[] {
  return allTutorials.filter(
    (tutorial) =>
      tutorial.roles.includes(userRole) || tutorial.roles.includes("ALL")
  );
}

/**
 * Get tutorials by category
 */
export function getTutorialsByCategory(
  category: TutorialCategory,
  userRole?: Role
): Tutorial[] {
  let filtered = allTutorials.filter((t) => t.category === category);

  if (userRole) {
    filtered = filtered.filter(
      (t) => t.roles.includes(userRole) || t.roles.includes("ALL")
    );
  }

  return filtered;
}

/**
 * Get a specific tutorial by ID
 */
export function getTutorialById(id: string): Tutorial | undefined {
  return allTutorials.find((t) => t.id === id);
}

/**
 * Get a specific section within a tutorial
 */
export function getTutorialSection(tutorialId: string, sectionId: string) {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return undefined;

  return tutorial.sections.find((s) => s.id === sectionId);
}

/**
 * Search tutorials by keyword (searches title, description, tags)
 */
export function searchTutorials(
  query: string,
  userRole?: Role
): Tutorial[] {
  const lowerQuery = query.toLowerCase();

  let results = allTutorials.filter(
    (tutorial) =>
      tutorial.title.toLowerCase().includes(lowerQuery) ||
      tutorial.description.toLowerCase().includes(lowerQuery) ||
      tutorial.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );

  if (userRole) {
    results = results.filter(
      (t) => t.roles.includes(userRole) || t.roles.includes("ALL")
    );
  }

  return results;
}

/**
 * Get all unique tags across tutorials
 */
export function getAllTags(userRole?: Role): string[] {
  let tutorials = allTutorials;

  if (userRole) {
    tutorials = getTutorialsByRole(userRole);
  }

  const tagSet = new Set<string>();
  tutorials.forEach((tutorial) => {
    tutorial.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}

/**
 * Get tutorials by tag
 */
export function getTutorialsByTag(tag: string, userRole?: Role): Tutorial[] {
  let filtered = allTutorials.filter((t) =>
    t.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );

  if (userRole) {
    filtered = filtered.filter(
      (t) => t.roles.includes(userRole) || t.roles.includes("ALL")
    );
  }

  return filtered;
}

/**
 * Get recommended tutorials based on prerequisites and related sections
 */
export function getRelatedTutorials(tutorialId: string): Tutorial[] {
  const tutorial = getTutorialById(tutorialId);
  if (!tutorial) return [];

  const relatedIds = new Set<string>();

  // Get all related section IDs from all sections in this tutorial
  tutorial.sections.forEach((section) => {
    section.relatedSections?.forEach((relatedSectionId) => {
      // Find which tutorial contains this section
      const relatedTutorial = allTutorials.find((t) =>
        t.sections.some((s) => s.id === relatedSectionId)
      );
      if (relatedTutorial && relatedTutorial.id !== tutorialId) {
        relatedIds.add(relatedTutorial.id);
      }
    });
  });

  // Get tutorials mentioned in prerequisites
  tutorial.prerequisites?.forEach((prereqId) => {
    relatedIds.add(prereqId);
  });

  return Array.from(relatedIds)
    .map((id) => getTutorialById(id))
    .filter((t): t is Tutorial => t !== undefined);
}

/**
 * Get tutorial categories available for a role
 */
export function getCategoriesForRole(userRole: Role): TutorialCategory[] {
  const tutorials = getTutorialsByRole(userRole);
  const categories = new Set<TutorialCategory>();

  tutorials.forEach((tutorial) => {
    categories.add(tutorial.category);
  });

  return Array.from(categories);
}

/**
 * Get tutorial count statistics
 */
export function getTutorialStats(userRole?: Role) {
  const tutorials = userRole ? getTutorialsByRole(userRole) : allTutorials;

  const byCategory: Record<TutorialCategory, number> = {
    "getting-started": 0,
    dashboard: 0,
    payments: 0,
    "league-management": 0,
    jerseys: 0,
    games: 0,
    photos: 0,
    settings: 0,
    scorekeeper: 0,
    reports: 0,
  };

  const byDifficulty = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };

  tutorials.forEach((tutorial) => {
    byCategory[tutorial.category]++;
    byDifficulty[tutorial.difficulty]++;
  });

  return {
    total: tutorials.length,
    byCategory,
    byDifficulty,
    totalEstimatedTime: tutorials.reduce(
      (sum, t) => sum + t.estimatedTime,
      0
    ),
  };
}

/**
 * Category display metadata
 */
export const categoryMetadata: Record<
  TutorialCategory,
  { label: string; description: string; icon: string }
> = {
  "getting-started": {
    label: "Getting Started",
    description: "Essential tutorials to get you started with the admin portal",
    icon: "🚀",
  },
  dashboard: {
    label: "Dashboard & Analytics",
    description: "Understanding your dashboard and data insights",
    icon: "📊",
  },
  payments: {
    label: "Payment Management",
    description: "Processing and managing player payments",
    icon: "💳",
  },
  "league-management": {
    label: "League Management",
    description: "Managing divisions, teams, and players",
    icon: "🏒",
  },
  jerseys: {
    label: "Jersey Management",
    description: "Managing jersey orders and assignments",
    icon: "👕",
  },
  games: {
    label: "Game Management",
    description: "Scheduling and managing games",
    icon: "🎮",
  },
  photos: {
    label: "Photo Management",
    description: "Uploading and organizing photos",
    icon: "📸",
  },
  settings: {
    label: "Settings & Configuration",
    description: "System setup and staff management",
    icon: "⚙️",
  },
  scorekeeper: {
    label: "Scorekeeping",
    description: "Recording game scores and events",
    icon: "📋",
  },
  reports: {
    label: "Reports & Exports",
    description: "Generating reports and exporting data",
    icon: "📈",
  },
};
