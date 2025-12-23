// src/constants/permissions.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Define permissions and role mappings ONLY
 */

/**
 * DRY Principle
 * Single source of truth for all permissions
 */
// src/constants/permissions.ts

import { AdminRole } from "@/models/Admin";

export type Permission =
  // Dashboard
  | "view_dashboard"

  // League Management - EXECUTIVE only
  | "manage_cities"
  | "manage_locations"
  | "manage_levels"

  // League Management - EXECUTIVE + COMMISSIONER
  | "manage_divisions"
  | "view_divisions"
  | "manage_teams"
  | "view_teams"
  | "manage_players"
  | "view_players"

  // Admin Management
  | "manage_admins"

  // Game Management
  | "manage_games"
  | "view_games"

  // Payment Management
  | "manage_prices"
  | "manage_payments"
  | "view_payments"

  // Jersey Management
  | "manage_jerseys"
  | "view_jerseys"

  // Photos Management
  | "manage_photos"
  | "view_photos"

  // Scorekeeper Tools
  | "manage_scores"

  // Communications
  | "manage_communications"
  | "view_communications"

  // Terminal Management
  | "manage_terminal"
  | "view_terminal"

  // Exports
  | "export_players";

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  EXECUTIVE: [
    "view_dashboard",
    "manage_cities",
    "manage_locations",
    "manage_levels",
    "manage_divisions",
    "view_divisions",
    "manage_teams",
    "view_teams",
    "manage_players",
    "view_players",
    "manage_admins",
    "manage_games",
    "view_games",
    "manage_prices",
    "manage_payments",
    "view_payments",
    "manage_jerseys",
    "view_jerseys",
    "manage_photos",
    "view_photos",
    "manage_scores",
    "manage_communications",
    "view_communications",
    "manage_terminal",
    "view_terminal",
    "export_players",
  ],

  COMMISSIONER: [
    "view_dashboard",
    // NO manage_cities, manage_locations, manage_levels
    "manage_divisions",
    "view_divisions",
    "manage_teams",
    "view_teams",
    "manage_players",
    "view_players",
    "manage_games",
    "view_games",
    "manage_payments",
    "view_payments",
    "manage_jerseys",
    "view_jerseys",
    "manage_photos",
    "view_photos",
    "manage_scores",
    "manage_communications",
    "view_communications",
    "manage_terminal",
    "view_terminal",
  ],

  SCOREKEEPER: ["view_dashboard", "manage_scores", "view_games"],

  PHOTOGRAPHER: [
    "view_dashboard",
    "manage_photos",
    "view_photos",
    "view_games",
  ],
};

export function hasPermission(
  role: AdminRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: AdminRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}
