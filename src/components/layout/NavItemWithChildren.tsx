// src/components/layout/NavItemWithChildren.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Renders navigation item with expandable children ONLY
 */
// src/components/layout/NavItemWithChildren.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { NavItem as NavItemType } from "@/constants/navigation";

interface NavItemWithChildrenProps {
  item: NavItemType;
  pathname: string;
  cityId: string;
  onNavigate: () => void;
}

export function NavItemWithChildren({
  item,
  pathname,
  cityId,
  onNavigate,
}: NavItemWithChildrenProps) {
  // Check if any child route is active (exact match or starts with the route)
  const isActiveParent = item.children?.some((child) => {
    // Handle both /league/teams and /league/teams patterns
    const href = child.href?.startsWith("/") ? child.href : `/${child.href}`;
    const childPath = `${href}`;
    const isActive =
      pathname === childPath || pathname.startsWith(`${childPath}/`);
    console.log("NavItemWithChildren check:", {
      itemLabel: item.label,
      childLabel: child.label,
      childHref: child.href,
      childPath,
      pathname,
      isActive,
    });
    return isActive;
  });

  // Auto-expand if a child is active
  const [isOpen, setIsOpen] = useState(isActiveParent || false);
  const Icon = (LucideIcons as any)[item.icon];

  console.log("NavItemWithChildren state:", {
    itemLabel: item.label,
    pathname,
    isActiveParent,
    isOpen,
  });

  // Update isOpen when pathname changes and a child becomes active
  useEffect(() => {
    if (isActiveParent) {
      setIsOpen(true);
    }
  }, [isActiveParent]);

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors",
          isActiveParent
            ? "bg-gray-800 text-white"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5" />}
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      {isOpen && item.children && (
        <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">
          {item.children.map((child) => {
            const ChildIcon = (LucideIcons as any)[child.icon];
            // Handle both /league/teams and /league/teams patterns
            const href = child.href?.startsWith("/")
              ? child.href
              : `/${child.href}`;
            const childPath = `${href}`;
            // Check if current page is this child or a sub-page of it
            const isActive =
              pathname === childPath || pathname.startsWith(`${childPath}/`);

            return (
              <li key={child.href}>
                <Link
                  href={childPath}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-blue-600 text-white font-semibold"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  {ChildIcon && <ChildIcon className="h-4 w-4" />}
                  <span>{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
