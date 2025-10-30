"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaceRecognitionStats } from "./FaceRecognitionStats";
import { PersonsGrid } from "./PersonsGrid";
import { PersonDetailModal } from "./PersonDetailModal";
import { Users, BarChart3 } from "lucide-react";

interface GamePhoto {
  _id: string;
  url: string;
  thumbnail?: string;
}

interface Props {
  gameId: string;
  photos?: GamePhoto[];
  onPersonClick?: (personId: string) => void;
  selectedPersonId?: string | null;
}

export function FaceRecognitionSection({
  gameId,
  photos = [],
  onPersonClick,
  selectedPersonId,
}: Props) {
  const [modalPersonId, setModalPersonId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePersonClick = (personId: string) => {
    // Call parent callback to filter photos
    if (onPersonClick) {
      onPersonClick(personId);
    }
    // Also open modal for person details
    setModalPersonId(personId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalPersonId(null);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <FaceRecognitionStats gameId={gameId} />

      {/* Tabs for different views */}
      <Card className="p-6">
        <Tabs defaultValue="persons" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="persons" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Persons
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="persons" className="mt-6">
            <PersonsGrid
              gameId={gameId}
              photos={photos}
              onPersonClick={handlePersonClick}
              selectedPersonId={selectedPersonId}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Analytics coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Person Detail Modal */}
      <PersonDetailModal
        personId={modalPersonId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
