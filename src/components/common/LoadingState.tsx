/**
 * SOLID - Single Responsibility Principle (SRP)
 * Loading state component ONLY
 */

/**
 * Accessibility
 * Proper ARIA labels for screen readers
 */

import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center p-12"
    >
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
}
