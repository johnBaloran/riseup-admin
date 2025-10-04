// src/app/api/auth/[...nextauth]/route.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * NextAuth handler ONLY
 */

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
