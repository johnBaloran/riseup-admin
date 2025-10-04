// src/components/features/league/levels/LevelsTable.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Display levels table ONLY
 */

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditLevelDialog } from "./EditLevelDialog";

interface Level {
  _id: string;
  name: string;
  grade: number;
}

interface LevelsTableProps {
  levels: Level[];
  cityId: string;
}

export function LevelsTable({ levels, cityId }: LevelsTableProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const handleEdit = (level: Level) => {
    setSelectedLevel(level);
    setEditDialogOpen(true);
  };

  const getGradeBadgeColor = (grade: number) => {
    if (grade === 1) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (grade === 2) return "bg-blue-100 text-blue-800 border-blue-200";
    if (grade === 3) return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Grade</TableHead>
              <TableHead>Level Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {levels.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  No skill levels found. Create your first level to get started.
                </TableCell>
              </TableRow>
            ) : (
              levels.map((level) => (
                <TableRow key={level._id}>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getGradeBadgeColor(level.grade)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Grade {level.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{level.name}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {level.grade === 1 && "Highest skill level"}
                    {level.grade === 2 && "Intermediate skill level"}
                    {level.grade === 3 && "Recreational skill level"}
                    {level.grade > 3 && "Custom skill level"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(level)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedLevel && (
        <EditLevelDialog
          level={selectedLevel}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </>
  );
}
