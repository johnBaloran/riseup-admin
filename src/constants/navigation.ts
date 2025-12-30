// src/constants/navigation.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Navigation structure definition ONLY
 */

/**
 * DRY Principle
 * Single source of truth for navigation
 */
// src/constants/navigation.ts

import { Permission } from "./permissions";

export interface NavItem {
  label: string;
  href?: string;
  icon: string;
  permission: Permission;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    permission: "view_dashboard",
  },
  {
    label: "League Management",
    icon: "Trophy",
    permission: "view_divisions",
    children: [
      {
        label: "Cities",
        href: "/league/cities",
        icon: "Building2",
        permission: "manage_cities",
      },
      {
        label: "Locations",
        href: "/league/locations",
        icon: "MapPin",
        permission: "manage_locations",
      },
      {
        label: "Levels",
        href: "/league/levels",
        icon: "TrendingUp",
        permission: "manage_levels",
      },
      {
        label: "Prices",
        href: "/league/prices",
        icon: "DollarSign",
        permission: "manage_prices",
      },
      {
        label: "Divisions",
        href: "/league/divisions",
        icon: "List",
        permission: "view_divisions",
      },
      {
        label: "Teams",
        href: "/league/teams",
        icon: "Users",
        permission: "view_teams",
      },
      {
        label: "Players",
        href: "/league/players",
        icon: "User",
        permission: "view_players",
      },
    ],
  },
  {
    label: "Game Management",
    href: "/games",
    icon: "Calendar",
    permission: "view_games",
  },
  {
    label: "Payment Management",
    href: "/payments",
    icon: "CreditCard",
    permission: "view_payments",
  },
  {
    label: "Jersey Management",
    href: "/jerseys",
    icon: "Shirt",
    permission: "view_jerseys",
  },
  {
    label: "Photos Management",
    href: "/photos",
    icon: "Camera",
    permission: "view_photos",
  },
  {
    label: "Scorekeeper",
    href: "/scorekeeper",
    icon: "ClipboardList",
    permission: "manage_scores",
  },
  {
    label: "Communications",
    href: "/communications",
    icon: "MessageSquare",
    permission: "view_communications",
  },
  {
    label: "Exports",
    icon: "FileSpreadsheet",
    permission: "export_players",
    children: [
      {
        label: "Player Export",
        href: "/exports/players",
        icon: "Users",
        permission: "export_players",
      },
    ],
  },
  {
    label: "Tutorials",
    href: "/tutorials",
    icon: "BookOpen",
    permission: "view_dashboard",
  },
  {
    label: "Settings",
    icon: "Settings",
    permission: "view_dashboard",
    children: [
      {
        label: "Staff Management",
        href: "/settings/admins",
        icon: "Shield",
        permission: "manage_admins",
      },
      {
        label: "Connect Terminal",
        href: "/settings/terminal",
        icon: "CreditCard",
        permission: "view_terminal",
      },
      {
        label: "Profile",
        href: "/settings/profile",
        icon: "User",
        permission: "view_dashboard",
      },
    ],
  },
];

export function filterNavigationByPermissions(
  items: NavItem[],
  userPermissions: Permission[]
): NavItem[] {
  return items
    .filter((item) => userPermissions.includes(item.permission))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter((child) =>
            userPermissions.includes(child.permission)
          ),
        };
      }
      return item;
    })
    .filter((item) => !item.children || item.children.length > 0);
}
