// src/components/layout/PageHeader.tsx

/**
 * Reusable Page Header with Back Button Support and Tutorial Link
 */

"use client";

import { BackButton } from "@/components/ui/back-button";
import TutorialLink from "@/components/features/tutorials/TutorialLink";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  tutorialId?: string;
  tutorialSectionId?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  tutorialId,
  tutorialSectionId
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {tutorialId && (
            <TutorialLink
              tutorialId={tutorialId}
              sectionId={tutorialSectionId}
            />
          )}
        </div>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
