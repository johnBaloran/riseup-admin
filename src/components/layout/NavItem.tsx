// src/components/layout/NavItem.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Renders a single navigation item ONLY
 */

// src/components/layout/NavItem.tsx

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

interface NavItemProps {
  label: string;
  href: string;
  icon: string; // Lucide icon name
  isActive: boolean;
  onClick?: () => void;
}

export function NavItem({
  label,
  href,
  icon,
  isActive,
  onClick,
}: NavItemProps) {
  const Icon = (LucideIcons as any)[icon];

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-gray-800 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      )}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
