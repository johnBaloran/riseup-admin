// src/components/features/league/players/LinkUserAccountDialog.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Search, User, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UserResult {
  _id: string;
  name: string;
  email: string;
}

interface LinkUserAccountDialogProps {
  playerId: string;
}

export function LinkUserAccountDialog({
  playerId,
}: LinkUserAccountDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      toast.error("Please enter at least 2 characters to search");
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/v1/users/search?q=${encodeURIComponent(searchQuery)}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to search users");
      }

      setSearchResults(result.data || []);

      if (result.data.length === 0) {
        toast.info("No users found");
      }
    } catch (error: any) {
      console.error("Error searching users:", error);
      toast.error(error.message || "Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkUser = async () => {
    if (!selectedUser) {
      toast.error("Please select a user to link");
      return;
    }

    try {
      setIsLinking(true);
      const response = await fetch(`/api/v1/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: playerId,
          user: selectedUser._id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to link user account");
      }

      toast.success("User account linked successfully");
      setOpen(false);
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
      router.refresh();
    } catch (error: any) {
      console.error("Error linking user:", error);
      toast.error(error.message || "Failed to link user account");
    } finally {
      setIsLinking(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset state when closing
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Link User Account
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link User Account</DialogTitle>
          <DialogDescription>
            Search for a user by name or email to link to this player
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Users</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-9"
                  disabled={isSearching || isLinking}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching || isLinking || searchQuery.length < 2}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label>Search Results ({searchResults.length})</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchResults.map((user) => (
                  <Card
                    key={user._id}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedUser?._id === user._id
                        ? "border-blue-500 bg-blue-50"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{user.name}</p>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                      {selectedUser?._id === user._id && (
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected User Preview */}
          {selectedUser && (
            <div className="space-y-2">
              <Label>Selected User</Label>
              <Card className="p-3 border-blue-500 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{selectedUser.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{selectedUser.email}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLinking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkUser}
              disabled={!selectedUser || isLinking}
            >
              {isLinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link User Account"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
