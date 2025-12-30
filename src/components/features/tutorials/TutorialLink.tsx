"use client";

// src/components/features/tutorials/TutorialLink.tsx

/**
 * TutorialLink Component
 *
 * A reusable component that displays an info icon (ℹ️) and opens tutorials in a drawer.
 * Can be embedded anywhere in the app to provide contextual help.
 *
 * Usage Examples:
 *
 * 1. Link to entire tutorial:
 *    <TutorialLink tutorialId="payment-dashboard-overview" />
 *
 * 2. Link to specific section within tutorial:
 *    <TutorialLink tutorialId="payment-dashboard-overview" sectionId="understanding-payment-statuses" />
 *
 * 3. Custom tooltip text:
 *    <TutorialLink
 *      tutorialId="processing-unpaid-players"
 *      tooltip="Learn how to send payment reminders"
 *    />
 *
 * 4. Inline variant (smaller, for use within text):
 *    <TutorialLink tutorialId="cash-and-etransfer-payments" variant="inline" />
 *
 * 5. Button variant (larger, standalone):
 *    <TutorialLink tutorialId="creating-divisions" variant="button" />
 */

import { Info, HelpCircle, BookOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { getTutorialById, getTutorialSection } from "@/data/tutorials";
import { useTutorial } from "@/contexts/TutorialContext";

interface TutorialLinkProps {
  /** ID of the tutorial to link to */
  tutorialId: string;
  /** Optional: ID of specific section within tutorial */
  sectionId?: string;
  /** Optional: Custom tooltip text (defaults to tutorial title) */
  tooltip?: string;
  /** Optional: Display variant */
  variant?: "default" | "inline" | "button" | "help";
  /** Optional: Custom className */
  className?: string;
  /** Optional: Show label text next to icon */
  showLabel?: boolean;
}

export default function TutorialLink({
  tutorialId,
  sectionId,
  tooltip,
  variant = "default",
  className = "",
  showLabel = false,
}: TutorialLinkProps) {
  const { openTutorial } = useTutorial();

  // Get tutorial/section info for tooltip
  const tutorial = getTutorialById(tutorialId);
  let tooltipText = tooltip;

  if (!tooltipText && tutorial) {
    if (sectionId) {
      const section = getTutorialSection(tutorialId, sectionId);
      tooltipText = section
        ? `${tutorial.title} - ${section.heading}`
        : tutorial.title;
    } else {
      tooltipText = tutorial.title;
    }
  }

  if (!tooltipText) {
    tooltipText = "View tutorial";
  }

  const handleClick = () => {
    openTutorial(tutorialId, sectionId);
  };

  // Render different variants
  if (variant === "button") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={className}
              onClick={handleClick}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showLabel ? tooltipText : "View Tutorial"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "help") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
            >
              <HelpCircle className="h-4 w-4" />
              {showLabel && <span className="text-sm">Help</span>}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "inline") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={`inline-flex items-center align-middle ml-1 text-blue-500 hover:text-blue-700 transition-colors ${className}`}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Default variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ${className}`}
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * TutorialLinkGroup Component
 *
 * Groups multiple tutorial links together with a common label
 *
 * Usage:
 * <TutorialLinkGroup label="Learn more about payments:">
 *   <TutorialLink tutorialId="payment-dashboard-overview" />
 *   <TutorialLink tutorialId="processing-unpaid-players" />
 *   <TutorialLink tutorialId="cash-and-etransfer-payments" />
 * </TutorialLinkGroup>
 */
interface TutorialLinkGroupProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function TutorialLinkGroup({
  label,
  children,
  className = "",
}: TutorialLinkGroupProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}
