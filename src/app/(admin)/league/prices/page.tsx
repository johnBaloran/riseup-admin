// src/app/(admin)/league/prices/page.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Prices list page orchestration ONLY
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import { getAllPrices } from "@/lib/db/queries/prices";
import { PricesGrid } from "@/components/features/league/prices/PricesGrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

// Type definitions for populated Mongoose data
interface PopulatedCity {
  _id: string;
  cityName: string;
}

interface PopulatedPrice {
  _id: string;
  name: string;
  priceId: string;
  amount: number;
  type:
    | "earlyBird"
    | "regular"
    | "installment"
    | "regularInstallment"
    | "firstInstallment"
    | "free";
  city?: PopulatedCity;
}

export default async function PricesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "manage_prices")) {
    redirect("/unauthorized");
  }

  const prices = (await getAllPrices()) as unknown as PopulatedPrice[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prices</h1>
          <p className="text-gray-600 mt-1">
            Manage Stripe pricing for divisions (Prices are permanent once
            created)
          </p>
        </div>
        <Button asChild>
          <Link href={`/league/prices/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Price
          </Link>
        </Button>
      </div>

      <PricesGrid prices={prices} />
    </div>
  );
}
