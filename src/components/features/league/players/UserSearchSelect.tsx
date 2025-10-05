// src/components/features/league/players/UserSearchSelect.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * User search and select component ONLY
 */

"use client";

import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSearchSelectProps {
  onSelectUser: (userId: string) => void;
  disabled?: boolean;
  cityId: string;
}

export function UserSearchSelect({
  onSelectUser,
  disabled,
  cityId,
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      fetchUsers(searchQuery);
    } else {
      setUsers([]);
    }
  }, [searchQuery]);

  const fetchUsers = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/${cityId}/users/search?q=${encodeURIComponent(query)}`
      );
      const result = await response.json();

      if (result.success) {
        setUsers(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: any) => {
    setSelectedUser(user);
    onSelectUser(user._id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedUser ? selectedUser.email : "Search by email..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Type email to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading && <CommandEmpty>Searching...</CommandEmpty>}
            {!loading && searchQuery.length < 2 && (
              <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
            )}
            {!loading && searchQuery.length >= 2 && users.length === 0 && (
              <CommandEmpty>No users found</CommandEmpty>
            )}
            {users.length > 0 && (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user._id}
                    value={user._id}
                    onSelect={() => handleSelect(user)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedUser?._id === user._id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-500">{user.name}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
