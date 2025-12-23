"use client";

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Player export UI component ONLY
 */

import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function PlayerExportContent() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const response = await fetch("/api/v1/exports/players", {
        method: "GET",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export players");
      }

      // Get the filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `registered-players-${new Date().toISOString().split("T")[0]}.xlsx`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Excel file downloaded successfully");
    } catch (error: any) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export players");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Registered Players Export
        </CardTitle>
        <CardDescription>
          Export all players who have linked user accounts and are assigned to teams.
          Includes player name, email, phone number, team, city, and location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-sm mb-2">Export includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Player Name</li>
              <li>• Email Address</li>
              <li>• Phone Number</li>
              <li>• Team Name</li>
              <li>• City</li>
              <li>• Location</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Only players with linked user accounts and assigned teams will be included in the export.
            </p>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Excel...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Excel Report
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
