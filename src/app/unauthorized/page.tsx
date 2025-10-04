// src/app/unauthorized/page.tsx

/**
 * User Experience
 * Clear feedback for access denied
 */

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Button asChild>
          <Link href="/admin">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
