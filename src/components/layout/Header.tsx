// src/components/layout/Header.tsx

/**
 * SOLID - Single Responsibility Principle (SRP)
 * Header layout orchestration ONLY
 */

"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitySelector } from "./CitySelector";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onMenuClick: () => void;
  cityId: string;
}

export function Header({ onMenuClick, cityId }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </Button>

        {/* City selector */}
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
          <CitySelector currentCityId={cityId} />
        </div>

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
