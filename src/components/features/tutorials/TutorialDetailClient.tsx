"use client";

// src/components/features/tutorials/TutorialDetailClient.tsx

import { useState, useEffect, useRef } from "react";
import { Tutorial, TutorialSection, Role } from "@/types/tutorial";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronRight,
  Printer,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { categoryMetadata } from "@/data/tutorials";
import { useRouter } from "next/navigation";

interface TutorialDetailClientProps {
  tutorial: Tutorial;
  relatedTutorials: Tutorial[];
  initialSection?: string;
  userRole: Role;
}

export default function TutorialDetailClient({
  tutorial,
  relatedTutorials,
  initialSection,
  userRole,
}: TutorialDetailClientProps) {
  const router = useRouter();
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    initialSection || null
  );
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const metadata = categoryMetadata[tutorial.category];
  const difficultyColor =
    tutorial.difficulty === "beginner"
      ? "bg-green-100 text-green-800"
      : tutorial.difficulty === "intermediate"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  // Scroll to section on mount if initialSection is provided
  useEffect(() => {
    if (initialSection && sectionRefs.current[initialSection]) {
      setTimeout(() => {
        sectionRefs.current[initialSection]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [initialSection]);

  const scrollToSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    // Update URL without page reload
    router.push(`/tutorials/${tutorial.id}?section=${sectionId}`, {
      scroll: false,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/tutorials/${tutorial.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: tutorial.title,
          text: tutorial.description,
          url: url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  };

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

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <Link href="/tutorials">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>
        </Link>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{metadata.icon}</span>
              <Badge variant="outline">{metadata.label}</Badge>
              <Badge className={difficultyColor}>{tutorial.difficulty}</Badge>
              {tutorial.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl font-bold mb-2">{tutorial.title}</h1>
            <p className="text-xl text-gray-600">{tutorial.description}</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {tutorial.estimatedTime} minutes
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div>{tutorial.sections.length} sections</div>
          <Separator orientation="vertical" className="h-4" />
          <div>Last updated: {tutorial.lastUpdated}</div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {tutorial.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <nav className="space-y-1">
                  {tutorial.sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        activeSectionId === section.id
                          ? "bg-blue-100 text-blue-900 font-medium"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium mt-0.5">
                          {index + 1}.
                        </span>
                        <span className="flex-1">{section.heading}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Prerequisites */}
          {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Prerequisites
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-3">
                  Before starting this tutorial, make sure you&apos;ve completed:
                </p>
                <ul className="space-y-2">
                  {tutorial.prerequisites.map((prereqId) => (
                    <li key={prereqId}>
                      <Link
                        href={`/tutorials/${prereqId}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ChevronRight className="h-4 w-4" />
                        {prereqId}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tutorial Sections */}
          {tutorial.sections.map((section, sectionIndex) => (
            <section
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              id={section.id}
              className="scroll-mt-4"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {sectionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {section.heading}
                      </CardTitle>
                      {section.description && (
                        <CardDescription className="text-base">
                          {section.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Steps */}
                  {section.steps.map((step) => (
                    <div key={step.stepNumber} className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-medium">
                          {step.stepNumber}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900">{step.instruction}</p>

                          {/* Substeps */}
                          {step.substeps && step.substeps.length > 0 && (
                            <ul className="mt-3 space-y-2 ml-4">
                              {step.substeps.map((substep, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-gray-700"
                                >
                                  <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                  <span>{substep}</span>
                                </li>
                              ))}
                            </ul>
                          )}

                          {/* Image */}
                          {step.image && (
                            <div className="mt-4 rounded-lg border overflow-hidden">
                              <img
                                src={step.image.src}
                                alt={step.image.alt}
                                className="w-full"
                              />
                              {step.image.caption && (
                                <p className="text-sm text-gray-600 p-3 bg-gray-50 border-t">
                                  {step.image.caption}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Tips */}
                          {step.tips && step.tips.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {step.tips.map((tip, tipIdx) => (
                                <div
                                  key={tipIdx}
                                  className={`p-3 rounded-lg border ${getTipStyles(tip.type)}`}
                                >
                                  <div className="flex items-start gap-2">
                                    {getTipIcon(tip.type)}
                                    <p className="text-sm flex-1">
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

                  {/* Related Sections */}
                  {section.relatedSections &&
                    section.relatedSections.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Related Sections:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {section.relatedSections.map((relatedId) => (
                            <button
                              key={relatedId}
                              onClick={() => scrollToSection(relatedId)}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {relatedId}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            </section>
          ))}

          {/* Related Tutorials */}
          {relatedTutorials.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Tutorials</CardTitle>
                <CardDescription>
                  Continue learning with these related topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedTutorials.map((related) => {
                    const relatedMeta = categoryMetadata[related.category];
                    return (
                      <Link
                        key={related.id}
                        href={`/tutorials/${related.id}`}
                        className="block p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{relatedMeta.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium">{related.title}</h4>
                            <p className="text-sm text-gray-600">
                              {related.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            {related.estimatedTime}m
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to Tutorials */}
          <div className="flex justify-center pt-4">
            <Link href="/tutorials">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Tutorials
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
