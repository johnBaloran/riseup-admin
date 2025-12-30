"use client";

// src/contexts/TutorialContext.tsx

import { createContext, useContext, useState, ReactNode } from "react";
import TutorialDrawer from "@/components/features/tutorials/TutorialDrawer";

interface TutorialContextType {
  openTutorial: (tutorialId: string, sectionId?: string) => void;
  closeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined
);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);

  const openTutorial = (id: string, section?: string) => {
    setTutorialId(id);
    setSectionId(section || null);
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
    // Delay clearing IDs to allow close animation
    setTimeout(() => {
      setTutorialId(null);
      setSectionId(null);
    }, 300);
  };

  return (
    <TutorialContext.Provider value={{ openTutorial, closeTutorial }}>
      {children}
      <TutorialDrawer
        tutorialId={tutorialId}
        sectionId={sectionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}
