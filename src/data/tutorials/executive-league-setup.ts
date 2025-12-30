// src/data/tutorials/executive-league-setup.ts

/**
 * Executive-level tutorials for League Setup
 * Covers Cities, Locations, and Competition Levels
 * These are foundational elements that Commissioners cannot modify
 */

import { Tutorial } from "@/types/tutorial";

export const executiveLeagueSetupTutorials: Tutorial[] = [
  {
    id: "setting-up-cities",
    title: "Setting Up Cities",
    description:
      "Create and configure cities including Stripe accounts, Google Chat webhooks, e-transfer email addresses, regions, and timezones.",
    roles: ["EXECUTIVE"],
    category: "league-management",
    estimatedTime: 4,
    difficulty: "advanced",
    tags: ["cities", "stripe", "google-chat", "e-transfer", "timezone", "setup"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-new-city",
        heading: "Creating a New City",
        description: "Add a new city/location to your league system.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Cities" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Add City" or "Create New City" button.',
          },
          {
            stepNumber: 3,
            instruction: "Fill in the basic city information:",
            substeps: [
              "City Name - The display name (e.g., 'Toronto', 'Vancouver')",
              "City Code - Short code for internal use (e.g., 'TOR', 'VAN')",
              "Region - Geographic region or province",
              "Active - Whether this city is currently accepting registrations",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Select the timezone for this city.",
            substeps: [
              "America/Toronto (Eastern Time)",
              "America/Vancouver (Pacific Time)",
              "America/Edmonton (Mountain Time)",
              "And other North American timezones",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Timezone is critical for scheduling games and payment deadlines. Double-check this!",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save" to create the city.',
            tips: [
              {
                type: "info",
                content:
                  "You can configure Stripe and webhooks after creating the city, or do it now.",
              },
            ],
          },
        ],
      },
      {
        id: "configuring-stripe-accounts",
        heading: "Configuring Stripe Accounts per City",
        description:
          "Connect each city to its own Stripe Connected Account for proper payment routing and reporting.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Each city should have its own Stripe Connected Account to keep finances separate.",
            tips: [
              {
                type: "info",
                content:
                  "This allows each city's revenue to go to separate bank accounts and simplifies accounting.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Edit the city you want to configure Stripe for.",
          },
          {
            stepNumber: 3,
            instruction: 'Scroll to the "Stripe Integration" section.',
          },
          {
            stepNumber: 4,
            instruction: "You have two options:",
            substeps: [
              "Option A: Create a new Stripe Connect account for this city",
              "Option B: Link to an existing Stripe account ID",
            ],
          },
          {
            stepNumber: 5,
            instruction: "If creating a new Connect account:",
            substeps: [
              'Click "Connect Stripe Account"',
              "You'll be redirected to Stripe's onboarding flow",
              "Fill in business details for this city/region",
              "Complete bank account setup",
              "Verify identity documents",
              "Return to Rise Up Admin (redirect happens automatically)",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use a dedicated email per city (e.g., toronto@yourleague.com) for easier management.",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction: "If linking existing account:",
            substeps: [
              'Enter the Stripe Account ID (format: acct_XXXXXXXXXXXX)',
              'Click "Link Account"',
              "System verifies the account exists and is active",
            ],
          },
          {
            stepNumber: 7,
            instruction: "Once connected, the city will show:",
            substeps: [
              "Stripe Account ID",
              "Account Status (Active/Pending/Restricted)",
              "Last 4 digits of connected bank account",
              "Capabilities (payments, terminal, etc.)",
            ],
          },
          {
            stepNumber: 8,
            instruction:
              "All payments for players in this city will now route to this Stripe account.",
            tips: [
              {
                type: "success",
                content:
                  "Revenue automatically goes to the correct bank account based on player's city!",
              },
            ],
          },
        ],
      },
      {
        id: "google-chat-webhooks",
        heading: "Setting Up Google Chat Webhooks",
        description:
          "Configure automated notifications to Google Chat for payment alerts and updates.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Google Chat webhooks send automated messages to your team's chat space when important events occur.",
            tips: [
              {
                type: "info",
                content:
                  "Example: Get notified when someone pays, when payments fail, or when daily reports are ready.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "First, create a webhook in Google Chat:",
            substeps: [
              "Open Google Chat and navigate to the space you want notifications in",
              "Click the space name → Manage webhooks",
              "Click 'Add webhook'",
              "Name it (e.g., 'Toronto Payments')",
              "Copy the webhook URL",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Return to Rise Up Admin and edit the city.",
          },
          {
            stepNumber: 4,
            instruction: 'Find the "Google Chat Webhook" section.',
          },
          {
            stepNumber: 5,
            instruction: "Paste the webhook URL into the field.",
            tips: [
              {
                type: "tip",
                content:
                  "The URL should start with https://chat.googleapis.com/v1/spaces/...",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction: 'Click "Test Webhook" to send a test message.',
          },
          {
            stepNumber: 7,
            instruction:
              "Check your Google Chat space to confirm the test message arrived.",
          },
          {
            stepNumber: 8,
            instruction: 'Click "Save" to enable webhook notifications for this city.',
          },
          {
            stepNumber: 9,
            instruction: "Notifications will be sent for:",
            substeps: [
              "Successful payments",
              "Failed payments requiring attention",
              "Daily payment summaries",
              "Important system alerts",
            ],
          },
        ],
      },
      {
        id: "etransfer-email-setup",
        heading: "Adding E-Transfer Email Addresses",
        description:
          "Configure the email address where players should send e-transfer payments for this city.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Each city should have a dedicated email for receiving e-transfer payments.",
            tips: [
              {
                type: "tip",
                content:
                  "Use city-specific emails (toronto@league.com) to easily identify which city a payment is for.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Edit the city configuration.",
          },
          {
            stepNumber: 3,
            instruction: 'Find the "E-Transfer Email" section.',
          },
          {
            stepNumber: 4,
            instruction: "Enter the email address where players should send e-transfers.",
          },
          {
            stepNumber: 5,
            instruction:
              "This email will be displayed to players when they select e-transfer as payment method.",
          },
          {
            stepNumber: 6,
            instruction: "Optional: Add security question and answer hints.",
            substeps: [
              "Security Question - What question e-transfers should use",
              "Answer Hint - Hint for players (don't include the actual answer!)",
            ],
            tips: [
              {
                type: "warning",
                content:
                  'Example: Question: "League name?" Hint: "Our organization name in lowercase"',
              },
            ],
          },
          {
            stepNumber: 7,
            instruction: 'Click "Save" to update the city e-transfer configuration.',
          },
        ],
      },
      {
        id: "regions-and-timezones",
        heading: "Understanding Regions and Timezones",
        description:
          "How regions and timezones affect scheduling, deadlines, and reporting.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Timezones are critical for multi-city leagues spanning different time zones.",
          },
          {
            stepNumber: 2,
            instruction: "Timezone affects:",
            substeps: [
              "Game scheduling - Games show in local time for that city",
              "Payment deadlines - Early bird cutoff respects city timezone",
              "Email/SMS timing - Reminders sent at appropriate local times",
              "Reports - Daily reports cut off at midnight in city's timezone",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Regions are organizational groupings (e.g., 'Ontario', 'BC', 'East Coast').",
          },
          {
            stepNumber: 4,
            instruction: "Regions are used for:",
            substeps: [
              "Filtering and reporting",
              "Grouping cities in navigation",
              "Regional analytics and comparisons",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Regions are optional - you can leave blank if you only operate in one area.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "managing-locations",
    title: "Managing Locations",
    description:
      "Create and manage game locations/venues, add location details, and assign locations to cities.",
    roles: ["EXECUTIVE"],
    category: "league-management",
    estimatedTime: 4,
    difficulty: "beginner",
    tags: ["locations", "venues", "facilities", "address", "map"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "creating-game-locations",
        heading: "Creating Game Locations/Venues",
        description: "Add new facilities where games will be played.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Settings" → "Locations" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Add Location" or "Create New Location".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in the basic location information:",
            substeps: [
              "Location Name - Facility name (e.g., 'Lamport Stadium', 'Monarch Park')",
              "Short Name - Abbreviated name for schedules (e.g., 'Lamport', 'Monarch')",
              "Type - Indoor or Outdoor",
              "Active - Whether this location is currently in use",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Assign the location to a city.",
            tips: [
              {
                type: "info",
                content:
                  "Each location belongs to one city. Multi-city locations should be created separately per city.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save" to create the location.',
          },
        ],
      },
      {
        id: "adding-location-details",
        heading: "Adding Location Details (Address, Map Link)",
        description:
          "Add comprehensive information to help players find the venue.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Edit the location you want to add details to.",
          },
          {
            stepNumber: 2,
            instruction: "Add the complete address:",
            substeps: [
              "Street Address - Street number and name",
              "City - City name (usually matches assigned city)",
              "Province/State",
              "Postal/Zip Code",
              "Country",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Add a Google Maps link:",
            substeps: [
              "Open Google Maps and search for the location",
              "Click 'Share' → 'Copy link'",
              "Paste the link in the 'Map Link' field",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use the pin drop feature in Google Maps for exact field location, not just the building address.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Optional: Add parking information:",
            substeps: [
              "Parking availability (Free/Paid/Street)",
              "Parking location (next to field, across street, etc.)",
              "Cost (if paid parking)",
            ],
          },
          {
            stepNumber: 5,
            instruction: "Optional: Add facility notes:",
            substeps: [
              "Washroom locations",
              "Water fountains",
              "Spectator seating",
              "Accessibility information",
              "Entry instructions (gates, doors, etc.)",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "The more detail you provide, the fewer questions you'll get from players!",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction: 'Click "Save" to update the location.',
          },
        ],
      },
      {
        id: "assigning-locations-to-cities",
        heading: "Assigning Locations to Cities",
        description:
          "Manage which city each location belongs to and change assignments.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Each location must be assigned to exactly one city.",
          },
          {
            stepNumber: 2,
            instruction: "To assign or change a location's city:",
            substeps: [
              "Edit the location",
              'Find the "City" dropdown',
              "Select the city this location belongs to",
              'Click "Save"',
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Changing a location's city will affect all divisions using that location.",
            tips: [
              {
                type: "warning",
                content:
                  "If divisions are assigned to this location, they'll remain assigned but their city context changes.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Only active locations appear in division creation forms.",
            tips: [
              {
                type: "tip",
                content:
                  "Set locations to 'Inactive' when they're no longer in use, rather than deleting them (preserves history).",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "creating-competition-levels",
    title: "Creating Competition Levels",
    description:
      "Set up competition levels (Recreational, Competitive, Elite) and understand how they work with divisions.",
    roles: ["EXECUTIVE"],
    category: "league-management",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["levels", "competitive", "recreational", "elite", "skill"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "setting-up-levels",
        heading: "Setting Up Levels (Recreational, Competitive, Elite)",
        description:
          "Create different skill/competition levels for your league.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Navigate to "Settings" → "Competition Levels" in the sidebar.',
          },
          {
            stepNumber: 2,
            instruction: 'Click "Add Level" or "Create New Level".',
          },
          {
            stepNumber: 3,
            instruction: "Fill in the level details:",
            substeps: [
              "Level Name - Display name (e.g., 'Recreational', 'Competitive', 'Elite')",
              "Level Code - Short code (e.g., 'REC', 'COMP', 'ELITE')",
              "Description - What this level represents",
              "Skill Range - Beginner, Intermediate, Advanced, etc.",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Common level configurations:",
            substeps: [
              "Recreational - Casual play, no refs, minimal skill requirements",
              "Competitive - Refs enforced, higher skill, more serious play",
              "Elite - Top-tier play, experienced players only",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use descriptions to set expectations for players about pace of play and skill requirements.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Save" to create the level.',
          },
        ],
      },
      {
        id: "levels-with-divisions",
        heading: "Understanding How Levels Work with Divisions",
        description:
          "Learn how competition levels are assigned to divisions and affect league structure.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Competition levels are assigned to divisions, not directly to players.",
          },
          {
            stepNumber: 2,
            instruction: "When creating a division, you select:",
            substeps: [
              "City - Where the division is located",
              "Location - What facility games are played at",
              "Level - What skill/competition level this division is",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Example division structure:",
            substeps: [
              "Toronto Monday Recreational - City: Toronto, Level: Recreational",
              "Toronto Monday Competitive - City: Toronto, Level: Competitive",
              "Vancouver Wednesday Elite - City: Vancouver, Level: Elite",
            ],
            tips: [
              {
                type: "info",
                content:
                  "You can have multiple divisions in the same city with different levels.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Players see the level when registering:",
            substeps: [
              "Division listings show level name and description",
              "Players can filter by level to find appropriate skill tier",
              "Helps players self-select into the right competition tier",
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "Levels can have different rules or features:",
            substeps: [
              "Recreational might allow larger rosters",
              "Competitive might have stricter attendance policies",
              "Elite might require tryouts or invitations",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Document your level differences clearly so players know what to expect.",
              },
            ],
          },
        ],
      },
    ],
  },
];
