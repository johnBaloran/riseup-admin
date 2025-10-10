// src/components/features/league/levels/LevelsContent.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Levels content with tabs ONLY
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { LevelsTable } from "./LevelsTable";

interface LevelsContentProps {
  activeFilter: string;
}

export function LevelsContent({ activeFilter }: LevelsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, [activeFilter]);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/league/levels?active=${activeFilter}`
      );
      const result = await response.json();

      if (result.success) {
        setLevels(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching levels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={activeFilter} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button asChild>
          <Link href="/admin/league/levels/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Level
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Loading levels...</p>
        </div>
      ) : (
        <LevelsTable levels={levels} onUpdate={fetchLevels} />
      )}
    </div>
  );
}
