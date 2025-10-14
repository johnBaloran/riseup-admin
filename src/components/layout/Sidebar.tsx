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
import { useNavigation } from "@/contexts/NavigationContext";
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
  const { clearHistory } = useNavigation();

  const filteredNavigation = useMemo(
    () => filterNavigationByPermissions(navigationItems, permissions),
    [permissions]
  );

  // Clear history when sidebar navigation is clicked
  const handleNavigate = () => {
    clearHistory();
    onClose();
  };

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
          <h1 className="text-xl font-bold">Rise Up League</h1>
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
            {filteredNavigation.map((item) => {
              if (item.children) {
                return (
                  <NavItemWithChildren
                    key={item.href || item.label}
                    item={item}
                    pathname={pathname}
                    cityId={cityId}
                    onNavigate={handleNavigate}
                  />
                );
              }

              // For top-level items without children
              const href = item.href?.startsWith('/') ? item.href : `/${item.href}`;
              const fullPath = `/admin${href}`;
              // Check if current page is this route or a sub-page of it
              const isActive =
                pathname === fullPath || pathname.startsWith(`${fullPath}/`);

              return (
                <li key={item.href}>
                  <NavItem
                    label={item.label}
                    href={fullPath}
                    icon={item.icon}
                    isActive={isActive}
                    onClick={handleNavigate}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
