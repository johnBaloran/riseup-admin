// src/types/auth.ts

/**
 * SOLID - Interface Segregation Principle (ISP)
 * Define focused auth-related types only
 */

import { AdminRole } from "@/models/Admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  allLocations: boolean;
  assignedLocations: string[];
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
