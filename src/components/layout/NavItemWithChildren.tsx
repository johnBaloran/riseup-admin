// src/components/layout/NavItemWithChildren.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Renders navigation item with expandable children ONLY
 */
// src/components/layout/NavItemWithChildren.tsx

"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const Icon = (LucideIcons as any)[item.icon];

  const isActiveParent = item.children?.some(
    (child) => pathname === `/admin/${child.href}`
  );

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
            const isActive = pathname === `/admin/${child.href}`;

            return (
              <li key={child.href}>
                <Link
                  href={`/admin/${child.href}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                    isActive
                      ? "bg-gray-800 text-white"
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
