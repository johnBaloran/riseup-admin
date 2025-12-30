// src/data/tutorials/executive-league-operations.ts

/**
 * Executive-level tutorials for League Operations
 * Covers Pricing, Divisions, Teams, and Players
 */

import { Tutorial } from "@/types/tutorial";

export const executiveLeagueOperationsTutorials: Tutorial[] = [
  {
    id: "managing-pricing-tiers",
    title: "Managing Pricing Tiers",
    description:
      "Create pricing structures, set up early bird pricing, configure regular pricing, and understand how pricing applies to divisions.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 5,
    difficulty: "intermediate",
    tags: ["pricing", "early-bird", "installments", "registration-fee"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-pricing-structures",
        heading: "Creating Pricing Structures",
        description: "Set up different pricing tiers for your league.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Pricing" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Create New Pricing".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in the pricing details:",
            substeps: [
              "Pricing Name - Descriptive name (e.g., 'Summer 2024 Pricing', 'Fall Elite Pricing')",
              "Season - Which season this pricing is for",
              "Active - Whether this pricing tier is currently available",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Set the pricing amounts (covered in detail in next sections):",
            substeps: [
              "Early Bird pricing",
              "Regular pricing",
              "Installment options",
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save" to create the pricing tier.',
          },
        ],
      },
      {
        id: "early-bird-pricing",
        heading: "Setting Up Early Bird Pricing",
        description:
          "Configure discounted pricing for players who register early.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Early bird pricing encourages players to register before a deadline.",
          },
          {
            stepNumber: 2,
            instruction: "When creating or editing a pricing tier, set:",
            substeps: [
              "Early Bird Price - Discounted amount (e.g., $120)",
              "Early Bird Deadline - Date when early bird expires",
              "Early Bird Installment Price - Total if paid in installments (usually slightly higher, e.g., $130)",
              "Installment Count - How many payments (e.g., 2, 3, or 4)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Example early bird configuration:",
            substeps: [
              "Early Bird Full: $120",
              "Early Bird Installments: $130 (paid in 2 installments of $65)",
              "Deadline: March 15, 2024",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Make installment pricing slightly higher ($10-20) to cover Stripe processing fees and encourage full payment.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Set realistic deadlines:",
            tips: [
              {
                type: "warning",
                content:
                  "Give yourself at least 2-3 weeks between early bird deadline and season start for late registrations.",
              },
            ],
          },
        ],
      },
      {
        id: "regular-pricing",
        heading: "Regular Pricing Configuration",
        description: "Set up standard pricing for after early bird expires.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Regular pricing applies after the early bird deadline passes.",
          },
          {
            stepNumber: 2,
            instruction: "Configure regular pricing amounts:",
            substeps: [
              "Regular Price - Standard full payment (e.g., $150)",
              "Regular Installment Price - Total if paid in installments (e.g., $165)",
              "Installment Count - Same as early bird or different",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Example regular pricing:",
            substeps: [
              "Regular Full: $150",
              "Regular Installments: $165 (paid in 2 installments of $82.50)",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Regular pricing is typically $20-40 higher than early bird to reward early registration.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Players automatically see regular pricing after early bird deadline.",
            tips: [
              {
                type: "success",
                content:
                  "The system automatically switches pricing tiers based on registration date - no manual work needed!",
              },
            ],
          },
        ],
      },
      {
        id: "pricing-applies-to-divisions",
        heading: "How Pricing Applies to Divisions",
        description:
          "Understanding the relationship between pricing tiers and divisions.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Pricing is assigned at the division level, not globally.",
          },
          {
            stepNumber: 2,
            instruction: "When creating a division, you select which pricing tier to use.",
            tips: [
              {
                type: "info",
                content:
                  "This allows you to have different pricing for different divisions (e.g., Elite divisions cost more).",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Example division pricing setup:",
            substeps: [
              "Toronto Monday Recreational → Uses 'Summer 2024 Standard Pricing' ($120 early bird)",
              "Toronto Monday Competitive → Uses 'Summer 2024 Competitive Pricing' ($150 early bird)",
              "Toronto Monday Elite → Uses 'Summer 2024 Elite Pricing' ($200 early bird)",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "All players in a division inherit that division's pricing.",
          },
          {
            stepNumber: 5,
            instruction:
              "Players see their pricing tier when registering and in their payment dashboard.",
          },
          {
            stepNumber: 6,
            instruction: "To change pricing for a division:",
            substeps: [
              "Edit the division",
              "Change the pricing tier in the dropdown",
              "Save the division",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Changing division pricing doesn't affect players who already paid - only new registrations.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "creating-divisions",
    title: "Creating Divisions",
    description:
      "Set division details, assign city/level/location, configure game days and times, set capacity and pricing.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 5,
    difficulty: "intermediate",
    prerequisites: ["setting-up-cities", "managing-locations", "creating-competition-levels", "managing-pricing-tiers"],
    tags: ["divisions", "schedule", "capacity", "registration"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "setting-division-details",
        heading: "Setting Division Details",
        description: "Create a new division with basic information.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Divisions" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Create Division".',
          },
          {
            stepNumber: 3,
            instruction: "Enter the division name:",
            tips: [
              {
                type: "tip",
                content:
                  'Use descriptive names like "Toronto Monday Night Recreational" to clearly identify the division.',
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Add a division description (optional but recommended):",
            substeps: [
              "What makes this division unique",
              "Skill level expectations",
              "Any special rules or notes",
            ],
          },
        ],
      },
      {
        id: "assigning-city-level-location",
        heading: "Assigning City, Level, and Location",
        description: "Connect your division to the league structure.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Select the city where this division will operate.",
            tips: [
              {
                type: "info",
                content:
                  "This determines which Stripe account processes payments and which timezone is used.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Select the competition level:",
            substeps: [
              "Recreational - Casual play",
              "Competitive - More serious",
              "Elite - Top-tier",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Choose the location where games will be played.",
            tips: [
              {
                type: "info",
                content:
                  "Only locations assigned to the selected city will appear in the dropdown.",
              },
            ],
          },
        ],
      },
      {
        id: "game-days-and-times",
        heading: "Setting Game Days and Times",
        description: "Configure when games are played for this division.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Select the day of the week games are played:",
            substeps: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Set the start time for games (e.g., 7:00 PM).",
          },
          {
            stepNumber: 3,
            instruction: "Set the end time (e.g., 9:00 PM).",
            tips: [
              {
                type: "tip",
                content:
                  "Allow buffer time. If games run 7-9 PM, set end time as 9:15 PM to account for delays.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "This time range is used for scheduling games and displayed to players.",
          },
        ],
      },
      {
        id: "division-capacity-pricing",
        heading: "Division Capacity and Pricing",
        description: "Set limits and assign pricing to the division.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Set the maximum number of teams for this division.",
            tips: [
              {
                type: "info",
                content:
                  "Common sizes: 6 teams (small), 8 teams (standard), 10-12 teams (large).",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Set the team size (players per team, e.g., 10-12 players).",
          },
          {
            stepNumber: 3,
            instruction: "Select the pricing tier for this division.",
            tips: [
              {
                type: "tip",
                content:
                  "All players in this division will use this pricing structure.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Enable or disable registration:",
            substeps: [
              "Registration Open - Players can join",
              "Registration Closed - No new players (full or season started)",
              "Active - Division is currently running",
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Create Division" to save.',
          },
        ],
      },
    ],
  },

  {
    id: "editing-managing-divisions",
    title: "Editing & Managing Divisions",
    description:
      "Update division details, view division teams and players, and analyze division metrics.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 3,
    difficulty: "beginner",
    prerequisites: ["creating-divisions"],
    tags: ["divisions", "edit", "analytics", "roster"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "updating-division-details",
        heading: "Updating Division Details",
        description: "Make changes to existing divisions.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Divisions".',
          },
          {
            stepNumber: 2,
            instruction: "Find the division you want to edit and click on it.",
          },
          {
            stepNumber: 3,
            instruction: 'Click "Edit Division" button.',
          },
          {
            stepNumber: 4,
            instruction: "You can update:",
            substeps: [
              "Division name and description",
              "Game day and times",
              "Capacity limits",
              "Registration status",
              "Active status",
            ],
          },
          {
            stepNumber: 5,
            instruction: "Changes that require caution:",
            substeps: [
              "Changing pricing (won't affect existing paid players)",
              "Changing location (ensure teams are notified)",
              "Closing registration (prevents new sign-ups)",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "You cannot change the city or level after creation - create a new division if needed.",
              },
            ],
          },
        ],
      },
      {
        id: "viewing-division-teams-players",
        heading: "Viewing Division Teams and Players",
        description: "See all teams and players in a division.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Click on a division to view its detail page.",
          },
          {
            stepNumber: 2,
            instruction: 'The "Teams" tab shows all teams in this division:',
            substeps: [
              "Team name",
              "Player count",
              "Payment status",
              "Team captain",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Click on any team to view their roster and details.",
          },
          {
            stepNumber: 4,
            instruction: 'The "Players" tab shows all players across all teams:',
            substeps: [
              "Player name",
              "Team assignment",
              "Payment status",
              "Contact info",
            ],
          },
          {
            stepNumber: 5,
            instruction: "Use filters to find specific players or teams quickly.",
          },
        ],
      },
      {
        id: "division-analytics",
        heading: "Division Analytics",
        description: "View stats and metrics for a division.",
        steps: [
          {
            stepNumber: 1,
            instruction: "On the division detail page, view key metrics:",
            substeps: [
              "Total Teams - How many teams are in the division",
              "Total Players - Across all teams",
              "Payment Completion Rate - Percentage who have paid",
              "Revenue - Total collected so far",
              "Capacity - How full the division is",
            ],
          },
          {
            stepNumber: 2,
            instruction: "View payment breakdown by status:",
            substeps: [
              "Paid players count",
              "In Progress (installments)",
              "Has Issues",
              "Unpaid",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Use analytics to identify divisions needing attention (low payment rates, low registration, etc.).",
          },
        ],
      },
    ],
  },

  {
    id: "creating-teams",
    title: "Creating Teams",
    description:
      "Add new teams to divisions, set team name and details, and assign team captains.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["teams", "roster", "captain"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "adding-team-to-division",
        heading: "Adding a New Team to a Division",
        description: "Create teams within your divisions.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Teams" or navigate to a specific division.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Create Team".',
          },
          {
            stepNumber: 3,
            instruction: "Select which division this team belongs to.",
          },
          {
            stepNumber: 4,
            instruction: "Enter team details:",
            substeps: [
              "Team Name - Full name (e.g., 'Thunder FC', 'Blue Lightning')",
              "Team Short Name - Abbreviated (e.g., 'Thunder', 'Lightning')",
              "Team Code - 2-4 letter code (e.g., 'THU', 'BLU')",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Team codes are used in schedules and scoreboards - keep them short and clear.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "Optional: Add team colors (primary and secondary).",
          },
          {
            stepNumber: 6,
            instruction: 'Click "Create Team".',
          },
        ],
      },
      {
        id: "team-name-details",
        heading: "Setting Team Name and Details",
        description: "Configure team information and branding.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Choose meaningful team names that players will recognize.",
          },
          {
            stepNumber: 2,
            instruction: "Team name guidelines:",
            substeps: [
              "Keep it appropriate and professional",
              "Avoid offensive or controversial names",
              "Consider including division or city for clarity",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Add team logo (optional):",
            substeps: [
              "Upload an image file (PNG, JPG)",
              "Recommended size: 500x500px",
              "Logo appears on team pages and schedules",
            ],
          },
        ],
      },
      {
        id: "team-captain-assignment",
        heading: "Team Captain Assignment",
        description: "Designate team captains for communication and leadership.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Team captains are important for:",
            substeps: [
              "Communicating with their team",
              "Collecting payments (if doing cash or e-transfer)",
              "Coordinating attendance and substitutes",
              "Being the primary admin contact point",
            ],
          },
          {
            stepNumber: 2,
            instruction: "To assign a captain:",
            substeps: [
              "Go to the team detail page",
              "Click 'Assign Captain' or 'Change Captain'",
              "Select a player from the roster",
              "Confirm the selection",
            ],
          },
          {
            stepNumber: 3,
            instruction: "The captain will see additional options in their player app:",
            substeps: [
              "View full team roster",
              "Communicate with teammates",
              "See team payment status",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Captains don't have admin access - they're still regular players with extra team visibility.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "You can change captains at any time if needed.",
          },
        ],
      },
    ],
  },

  {
    id: "managing-teams",
    title: "Managing Teams",
    description:
      "View team rosters, edit team details, and understand team payment status.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 3,
    difficulty: "beginner",
    prerequisites: ["creating-teams"],
    tags: ["teams", "roster", "payment", "management"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "viewing-team-rosters",
        heading: "Viewing Team Rosters",
        description: "See all players on a team and their status.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Teams".',
          },
          {
            stepNumber: 2,
            instruction: "Click on a team to view its detail page.",
          },
          {
            stepNumber: 3,
            instruction: "The roster shows all players with:",
            substeps: [
              "Player name",
              "Jersey number",
              "Payment status (paid, in progress, unpaid, has issues)",
              "User account status (linked or not)",
              "Captain indicator",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Click on any player to view their full profile.",
          },
          {
            stepNumber: 5,
            instruction: "Use roster management tools:",
            substeps: [
              "Add Existing Player - Add a free agent from the division",
              "Create New Player - Add a brand new player directly to this team",
              "Remove Player - Make a player a free agent",
            ],
          },
        ],
        relatedSections: ["adding-players-manually"],
      },
      {
        id: "editing-team-details",
        heading: "Editing Team Details",
        description: "Update team information after creation.",
        steps: [
          {
            stepNumber: 1,
            instruction: "On the team detail page, click 'Edit Team'.",
          },
          {
            stepNumber: 2,
            instruction: "You can update:",
            substeps: [
              "Team name and short name",
              "Team code",
              "Team colors",
              "Team logo",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Changes that affect schedules:",
            tips: [
              {
                type: "warning",
                content:
                  "If you change the team code, update any printed schedules or scoreboards.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Save Changes".',
          },
        ],
      },
      {
        id: "team-payment-status",
        heading: "Understanding Team Payment Status",
        description: "Track payment completion across the entire team.",
        steps: [
          {
            stepNumber: 1,
            instruction: "The team detail page shows aggregate payment stats:",
            substeps: [
              "Total Players on roster",
              "Players Paid - Fully completed payments",
              "Players In Progress - On installment plans",
              "Players with Issues - Failed payments",
              "Players Unpaid - Haven't started payment",
              "Completion Percentage - Overall team payment rate",
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "Use this to identify teams that need payment follow-up.",
            tips: [
              {
                type: "tip",
                content:
                  "Contact team captains if their team has low payment completion rates.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "View team payment details:",
            substeps: [
              "Click 'Payment Breakdown' to see which players haven't paid",
              "Filter by status to focus on specific groups",
              "Export team payment report for captain",
            ],
          },
        ],
        relatedSections: ["team-bulk-etransfer"],
      },
    ],
  },

  {
    id: "adding-players-manually",
    title: "Adding Players Manually",
    description:
      "Create player records, assign to teams and divisions, and add player details and contact info.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["players", "registration", "manual", "add"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-player-record",
        heading: "Creating a Player Record",
        description: "Add a new player to the system manually.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Players".',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Add Player" or "Create New Player".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in basic player information:",
            substeps: [
              "Player Name - Full name",
              "Email - For communication (optional)",
              "Phone - For SMS reminders (optional)",
              "Instagram - Social handle (optional)",
            ],
          },
          {
            stepNumber: 4,
            instruction: "All fields except name are optional, but highly recommended for payment follow-up.",
            tips: [
              {
                type: "tip",
                content:
                  "Get at least phone OR email to enable payment reminders.",
              },
            ],
          },
        ],
      },
      {
        id: "assigning-team-division",
        heading: "Assigning to Team and Division",
        description: "Place the player in the league structure.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Select the division:",
            substeps: [
              "Choose city first (filters divisions)",
              "Select the division from dropdown",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Select the team (optional):",
            substeps: [
              "Choose a team from the division",
              "Or leave blank to make them a free agent",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Free agents can be added to teams later via roster management.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "The player inherits pricing from the division automatically.",
          },
        ],
      },
      {
        id: "player-contact-info",
        heading: "Player Details and Contact Info",
        description: "Add comprehensive player information.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Add contact details:",
            substeps: [
              "Email - Primary contact",
              "Phone - For SMS",
              "Instagram - Social media (many leagues use this heavily)",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Jersey information (can be added later in Jersey Management):",
            substeps: [
              "Jersey Number - 0-99",
              "Jersey Size - S, M, L, XL, 2XL",
              "Jersey Name - Last name for back of jersey",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Jersey info is now managed in the Jersey Management section, not during player creation.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: 'Click "Create Player" to save.',
          },
          {
            stepNumber: 4,
            instruction: "The player is now in the system and shows as 'Unpaid' until payment is processed.",
          },
        ],
      },
    ],
  },

  {
    id: "viewing-editing-players",
    title: "Viewing & Editing Players",
    description:
      "Access player detail pages, edit player information, and understand player status.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "league-management",
    estimatedTime: 2,
    difficulty: "beginner",
    prerequisites: ["adding-players-manually"],
    tags: ["players", "edit", "profile", "status"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "player-detail-pages",
        heading: "Player Detail Pages",
        description: "View comprehensive player information.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "League" → "Players" or find them via team roster.',
          },
          {
            stepNumber: 2,
            instruction: "Click on a player's name to view their detail page.",
          },
          {
            stepNumber: 3,
            instruction: "The player detail page shows:",
            substeps: [
              "Personal Information - Name, contact details",
              "Division and Team Assignment",
              "Payment Status - Current status and payment history",
              "User Account Link - Whether they have app access",
              "Jersey Information - Number, size, name",
              "Game Statistics - Goals, assists, games played",
              "Photos - Game photos they appear in",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Use this page to get a complete view of the player's league participation.",
          },
        ],
      },
      {
        id: "editing-player-information",
        heading: "Editing Player Information",
        description: "Update player details, including team changes.",
        steps: [
          {
            stepNumber: 1,
            instruction: "On the player detail page, click 'Edit Info'.",
          },
          {
            stepNumber: 2,
            instruction: "You can update:",
            substeps: [
              "Player Name",
              "Instagram handle",
              "Division (moves to different division)",
              "Team (switches teams or becomes free agent)",
              "User Account Link (connect/disconnect account)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Jersey information:",
            tips: [
              {
                type: "info",
                content:
                  'Jersey details are now managed via the "Manage Jersey" button which links to the Jersey Management page.',
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Changing teams or divisions:",
            substeps: [
              "Select new division (if changing divisions)",
              "Warning appears if moving to different city",
              "Select new team from dropdown",
              "Team is cleared when changing divisions",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Changing divisions doesn't affect their PaymentMethod - they keep their payment record.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save Changes".',
          },
        ],
      },
      {
        id: "understanding-player-status",
        heading: "Understanding Player Status",
        description: "Learn what different player statuses mean.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Players can have multiple status indicators:",
          },
          {
            stepNumber: 2,
            instruction: "Payment Status:",
            substeps: [
              "Paid - Fully completed payment",
              "In Progress - On installment plan",
              "Has Issues - Payment failed",
              "Unpaid - No payment attempt yet",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Team Status:",
            substeps: [
              "On Team - Assigned to a specific team",
              "Free Agent - In division but no team",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Account Status:",
            substeps: [
              "User Linked - Has app account (can log in)",
              "No Account - Manually created by admin",
            ],
          },
          {
            stepNumber: 5,
            instruction: "These statuses help you identify which players need attention and what actions to take.",
          },
        ],
      },
    ],
  },
];
