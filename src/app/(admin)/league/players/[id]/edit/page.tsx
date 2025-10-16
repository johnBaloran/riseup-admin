// src/app/league/players/[id]/edit/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Edit player page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getPlayerById } from "@/lib/db/queries/players";
import { getActiveCities } from "@/lib/db/queries/cities";
import { EditPlayerForm } from "@/components/features/league/players/EditPlayerForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EditPlayerPageProps {
  params: { cityId: string; id: string };
}

export default async function EditPlayerPage({ params }: EditPlayerPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_players")) {
    redirect("/unauthorized");
  }

  const [player, cities] = await Promise.all([
    getPlayerById(params.id),
    getActiveCities(),
  ]);

  if (!player) {
    redirect(`/league/players`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/league/players/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Player</h1>
        <p className="text-gray-600 mt-1">
          Update player information and settings
        </p>
      </div>

      <div className="max-w-2xl">
        <EditPlayerForm
          player={player}
          cityId={params.cityId}
          cities={cities}
        />
      </div>
    </div>
  );
}
