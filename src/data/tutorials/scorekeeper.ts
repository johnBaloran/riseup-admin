// src/data/tutorials/scorekeeper.ts

/**
 * Scorekeeper-level tutorials
 * Scorekeepers have limited access focused on game scoring
 */

import { Tutorial } from "@/types/tutorial";

export const scorekeeperTutorials: Tutorial[] = [
  {
    id: "scorekeeper-dashboard",
    title: "Scorekeeper Dashboard",
    description:
      "Understanding your limited scorekeeper dashboard and how to navigate to games.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "getting-started",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["scorekeeper", "dashboard", "games", "navigation"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "scorekeeper-limited-dashboard",
        heading: "Understanding Your Limited Dashboard",
        description: "What scorekeepers see when they log in.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "As a Scorekeeper, your dashboard is simplified and focused on your role:",
            substeps: [
              "Upcoming games you're assigned to score",
              "Recent games you've scored",
              "Quick links to game schedules",
            ],
          },
          {
            stepNumber: 2,
            instruction: "You will NOT see:",
            substeps: [
              "Payment analytics or revenue data",
              "Player management tools",
              "Division or team setup",
              "Photo upload features",
              "Admin settings",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Your role is focused exclusively on scoring games - everything else is hidden to keep your interface simple.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: 'Your sidebar menu only shows:',
            substeps: [
              "Dashboard",
              "Games - View schedules",
              "Profile - Update your personal info",
            ],
          },
        ],
      },
      {
        id: "navigating-to-games",
        heading: "Navigating to Games",
        description: "How to find games you need to score.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Click "Games" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: "You'll see a list of upcoming games across all divisions.",
          },
          {
            stepNumber: 3,
            instruction: "Filter games by:",
            substeps: [
              "Date - Today, This Week, Specific Date",
              "Division - Focus on specific division",
              "Status - Upcoming vs Completed",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Click on a game to open the scorekeeper interface.",
          },
        ],
      },
    ],
  },

  {
    id: "viewing-game-schedules",
    title: "Viewing Game Schedules",
    description:
      "Learn how to find games to score and view game details and teams.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "scorekeeper",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["scorekeeper", "schedule", "games", "viewing"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "finding-games-to-score",
        heading: "Finding Games to Score",
        description: "Locate the games you need to officiate.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Games" from the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: "Games are organized chronologically - upcoming games appear first.",
          },
          {
            stepNumber: 3,
            instruction: "Each game shows:",
            substeps: [
              "Date and Time",
              "Division name",
              "Location/Venue",
              "Home Team vs Away Team",
              "Current Score (if game started)",
              "Status (Scheduled, In Progress, Completed)",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Use filters to find your assigned games:",
            substeps: [
              'Select "Today" to see only today\'s games',
              "Filter by division if you handle specific divisions",
              "Search by team name",
            ],
          },
        ],
      },
      {
        id: "game-details-and-teams",
        heading: "Game Details and Teams",
        description: "View detailed information about a specific game.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Click on a game to view full details.",
          },
          {
            stepNumber: 2,
            instruction: "The game detail page shows:",
            substeps: [
              "Full team names and team codes",
              "Division and level information",
              "Exact location with address and map link",
              "Time and date",
              "Current score (if game started)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "View team rosters:",
            substeps: [
              "Home Team roster with jersey numbers",
              "Away Team roster with jersey numbers",
              "Player names for easy identification",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "This information helps you prepare before arriving at the game.",
          },
        ],
      },
    ],
  },

  {
    id: "opening-game-for-scoring",
    title: "Opening a Game for Scoring",
    description:
      "Learn how to select a game, understand the scorekeeper interface, and view team rosters.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "scorekeeper",
    estimatedTime: 3,
    difficulty: "beginner",
    prerequisites: ["viewing-game-schedules"],
    tags: ["scorekeeper", "scoring", "interface", "start"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "selecting-a-game",
        heading: "Selecting a Game",
        description: "Open the scoring interface for a specific game.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Games" and find the game you need to score.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Open Scorekeeper" or "Start Scoring".',
          },
          {
            stepNumber: 3,
            instruction:
              "The scorekeeper interface loads with the game ready to score.",
            tips: [
              {
                type: "info",
                content:
                  "You can open the scorekeeper interface before the game starts to familiarize yourself with the teams.",
              },
            ],
          },
        ],
      },
      {
        id: "scorekeeper-interface",
        heading: "Understanding the Scorekeeper Interface",
        description: "Overview of the scoring controls and displays.",
        steps: [
          {
            stepNumber: 1,
            instruction: "The scorekeeper interface has several sections:",
          },
          {
            stepNumber: 2,
            instruction: "Top: Scoreboard Display",
            substeps: [
              "Home Team name and current score",
              "Away Team name and current score",
              "Current period/time",
              "Game status (Not Started, In Progress, Final)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Left Side: Home Team Roster",
            substeps: [
              "List of all home team players",
              "Jersey numbers",
              "Click player to record event",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Right Side: Away Team Roster",
            substeps: [
              "List of all away team players",
              "Jersey numbers",
              "Click player to record event",
            ],
          },
          {
            stepNumber: 5,
            instruction: "Center: Event Log",
            substeps: [
              "Chronological list of all events (goals, assists, etc.)",
              "Timestamps for each event",
              "Edit/delete buttons for corrections",
            ],
          },
          {
            stepNumber: 6,
            instruction: "Bottom: Game Controls",
            substeps: [
              "Start Game button",
              "Add Event buttons (Goal, Assist, Other)",
              "End Period/End Game buttons",
            ],
          },
        ],
      },
      {
        id: "viewing-team-rosters",
        heading: "Team Rosters",
        description: "Understanding roster displays for player selection.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Each team's roster is displayed on their respective side of the interface.",
          },
          {
            stepNumber: 2,
            instruction: "Players are listed with:",
            substeps: [
              "Jersey number (if assigned)",
              "Player name",
              "Current game stats (goals, assists)",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Players who score goals are highlighted or have their stats updated in real-time.",
          },
          {
            stepNumber: 4,
            instruction: "Use jersey numbers to quickly identify players on the field.",
            tips: [
              {
                type: "tip",
                content:
                  "If a player doesn't have a jersey number, use their name to find them in the roster.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "recording-game-events",
    title: "Recording Game Events",
    description:
      "Learn how to add goals, record assists, add other events, and edit or remove events.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "scorekeeper",
    estimatedTime: 8,
    difficulty: "intermediate",
    prerequisites: ["opening-game-for-scoring"],
    tags: ["scorekeeper", "goals", "assists", "events", "scoring"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "adding-goals",
        heading: "Adding Goals (Player Selection)",
        description: "Record when a player scores a goal.",
        steps: [
          {
            stepNumber: 1,
            instruction: "When a goal is scored:",
            substeps: [
              "Note which team scored (home or away)",
              "Note the player's jersey number or name",
              "Note the time (if tracking time)",
            ],
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Add Goal" button or click directly on the scoring player in the roster.',
          },
          {
            stepNumber: 3,
            instruction: "A dialog opens asking for details:",
            substeps: [
              "Scoring Player - Auto-selected if you clicked from roster, or select from dropdown",
              "Time - When the goal occurred (optional)",
              "Period - Which period/half the goal was scored in",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Select the player who scored from the dropdown or roster.",
            tips: [
              {
                type: "tip",
                content:
                  "Type jersey number or start of player name to quickly filter the list.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Add Goal" to record the event.',
          },
          {
            stepNumber: 6,
            instruction: "The score updates immediately:",
            substeps: [
              "Scoreboard increments for the scoring team",
              "Event appears in the event log",
              "Player's goal count increases",
            ],
            tips: [
              {
                type: "success",
                content:
                  "The score is visible to everyone instantly - players can follow along in real-time!",
              },
            ],
          },
        ],
      },
      {
        id: "recording-assists",
        heading: "Recording Assists",
        description: "Track players who assisted on goals.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "After adding a goal, you can add assist(s) to the same play.",
          },
          {
            stepNumber: 2,
            instruction: "In the goal dialog or event log, click 'Add Assist'.",
          },
          {
            stepNumber: 3,
            instruction: "Select the player who made the assist:",
            substeps: [
              "Must be from the same team as the goal scorer",
              "Can add up to 2 assists per goal (primary and secondary)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Add Assist".',
          },
          {
            stepNumber: 5,
            instruction: "The assist is recorded and the player's assist count increases.",
            tips: [
              {
                type: "info",
                content:
                  "Assists are optional - if you're unsure who assisted, you can skip this step.",
              },
            ],
          },
        ],
      },
      {
        id: "adding-other-events",
        heading: "Adding Other Events",
        description: "Record non-scoring events (penalties, injuries, etc.).",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Besides goals, you can track other game events:",
            substeps: [
              "Yellow Cards/Cautions",
              "Red Cards/Ejections",
              "Injuries",
              "Substitutions (if tracking)",
              "Other notable events",
            ],
          },
          {
            stepNumber: 2,
            instruction: 'Click "Add Event" or "Other Event".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in event details:",
            substeps: [
              "Event Type - Select from dropdown",
              "Player - Who the event involves (if applicable)",
              "Team - Which team",
              "Time - When it occurred",
              "Notes - Additional context (optional)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Add" to record the event.',
          },
          {
            stepNumber: 5,
            instruction:
              "Other events appear in the event log but don't affect the score.",
          },
        ],
      },
      {
        id: "editing-removing-events",
        heading: "Editing/Removing Events",
        description: "Fix mistakes or correct incorrectly recorded events.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "If you make a mistake, you can edit or delete events.",
          },
          {
            stepNumber: 2,
            instruction: "In the event log, find the event you want to change.",
          },
          {
            stepNumber: 3,
            instruction: "To edit:",
            substeps: [
              'Click the "Edit" icon next to the event',
              "Update the event details (player, time, etc.)",
              'Click "Save Changes"',
            ],
          },
          {
            stepNumber: 4,
            instruction: "To delete:",
            substeps: [
              'Click the "Delete" icon next to the event',
              "Confirm the deletion",
              "The event is removed and scores are recalculated",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Deleting a goal will decrease the team's score. Double-check before deleting!",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "Common corrections:",
            substeps: [
              "Wrong player scored - Edit to select correct player",
              "Goal counted twice - Delete the duplicate",
              "Wrong team scored - Delete and re-add for correct team",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "managing-game-time",
    title: "Managing Game Time",
    description:
      "Learn how to start/stop the game clock and manage period transitions.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "scorekeeper",
    estimatedTime: 2,
    difficulty: "beginner",
    prerequisites: ["opening-game-for-scoring"],
    tags: ["scorekeeper", "time", "clock", "periods"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "start-stop-game-clock",
        heading: "Start/Stop Game Clock",
        description: "Control game timing (if your league uses timed games).",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Some leagues track game time, others don't. This feature is optional.",
          },
          {
            stepNumber: 2,
            instruction: "To start the game clock:",
            substeps: [
              'Click "Start Game" button',
              "Clock begins counting up or down (depending on league settings)",
              "Game status changes to 'In Progress'",
            ],
          },
          {
            stepNumber: 3,
            instruction: "To pause/stop the clock:",
            substeps: [
              'Click "Pause" button during breaks or stoppages',
              "Clock stops but game remains 'In Progress'",
              'Click "Resume" to continue',
            ],
          },
          {
            stepNumber: 4,
            instruction: "If not tracking time:",
            substeps: [
              "Simply record events without starting clock",
              "Focus on goals, assists, and final score",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Many recreational leagues don't track time - just final scores. Ask your league admin if time tracking is required.",
              },
            ],
          },
        ],
      },
      {
        id: "period-management",
        heading: "Period Management",
        description: "Handle half-time, period transitions, and overtime.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Most games have periods (halves, quarters, etc.).",
          },
          {
            stepNumber: 2,
            instruction: "To end a period:",
            substeps: [
              'Click "End Period" button',
              "Current period is marked complete",
              "You can enter half-time notes or stats",
            ],
          },
          {
            stepNumber: 3,
            instruction: "To start the next period:",
            substeps: [
              'Click "Start Next Period"',
              "Clock resets (if tracking time)",
              "Events continue to be logged",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Periods help organize the event log:",
            substeps: [
              "Events are grouped by period",
              "Easier to see when goals were scored",
              "Useful for stat tracking",
            ],
          },
        ],
      },
    ],
  },

  {
    id: "finalizing-scores",
    title: "Finalizing Scores",
    description:
      "Review the final score and submit results to complete the game.",
    roles: ["EXECUTIVE", "SCOREKEEPER"],
    category: "scorekeeper",
    estimatedTime: 2,
    difficulty: "beginner",
    prerequisites: ["recording-game-events"],
    tags: ["scorekeeper", "final-score", "submit", "complete"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "reviewing-final-score",
        heading: "Reviewing Final Score",
        description: "Double-check scores before finalizing.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Before ending the game, verify:",
            substeps: [
              "Both team scores are correct",
              "All goals have been recorded",
              "All events are accurate",
              "No duplicate entries",
            ],
          },
          {
            stepNumber: 2,
            instruction: "Review the event log chronologically:",
            substeps: [
              "Check each goal is attributed to the correct player",
              "Verify assists are correct",
              "Look for any errors or typos",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Make any final corrections using the edit/delete functions.",
          },
          {
            stepNumber: 4,
            instruction: "Confirm the score matches what happened on the field.",
            tips: [
              {
                type: "warning",
                content:
                  "Once submitted, scores can only be changed by league admins. Take your time to ensure accuracy!",
              },
            ],
          },
        ],
      },
      {
        id: "submitting-results",
        heading: "Submitting Results",
        description: "Finalize and publish the game score.",
        steps: [
          {
            stepNumber: 1,
            instruction: "When you're confident the score is correct:",
            substeps: [
              'Click "End Game" or "Finalize Score" button',
              "A confirmation dialog appears",
            ],
          },
          {
            stepNumber: 2,
            instruction: "The confirmation shows:",
            substeps: [
              "Final score: Home X - Away Y",
              "Total goals recorded",
              "Total events logged",
              "Warning that this action finalizes the game",
            ],
          },
          {
            stepNumber: 3,
            instruction: 'Click "Submit Final Score" to complete the game.',
          },
          {
            stepNumber: 4,
            instruction: "What happens after submission:",
            substeps: [
              "Game status changes to 'Completed'",
              "Final score is published to players",
              "Player statistics are updated (goals, assists, games played)",
              "Game appears in standings/leaderboards",
              "Scorekeeper can no longer edit (admin-only from this point)",
            ],
            tips: [
              {
                type: "success",
                content:
                  "Great job! The game is now officially complete and results are live for everyone to see.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "If you need to make changes after submission:",
            substeps: [
              "Contact a Commissioner or Executive admin",
              "Explain what needs to be corrected",
              "They can edit completed games",
            ],
          },
        ],
      },
    ],
  },
];
