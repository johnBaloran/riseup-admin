// src/lib/auth/auth.config.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * This file handles ONLY NextAuth configuration
 * No business logic, just auth setup
 */

/**
 * Security
 * - JWT strategy (no database sessions)
 * - Credentials provider for admin login
 * - Password verification with bcrypt
 */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminByEmail, updateLastLogin } from "@/lib/db/queries/admins";
import { AdminRole } from "@/models/Admin";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
      allLocations: boolean;
      assignedLocations: string[];
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    allLocations: boolean;
    assignedLocations: string[];
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    role: AdminRole;
    allLocations: boolean;
    assignedLocations: string[];
    isActive: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          // Find admin with password
          const admin = await getAdminByEmail(credentials.email);

          if (!admin) {
            throw new Error("Invalid credentials");
          }

          // Check if active
          if (!admin.isActive) {
            throw new Error("Account is inactive");
          }

          // Verify password
          const isValidPassword = await admin.comparePassword(
            credentials.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid credentials");
          }

          // Update last login
          await updateLastLogin(admin._id.toString());

          // Return user object (without password)
          return {
            id: admin._id.toString(),
            email: admin.email,
            name: admin.name,
            role: admin.role,
            allLocations: admin.allLocations,
            assignedLocations: admin.assignedLocations.map((loc: any) =>
              loc.toString()
            ),
            isActive: admin.isActive,
          };
        } catch (error: any) {
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.allLocations = user.allLocations;
        token.assignedLocations = user.assignedLocations;
        token.isActive = user.isActive;
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role,
          allLocations: token.allLocations,
          assignedLocations: token.assignedLocations,
          isActive: token.isActive,
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === "development",
};
