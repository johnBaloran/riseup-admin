// src/components/layout/AdminLayout.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Admin layout orchestration ONLY
 */

/**
 * Separation of Concerns
 * - Layout structure here
 * - Auth handling in parent
 * - Sidebar state managed locally
 */

"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface AdminLayoutProps {
  children: React.ReactNode;
  cityId: string;
}

export function AdminLayout({ children, cityId }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setIsSidebarOpen(true)} cityId={cityId} />

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
