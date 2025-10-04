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

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if admin is active
    if (token && !token.isActive) {
      return NextResponse.redirect(new URL("/login?error=inactive", req.url));
    }

    // Admin management routes - EXECUTIVE only
    if (path.includes("/settings/admins") && token?.role !== "EXECUTIVE") {
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
  matcher: ["/admin/:path*", "/api/v1/:path*"],
};
