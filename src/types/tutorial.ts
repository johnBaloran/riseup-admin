// src/types/tutorial.ts

/**
 * Tutorial System Type Definitions
 *
 * These types define the structure for the Rise Up Admin tutorial documentation system.
 * Tutorials are role-based, categorized, and support deep linking to specific sections.
 */

export type Role = "EXECUTIVE" | "COMMISSIONER" | "SCOREKEEPER" | "PHOTOGRAPHER" | "ALL";

export type TutorialCategory =
  | "getting-started"
  | "dashboard"
  | "payments"
  | "league-management"
  | "jerseys"
  | "games"
  | "photos"
  | "settings"
  | "scorekeeper"
  | "reports";

export interface TutorialImage {
  src: string; // Path to image (e.g., /tutorials/dashboard/overview-1.webp)
  alt: string; // Alt text for accessibility
  caption?: string; // Optional caption below image
}

export interface TutorialTip {
  type: "tip" | "warning" | "info" | "success";
  content: string;
}

export interface TutorialStep {
  stepNumber: number;
  instruction: string; // Clear, actionable instruction
  image?: TutorialImage; // Screenshot showing this step
  tips?: TutorialTip[]; // Helpful tips or warnings
  substeps?: string[]; // Optional sub-steps for complex actions
}

export interface TutorialSection {
  id: string; // Unique ID for deep linking (e.g., "cash-payments")
  heading: string; // Section title
  description?: string; // Brief description of what this section covers
  steps: TutorialStep[]; // Step-by-step instructions
  relatedSections?: string[]; // IDs of related tutorial sections
}

export interface Tutorial {
  id: string; // Unique tutorial ID (e.g., "payment-dashboard-overview")
  title: string; // Tutorial title
  description: string; // Brief description of what this tutorial teaches
  roles: Role[]; // Which roles can access this tutorial
  category: TutorialCategory; // Category for organization
  estimatedTime: number; // Estimated time in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[]; // IDs of tutorials that should be completed first
  sections: TutorialSection[]; // Tutorial content broken into sections
  tags: string[]; // Keywords for search (e.g., ["stripe", "cash", "payment"])
  lastUpdated: string; // ISO date string
}

export interface TutorialCategoryGroup {
  category: TutorialCategory;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  tutorials: Tutorial[];
}

export interface TutorialProgress {
  tutorialId: string;
  userId: string;
  completed: boolean;
  lastViewed: string; // ISO date string
  completedSections: string[]; // Section IDs that have been marked complete
}
