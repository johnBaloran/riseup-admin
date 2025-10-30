"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Image, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { FaceStats } from "@/types/faceRecognition";

interface Props {
  gameId: string;
}

export function FaceRecognitionStats({ gameId }: Props) {
  const [stats, setStats] = useState<FaceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [gameId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/faces/stats/game/${gameId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-gray-500">Loading stats...</span>
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-sm text-red-500">
          {error || "Failed to load stats"}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Photos */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Image className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Photos</p>
            <p className="text-2xl font-bold">{stats.photos.total}</p>
            <div className="flex gap-2 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {stats.photos.completed}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-yellow-500" />
                {stats.photos.pending}
              </span>
              {stats.photos.failed > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  {stats.photos.failed}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Faces Detected */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Faces Detected</p>
            <p className="text-2xl font-bold">{stats.faces.total}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.faces.linked} linked, {stats.faces.unlinked} unlinked
            </p>
          </div>
        </div>
      </Card>

      {/* Unique Persons */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Unique Persons</p>
            <p className="text-2xl font-bold">{stats.persons.total}</p>
            <p className="text-xs text-gray-500 mt-1">Detected individuals</p>
          </div>
        </div>
      </Card>

      {/* Processing Progress */}
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Progress</p>
            <p className="text-2xl font-bold">
              {stats.photos.total > 0
                ? Math.round((stats.photos.completed / stats.photos.total) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.photos.completed} of {stats.photos.total} processed
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
