// src/app/league/prices/new/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Create price page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { CreatePriceForm } from "@/components/features/league/prices/CreatePriceForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CreatePricePageProps {
  params: { cityId: string };
}

export default async function CreatePricePage({
  params,
}: CreatePricePageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_prices")) {
    redirect("/unauthorized");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/league/prices`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Price</h1>
        <p className="text-gray-600 mt-1">
          Link an existing Stripe price to your system (Permanent - cannot be
          edited or deleted)
        </p>
      </div>

      <div className="max-w-2xl">
        <CreatePriceForm cityId={params.cityId} />
      </div>
    </div>
  );
}
