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

  // Always show back button and use browser back (which preserves search params)
  // Just show a smart label if we have history
  const label = canGoBack && previousLabel ? `Back to ${previousLabel}` : fallbackLabel;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={goBack}
      className={`${className} ${!showOnMobile ? "hidden sm:flex" : ""}`}
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );
}
