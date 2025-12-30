// src/data/tutorials/photographer.ts

/**
 * Photographer-level tutorials
 * Photographers focus on game and media day photo management
 */

import { Tutorial } from "@/types/tutorial";

export const photographerTutorials: Tutorial[] = [
  {
    id: "photographer-dashboard",
    title: "Photographer Dashboard",
    description:
      "Understanding your photographer dashboard and navigating to photo sections.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "getting-started",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["photographer", "dashboard", "photos", "navigation"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "photographer-dashboard-overview",
        heading: "Understanding Your Dashboard",
        description: "What photographers see when they log in.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "As a Photographer, your dashboard is focused on photo-related tasks:",
            substeps: [
              "Upcoming games needing photos",
              "Recently uploaded photo batches",
              "Media day sessions scheduled",
              "Quick statistics (total photos uploaded, games covered)",
            ],
          },
          {
            stepNumber: 2,
            instruction: "You will NOT see:",
            substeps: [
              "Payment or financial data",
              "Player management tools",
              "Division or team setup",
              "Game scoring interface",
              "Admin settings or staff management",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Your role is photography-only - everything else is hidden to simplify your workflow.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: 'Your sidebar menu shows:',
            substeps: [
              "Dashboard",
              "Games - View schedule to know what to photograph",
              "Photos - Upload and manage game photos",
              "Media Day - Manage media day sessions and uploads",
              "Profile - Update your personal info",
            ],
          },
        ],
      },
      {
        id: "navigating-to-photo-sections",
        heading: "Navigating to Photo Sections",
        description: "How to access different photo management areas.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Click "Photos" in the sidebar to access game photo management.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Media Day" to access media day photo sessions.',
          },
          {
            stepNumber: 3,
            instruction: 'Click "Games" to view the game schedule and identify which games you should photograph.',
          },
          {
            stepNumber: 4,
            instruction:
              "Your dashboard also provides quick links to priority tasks (games without photos, upcoming media days).",
          },
        ],
      },
    ],
  },

  {
    id: "viewing-game-schedules-photographer",
    title: "Viewing Game Schedules",
    description:
      "Find games that need photos and plan your photography schedule.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 1,
    difficulty: "beginner",
    tags: ["photographer", "schedule", "games", "planning"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "finding-games-needing-photos",
        heading: "Finding Games That Need Photos",
        description: "Identify which games to photograph.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Games" to see the game schedule.',
          },
          {
            stepNumber: 2,
            instruction: "Games are displayed with photo status indicators:",
            substeps: [
              "Red/Empty - No photos yet (priority)",
              "Yellow/Partial - Some photos uploaded (may need more)",
              "Green/Complete - Sufficient photos uploaded",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Filter games to plan your schedule:",
            substeps: [
              "By Date - This Week, Next Week, Specific Date",
              "By Division - Focus on specific divisions you're assigned to",
              "By Photo Status - Show only games without photos",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Click on a game to see:",
            substeps: [
              "Date, time, and location",
              "Teams playing",
              "How many photos already uploaded (if any)",
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "Use this to prioritize which games to attend and photograph.",
            tips: [
              {
                type: "tip",
                content:
                  "Coordinate with league admins about which games are highest priority if you can't cover all games.",
              },
            ],
          },
        ],
      },
    ],
  },

  // Reference Executive tutorials for detailed photo upload instructions
  {
    id: "uploading-game-photos-photographer",
    title: "Uploading Game Photos",
    description:
      "Select games, upload photos in batch, and follow best practices. Refer to Executive 'Game Photos' tutorial for detailed instructions.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 4,
    difficulty: "beginner",
    tags: ["photographer", "upload", "game-photos", "batch"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "game-photo-upload-overview",
        heading: "Game Photo Upload Overview",
        description: "Quick reference for uploading game photos.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Photographers upload game photos the same way as Executives and Commissioners.",
          },
          {
            stepNumber: 2,
            instruction: "For detailed step-by-step instructions, refer to the Executive tutorial: 'Game Photos'.",
          },
          {
            stepNumber: 3,
            instruction: "Quick summary:",
            substeps: [
              "Navigate to Photos → Game Photos",
              "Select the game you photographed",
              "Click 'Upload Photos'",
              "Select multiple image files (JPG, PNG, HEIC)",
              "Wait for upload to complete",
              "Photos are automatically tagged with game info",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Best practices specific to photographers:",
            substeps: [
              "Upload within 24 hours of game for best player engagement",
              "Rename files before upload with game info for your records",
              "Aim for 15-25 quality photos per game",
              "Mix action shots, team celebrations, and candid moments",
              "Delete blurry or duplicate shots before uploading",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Batch upload multiple games at once if you photographed several games in one day.",
              },
            ],
          },
        ],
        relatedSections: ["game-photos", "photo-organization"],
      },
    ],
  },

  {
    id: "photo-organization-tips-photographer",
    title: "Photo Organization Tips",
    description:
      "File naming conventions, batch uploads, and quality standards for professional photography.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 4,
    difficulty: "beginner",
    tags: ["photographer", "organization", "quality", "workflow"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "file-naming-conventions",
        heading: "File Naming Conventions",
        description: "How to name your photo files for easy management.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Develop a consistent file naming system before uploading:",
          },
          {
            stepNumber: 2,
            instruction: "Recommended format:",
            substeps: [
              "YYYY-MM-DD_Division_HomeTeam-vs-AwayTeam_##.jpg",
              "Example: 2024-07-15_Toronto-Monday-Rec_Thunder-vs-Lightning_01.jpg",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Why this helps:",
            substeps: [
              "Easy to find photos in your archive later",
              "Quick identification of which game photos belong to",
              "Chronological sorting automatically",
              "Professional organization",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Tools to batch rename files:",
            substeps: [
              "macOS: Select all → Right-click → Rename",
              "Windows: Select all → Right-click → Rename",
              "Adobe Bridge - Professional option",
              "Free tools: Bulk Rename Utility (Windows), Renamer (Mac)",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Rename files in your photo editor before export for efficiency.",
              },
            ],
          },
        ],
      },
      {
        id: "batch-uploads",
        heading: "Batch Uploads",
        description: "Efficiently upload large quantities of photos.",
        steps: [
          {
            stepNumber: 1,
            instruction: "When uploading multiple games at once:",
          },
          {
            stepNumber: 2,
            instruction: "Organize photos by game first:",
            substeps: [
              "Create folders on your computer: Game1, Game2, Game3, etc.",
              "Sort photos into respective game folders",
              "Upload one game at a time to avoid mixing photos",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Upload workflow:",
            substeps: [
              "Select first game in admin portal",
              "Upload all photos from that game's folder",
              "Wait for completion (progress bar shows status)",
              "Move to next game and repeat",
            ],
          },
          {
            stepNumber: 4,
            instruction: "For very large uploads (50+ photos):",
            substeps: [
              "Upload in batches of 25-30 photos at a time",
              "Wait for each batch to complete before starting next",
              "Prevents timeout errors on slow connections",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Don't close the browser tab while upload is in progress or photos will be lost!",
              },
            ],
          },
        ],
      },
      {
        id: "quality-standards",
        heading: "Quality Standards",
        description: "Guidelines for professional photo quality.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Before uploading, ensure photos meet quality standards:",
          },
          {
            stepNumber: 2,
            instruction: "Technical quality:",
            substeps: [
              "In Focus - Reject blurry shots",
              "Proper Exposure - Not too dark or too bright",
              "No Extreme Motion Blur - Unless artistic choice",
              "Minimum Resolution - 1920x1080px recommended",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Content quality:",
            substeps: [
              "Action Shots - Players actually playing",
              "Faces Visible - Players identifiable when possible",
              "Variety - Mix of wide shots, close-ups, celebrations",
              "Inclusive - Capture all teams equally",
            ],
          },
          {
            stepNumber: 4,
            instruction: "What to exclude:",
            substeps: [
              "Completely blurry or out-of-focus shots",
              "Duplicates (3 nearly identical shots - pick the best)",
              "Test shots or photos of the ground",
              "Photos with sensitive content or injuries",
            ],
          },
          {
            stepNumber: 5,
            instruction: "Editing (if applicable):",
            substeps: [
              "Light editing is okay (exposure, crop, color)",
              "Keep edits natural - avoid heavy filters",
              "Maintain file quality - don't over-compress",
              "Batch edit similar lighting conditions for consistency",
            ],
            tips: [
              {
                type: "success",
                content:
                  "High-quality photos dramatically improve player satisfaction and league reputation!",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "media-day-overview-photographer",
    title: "Media Day Overview",
    description:
      "Understanding media day sessions and how to prepare for organized photo shoots.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["photographer", "media-day", "sessions", "headshots"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "understanding-media-day-sessions",
        heading: "Understanding Media Day Sessions",
        description: "What media days are and why they're important.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Media Day is a scheduled event where you photograph all players and teams in one location.",
          },
          {
            stepNumber: 2,
            instruction: "Types of photos taken:",
            substeps: [
              "Individual Player Headshots - Profile/roster photos",
              "Team Photos - Full team group shots",
              "Action Poses - Players with ball/equipment",
              "Optional: Jersey/Number Photos for roster graphics",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Why media days are valuable:",
            substeps: [
              "Professional photos for all players",
              "Consistent lighting and quality",
              "Player profile pictures for app and website",
              "Marketing materials for league promotion",
              "Efficient - photograph everyone in 2-3 hours",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Media days are typically scheduled before the season starts or mid-season.",
          },
        ],
      },
      {
        id: "media-day-location-and-date",
        heading: "Location and Date Selection",
        description: "What to look for when planning media day.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Media days are created by Executives or Commissioners. As a photographer, you'll be assigned to photograph them.",
          },
          {
            stepNumber: 2,
            instruction: 'Check "Media Day" in the sidebar to see upcoming sessions.',
          },
          {
            stepNumber: 3,
            instruction: "For each session, you'll see:",
            substeps: [
              "Session Name (e.g., 'Toronto Fall 2024 Media Day')",
              "Date and Time",
              "Location/Venue",
              "Divisions Included",
              "Expected number of players",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Preparation checklist:",
            substeps: [
              "Scout the location beforehand if possible",
              "Check lighting conditions",
              "Plan backdrop setup (if bringing one)",
              "Estimate time needed (2-3 min per player)",
              "Bring backup equipment and batteries",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Arrive 30 minutes early to set up equipment and test shots before players arrive.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "uploading-media-day-photos-photographer",
    title: "Uploading Media Day Photos",
    description:
      "Select media day session, batch upload player photos, and follow the photo review process.",
    roles: ["EXECUTIVE", "PHOTOGRAPHER"],
    category: "photos",
    estimatedTime: 6,
    difficulty: "intermediate",
    prerequisites: ["media-day-overview-photographer"],
    tags: ["photographer", "media-day", "upload", "headshots"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "selecting-media-day-session",
        heading: "Selecting Media Day Session",
        description: "Choose which session to upload photos to.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Media Day" from the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: "You'll see a list of media day sessions (past and upcoming).",
          },
          {
            stepNumber: 3,
            instruction: "Click on the session you photographed.",
          },
          {
            stepNumber: 4,
            instruction: "The session detail page shows:",
            substeps: [
              "Session information (date, location, divisions)",
              "Player list - all players expected at this session",
              "Upload status - how many players have photos",
              "Upload interface",
            ],
          },
        ],
      },
      {
        id: "bulk-player-photo-upload",
        heading: "Bulk Player Photo Upload",
        description: "Efficiently upload all player headshots at once.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Before uploading, organize and name your photos:",
            substeps: [
              "Rename files with player names (e.g., 'John-Doe.jpg', 'Jane-Smith.jpg')",
              "Or number them in the order you photographed (if you have a player list)",
              "Keep photos in one folder for easy batch select",
            ],
          },
          {
            stepNumber: 2,
            instruction: 'Click "Upload Photos" on the media day session page.',
          },
          {
            stepNumber: 3,
            instruction: "Select all player photos from your computer:",
            substeps: [
              "Ctrl+A (Windows) or Cmd+A (Mac) to select all in folder",
              "Or manually select specific photos",
              "You can upload 50-100+ photos at once",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Wait for upload to complete - this may take several minutes for large batches.",
            tips: [
              {
                type: "warning",
                content:
                  "Do NOT close the browser during upload or you'll lose progress!",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "Once uploaded, photos appear in the media day gallery.",
          },
        ],
      },
      {
        id: "photo-review-process",
        heading: "Photo Review Process",
        description: "Tag photos to players for proper organization.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "After uploading, you need to assign photos to the correct players.",
          },
          {
            stepNumber: 2,
            instruction: "The photo review interface shows:",
            substeps: [
              "Uploaded photos in a grid",
              "Player list on the side",
              "Drag-and-drop or click-to-assign functionality",
            ],
          },
          {
            stepNumber: 3,
            instruction: "To assign photos to players:",
            substeps: [
              "Method A: Click photo → Select player from dropdown → Save",
              "Method B: Drag photo onto player name",
              "Method C: Click player name → Select all their photos",
            ],
          },
          {
            stepNumber: 4,
            instruction: "If you named files with player names, the system may auto-suggest matches:",
            substeps: [
              "Review suggested matches",
              "Confirm correct assignments",
              "Manually assign any that didn't match",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "File naming with player names saves TONS of time in the review process!",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "For team photos:",
            substeps: [
              "Assign team photo to all players on that team",
              "Or tag it as 'Team Photo' without individual assignments",
            ],
          },
          {
            stepNumber: 6,
            instruction: "Once all photos are assigned, mark the session as 'Complete'.",
          },
          {
            stepNumber: 7,
            instruction: "What happens after completion:",
            substeps: [
              "Player headshots appear in their profiles",
              "Photos available to players in their app",
              "Admins can use photos for rosters and marketing",
            ],
            tips: [
              {
                type: "success",
                content:
                  "Congratulations! Media day photos are now live for everyone to enjoy.",
              },
            ],
          },
        ],
      },
    ],
  },
];
