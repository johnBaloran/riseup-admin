// src/hooks/useJerseyMutations.ts

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Jersey mutation operations ONLY
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useJerseyMutations() {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Update jersey edition with colors
   */
  const updateJerseyEdition = async (data: {
    teamId: string;
    jerseyEdition: string;
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "edition", ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update jersey edition");
      }

      toast.success("Jersey edition updated successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update custom jersey image
   */
  const updateJerseyCustom = async (data: {
    teamId: string;
    imageData: {
      id: string;
      url: string;
      publicId: string;
    };
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/design", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "custom", ...data }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update custom jersey");
      }

      toast.success("Custom jersey updated successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Remove jersey design
   */
  const removeJerseyDesign = async (teamId: string) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/design", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove jersey design");
      }

      toast.success("Jersey design removed successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update player jersey details
   */
  const updatePlayerJersey = async (data: {
    playerId: string;
    jerseyNumber?: number | null;
    jerseySize?: string | null;
    jerseyName?: string | null;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/player", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update player details");
      }

      toast.success("Player details updated successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Add generic jersey
   */
  const addGenericJersey = async (data: {
    teamId: string;
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/generic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add generic jersey");
      }

      toast.success("Generic jersey added successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Update generic jersey
   */
  const updateGenericJersey = async (data: {
    teamId: string;
    genericIndex: number;
    jerseyNumber?: number;
    jerseySize?: string;
    jerseyName?: string;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/generic", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update generic jersey");
      }

      toast.success("Generic jersey updated successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Remove generic jersey
   */
  const removeGenericJersey = async (data: {
    teamId: string;
    genericIndex: number;
  }) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/v1/jerseys/generic", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove generic jersey");
      }

      toast.success("Generic jersey removed successfully");
      return await response.json();
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateJerseyEdition,
    updateJerseyCustom,
    removeJerseyDesign,
    updatePlayerJersey,
    addGenericJersey,
    updateGenericJersey,
    removeGenericJersey,
  };
}
