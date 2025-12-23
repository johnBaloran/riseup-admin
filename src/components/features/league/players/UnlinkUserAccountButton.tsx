// src/components/features/league/players/UnlinkUserAccountButton.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Unlink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UnlinkUserAccountButtonProps {
  playerId: string;
  userName: string;
}

export function UnlinkUserAccountButton({
  playerId,
  userName,
}: UnlinkUserAccountButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const handleUnlink = async () => {
    try {
      setIsUnlinking(true);

      const response = await fetch(`/api/v1/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          user: null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unlink user account");
      }

      toast.success("User account unlinked successfully");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error unlinking user:", error);
      toast.error(error.message || "Failed to unlink user account");
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Unlink className="mr-2 h-4 w-4" />
          Unlink User Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlink User Account</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to unlink <strong>{userName}</strong> from
            this player? This will remove the association between the user
            account and this player profile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnlinking}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleUnlink();
            }}
            disabled={isUnlinking}
            className="bg-red-600 hover:bg-red-700"
          >
            {isUnlinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlinking...
              </>
            ) : (
              "Unlink"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
