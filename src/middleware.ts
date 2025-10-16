// src/middleware.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Route protection ONLY
 */

/**
 * Security
 * Protects all admin routes from unauthorized access
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROLE_PERMISSIONS } from "@/constants/permissions";
import type { AdminRole } from "@/models/Admin";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as AdminRole;

    // Check if admin is active
    if (token && !token.isActive) {
      return NextResponse.redirect(new URL("/login?error=inactive", req.url));
    }

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const permissions = ROLE_PERMISSIONS[role];

    // Route-based permission checks
    // League Management - EXECUTIVE only
    if (path.includes("/league/cities") && !permissions.includes("manage_cities")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.includes("/league/locations") && !permissions.includes("manage_locations")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.includes("/league/levels") && !permissions.includes("manage_levels")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.includes("/league/prices") && !permissions.includes("manage_prices")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // League Management - EXECUTIVE + COMMISSIONER
    if (path.includes("/league/divisions") && !permissions.includes("view_divisions")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.includes("/league/teams") && !permissions.includes("view_teams")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (path.includes("/league/players") && !permissions.includes("view_players")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Games - All except PHOTOGRAPHER can view
    if (path.includes("/games") && !permissions.includes("view_games")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Payments - EXECUTIVE + COMMISSIONER
    if (path.includes("/payments") && !permissions.includes("view_payments")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Jerseys - EXECUTIVE + COMMISSIONER
    if (path.includes("/jerseys") && !permissions.includes("view_jerseys")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Scorekeeper - EXECUTIVE + COMMISSIONER + SCOREKEEPER
    if (path.includes("/scorekeeper") && !permissions.includes("manage_scores")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Settings/Admin Management - EXECUTIVE only
    if (path.includes("/settings/admins") && !permissions.includes("manage_admins")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Settings/Terminal - EXECUTIVE + COMMISSIONER
    if (path.includes("/settings/terminal") && !permissions.includes("view_terminal")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all admin routes
export const config = {
  matcher: ["/:path*", "/api/v1/:path*"],
};
