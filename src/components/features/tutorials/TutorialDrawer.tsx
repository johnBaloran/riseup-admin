"use client";

// src/components/features/tutorials/TutorialDrawer.tsx

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { getTutorialById, getTutorialSection } from "@/data/tutorials";
import { categoryMetadata } from "@/data/tutorials";
import Link from "next/link";

interface TutorialDrawerProps {
  tutorialId: string | null;
  sectionId?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TutorialDrawer({
  tutorialId,
  sectionId,
  open,
  onOpenChange,
}: TutorialDrawerProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sectionId || null
  );

  const tutorial = tutorialId ? getTutorialById(tutorialId) : null;

  // Update active section when sectionId prop changes
  useEffect(() => {
    if (sectionId) {
      setActiveSectionId(sectionId);
    } else if (tutorial && tutorial.sections.length > 0) {
      setActiveSectionId(tutorial.sections[0].id);
    }
  }, [sectionId, tutorial]);

  if (!tutorial) {
    return null;
  }

  const metadata = categoryMetadata[tutorial.category];
  const difficultyColor =
    tutorial.difficulty === "beginner"
      ? "bg-green-100 text-green-800"
      : tutorial.difficulty === "intermediate"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  const getTipIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4" />;
      case "tip":
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getTipStyles = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "tip":
      default:
        return "bg-purple-50 border-purple-200 text-purple-900";
    }
  };

  const activeSection = tutorial.sections.find((s) => s.id === activeSectionId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{metadata.icon}</span>
            <Badge variant="outline" className="text-xs">
              {metadata.label}
            </Badge>
            <Badge className={`text-xs ${difficultyColor}`}>
              {tutorial.difficulty}
            </Badge>
          </div>
          <SheetTitle className="text-left">{tutorial.title}</SheetTitle>
          <SheetDescription className="text-left">
            {tutorial.description}
          </SheetDescription>
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {tutorial.estimatedTime} min
            </div>
            <div>{tutorial.sections.length} sections</div>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {/* Section Navigation */}
          <div className="col-span-1 border-r pr-3">
            <ScrollArea className="h-full">
              <nav className="space-y-1">
                {tutorial.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`w-full text-left px-2 py-2 rounded-md text-xs transition-colors ${
                      activeSectionId === section.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-1">
                      <span className="text-gray-500 font-medium">
                        {index + 1}.
                      </span>
                      <span className="flex-1 leading-tight">
                        {section.heading}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </ScrollArea>
          </div>

          {/* Section Content */}
          <div className="col-span-3">
            <ScrollArea className="h-full pr-4">
              {activeSection && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      {activeSection.heading}
                    </h3>
                    {activeSection.description && (
                      <p className="text-sm text-gray-600">
                        {activeSection.description}
                      </p>
                    )}
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    {activeSection.steps.map((step) => (
                      <div key={step.stepNumber} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
                            {step.stepNumber}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {step.instruction}
                            </p>

                            {/* Substeps */}
                            {step.substeps && step.substeps.length > 0 && (
                              <ul className="mt-2 space-y-1 ml-2">
                                {step.substeps.map((substep, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-sm text-gray-700"
                                  >
                                    <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                                    <span className="text-xs">{substep}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {/* Tips */}
                            {step.tips && step.tips.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {step.tips.map((tip, tipIdx) => (
                                  <div
                                    key={tipIdx}
                                    className={`p-2 rounded-lg border ${getTipStyles(tip.type)}`}
                                  >
                                    <div className="flex items-start gap-2">
                                      {getTipIcon(tip.type)}
                                      <p className="text-xs flex-1">
                                        {tip.content}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t bg-white">
          <div className="flex items-center justify-between">
            <Link href={`/tutorials/${tutorial.id}`} target="_blank">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Full Tutorial
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
