// src/components/layout/Sidebar.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Sidebar layout and orchestration ONLY
 */

"use client";

import { useMemo } from "react";
import { usePathname, useParams } from "next/navigation";
import { X } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  navigationItems,
  filterNavigationByPermissions,
} from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { NavItem } from "./NavItem";
import { NavItemWithChildren } from "./NavItemWithChildren";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const cityId = params.cityId as string;
  const { permissions } = usePermissions();

  const filteredNavigation = useMemo(
    () => filterNavigationByPermissions(navigationItems, permissions),
    [permissions]
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-gray-900 text-white
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="overflow-y-auto py-4 px-3 h-[calc(100vh-4rem)]">
          <ul className="space-y-1">
            {filteredNavigation.map((item) =>
              item.children ? (
                <NavItemWithChildren
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  cityId={cityId}
                  onNavigate={onClose}
                />
              ) : (
                <li key={item.href}>
                  <NavItem
                    label={item.label}
                    href={`/admin/${item.href}`}
                    icon={item.icon}
                    isActive={pathname === `/admin/${item.href}`}
                    onClick={onClose}
                  />
                </li>
              )
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
