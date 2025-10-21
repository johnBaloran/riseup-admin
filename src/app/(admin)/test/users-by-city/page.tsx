// src/app/(admin)/test/users-by-city/page.tsx

/**
 * Test page to query users who played at least once in a city
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/auth.config";
import { getUsersByCity } from "@/lib/db/queries/users";
import { getAllCities } from "@/lib/db/queries/cities";
import { UsersByCityTable } from "@/components/features/test/UsersByCityTable";

export default async function UsersByCityTestPage({
  searchParams,
}: {
  searchParams: { cityId?: string; activeFilter?: "active" | "inactive" | "all" };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const cities = await getAllCities();
  const activeFilter = searchParams.activeFilter || "all";
  const users = await getUsersByCity(searchParams.cityId, activeFilter);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Users by City - Test Page
        </h1>
        <p className="text-gray-600 mt-1">
          Query users who have played at least once in a city
        </p>
      </div>

      <UsersByCityTable
        users={users}
        cities={cities}
        selectedCityId={searchParams.cityId}
        selectedActiveFilter={activeFilter}
      />
    </div>
  );
}
