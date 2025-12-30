// src/data/tutorials/all-roles.ts

/**
 * Tutorials accessible to ALL roles
 * These cover basic system usage that every admin needs to know
 */

import { Tutorial } from "@/types/tutorial";

export const allRolesTutorials: Tutorial[] = [
  {
    id: "login-and-first-time-setup",
    title: "Login & First-Time Setup",
    description:
      "Learn how to access the Rise Up Admin portal and navigate the dashboard for the first time.",
    roles: ["ALL"],
    category: "getting-started",
    estimatedTime: 3,
    difficulty: "beginner",
    tags: ["login", "authentication", "navigation", "dashboard", "setup"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "accessing-admin-portal",
        heading: "Accessing the Admin Portal",
        description:
          "How to log in to the Rise Up Admin system and what to expect on your first login.",
        steps: [
          {
            stepNumber: 1,
            instruction: "Navigate to the admin portal URL provided by your organization.",
            tips: [
              {
                type: "info",
                content:
                  "Bookmark this URL for quick access. The admin portal is separate from the player app.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Enter your email address in the login form.",
            tips: [
              {
                type: "tip",
                content:
                  "This is the email address that was used when your admin account was created.",
              },
            ],
          },
          {
            stepNumber: 3,
            instruction: "Enter your password and click 'Sign In'.",
            tips: [
              {
                type: "warning",
                content:
                  "Passwords are case-sensitive. Make sure Caps Lock is off.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "If this is your first login, you'll be prompted to change your password.",
            substeps: [
              "Enter your current (temporary) password",
              "Create a new strong password (minimum 8 characters, uppercase, lowercase, and number)",
              "Confirm your new password",
              "Click 'Update Password'",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use a password manager to generate and store a strong, unique password.",
              },
            ],
          },
        ],
      },
      {
        id: "understanding-dashboard",
        heading: "Understanding Your Dashboard",
        description:
          "Overview of the main dashboard layout and what information is displayed based on your role.",
        steps: [
          {
            stepNumber: 1,
            instruction: "After logging in, you'll see your personalized dashboard.",
            tips: [
              {
                type: "info",
                content:
                  "Your dashboard shows different information based on your role (Executive, Commissioner, Scorekeeper, or Photographer).",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction:
              "Executives and Commissioners will see payment analytics, revenue tracking, and payment method breakdowns.",
            substeps: [
              "Total revenue across all cities or your assigned city",
              "Payment status distribution (Paid, In Progress, Has Issues, Unpaid)",
              "Payment method breakdown (Stripe, Installments, Cash, E-Transfer)",
              "Daily revenue trends",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Scorekeepers will see a simplified dashboard focused on game schedules and scoring tasks.",
            tips: [
              {
                type: "info",
                content:
                  "Scorekeepers have limited access - only games and scoring features are visible.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Photographers will see media management tasks and games that need photos.",
          },
        ],
      },
      {
        id: "navigating-sidebar-menu",
        heading: "Navigating the Sidebar Menu",
        description:
          "Learn how to use the sidebar navigation to access different sections of the admin system.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              "The sidebar menu on the left shows all sections you have access to based on your role.",
            tips: [
              {
                type: "tip",
                content:
                  "On mobile devices, tap the menu icon (☰) to open the sidebar.",
              },
            ],
          },
          {
            stepNumber: 2,
            instruction: "Main navigation sections include:",
            substeps: [
              "Dashboard - Overview and analytics",
              "Payments - Payment management and processing (Executives & Commissioners only)",
              "League - Teams, players, divisions (Executives & Commissioners only)",
              "Games - Schedule management and viewing",
              "Jerseys - Jersey orders and management",
              "Photos - Game photos and media day uploads",
              "Exports - Data export tools",
              "Settings - Staff management, terminal setup, profile",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Click on any menu item to navigate to that section.",
            tips: [
              {
                type: "info",
                content:
                  "The current active page is highlighted in the sidebar for easy reference.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "Use breadcrumbs at the top of the page to navigate back to parent sections.",
          },
        ],
      },
    ],
  },

  {
    id: "profile-settings",
    title: "Your Profile Settings",
    description:
      "Update your personal information, change your password, and understand your role permissions.",
    roles: ["ALL"],
    category: "settings",
    estimatedTime: 2,
    difficulty: "beginner",
    tags: ["profile", "password", "settings", "account"],
    lastUpdated: "2024-12-29",
    sections: [
      {
        id: "accessing-profile",
        heading: "Accessing Your Profile",
        description: "How to navigate to your profile settings page.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Click on your name or profile icon in the top-right corner of the admin portal.',
          },
          {
            stepNumber: 2,
            instruction: 'Select "Profile" from the dropdown menu.',
          },
          {
            stepNumber: 3,
            instruction:
              "You'll be taken to your profile settings page where you can view and edit your information.",
          },
        ],
      },
      {
        id: "updating-personal-info",
        heading: "Updating Your Name and Phone Number",
        description:
          "How to change your display name and contact phone number.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to your profile settings (click your name → "Profile").',
          },
          {
            stepNumber: 2,
            instruction:
              'In the "Personal Information" section, you can edit:',
            substeps: [
              "Full Name - Your display name throughout the admin system",
              "Phone Number - Your contact number (optional)",
            ],
          },
          {
            stepNumber: 3,
            instruction: "Make your desired changes in the input fields.",
          },
          {
            stepNumber: 4,
            instruction: 'Click "Save Changes" to update your profile.',
            tips: [
              {
                type: "success",
                content:
                  "You'll see a success message once your profile has been updated.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction:
              "Your updated name will be reflected throughout the admin system immediately.",
            tips: [
              {
                type: "info",
                content:
                  "You cannot change your email address yourself. Contact an Executive admin if your email needs to be updated.",
              },
            ],
          },
        ],
      },
      {
        id: "changing-password",
        heading: "Changing Your Password",
        description:
          "How to update your password for improved security or if you've forgotten it.",
        steps: [
          {
            stepNumber: 1,
            instruction: 'Navigate to your profile settings (click your name → "Profile").',
          },
          {
            stepNumber: 2,
            instruction: 'Scroll to the "Change Password" section.',
          },
          {
            stepNumber: 3,
            instruction: "Enter your current password in the first field.",
            tips: [
              {
                type: "warning",
                content:
                  "You must know your current password to change it. If you've forgotten it, use the 'Forgot Password' link on the login page.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction: "Enter your new password in the second field.",
            substeps: [
              "Minimum 8 characters",
              "At least one uppercase letter",
              "At least one lowercase letter",
              "At least one number",
            ],
            tips: [
              {
                type: "tip",
                content:
                  "Use a strong, unique password. Consider using a password manager.",
              },
            ],
          },
          {
            stepNumber: 5,
            instruction: "Confirm your new password by entering it again in the third field.",
          },
          {
            stepNumber: 6,
            instruction: 'Click "Update Password" to save your new password.',
            tips: [
              {
                type: "success",
                content:
                  "You'll see a confirmation message once your password has been changed successfully.",
              },
              {
                type: "info",
                content:
                  "You'll remain logged in after changing your password. You don't need to log in again.",
              },
            ],
          },
        ],
      },
      {
        id: "understanding-role-permissions",
        heading: "Understanding Your Role and Permissions",
        description:
          "Learn what your admin role allows you to do in the system.",
        steps: [
          {
            stepNumber: 1,
            instruction:
              'Your role is displayed on your profile page under "Role & Access".',
          },
          {
            stepNumber: 2,
            instruction: "There are four admin roles in the Rise Up Admin system:",
            substeps: [
              "Executive - Full access to all features including system setup, payments, league management, and staff management",
              "Commissioner - Access to daily operations including payments, league management, games, jerseys, and photos (cannot modify cities, locations, or levels)",
              "Scorekeeper - Limited access focused on game scoring and viewing schedules",
              "Photographer - Access to photo management for games and media day sessions",
            ],
          },
          {
            stepNumber: 3,
            instruction:
              "Your role determines which menu items appear in the sidebar and which pages you can access.",
            tips: [
              {
                type: "info",
                content:
                  "If you need access to features you can't currently see, contact an Executive admin to discuss changing your role.",
              },
            ],
          },
          {
            stepNumber: 4,
            instruction:
              "You cannot change your own role - only Executive admins can modify admin roles.",
            tips: [
              {
                type: "warning",
                content:
                  "Even Executive admins cannot change their own role to prevent accidental lockouts.",
              },
            ],
          },
        ],
        relatedSections: ["staff-roles"],
      },
    ],
  },
];
