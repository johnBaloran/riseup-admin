// src/data/tutorials/executive-operations.ts

/**
 * Executive-level tutorials for Operations
 * Covers Terminal, Jerseys, Games, Photos, and Staff Management
 */

import { Tutorial } from "@/types/tutorial";

export const executiveOperationsTutorials: Tutorial[] = [
  {
    id: "stripe-terminal-setup",
    title: "Stripe Terminal Setup",
    description:
      "Connect card readers, register terminals, process in-person payments, and understand terminal locations.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "settings",
    estimatedTime: 5,
    difficulty: "advanced",
    tags: ["terminal", "stripe", "card-reader", "in-person", "payment"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "connecting-card-readers",
        heading: "Connecting Card Readers",
        description: "Set up physical Stripe Terminal card readers.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Ensure you have a Stripe Terminal device:",
            substeps: [
              "Stripe Reader S700 (recommended)",
              "Stripe Reader M2",
              "Verifone P400",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Purchase terminals directly from Stripe. They ship pre-configured for your account.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Unbox and charge the terminal fully before first use.",
          },
          {
            stepNumber: 3,
            instruction: "Power on the terminal and follow on-screen setup:",
            substeps: [
              "Connect to Wi-Fi (recommended) or Ethernet",
              "Terminal will download firmware updates automatically",
              "Wait for 'Ready' status on screen",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "The terminal should automatically appear in your Stripe Dashboard within a few minutes.",
          },
        ],
      },
      {
        id: "terminal-registration",
        heading: "Terminal Registration",
        description: "Register terminals in the Rise Up Admin system.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Terminal" in the Rise Up Admin.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Refresh Terminals" to fetch from Stripe.',
          },
          {
            stepNumber: 3,
            instruction: "Your online terminals will appear in the list:",
            substeps: [
              "Terminal ID",
              "Device Type (S700, M2, etc.)",
              "Status (Online/Offline)",
              "Location",
              "Last Seen timestamp",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Assign a friendly label to each terminal:",
            substeps: [
              'Click "Edit" next to a terminal',
              "Enter a label (e.g., 'Front Desk Toronto', 'Mobile Unit Vancouver')",
              "Save the label",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use descriptive labels if you have multiple terminals - makes it easy to select the right one during checkout.",
              },
            ],
          },
        ],
      },
      {
        id: "processing-in-person-payments",
        heading: "Processing In-Person Payments",
        description: "Use terminal to charge players at registration events or games.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Navigate to "Payments" and find the player you want to charge.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Terminal Payment" for that player.',
          },
          {
            stepNumber: 3,
            instruction: "Select which terminal to use from the dropdown.",
            tips: [
              {
                type: "warning",
                content:
                  "Only online terminals appear. If your terminal isn't listed, check Wi-Fi connection and power.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "The amount is pre-filled based on the player's pricing tier.",
          },
          {
            stepNumber: 5,
            instruction: 'Click "Charge Terminal" to initiate payment.',
          },
          {
            stepNumber: 6,
            instruction: "The terminal screen will prompt the player:",
            substeps: [
              "Insert chip card (preferred)",
              "Tap contactless card or phone",
              "Swipe magnetic stripe (fallback)",
            ],
          },
          {
            stepNumber: 7,
            instruction: "Wait for processing (typically 5-10 seconds).",
          },
          {
            stepNumber: 8,
            instruction: "Payment result:",
            substeps: [
              "Approved - Player marked as paid, receipt prints (if enabled)",
              "Declined - Try again or use alternate payment method",
            ],
            tips: [
              {
                type: "success",
                content:
                  "Terminal payments update the player's status immediately - no manual recording needed!",
              },
            ],
          },
        ],
      },
      {
        id: "terminal-locations",
        heading: "Understanding Terminal Locations",
        description: "Configure terminal locations for accurate reporting.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Stripe Terminal Locations are physical places where terminals are used.",
          },
          {
            stepNumber: 2,
            instruction: "Create locations in Stripe Dashboard:",
            substeps: [
              "Log in to Stripe Dashboard",
              "Go to Terminal → Locations",
              "Create location (e.g., 'Toronto Registration Desk')",
              "Add address details",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Assign terminals to locations in Stripe.",
          },
          {
            stepNumber: 4,
            instruction:
              "Benefits of location tracking:",
            substeps: [
              "Reporting - Revenue by physical location",
              "Compliance - Required in some jurisdictions",
              "Organization - Easily identify which terminal is where",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "jersey-dashboard",
    title: "Jersey Dashboard",
    description:
      "View jersey orders by team, understand jersey status, and use filtering and search features.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "jerseys",
    estimatedTime: 4,
    difficulty: "beginner",
    tags: ["jerseys", "orders", "teams", "filtering"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "viewing-jersey-orders-by-team",
        heading: "Viewing Jersey Orders by Team",
        description: "See which teams have placed jersey orders.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Jerseys" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: "The jersey dashboard shows all teams with jersey information:",
            substeps: [
              "Team Name and Division",
              "Total Players on roster",
              "Players with complete jersey info (number + size + name)",
              "Players missing jersey info",
              "Completion percentage",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Teams are organized by division and city for easy browsing.",
          },
          {
            stepNumber: 4,
            instruction: "Click on a team to view detailed jersey breakdown for all players.",
          },
        ],
      },
      {
        id: "understanding-jersey-status",
        heading: "Understanding Jersey Status",
        description: "Learn what jersey completion means and why it matters.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Jersey status tracks whether players have provided all required info:",
            substeps: [
              "Jersey Number (0-99)",
              "Jersey Size (S, M, L, XL, 2XL)",
              "Jersey Name (last name for back of jersey)",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Status indicators:",
            substeps: [
              "Complete - All three fields filled in",
              "Incomplete - One or more fields missing",
              "Empty - No jersey info provided yet",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Use completion percentage to track which teams are ready for jersey orders.",
            tips: [
              {
                type: "tip",
                content:
                  "Set a deadline for jersey info submission before placing bulk orders with suppliers.",
              },
            ],
          },
        ],
      },
      {
        id: "jersey-filtering-search",
        heading: "Filtering and Searching",
        description: "Find specific teams or players quickly.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Use the city filter to show only teams from a specific location.",
          },
          {
            stepNumber: 2,
            instruction: "Use the division filter to narrow by division.",
          },
          {
            stepNumber: 3,
            instruction: 'Filter by completion status:',
            substeps: [
              "All Teams",
              "Complete - 100% of players have jersey info",
              "Incomplete - Some missing info",
              "Empty - No players have provided info yet",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Use search to find specific team names quickly.",
          },
        ],
      },
    ],
  },

  {
    id: "managing-jersey-orders",
    title: "Managing Jersey Orders",
    description:
      "View team jersey details, manage individual player jerseys, and export jersey data to CSV.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "jerseys",
    estimatedTime: 4,
    difficulty: "beginner",
    prerequisites: ["jersey-dashboard"],
    tags: ["jerseys", "export", "csv", "orders"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "viewing-team-jersey-details",
        heading: "Viewing Team Jersey Details",
        description: "See complete jersey information for an entire team.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Jerseys" and click on a team.',
          },
          {
            stepNumber: 2,
            instruction: "The team jersey page shows a table of all players:",
            substeps: [
              "Player Name",
              "Jersey Number",
              "Jersey Size",
              "Jersey Name (back of jersey)",
              "Completion status",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Players with missing information are highlighted.",
          },
          {
            stepNumber: 4,
            instruction: "Use this view to verify jersey orders before submitting to supplier.",
          },
        ],
      },
      {
        id: "individual-player-jerseys",
        heading: "Individual Player Jerseys",
        description: "Edit jersey information for specific players.",
        steps: [
          {
            stepNumber: 1,
            instruction: "On the team jersey page, click on a player's row.",
          },
          {
            stepNumber: 2,
            instruction: "An edit dialog opens where you can update:",
            substeps: [
              "Jersey Number - Choose 0-99",
              "Jersey Size - S, M, L, XL, 2XL",
              "Jersey Name - Usually last name",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Make your changes and click 'Save'.",
          },
          {
            stepNumber: 4,
            instruction: "The player's jersey status updates immediately.",
            tips: [
              {
                type: "tip",
                content:
                  "Ask players to provide this info themselves via their player app to reduce admin work.",
              },
            ],
          },
        ],
      },
      {
        id: "exporting-jersey-data",
        heading: "Exporting Jersey Data to CSV",
        description: "Download jersey orders for supplier submission.",
        steps: [
          {
            stepNumber: 1,
            instruction: "On the team jersey page, click 'Export to CSV'.",
          },
          {
            stepNumber: 2,
            instruction: "A CSV file downloads with all player jersey information:",
            substeps: [
              "Player Name",
              "Jersey Number",
              "Jersey Size",
              "Jersey Name",
              "Team Name",
              "Division",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Send this file to your jersey supplier for bulk order processing.",
          },
          {
            stepNumber: 4,
            instruction: "Tip: Export by division or city to batch orders by location.",
            tips: [
              {
                type: "tip",
                content:
                  "Export only teams with 100% completion to avoid ordering incomplete sets.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "creating-games",
    title: "Creating Games",
    description:
      "Set up games for divisions, configure game date/time/location, and assign home/away teams.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "games",
    estimatedTime: 5,
    difficulty: "intermediate",
    tags: ["games", "schedule", "calendar", "matchups"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "setting-up-games-for-divisions",
        heading: "Setting Up Games for Divisions",
        description: "Create game schedules for your divisions.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Games" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: "Select a division to create games for.",
          },
          {
            stepNumber: 3,
            instruction: "The game schedule interface shows weeks:",
            substeps: [
              "Regular Season Weeks (Week 1, 2, 3, etc.)",
              "Playoff Weeks (Quarterfinals, Semifinals, Final)",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Click on a week to add games for that week.",
          },
        ],
      },
      {
        id: "game-date-time-location",
        heading: "Game Date, Time, and Location",
        description: "Configure when and where games are played.",
        steps: [
          {
            stepNumber: 1,
            instruction: "When creating a game, set:",
            substeps: [
              "Date - Which day the game is played",
              "Time - Start time for the game",
              "Location - Inherited from division settings (can override if needed)",
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "By default, games use the division's configured day and time.",
            tips: [
              {
                type: "info",
                content:
                  "If your division plays Mondays at 7 PM, new games default to Monday 7 PM.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Override date/time for special cases:",
            substeps: [
              "Holiday rescheduling",
              "Weather makeup games",
              "Playoff games on different days",
            ],
          },
        ],
      },
      {
        id: "assigning-home-away-teams",
        heading: "Assigning Home/Away Teams",
        description: "Set which teams are playing in each game.",
        steps: [
          {
            stepNumber: 1,
            instruction: "For each game slot, select:",
            substeps: [
              "Home Team - First team dropdown",
              "Away Team - Second team dropdown",
            ],
          },
          {
            stepNumber: 2,
            instruction: "The system prevents selecting the same team for both slots.",
            tips: [
              {
                type: "warning",
                content:
                  "A team cannot play itself! The system will block this.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Use team codes for quick identification (e.g., THU vs BLU).",
          },
          {
            stepNumber: 4,
            instruction: "Save the week's schedule when all games are configured.",
          },
          {
            stepNumber: 5,
            instruction: "Games become visible to players in the player app automatically.",
          },
        ],
      },
    ],
  },

  {
    id: "managing-games",
    title: "Managing Games",
    description:
      "View game schedules, edit game details, reschedule, and track game status.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "games",
    estimatedTime: 5,
    difficulty: "beginner",
    prerequisites: ["creating-games"],
    tags: ["games", "schedule", "edit", "reschedule", "status"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "viewing-game-schedules",
        heading: "Viewing Game Schedules",
        description: "See all games across divisions and weeks.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Games" to see the schedule overview.',
          },
          {
            stepNumber: 2,
            instruction: "Filter by:",
            substeps: [
              "City - See only games in specific cities",
              "Division - Focus on one division",
              "Week - View a specific week's matchups",
              "Status - Upcoming, In Progress, Completed",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Click on a division to view its full season schedule.",
          },
          {
            stepNumber: 4,
            instruction: "The schedule shows:",
            substeps: [
              "Week number and type (regular/playoff)",
              "All matchups for that week",
              "Game status (scheduled, in progress, completed)",
              "Scores (if game completed)",
            ],
          },
        ],
      },
      {
        id: "editing-game-details",
        heading: "Editing Game Details",
        description: "Make changes to scheduled games.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Games can be edited inline in the schedule view.",
          },
          {
            stepNumber: 2,
            instruction: "Click on a game to modify:",
            substeps: [
              "Date/Time - Reschedule to different day/time",
              "Teams - Swap home/away or change matchup",
              "Published - Toggle visibility to players",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Changes save automatically when you click outside the field.",
            tips: [
              {
                type: "warning",
                content:
                  "Completed games (with final scores) cannot be edited to prevent score tampering.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "When you reschedule a game, the `dateOverride` flag is set for tracking.",
          },
        ],
      },
      {
        id: "game-status-tracking",
        heading: "Game Status Tracking",
        description: "Understand different game statuses and what they mean.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Games have three main statuses:",
            substeps: [
              "Scheduled - Future game, not yet played",
              "In Progress - Game is currently happening (scorekeeper active)",
              "Completed - Game finished, final score recorded",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Additional status indicators:",
            substeps: [
              "Published - Visible to players",
              "Draft - Created but hidden from players",
              "Has Photos - Game photos uploaded",
              "Has Score - Final score entered",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Use status to track game progress and identify games needing attention (no score, no photos, etc.).",
          },
        ],
      },
    ],
  },

  {
    id: "game-photos",
    title: "Game Photos",
    description:
      "View games without photos, upload game photos, and organize photo collections.",
    roles: ["EXECUTIVE", "COMMISSIONER", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 4,
    difficulty: "beginner",
    tags: ["photos", "games", "upload", "media"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "games-without-photos",
        heading: "Viewing Games Without Photos",
        description: "Identify which games need photo uploads.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Photos" → "Game Photos".',
          },
          {
            stepNumber: 2,
            instruction: "The dashboard shows:",
            substeps: [
              "Games with 0 photos - Priority uploads",
              "Games with some photos - May need more",
              "Games with full photo sets - Complete",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Filter by:",
            substeps: [
              "Division - Focus on specific division",
              "Date Range - Recent games or specific weeks",
              "Photo Count - Games with 0, 1-10, or 10+ photos",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Click on a game to upload photos for that specific matchup.",
          },
        ],
      },
      {
        id: "uploading-game-photos",
        heading: "Uploading Game Photos",
        description: "Add photos to game records.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Select the game you want to add photos to.",
          },
          {
            stepNumber: 2,
            instruction: 'Click "Upload Photos".',
          },
          {
            stepNumber: 3,
            instruction: "Select multiple image files:",
            substeps: [
              "Supported formats: JPG, PNG, HEIC",
              "Maximum file size: 10 MB per photo",
              "Recommended: Multiple photos per game for variety",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Rename files before upload with game info (e.g., 'Toronto-Week3-Thunder-vs-Lightning-01.jpg') for easier organization.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Photos upload in batch - wait for all to complete.",
          },
          {
            stepNumber: 5,
            instruction: "Photos are automatically:",
            substeps: [
              "Compressed for web viewing",
              "Tagged with game, teams, and date",
              "Made visible to players in their app",
            ],
          },
        ],
      },
      {
        id: "photo-organization",
        heading: "Photo Organization",
        description: "Keep your photo library organized and searchable.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Best practices for photo management:",
            substeps: [
              "Upload photos within 24 hours of game",
              "Tag photos with player faces (future feature)",
              "Delete duplicates or poor quality shots",
              "Aim for 10-20 photos per game",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Players can:",
            substeps: [
              "View all photos from their games",
              "Download photos",
              "Share on social media",
              "Tag themselves and teammates",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Use game photos for:",
            substeps: [
              "Social media promotion",
              "Season highlight videos",
              "League marketing materials",
              "Player engagement",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "High-quality game photos significantly improve player satisfaction and retention!",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "media-day-setup",
    title: "Media Day Setup",
    description:
      "Create media day sessions, set location and date, and manage photo upload workflow.",
    roles: ["EXECUTIVE", "COMMISSIONER", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 4,
    difficulty: "intermediate",
    tags: ["media-day", "photos", "headshots", "team-photos"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-media-day-sessions",
        heading: "Creating Media Day Sessions",
        description: "Set up organized photo shoot events.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Photos" → "Media Day".',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Create Media Day Session".',
          },
          {
            stepNumber: 3,
            instruction: "Configure session details:",
            substeps: [
              "Session Name - Descriptive name (e.g., 'Toronto Fall 2024 Media Day')",
              "Date - When the photo session is scheduled",
              "Location - Where photos will be taken",
              "Division(s) - Which divisions are included",
              "Status - Draft or Published",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Create Session".',
          },
        ],
      },
      {
        id: "media-day-location-date",
        heading: "Setting Location and Date",
        description: "Schedule and locate media day sessions.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Choose an appropriate location:",
            substeps: [
              "Indoor facility with good lighting",
              "Neutral background (or branded backdrop)",
              "Enough space for equipment and waiting players",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Schedule media day strategically:",
            substeps: [
              "Before season starts - Photos ready for rosters",
              "During a game day - Players already gathering",
              "Allow 2-3 hours for large divisions",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Schedule 2-3 minutes per player for individual photos + team photos at the end.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Notify players:",
            substeps: [
              "Email/SMS with date, time, location",
              "What to wear (jersey color, league shirt, etc.)",
              "Expected duration",
            ],
          },
        ],
      },
      {
        id: "media-day-photo-upload-workflow",
        heading: "Photo Upload Workflow",
        description: "Efficiently upload and organize media day photos.",
        steps: [
          {
            stepNumber: 1,
            instruction: "During media day:",
            substeps: [
              "Photograph each player individually",
              "Take team photos for each team",
              "Name files with player name or team (e.g., 'John-Doe.jpg', 'Thunder-Team.jpg')",
            ],
          },
          {
            stepNumber: 2,
            instruction: "After media day:",
            substeps: [
              "Navigate to the media day session in admin",
              "Click 'Upload Photos'",
              "Select all photos from the session",
            ],
          },
          {
            stepNumber: 3,
            instruction: "The system processes uploads:",
            substeps: [
              "Compresses images for web",
              "Tags with media day session",
              "Makes available to players",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Manually assign photos to players:",
            substeps: [
              "View uploaded photos",
              "Click on a photo",
              "Select which player(s) are in the photo",
              "Save tags",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Future enhancement: AI face recognition to auto-tag players.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "understanding-admin-roles",
    title: "Understanding Admin Roles",
    description:
      "Learn the differences between Executive, Commissioner, Scorekeeper, and Photographer roles, their permissions, and responsibilities.",
    roles: ["EXECUTIVE"],
    category: "settings",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["admin", "roles", "permissions", "access"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "role-types",
        heading: "Executive vs Commissioner vs Scorekeeper vs Photographer",
        description: "Overview of the four admin role types.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Rise Up Admin has four distinct roles with different access levels:",
          },
          {
            stepNumber: 2,
            instruction: "EXECUTIVE - Full System Access:",
            substeps: [
              "All features and pages",
              "System setup (cities, locations, levels)",
              "Financial oversight across all cities",
              "Staff management (add/edit/delete admins)",
              "Stripe and webhook configuration",
              "Complete payment processing",
              "Full league management",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Executives are league owners, directors, or senior leadership.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "COMMISSIONER - Operations Access:",
            substeps: [
              "Daily operations (payments, league management)",
              "Cannot modify cities, locations, or levels",
              "Cannot add/edit/delete other admins",
              "Full payment processing for their city",
              "Division, team, and player management",
              "Game and photo management",
              "Jersey management",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Commissioners are city managers or operations staff.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "SCOREKEEPER - Game Scoring Only:",
            substeps: [
              "View game schedules",
              "Enter game scores and statistics",
              "Record player performance (goals, assists, etc.)",
              "No access to payments, league setup, or photos",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Scorekeepers are refs, volunteers, or game officials.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "PHOTOGRAPHER - Media Management Only:",
            substeps: [
              "View game schedules",
              "Upload game photos",
              "Manage media day sessions and photos",
              "No access to payments or league management",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Photographers are contracted photographers or media volunteers.",
              },
            ],
          },
        ],
      },
      {
        id: "permission-differences",
        heading: "Permission Differences",
        description: "Detailed breakdown of what each role can and cannot do.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Feature Access Matrix:",
          },
          {
            stepNumber: 2,
            instruction: "Dashboard & Analytics:",
            substeps: [
              "Executive - Full access, all cities",
              "Commissioner - Full access, assigned city only",
              "Scorekeeper - Limited dashboard (upcoming games only)",
              "Photographer - Limited dashboard (upcoming games only)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Payments:",
            substeps: [
              "Executive - All payment methods, all cities",
              "Commissioner - All payment methods, assigned city only",
              "Scorekeeper - No access",
              "Photographer - No access",
            ],
          },
          {
            stepNumber: 4,
            instruction: "League Management (Cities/Locations/Levels):",
            substeps: [
              "Executive - Full create/edit/delete",
              "Commissioner - View only (cannot modify)",
              "Scorekeeper - No access",
              "Photographer - No access",
            ],
          },
          {
            stepNumber: 5,
            instruction: "League Management (Divisions/Teams/Players):",
            substeps: [
              "Executive - Full create/edit/delete",
              "Commissioner - Full create/edit/delete",
              "Scorekeeper - View only",
              "Photographer - View only",
            ],
          },
          {
            stepNumber: 6,
            instruction: "Games & Scheduling:",
            substeps: [
              "Executive - Full access",
              "Commissioner - Full access",
              "Scorekeeper - View + Score entry",
              "Photographer - View only",
            ],
          },
          {
            stepNumber: 7,
            instruction: "Photos:",
            substeps: [
              "Executive - Full access",
              "Commissioner - Full access",
              "Scorekeeper - No access",
              "Photographer - Upload + manage",
            ],
          },
          {
            stepNumber: 8,
            instruction: "Staff Management:",
            substeps: [
              "Executive - Add/edit/delete all admins",
              "Commissioner - View only",
              "Scorekeeper - No access",
              "Photographer - No access",
            ],
          },
        ],
      },
      {
        id: "role-responsibilities",
        heading: "Role Responsibilities",
        description: "What each role is expected to handle.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Executive Responsibilities:",
            substeps: [
              "Overall league strategy and growth",
              "Financial oversight and reporting",
              "System configuration and setup",
              "Staff hiring and management",
              "Stripe account management",
              "Policy and rule setting",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Commissioner Responsibilities:",
            substeps: [
              "Daily payment processing and follow-ups",
              "Division and team management",
              "Player registration and support",
              "Game scheduling coordination",
              "Communication with captains and players",
              "Issue resolution",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Scorekeeper Responsibilities:",
            substeps: [
              "Arrive at games on time",
              "Accurately record scores and statistics",
              "Track player performance",
              "Submit final scores promptly",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Photographer Responsibilities:",
            substeps: [
              "Capture game action photos",
              "Upload photos within 24 hours",
              "Organize media day sessions",
              "Provide high-quality images for players",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "adding-new-staff",
    title: "Adding New Staff",
    description:
      "Create admin accounts, set roles and permissions, and configure initial password setup.",
    roles: ["EXECUTIVE"],
    category: "settings",
    estimatedTime: 4,
    difficulty: "intermediate",
    prerequisites: ["understanding-admin-roles"],
    tags: ["admin", "staff", "create", "user-management"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-admin-accounts",
        heading: "Creating Admin Accounts",
        description: "Add new staff members to the admin system.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Staff Management".',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Add Staff Member".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in staff member details:",
            substeps: [
              "Full Name - Display name in admin portal",
              "Email - Used for login (must be unique)",
              "Phone Number - Optional, for contact",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Verify the email address is correct - this will be their login username.",
            tips: [
              {
                type: "warning",
                content:
                  "Email cannot be changed easily after creation. Double-check spelling!",
              },
            ],
          },
        ],
      },
      {
        id: "setting-roles-permissions",
        heading: "Setting Roles and Permissions",
        description: "Assign appropriate access level to the new staff member.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Select the role from the dropdown:",
            substeps: [
              "Executive - Full access",
              "Commissioner - Operations",
              "Scorekeeper - Game scoring only",
              "Photographer - Photo uploads only",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Consider the principle of least privilege:",
            tips: [
              {
                type: "tip",
                content:
                  "Give the minimum access needed for their job. You can always upgrade later if needed.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "For Commissioners, you may want to assign them to a specific city (optional).",
          },
          {
            stepNumber: 4,
            instruction: "Review the selected role's permissions before saving.",
          },
        ],
      },
      {
        id: "password-setup",
        heading: "Password Setup",
        description: "Configure initial password for the new admin.",
        steps: [
          {
            stepNumber: 1,
            instruction: "You have two options for password setup:",
          },
          {
            stepNumber: 2,
            instruction: "Option A: Set a temporary password:",
            substeps: [
              "Enter a temporary password (minimum 8 characters)",
              "Check 'Force password change on first login'",
              "Admin must change it when they log in",
              "Share temporary password securely (in person or encrypted message)",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use a password generator for temporary passwords. Never use simple passwords like 'password123'.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Option B: Send password reset email:",
            substeps: [
              "Leave password field blank",
              "Check 'Send password setup email'",
              "Admin receives email with setup link",
              "They create their own password",
            ],
            tips: [
              {
                type: "success",
                content:
                  "Recommended! Letting admins set their own password is more secure and convenient.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Create Admin" to save.',
          },
          {
            stepNumber: 5,
            instruction: "The new admin can now log in using their email and password.",
          },
        ],
      },
    ],
  },

  {
    id: "managing-staff",
    title: "Managing Staff",
    description:
      "Edit staff details, change roles and email, deactivate/reactivate accounts, and delete staff members.",
    roles: ["EXECUTIVE"],
    category: "settings",
    estimatedTime: 3,
    difficulty: "beginner",
    prerequisites: ["adding-new-staff"],
    tags: ["admin", "staff", "edit", "deactivate", "delete"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "editing-staff-details",
        heading: "Editing Staff Details",
        description: "Update information for existing admins.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Staff Management".',
          },
          {
            stepNumber: 2,
            instruction: "Find the staff member you want to edit and click on their name.",
          },
          {
            stepNumber: 3,
            instruction: 'Click "Edit Details".',
          },
          {
            stepNumber: 4,
            instruction: "You can update:",
            substeps: [
              "Name - Display name",
              "Phone Number - Contact info",
              "Role - Access level (see next section)",
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save Changes".',
          },
        ],
      },
      {
        id: "changing-roles-email",
        heading: "Changing Roles and Email",
        description: "Modify admin access levels and login credentials.",
        steps: [
          {
            stepNumber: 1,
            instruction: "To change an admin's role:",
            substeps: [
              "Edit the admin",
              "Select new role from dropdown",
              "Confirm the change",
              "Save",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Downgrading an Executive to Commissioner removes their access to system setup and staff management immediately.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "You cannot change your own role:",
            tips: [
              {
                type: "info",
                content:
                  "This prevents accidental lockouts. Have another Executive change your role if needed.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "To change email address:",
            substeps: [
              "Edit the admin",
              "Update email field",
              "System checks if new email is already in use",
              "Save - admin must use new email to log in",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Notify the admin when you change their email so they can log in successfully.",
          },
        ],
      },
      {
        id: "deactivating-reactivating-accounts",
        heading: "Deactivating/Reactivating Accounts",
        description: "Temporarily disable admin access without deleting the account.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Deactivating an admin:",
            substeps: [
              "Edit the admin",
              "Click 'Deactivate Account'",
              "Confirm the action",
            ],
          },
          {
            stepNumber: 2,
            instruction: "What happens when deactivated:",
            substeps: [
              "Admin cannot log in",
              "Their data and history remain intact",
              "They don't appear in active staff lists",
              "Can be reactivated at any time",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use deactivation for seasonal staff (photographers, scorekeepers) who return each year.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Reactivating an admin:",
            substeps: [
              "Navigate to Staff Management",
              "Toggle 'Show Inactive' to view deactivated admins",
              "Find the admin",
              "Click 'Reactivate Account'",
              "Confirm",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Reactivated admins can log in immediately with their existing credentials.",
          },
        ],
      },
      {
        id: "deleting-staff-members",
        heading: "Deleting Staff Members",
        description: "Permanently remove admin accounts (use with caution).",
        steps: [
          {
            stepNumber: 1,
            instruction: "When to delete vs deactivate:",
            substeps: [
              "Delete - Admin leaving permanently, no reason to keep record",
              "Deactivate - Temporary removal or might return (recommended)",
            ],
          },
          {
            stepNumber: 2,
            instruction: "To delete an admin:",
            substeps: [
              "Edit the admin",
              "Click 'Delete Admin' (red button)",
              "Read the warning carefully",
              "Type confirmation text",
              "Click 'Permanently Delete'",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Deletion is permanent and cannot be undone. All audit logs referencing this admin will show 'Deleted Admin'.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "You cannot delete yourself:",
            tips: [
              {
                type: "info",
                content:
                  "Another Executive must delete your account to prevent accidental self-lockouts.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "What gets deleted:",
            substeps: [
              "Admin account and login credentials",
              "Personal information",
              "Role and permissions",
            ],
          },
          {
            stepNumber: 5,
            instruction: "What is preserved:",
            substeps: [
              "Audit logs (shows 'Deleted Admin' instead of name)",
              "Historical actions they took (payments processed, games created, etc.)",
            ],
          },
        ],
      },
    ],
  },
];
