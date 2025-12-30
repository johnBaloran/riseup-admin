// src/data/tutorials/executive-dashboard.ts

/**
 * Executive-level tutorials for Dashboard & Analytics
 * Covers payment analytics, revenue tracking, filtering, and data exports
 */

import { Tutorial } from "@/types/tutorial";

export const executiveDashboardTutorials: Tutorial[] = [
  {
    id: "understanding-dashboard",
    title: "Understanding Your Dashboard",
    description:
      "Comprehensive overview of the Executive dashboard, including payment analytics, revenue tracking, payment method breakdown, and daily trends.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "dashboard",
    estimatedTime: 5,
    difficulty: "beginner",
    tags: [
      "dashboard",
      "analytics",
      "revenue",
      "payments",
      "metrics",
      "statistics",
    ],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "dashboard-overview",
        heading: "Dashboard Overview",
        description:
          "Understanding the main components of your admin dashboard.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "After logging in, the dashboard is the first page you see.",
            tips: [
              {
                type: "info",
                content:
                  "The dashboard provides a real-time overview of your league's financial health and payment status.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "The dashboard is divided into several key sections:",
            substeps: [
              "Payment Analytics Overview - High-level metrics at the top",
              "Revenue Tracking by City - Geographic breakdown",
              "Payment Method Breakdown - How players are paying",
              "Daily Trends - Revenue over time",
              "Payment Status Distribution - Current payment states",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "All metrics update in real-time as payments are processed.",
            tips: [
              {
                type: "tip",
                content:
                  "Refresh the page to see the latest data if you've just processed payments.",
              },
            ],
          },
        ],
      },
      {
        id: "payment-analytics-overview",
        heading: "Payment Analytics Overview",
        description:
          "Understanding the key metrics displayed at the top of your dashboard.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'The "Payment Analytics" section at the top shows four primary metrics:',
            substeps: [
              "Total Revenue - Sum of all completed payments across all cities",
              "Total Players - Number of registered players",
              "Average Payment - Average amount paid per player",
              "Completion Rate - Percentage of players who have fully paid",
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "Each metric card shows the current value and a trend indicator (if applicable).",
            tips: [
              {
                type: "info",
                content:
                  "Total Revenue only counts completed payments. In-progress installments show their paid amount, not the total owed.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Hover over any metric to see additional details and tooltips.",
          },
          {
            stepNumber: 4,
            instruction:
              "Use the date filter (covered in the next section) to view metrics for specific time periods.",
            tips: [
              {
                type: "tip",
                content:
                  "Compare week-over-week or month-over-month metrics to track registration progress.",
              },
            ],
          },
        ],
      },
      {
        id: "revenue-by-city",
        heading: "Revenue Tracking by City",
        description:
          "How to view and analyze revenue breakdown across different cities.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'The "Revenue by City" section shows a table or chart breaking down payments by location.',
          },
          {
            stepNumber: 2,
            instruction: "For each city, you can see:",
            substeps: [
              "City Name",
              "Total Revenue - All completed payments in this city",
              "Player Count - Number of players in this city",
              "Average per Player - Revenue divided by player count",
              "Completion Rate - Percentage of players fully paid",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Click on a city name to drill down into that city's payment details.",
            tips: [
              {
                type: "tip",
                content:
                  "This is useful for identifying which cities have the best payment completion rates.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Executives can see all cities. Commissioners see only their assigned city.",
            tips: [
              {
                type: "info",
                content:
                  "City-level revenue tracking helps identify geographic trends and collection issues.",
              },
            ],
          },
        ],
      },
      {
        id: "payment-method-breakdown",
        heading: "Payment Method Breakdown",
        description:
          "Understanding how players are paying (Stripe, Installments, Cash, E-Transfer).",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'The "Payment Method Breakdown" shows a pie chart or bar graph of payment types.',
          },
          {
            stepNumber: 2,
            instruction: "The five payment methods tracked are:",
            substeps: [
              "Full Payment (Stripe) - One-time credit card payments",
              "Installments (Stripe) - Recurring payment plans",
              "Cash - Manual cash payments processed by admins",
              "Terminal - In-person card reader payments",
              "E-Transfer - Bank transfers (individual or team bulk)",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Each payment method shows both count (number of players) and total revenue.",
            tips: [
              {
                type: "info",
                content:
                  "This helps you understand which payment methods are most popular and plan accordingly.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Click on any payment method to filter the dashboard to show only that type.",
            tips: [
              {
                type: "tip",
                content:
                  "Use this to identify players on installment plans who may need follow-up.",
              },
            ],
          },
        ],
      },
      {
        id: "daily-trends",
        heading: "Daily Trends and Insights",
        description:
          "Tracking revenue over time to identify patterns and peak registration periods.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'The "Daily Trends" section shows a line or bar graph of revenue over time.',
          },
          {
            stepNumber: 2,
            instruction:
              "By default, the graph shows the last 30 days of payment activity.",
          },
          {
            stepNumber: 3,
            instruction:
              "You can adjust the time range using the date filter controls:",
            substeps: [
              "Last 7 Days - Quick view of recent activity",
              "Last 30 Days - Default monthly view",
              "Last 90 Days - Quarterly trends",
              "Custom Range - Select specific start and end dates",
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Hover over any point on the graph to see exact revenue for that day.",
          },
          {
            stepNumber: 5,
            instruction: "Look for patterns such as:",
            substeps: [
              "Spikes after registration opens",
              "Increase near early bird deadline",
              "Steady installment payment dates",
              "Low activity periods requiring promotion",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use trends to plan reminders and follow-ups during slow periods.",
              },
            ],
          },
        ],
      },
      {
        id: "payment-status-distribution",
        heading: "Payment Status Distribution",
        description:
          "Understanding the four payment statuses and what they mean for your league.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'The "Payment Status" section shows a breakdown of all players by their current status.',
          },
          {
            stepNumber: 2,
            instruction: "The four payment statuses are:",
            substeps: [
              "Paid (Green) - Players who have completed full payment",
              "In Progress (Blue) - Players on active installment plans",
              "Has Issues (Red) - Players with failed payments or expired cards",
              "Unpaid (Gray) - Players with no payment record yet",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Each status shows both a count and percentage of total players.",
          },
          {
            stepNumber: 4,
            instruction:
              'Click on any status to navigate to the "Payments" page filtered to that status.',
            tips: [
              {
                type: "tip",
                content:
                  "This is the fastest way to take action on players needing follow-up.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "Monitor your 'Has Issues' count daily to prevent lost revenue.",
            tips: [
              {
                type: "warning",
                content:
                  "Failed payments don't automatically retry. You must manually charge the card or send a new payment link.",
              },
            ],
          },
        ],
      },
    ],
  },

  {
    id: "dashboard-filters",
    title: "Using Dashboard Filters",
    description:
      "Learn how to filter your dashboard by date range and city to analyze specific segments of your data.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "dashboard",
    estimatedTime: 3,
    difficulty: "beginner",
    prerequisites: ["understanding-dashboard"],
    tags: ["dashboard", "filters", "date", "city", "analytics"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "date-range-selection",
        heading: "Date Range Selection",
        description:
          "Filter your dashboard metrics to show data for specific time periods.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Locate the date filter controls at the top of the dashboard (usually near "Filter by Date").',
          },
          {
            stepNumber: 2,
            instruction: "You have several quick filter options:",
            substeps: [
              "Today - Only payments from today",
              "Last 7 Days - Past week",
              "Last 30 Days - Past month (default)",
              "Last 90 Days - Past quarter",
              "All Time - No date filtering",
              "Custom - Choose specific start and end dates",
            ],
          },
          {
            stepNumber: 3,
            instruction: 'To select a preset range, click on the quick filter button (e.g., "Last 7 Days").',
            tips: [
              {
                type: "info",
                content:
                  "The dashboard will refresh automatically to show data for that time period.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "To set a custom date range:",
            substeps: [
              'Click the "Custom" button',
              "Select your start date from the calendar",
              "Select your end date from the calendar",
              'Click "Apply" to update the dashboard',
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "The active date range is displayed prominently, and all metrics reflect that period.",
            tips: [
              {
                type: "tip",
                content:
                  'Use custom ranges to compare "before vs after" periods, like before and after early bird deadlines.',
              },
            ],
          },
        ],
      },
      {
        id: "city-filtering",
        heading: "City Filtering",
        description:
          "Focus your dashboard on a specific city to analyze local performance.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Locate the city filter dropdown (usually labeled "All Cities" or "Filter by City").',
            tips: [
              {
                type: "info",
                content:
                  "Executives see all cities. Commissioners are automatically filtered to their assigned city.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Click the city dropdown to see available cities.",
          },
          {
            stepNumber: 3,
            instruction: "Select a specific city to filter the dashboard.",
          },
          {
            stepNumber: 4,
            instruction:
              "All dashboard metrics (revenue, player count, trends) will update to show only that city's data.",
          },
          {
            stepNumber: 5,
            instruction: 'Select "All Cities" to return to the combined view.',
            tips: [
              {
                type: "tip",
                content:
                  "Use city filtering to identify underperforming locations or celebrate top performers.",
              },
            ],
          },
        ],
      },
      {
        id: "comparing-time-periods",
        heading: "Comparing Time Periods",
        description:
          "Techniques for comparing different time periods to identify trends and growth.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "To compare two time periods, you'll need to view them separately and note the metrics.",
            tips: [
              {
                type: "info",
                content:
                  "Future enhancement: Side-by-side comparison mode is planned for a future release.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Example: Comparing Week 1 vs Week 2 registrations",
            substeps: [
              'Set date filter to "Custom" and select Week 1 dates',
              "Note the Total Revenue and Player Count",
              "Change date filter to Week 2 dates",
              "Compare the new revenue and count to Week 1",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Common comparisons to track:",
            substeps: [
              "Week over week - Are registrations accelerating or slowing?",
              "Month over month - Seasonal trends",
              "Before vs after early bird - Did the deadline drive urgency?",
              "Year over year - Growth from previous season",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Export data for each period to create comparison spreadsheets.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Look for unusual spikes or drops and investigate the cause (promotion, social media post, email campaign, etc.).",
          },
        ],
        relatedSections: ["exporting-data"],
      },
    ],
  },

  {
    id: "exporting-data",
    title: "Exporting Data",
    description:
      "Learn how to export player data to CSV for offline analysis, reporting, and backups.",
    roles: ["EXECUTIVE", "COMMISSIONER"],
    category: "dashboard",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["export", "csv", "data", "download", "reporting"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "exporting-player-data",
        heading: "Exporting Player Data to CSV",
        description:
          "Download a comprehensive spreadsheet of all player information.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to "Exports" in the sidebar menu.',
          },
          {
            stepNumber: 2,
            instruction: 'Select "Player Export" from the available export options.',
          },
          {
            stepNumber: 3,
            instruction: "Configure your export filters:",
            substeps: [
              "City - Select specific city or all cities",
              "Division - Filter by specific division (optional)",
              "Payment Status - Filter by payment status (optional)",
              "Active Only - Include only active divisions",
            ],
          },
          {
            stepNumber: 4,
            instruction: 'Click "Export to CSV" to download the file.',
            tips: [
              {
                type: "info",
                content:
                  "Large exports (1000+ players) may take a few seconds to generate.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "The CSV file will download to your browser's default download location.",
          },
        ],
      },
      {
        id: "understanding-export-fields",
        heading: "Understanding Export Fields",
        description:
          "Learn what each column in the exported CSV represents.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Open the exported CSV in Excel, Google Sheets, or any spreadsheet app.",
          },
          {
            stepNumber: 2,
            instruction: "The export includes the following columns:",
            substeps: [
              "Player Name - Full name of the player",
              "Email - Player's email (if user account linked)",
              "Phone - Player's phone number (if provided)",
              "City - City where the player is registered",
              "Division - Division name",
              "Team - Team name (or 'Free Agent' if no team)",
              "Jersey Number - Player's jersey number",
              "Jersey Size - Player's jersey size",
              "Jersey Name - Name on back of jersey",
              "Payment Status - Current payment status (Paid, In Progress, etc.)",
              "Payment Method - How player paid (Stripe, Cash, E-Transfer, etc.)",
              "Amount Paid - Total amount paid so far",
              "Pricing Tier - Early Bird or Regular",
              "User Linked - Whether player has a user account (Yes/No)",
              "Instagram - Player's Instagram handle",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Use this data for:",
            substeps: [
              "Creating email lists for specific divisions or teams",
              "Generating financial reports for your organization",
              "Identifying players missing key information",
              "Backup of player data for record-keeping",
              "Importing into third-party tools or CRMs",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Export data regularly as a backup. Recommended: weekly during registration, monthly during season.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Sensitive data: Treat exported files as confidential. They contain personal information.",
            tips: [
              {
                type: "warning",
                content:
                  "Do not share CSV exports publicly or via insecure channels. Use password-protected files when sharing.",
              },
            ],
          },
        ],
      },
    ],
  },
];
