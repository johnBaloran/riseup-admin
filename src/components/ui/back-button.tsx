// src/components/ui/back-button.tsx

/**
 * Smart Back Button Component
 * Shows contextual back navigation based on navigation history
 */

"use client";

import { useNavigation } from "@/contexts/NavigationContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref?: string;
  fallbackLabel?: string;
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showOnMobile?: boolean;
}

export function BackButton({
  fallbackHref,
  fallbackLabel = "Back",
  variant = "ghost",
  size = "default",
  className = "",
  showOnMobile = true,
}: BackButtonProps) {
  const { canGoBack, previousLabel, goBack } = useNavigation();

  // Debug logging
  console.log("BackButton State:", {
    canGoBack,
    previousLabel,
    fallbackHref,
    fallbackLabel,
  });

  // If we have history, use it
  if (canGoBack) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={goBack}
        className={`${className} ${!showOnMobile ? "hidden sm:flex" : ""}`}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">Back to {previousLabel}</span>
        <span className="sm:hidden">Back</span>
      </Button>
    );
  }

  // Fallback to provided href if no history
  if (fallbackHref) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => window.location.href = fallbackHref}
        className={`${className} ${!showOnMobile ? "hidden sm:flex" : ""}`}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline">{fallbackLabel}</span>
        <span className="sm:hidden">Back</span>
      </Button>
    );
  }

  // Don't render if no history and no fallback
  return null;
}
