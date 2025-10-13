// src/components/layout/PageHeader.tsx

/**
 * Reusable Page Header with Back Button Support
 */

"use client";

import { BackButton } from "@/components/ui/back-button";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  showBackButton?: boolean;
  backButtonFallback?: {
    href: string;
    label: string;
  };
}

export function PageHeader({
  title,
  description,
  actions,
  showBackButton = false,
  backButtonFallback,
}: PageHeaderProps) {
  // Debug logging
  console.log("PageHeader Props:", {
    title,
    description,
    showBackButton,
    backButtonFallback,
    hasActions: !!actions,
  });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1">
        {showBackButton && (
          <div className="mb-3">
            <BackButton
              fallbackHref={backButtonFallback?.href}
              fallbackLabel={backButtonFallback?.label}
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
