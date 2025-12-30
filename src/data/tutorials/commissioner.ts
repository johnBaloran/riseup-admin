// src/data/tutorials/commissioner.ts

/**
 * Commissioner-level tutorials
 * Commissioners have most operational access but cannot modify system setup (cities, locations, levels)
 * Many tutorials reference EXECUTIVE tutorials since functionality is shared
 */

import { Tutorial } from "@/types/tutorial";

export const commissionerTutorials: Tutorial[] = [
  {
    id: "commissioner-dashboard",
    title: "Commissioner Dashboard Overview",
    description:
      "Understanding your Commissioner dashboard and how it differs from Executive view.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "dashboard",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["dashboard", "commissioner", "analytics", "overview"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "commissioner-dashboard-differences",
        heading: "Dashboard Differences from Executive",
        description: "Understanding what Commissioners can and cannot see.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Commissioner dashboards are identical to Executive dashboards with one key difference:",
            tips: [
              {
                type: "info",
                content:
                  "Commissioners see data for their assigned city only, not all cities.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "You will see:",
            substeps: [
              "Payment analytics for your city",
              "Revenue tracking for your city",
              "Payment method breakdown (city-specific)",
              "Daily trends for your assigned location",
            ],
          },
          {
            stepNumber: 3,
            instruction: "The city filter is locked to your assigned city.",
            tips: [
              {
                type: "info",
                content:
                  "If you need to see other cities, contact an Executive to change your assignment or upgrade your role.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "For detailed dashboard usage, refer to the Executive 'Understanding Your Dashboard' tutorial - all functionality is the same.",
          },
        ],
        relatedSections: ["understanding-dashboard", "dashboard-filters"],
      },
    ],
  },

  {
    id: "commissioner-limitations",
    title: "Understanding Commissioner Limitations",
    description:
      "Learn what Commissioners cannot access or modify to understand your role boundaries.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "getting-started",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["commissioner", "permissions", "limitations", "access"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "cannot-modify-system-setup",
        heading: "System Setup Restrictions",
        description: "Understanding what system configurations are Executive-only.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Commissioners cannot create or modify:",
            substeps: [
              "Cities - Cannot add new cities or edit city configurations",
              "Locations - Cannot create venues or edit facility details",
              "Competition Levels - Cannot add or modify skill tiers",
              "Stripe Configuration - Cannot change connected accounts",
              "Google Chat Webhooks - Cannot update webhook URLs",
            ],
            tips: [
              {
                type: "info",
                content:
                  "These are foundational settings that require Executive oversight for consistency and security.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "If you need any of these changed:",
            substeps: [
              "Contact an Executive admin",
              "Provide details of what you need",
              "Executive will make the change",
            ],
          },
        ],
      },
      {
        id: "cannot-manage-staff",
        heading: "Staff Management Restrictions",
        description: "Commissioners cannot add, edit, or remove admin accounts.",
        steps: [
          {
            stepNumber: 1,
            instruction: "You cannot:",
            substeps: [
              "Add new admin accounts",
              "Change admin roles",
              "Deactivate or delete admins",
              "View other admins' details",
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "If you need new staff added (scorekeepers, photographers), request it from an Executive.",
          },
        ],
      },
      {
        id: "what-commissioners-can-do",
        heading: "What Commissioners CAN Do",
        description: "Full list of Commissioner capabilities.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Commissioners have full access to:",
            substeps: [
              "All payment processing and management",
              "Division creation and editing (within existing cities/locations/levels)",
              "Team management (create, edit, delete)",
              "Player management (add, edit, transfer, delete)",
              "Game scheduling and management",
              "Jersey management",
              "Photo uploads and media day management",
              "Data exports",
              "Stripe Terminal usage",
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "Essentially, Commissioners run day-to-day league operations without system-level configuration access.",
          },
        ],
      },
    ],
  },

  // NOTE: Commissioner tutorials for Payments, League Management, Games, etc.
  // use the exact same tutorials as EXECUTIVE since functionality is identical.
  // The tutorial system will filter by role to show appropriate tutorials.

  // Here's a reference tutorial that points to Executive tutorials:
  {
    id: "commissioner-payment-processing",
    title: "Payment Processing (Commissioner)",
    description:
      "Commissioners process payments identically to Executives. Refer to Executive payment tutorials for detailed instructions.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 1,
    difficulty: "beginner",
    tags: ["payments", "reference", "commissioner"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "payment-tutorial-reference",
        heading: "Payment Tutorials Reference",
        description: "Where to find detailed payment processing instructions.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Commissioners have full payment processing access. All Executive payment tutorials apply to you.",
          },
          {
            stepNumber: 2,
            instruction: "Refer to these tutorials:",
            substeps: [
              "Payment Dashboard Overview",
              "Processing Unpaid Players",
              "Handling In-Progress Payments",
              "Managing Payment Issues",
              "Cash & E-Transfer Payments",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "The only difference: You see payments for your assigned city only, not all cities.",
          },
        ],
        relatedSections: [
          "payment-dashboard-overview",
          "processing-unpaid-players",
          "handling-in-progress-payments",
          "managing-payment-issues",
          "cash-and-etransfer-payments",
        ],
      },
    ],
  },

  {
    id: "commissioner-league-management",
    title: "League Management (Commissioner)",
    description:
      "Commissioners manage divisions, teams, and players. Refer to Executive league tutorials for detailed instructions.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 1,
    difficulty: "beginner",
    tags: ["league", "reference", "commissioner"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "league-tutorial-reference",
        heading: "League Management Tutorials Reference",
        description: "Where to find detailed league management instructions.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Commissioners have full league management access (divisions, teams, players). All Executive league tutorials apply to you.",
          },
          {
            stepNumber: 2,
            instruction: "Refer to these tutorials:",
            substeps: [
              "Managing Pricing Tiers",
              "Creating Divisions",
              "Editing & Managing Divisions",
              "Creating Teams",
              "Managing Teams",
              "Adding Players Manually",
              "Viewing & Editing Players",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Limitations:",
            substeps: [
              "Cannot create new cities - use existing cities only",
              "Cannot create new locations - use existing venues only",
              "Cannot create new competition levels - use existing levels only",
            ],
            tips: [
              {
                type: "info",
                content:
                  "If you need new cities, locations, or levels, contact an Executive.",
              },
            ],
          },
        ],
        relatedSections: [
          "managing-pricing-tiers",
          "creating-divisions",
          "editing-managing-divisions",
          "creating-teams",
          "managing-teams",
          "adding-players-manually",
          "viewing-editing-players",
        ],
      },
    ],
  },
];
