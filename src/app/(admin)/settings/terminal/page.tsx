// src/app/(admin)/settings/terminal/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Terminal management page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { ConnectTerminalContent } from "@/components/features/terminal/ConnectTerminalContent";

export default async function ConnectTerminalPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check permission
  if (!hasPermission(session, "view_terminal")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Connect Terminal
        </h1>
        <p className="text-gray-600 mt-1">
          Manage card readers for in-person payments
        </p>
      </div>

      <ConnectTerminalContent canManage={hasPermission(session, "manage_terminal")} />
    </div>
  );
}
