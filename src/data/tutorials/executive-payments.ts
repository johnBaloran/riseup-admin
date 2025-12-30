// src/data/tutorials/executive-payments.ts

/**
 * Executive-level tutorials for Payment Management
 * Covers all 4 payment statuses: Unpaid, In Progress, Has Issues, Paid
 * Plus terminal, cash, e-transfer, and bulk operations
 */

import { Tutorial } from "@/types/tutorial";

export const executivePaymentTutorials: Tutorial[] = [
  {
    id: "payment-dashboard-overview",
    title: "Payment Dashboard Overview",
    description:
      "Understanding the payment management dashboard, statuses, filters, and how to navigate between different payment categories.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 5,
    difficulty: "beginner",
    tags: ["payments", "dashboard", "status", "filters", "navigation"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "payment-statuses",
        heading: "Understanding Payment Statuses",
        description:
          "Learn the four payment statuses and what they mean for player payment tracking.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Navigate to "Payments" in the sidebar to access the payment management dashboard.',
          },
          {
            stepNumber: 2,
            instruction:
              "The payment dashboard is organized into four tabs representing player payment statuses:",
            substeps: [
              "Unpaid - Players who haven't started any payment (no payment record exists)",
              "In Progress - Players on active installment plans with ongoing payments",
              "Has Issues - Players with failed payments, expired cards, or payment problems",
              "Paid - Players who have completed full payment successfully",
            ],
            tips: [
              {
                type: "info",
                content:
                  "Payment status is automatically calculated based on PaymentMethod records and Stripe subscription status.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Each tab shows a count badge indicating how many players are in that status.",
            tips: [
              {
                type: "tip",
                content:
                  "Focus on 'Unpaid' and 'Has Issues' tabs daily to maximize revenue collection.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Click on any tab to view players in that status category.",
          },
        ],
      },
      {
        id: "payment-filters",
        heading: "Filter by City and Status",
        description:
          "Use filters to narrow down players by city and quickly find specific groups.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "At the top of the payment dashboard, you'll see filter controls.",
          },
          {
            stepNumber: 2,
            instruction: "City Filter:",
            substeps: [
              'Click the "Filter by City" dropdown',
              "Select a specific city to show only players from that location",
              'Select "All Cities" to see players from all locations',
            ],
            tips: [
              {
                type: "info",
                content:
                  "Commissioners automatically see only their assigned city. Executives can see all cities.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Status Filter:",
            substeps: [
              "Use the status tabs (Unpaid, In Progress, Has Issues, Paid) to filter",
              "Each tab shows only players in that specific payment state",
              "The count on each tab updates as you apply city filters",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Filters work together - you can select a city AND a status to drill down to specific groups.",
            tips: [
              {
                type: "tip",
                content:
                  'Example: "Toronto" + "Has Issues" shows only Toronto players with payment problems.',
              },
            ],
          },
        ],
      },
      {
        id: "quick-search",
        heading: "Quick Search Functionality",
        description: "Find specific players quickly using the search feature.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Locate the search bar at the top of the payment dashboard (usually labeled "Search players...").',
          },
          {
            stepNumber: 2,
            instruction: "Type the player's name to search.",
            tips: [
              {
                type: "tip",
                content:
                  "Search works across all payment statuses - you don't need to switch tabs first.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Search results appear instantly as you type, showing matching players.",
          },
          {
            stepNumber: 4,
            instruction: "Click on a player in the search results to view their payment details.",
          },
          {
            stepNumber: 5,
            instruction:
              "Clear the search box to return to the full list view.",
          },
        ],
      },
    ],
  },

  {
    id: "processing-unpaid-players",
    title: "Processing Unpaid Players",
    description:
      "Learn how to handle players who haven't started payment - send reminders, create payment links, notify captains, and link user accounts.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 6,
    difficulty: "intermediate",
    prerequisites: ["payment-dashboard-overview"],
    tags: [
      "unpaid",
      "payment-link",
      "sms",
      "reminder",
      "captain",
      "user-account",
    ],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "viewing-unpaid-players",
        heading: "Viewing Unpaid Player Details",
        description:
          "Understanding what information is displayed for unpaid players.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to Payments and click the "Unpaid" tab.',
          },
          {
            stepNumber: 2,
            instruction: "For each unpaid player, you'll see:",
            substeps: [
              "Player Name",
              "Team Name and Division",
              "Pricing Tier (Early Bird or Regular)",
              "Expected Amount (what they should pay)",
              "Contact Information (if available)",
              "User Account Status (linked or not)",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Players are unpaid because no PaymentMethod record exists yet - they haven't attempted to pay.",
            tips: [
              {
                type: "info",
                content:
                  "Unpaid doesn't mean they refused to pay - it just means they haven't started the process yet.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Click on a player's row to expand and see available actions.",
          },
        ],
      },
      {
        id: "sending-payment-reminders",
        heading: "Sending Payment Reminders via SMS",
        description:
          "Send automated SMS reminders to players who haven't paid yet.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Find the player you want to remind in the Unpaid tab.",
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Send Reminder" button for that player.',
            tips: [
              {
                type: "warning",
                content:
                  "This button only appears if the player has a phone number on file.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "A confirmation dialog will appear showing:",
            substeps: [
              "Player's name and phone number",
              "Preview of the SMS message that will be sent",
              "Cost of the SMS (Twilio charges apply)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Review the message and click "Send SMS" to confirm.',
          },
          {
            stepNumber: 5,
            instruction:
              "The player will receive an SMS with a reminder to complete their payment.",
            tips: [
              {
                type: "info",
                content:
                  "SMS typically delivers within seconds. The player receives a text with payment instructions.",
              },
              {
                type: "tip",
                content:
                  "Avoid sending multiple reminders in one day - space them out to avoid annoying players.",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "The system tracks when reminders were sent (visible in player payment history).",
          },
        ],
      },
      {
        id: "notifying-team-captain",
        heading: "Notifying Team Captains",
        description:
          "Send notifications to team captains to follow up with unpaid players on their roster.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Find the unpaid player in the Unpaid tab.",
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Notify Captain" button.',
            tips: [
              {
                type: "info",
                content:
                  "This button only appears if the team has a designated captain with contact information.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "The team captain will receive a notification (via email or SMS) informing them that this player hasn't paid yet.",
          },
          {
            stepNumber: 4,
            instruction: "The captain can then personally follow up with the player.",
            tips: [
              {
                type: "tip",
                content:
                  "Captains often have better relationships with players and can get faster results than admin reminders.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "Use this feature sparingly - you don't want to overwhelm captains with too many unpaid player alerts.",
            tips: [
              {
                type: "warning",
                content:
                  "Only notify captains for players who are significantly overdue (e.g., 1+ week past deadline).",
              },
            ],
          },
        ],
      },
      {
        id: "linking-user-accounts",
        heading: "Linking Players to User Accounts",
        description:
          "Connect manually-created players to existing user accounts so they can pay online.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Players created manually by admins don't have user accounts initially.",
            tips: [
              {
                type: "info",
                content:
                  "User accounts are required for players to pay online via Stripe or view their profile in the player app.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction:
              'For unpaid players without user accounts, click the "Link User Account" button.',
          },
          {
            stepNumber: 3,
            instruction:
              "A dialog will open allowing you to search for existing users by email.",
          },
          {
            stepNumber: 4,
            instruction: "Type the player's email address to search.",
            substeps: [
              "If a matching user exists, they'll appear in the search results",
              "If no user exists, you'll see an option to invite them to create an account",
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Link Account" to connect the player to the user.',
            tips: [
              {
                type: "success",
                content:
                  "Once linked, the player can log in to the player app and pay online.",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "If inviting a new user, they'll receive an email with instructions to create their account and password.",
          },
        ],
        relatedSections: ["creating-payment-links"],
      },
      {
        id: "creating-payment-links",
        heading: "Creating Payment Links",
        description:
          "Generate one-time payment links for players to pay online without logging in.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Payment links are useful when a player doesn't have a user account or can't log in.",
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Create Payment Link" button for the unpaid player.',
          },
          {
            stepNumber: 3,
            instruction: "A dialog will open with payment link options:",
            substeps: [
              "Payment Type - Full payment or installments",
              "Amount - Pre-filled with their pricing tier amount",
              "Expiration - How long the link is valid (24 hours, 7 days, 30 days, never)",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              'Configure the options and click "Generate Link".',
          },
          {
            stepNumber: 5,
            instruction: "The system creates a Stripe payment link and displays it.",
            substeps: [
              'Click "Copy Link" to copy to clipboard',
              'Click "Send via SMS" to text the link to the player (if phone number available)',
              'Manually share the link via email, WhatsApp, or other messaging',
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Payment links are secure and unique to each player. They cannot be used by others.",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "When the player completes payment via the link, their status automatically updates to 'Paid' (or 'In Progress' for installments).",
          },
        ],
      },
    ],
  },

  {
    id: "handling-in-progress-payments",
    title: "Handling In-Progress Payments",
    description:
      "Manage players on installment plans - view schedules, track progress, and process manual installments.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 4,
    difficulty: "intermediate",
    prerequisites: ["payment-dashboard-overview"],
    tags: ["installments", "subscriptions", "recurring", "stripe"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "understanding-installment-status",
        heading: "Understanding Installment Status",
        description:
          "Learn how installment plans work and what 'In Progress' means.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to the "In Progress" tab in the Payments dashboard.',
          },
          {
            stepNumber: 2,
            instruction:
              "Players appear in this tab when they've chosen an installment payment plan.",
            tips: [
              {
                type: "info",
                content:
                  "Installment plans are Stripe subscriptions that charge the player's card automatically on scheduled dates.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "For each player in progress, you'll see:",
            substeps: [
              "Player Name and Team",
              "Total Amount Owed - Original registration price",
              "Amount Paid So Far - Sum of successful installments",
              "Remaining Balance - What's left to pay",
              "Next Payment Date - When the next installment will charge",
              "Installment Status - Active, Paused, or Cancelled",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Players remain 'In Progress' until they've paid the full amount or their subscription fails.",
          },
        ],
      },
      {
        id: "viewing-payment-schedules",
        heading: "Viewing Payment Schedules",
        description:
          "See the detailed installment schedule for each player on a payment plan.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Click on a player in the In Progress tab to expand their details.",
          },
          {
            stepNumber: 2,
            instruction: "The expanded view shows their complete payment schedule:",
            substeps: [
              "Past Installments - Dates and amounts already paid",
              "Upcoming Installments - Future scheduled charges",
              "Failed Attempts - Any installments that didn't go through",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Each installment shows:",
            substeps: [
              "Date - When the charge occurred or will occur",
              "Amount - How much was/will be charged",
              "Status - Succeeded, Pending, or Failed",
              "Stripe Invoice ID - For reference and troubleshooting",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Use this information to answer player questions about their payment status.",
            tips: [
              {
                type: "tip",
                content:
                  'If a player asks "When is my next payment?", check this schedule for the exact date.',
              },
            ],
          },
        ],
      },
      {
        id: "manual-installment-processing",
        heading: "Manual Payment Processing",
        description:
          "Process installments manually when automatic charges fail or players request it.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "If an installment fails, you may need to manually charge the player's card.",
          },
          {
            stepNumber: 2,
            instruction:
              'Click "Charge Card" next to the failed installment.',
            tips: [
              {
                type: "warning",
                content:
                  "This only works if the player has a card on file. If the card expired, they'll need to update their payment method first.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "A confirmation dialog appears showing:",
            substeps: [
              "Player's name",
              "Amount to charge",
              "Card details (last 4 digits)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Charge Now" to process the payment.',
          },
          {
            stepNumber: 5,
            instruction:
              "The charge is processed immediately through Stripe.",
            tips: [
              {
                type: "success",
                content:
                  "If successful, the installment status updates to 'Succeeded' and the player's paid amount increases.",
              },
              {
                type: "warning",
                content:
                  "If the charge fails again, the player will move to the 'Has Issues' tab.",
              },
            ],
          },
        ],
        relatedSections: ["managing-payment-issues"],
      },
    ],
  },

  {
    id: "managing-payment-issues",
    title: "Managing Payment Issues",
    description:
      "Handle failed payments, expired cards, and other payment problems to recover lost revenue.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 5,
    difficulty: "intermediate",
    prerequisites: ["payment-dashboard-overview"],
    tags: ["failed", "issues", "expired-card", "stripe", "recovery"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "understanding-payment-issues",
        heading: "Understanding Payment Issues",
        description:
          "Learn what causes payments to fail and how to identify the problem.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to the "Has Issues" tab in the Payments dashboard.',
          },
          {
            stepNumber: 2,
            instruction:
              "Players appear here when their payment has failed or encountered an error.",
          },
          {
            stepNumber: 3,
            instruction: "Common reasons for payment issues:",
            substeps: [
              "Card Declined - Insufficient funds, fraud protection, or bank rejection",
              "Card Expired - The card on file has passed its expiration date",
              "Card Cancelled - The player cancelled their card or it was lost/stolen",
              "Subscription Failed - A recurring installment couldn't be charged",
              "3D Secure Failed - Bank security verification didn't complete",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "Failed payments don't automatically retry. You must take manual action.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "For each player with issues, you'll see:",
            substeps: [
              "Player Name and Team",
              "Issue Type - Description of the problem",
              "Last Attempt Date - When the failure occurred",
              "Amount Owed - How much still needs to be paid",
              "Available Actions - Options to resolve the issue",
            ],
          },
        ],
      },
      {
        id: "charging-cards-manually",
        heading: "Charging Cards Manually",
        description:
          "Attempt to charge a failed payment again after the player resolves the issue.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "First, contact the player to ensure they've resolved the issue (added funds, updated card, etc.).",
            tips: [
              {
                type: "tip",
                content:
                  "Don't charge again without confirmation - it will likely fail again and may trigger fraud alerts.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: 'Click the "Charge Card" button for the player with issues.',
          },
          {
            stepNumber: 3,
            instruction: "Review the payment details in the confirmation dialog:",
            substeps: [
              "Player name",
              "Amount to charge",
              "Card on file (last 4 digits)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Process Payment" to attempt the charge.',
          },
          {
            stepNumber: 5,
            instruction: "Possible outcomes:",
            substeps: [
              "Success - Payment goes through, player moves to 'Paid' or 'In Progress'",
              "Failure - Payment fails again, player stays in 'Has Issues'",
            ],
            tips: [
              {
                type: "warning",
                content:
                  "If charging fails multiple times, ask the player to update their payment method or pay via alternate method (terminal, cash, e-transfer).",
              },
            ],
          },
        ],
      },
      {
        id: "terminal-payment-processing",
        heading: "Terminal Payment Processing",
        description:
          "Process in-person card payments using a Stripe Terminal card reader.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "If online payments keep failing, offer the player to pay in person with a card reader.",
            tips: [
              {
                type: "info",
                content:
                  "This requires a physical Stripe Terminal device to be set up and online.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: 'Click "Terminal Payment" for the player.',
          },
          {
            stepNumber: 3,
            instruction: "Select which card reader to use from the dropdown list.",
            tips: [
              {
                type: "warning",
                content:
                  "Only online readers appear in the list. If no readers show, check that your terminal is powered on and connected.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "The amount is pre-filled based on what the player owes.",
          },
          {
            stepNumber: 5,
            instruction: 'Click "Charge Terminal" to initiate the payment.',
          },
          {
            stepNumber: 6,
            instruction:
              "The card reader will prompt the player to insert, tap, or swipe their card.",
          },
          {
            stepNumber: 7,
            instruction:
              "Wait for the terminal to process the payment (usually 5-10 seconds).",
            tips: [
              {
                type: "tip",
                content:
                  "The admin portal will show 'Processing...' while the card reader is working.",
              },
            ],
          },
          {
            stepNumber: 8,
            instruction: "Once complete:",
            substeps: [
              "Success - Player's status updates to 'Paid', receipt prints (if enabled)",
              "Declined - Try again or use alternate payment method",
            ],
          },
        ],
        relatedSections: ["terminal-setup"],
      },
      {
        id: "sending-new-payment-links",
        heading: "Sending New Payment Links",
        description:
          "Create fresh payment links when the player needs to update their card or start over.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "If the card on file is expired or cancelled, the player needs to provide a new one.",
          },
          {
            stepNumber: 2,
            instruction: 'Click "Send Payment Link" for the player with issues.',
          },
          {
            stepNumber: 3,
            instruction: "Configure the payment link:",
            substeps: [
              "Payment Type - Full payment or installments (if they want to restart)",
              "Amount - Usually the remaining balance",
              "Expiration - Set a deadline (e.g., 7 days)",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Generate & Send" to create the link.',
          },
          {
            stepNumber: 5,
            instruction: "The link can be sent via:",
            substeps: [
              "SMS - If player has phone number on file",
              "Email - Manually send via email",
              "Copy & paste - Share via messaging app",
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "When the player pays via the new link, their old failed payment is replaced and status updates accordingly.",
          },
        ],
      },
      {
        id: "resolving-issues",
        heading: "Resolving and Tracking Issues",
        description:
          "Mark issues as resolved and track resolution history.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "After successfully recovering a failed payment, the player automatically moves out of 'Has Issues'.",
          },
          {
            stepNumber: 2,
            instruction:
              "The system keeps a log of all payment attempts and resolutions.",
          },
          {
            stepNumber: 3,
            instruction: "To view resolution history:",
            substeps: [
              "Click on the player's name to view their full payment record",
              "Scroll to 'Payment History' section",
              "Review all attempts, failures, and successes with timestamps",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Use this history to identify patterns (e.g., player whose card fails every month).",
            tips: [
              {
                type: "tip",
                content:
                  "For repeat offenders, suggest they switch to e-transfer or cash to avoid ongoing issues.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "cash-and-etransfer-payments",
    title: "Cash & E-Transfer Payments",
    description:
      "Process manual cash payments and e-transfers (individual and team bulk), including auto-split functionality and reverting payments.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "payments",
    estimatedTime: 5,
    difficulty: "intermediate",
    prerequisites: ["payment-dashboard-overview"],
    tags: ["cash", "e-transfer", "manual", "bulk", "team-payment"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "marking-cash-payments",
        heading: "Marking Cash Payments",
        description:
          "Record when a player pays in cash for proper tracking and status updates.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "When a player pays in cash (in person or via captain), you need to record it manually.",
          },
          {
            stepNumber: 2,
            instruction:
              'Find the player in the "Unpaid" tab and click "Mark as Cash".',
            tips: [
              {
                type: "info",
                content:
                  "This button also appears in 'Has Issues' if a failed payment needs to be replaced with cash.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "A dialog will open asking for confirmation:",
            substeps: [
              "Player name and team",
              "Amount received (pre-filled with their pricing tier)",
              "Date received (defaults to today)",
              "Optional notes (e.g., 'Paid to captain on Dec 15')",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Verify the amount is correct and add any relevant notes.",
          },
          {
            stepNumber: 5,
            instruction: 'Click "Mark as Paid" to record the cash payment.',
            tips: [
              {
                type: "success",
                content:
                  "The player immediately moves to the 'Paid' tab and their status updates throughout the system.",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "The PaymentMethod record is created with type 'CASH' and status 'COMPLETED'.",
            tips: [
              {
                type: "tip",
                content:
                  "Always add notes about who you received the cash from for your records.",
              },
            ],
          },
        ],
      },
      {
        id: "individual-etransfer",
        heading: "Processing Individual E-Transfers",
        description:
          "Record single e-transfer payments received from individual players.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "When you receive an e-transfer in your league's bank account, you need to match it to the player.",
          },
          {
            stepNumber: 2,
            instruction:
              'Find the player in the "Unpaid" tab and click "Mark as E-Transfer".',
          },
          {
            stepNumber: 3,
            instruction: "A form will open asking for e-transfer details:",
            substeps: [
              "Amount Received - How much the player sent",
              "Transaction ID - From your bank (optional but recommended)",
              "Date Received - When the transfer arrived",
              "Sender Name - Who sent it (should match player)",
              "Notes - Any additional information",
            ],
          },
          {
            stepNumber: 4,
            instruction: "Fill in the details from your bank notification.",
            tips: [
              {
                type: "tip",
                content:
                  "Copy the transaction ID from your bank email for easy tracking and potential refunds.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Click "Record Payment" to save the e-transfer.',
          },
          {
            stepNumber: 6,
            instruction:
              "The player's status updates to 'Paid' and the amount is recorded.",
            tips: [
              {
                type: "info",
                content:
                  "E-transfers are tracked separately for financial reporting and reconciliation.",
              },
            ],
          },
        ],
      },
      {
        id: "partial-etransfer-payments",
        heading: "Partial E-Transfer Payments",
        description:
          "Handle players who pay in multiple e-transfer installments.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Some players split their payment across multiple e-transfers (e.g., paying $50 twice instead of $100 once).",
            tips: [
              {
                type: "info",
                content:
                  "The system automatically tracks partial payments and calculates when the full amount is paid.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "When you receive the first partial payment, mark it as e-transfer with the actual amount received.",
          },
          {
            stepNumber: 3,
            instruction:
              "The player will move to 'In Progress' status (similar to installments).",
          },
          {
            stepNumber: 4,
            instruction:
              "When you receive subsequent payments, click 'Add E-Transfer' to record additional amounts.",
          },
          {
            stepNumber: 5,
            instruction: "The system automatically:",
            substeps: [
              "Adds the new payment to their e-transfer payment array",
              "Recalculates their total amount paid",
              "Updates their status to 'Paid' when total >= registration price",
            ],
            tips: [
              {
                type: "success",
                content:
                  "This auto-calculation happens via a pre-save hook in the PaymentMethod model!",
              },
            ],
          },
          {
            stepNumber: 6,
            instruction:
              "You can view all e-transfer payments for a player in their payment detail page.",
          },
        ],
      },
      {
        id: "team-bulk-etransfer",
        heading: "Team Bulk E-Transfer Processing",
        description:
          "Process one e-transfer that covers multiple players on the same team (auto-split feature).",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "Sometimes team captains pay for their entire team in one bulk e-transfer.",
          },
          {
            stepNumber: 2,
            instruction:
              'Navigate to the team page and click "Process Team E-Transfer".',
            tips: [
              {
                type: "info",
                content:
                  "This feature is only available on team detail pages, not the general payment dashboard.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "A dialog will open showing:",
            substeps: [
              "Team name and captain",
              "List of all unpaid players on the roster",
              "Checkboxes to select which players this payment covers",
              "Total amount field",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Select all players that this e-transfer should cover.",
          },
          {
            stepNumber: 5,
            instruction:
              "Enter the total amount received from the team captain.",
          },
          {
            stepNumber: 6,
            instruction: "Choose auto-split method:",
            substeps: [
              "Equal Split - Divide amount evenly among selected players",
              "By Pricing Tier - Each player gets their exact registration fee (system calculates)",
            ],
            tips: [
              {
                type: "tip",
                content:
                  'Use "By Pricing Tier" if some players are early bird and others are regular - it automatically assigns the correct amount.',
              },
            ],
          },
          {
            stepNumber: 7,
            instruction: 'Click "Process Bulk Payment" to split and record.',
          },
          {
            stepNumber: 8,
            instruction: "The system automatically:",
            substeps: [
              "Creates individual e-transfer records for each selected player",
              "Marks each player as paid (or partially paid if split doesn't cover full amount)",
              "Updates all statuses in one operation",
              "Logs the bulk transaction for reporting",
            ],
            tips: [
              {
                type: "success",
                content:
                  "This saves massive time vs. manually entering each player separately!",
              },
            ],
          },
        ],
      },
      {
        id: "reverting-payments",
        heading: "Reverting Payments",
        description:
          "Undo incorrect payments (cash or e-transfer) to fix mistakes.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "If you accidentally marked the wrong player as paid or entered the wrong amount, you can revert it.",
          },
          {
            stepNumber: 2,
            instruction:
              'Navigate to the "Paid" tab and find the player whose payment needs to be undone.',
          },
          {
            stepNumber: 3,
            instruction: 'Click the three-dot menu and select "Revert Payment".',
            tips: [
              {
                type: "warning",
                content:
                  "This option only appears for CASH and E_TRANSFER payments. You cannot revert Stripe payments this way.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "A confirmation dialog will appear asking:",
            substeps: [
              "Are you sure you want to revert this payment?",
              "Reason for revert (optional notes for your records)",
            ],
          },
          {
            stepNumber: 5,
            instruction: 'Enter a reason (e.g., "Wrong player, meant to mark Sarah Smith not Sarah Jones") and click "Revert".',
          },
          {
            stepNumber: 6,
            instruction: "The system will:",
            substeps: [
              "Delete the PaymentMethod record",
              "Move the player back to 'Unpaid' status",
              "Log the revert action with timestamp and reason",
            ],
            tips: [
              {
                type: "info",
                content:
                  "The revert is logged for audit purposes but the payment record is completely removed.",
              },
            ],
          },
          {
            stepNumber: 7,
            instruction:
              "You can now mark the correct player as paid or fix the amount.",
          },
        ],
      },
    ],
  },
];
