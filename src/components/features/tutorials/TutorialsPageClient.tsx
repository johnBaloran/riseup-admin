"use client";

// src/components/features/tutorials/TutorialsPageClient.tsx

import { useState, useMemo } from "react";
import { Tutorial, TutorialCategory, Role } from "@/types/tutorial";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Search, Clock, BookOpen, Filter, X } from "lucide-react";
import { categoryMetadata } from "@/data/tutorials";

interface TutorialsPageClientProps {
  tutorials: Tutorial[];
  categories: TutorialCategory[];
  tags: string[];
  stats: {
    total: number;
    byCategory: Record<TutorialCategory, number>;
    byDifficulty: { beginner: number; intermediate: number; advanced: number };
    totalEstimatedTime: number;
  };
  userRole: Role;
}

export default function TutorialsPageClient({
  tutorials,
  categories,
  tags,
  stats,
  userRole,
}: TutorialsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<TutorialCategory | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    "beginner" | "intermediate" | "advanced" | null
  >(null);

  // Filter tutorials based on search, category, tags, difficulty
  const filteredTutorials = useMemo(() => {
    let filtered = [...tutorials];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((t) =>
        selectedTags.every((selectedTag) =>
          t.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
        )
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter((t) => t.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [
    tutorials,
    searchQuery,
    selectedCategory,
    selectedTags,
    selectedDifficulty,
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTags([]);
    setSelectedDifficulty(null);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedTags.length > 0 ||
    selectedDifficulty;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tutorials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Category
              </label>
              <ScrollArea className="h-[200px]">
                <div className="space-y-1">
                  <Button
                    variant={selectedCategory === null ? "secondary" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <span className="mr-2">📚</span>
                    All Categories ({stats.total})
                  </Button>
                  {categories.map((category) => {
                    const metadata = categoryMetadata[category];
                    const count = stats.byCategory[category] || 0;

                    return (
                      <Button
                        key={category}
                        variant={
                          selectedCategory === category ? "secondary" : "ghost"
                        }
                        className="w-full justify-start text-sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        <span className="mr-2">{metadata.icon}</span>
                        <span className="truncate">{metadata.label}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          {count}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Difficulty
              </label>
              <div className="space-y-1">
                <Button
                  variant={
                    selectedDifficulty === "beginner" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start text-sm"
                  onClick={() =>
                    setSelectedDifficulty(
                      selectedDifficulty === "beginner" ? null : "beginner"
                    )
                  }
                >
                  <span className="mr-2">🟢</span>
                  Beginner ({stats.byDifficulty.beginner})
                </Button>
                <Button
                  variant={
                    selectedDifficulty === "intermediate"
                      ? "secondary"
                      : "ghost"
                  }
                  className="w-full justify-start text-sm"
                  onClick={() =>
                    setSelectedDifficulty(
                      selectedDifficulty === "intermediate"
                        ? null
                        : "intermediate"
                    )
                  }
                >
                  <span className="mr-2">🟡</span>
                  Intermediate ({stats.byDifficulty.intermediate})
                </Button>
                <Button
                  variant={
                    selectedDifficulty === "advanced" ? "secondary" : "ghost"
                  }
                  className="w-full justify-start text-sm"
                  onClick={() =>
                    setSelectedDifficulty(
                      selectedDifficulty === "advanced" ? null : "advanced"
                    )
                  }
                >
                  <span className="mr-2">🔴</span>
                  Advanced ({stats.byDifficulty.advanced})
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <ScrollArea className="h-[150px]">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}

            {/* Stats */}
            <div className="pt-4 border-t space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">Total Time:</span>{" "}
                <span className="font-medium">
                  {Math.floor(stats.totalEstimatedTime / 60)}h{" "}
                  {stats.totalEstimatedTime % 60}m
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Your Role:</span>{" "}
                <Badge variant="secondary">{userRole}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Active Filters:
                </p>
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <Badge variant="secondary">
                      Search: &quot;{searchQuery}&quot;
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary">
                      {categoryMetadata[selectedCategory].label}
                    </Badge>
                  )}
                  {selectedDifficulty && (
                    <Badge variant="secondary">
                      {selectedDifficulty.charAt(0).toUpperCase() +
                        selectedDifficulty.slice(1)}
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredTutorials.length} of {tutorials.length} tutorials
          </p>
        </div>

        {/* Tutorial List */}
        {filteredTutorials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tutorials found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTutorials.map((tutorial) => {
              const metadata = categoryMetadata[tutorial.category];
              const difficultyColor =
                tutorial.difficulty === "beginner"
                  ? "bg-green-100 text-green-800"
                  : tutorial.difficulty === "intermediate"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800";

              return (
                <Link
                  key={tutorial.id}
                  href={`/tutorials/${tutorial.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{metadata.icon}</span>
                            <Badge variant="outline" className="text-xs">
                              {metadata.label}
                            </Badge>
                            <Badge className={`text-xs ${difficultyColor}`}>
                              {tutorial.difficulty}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">
                            {tutorial.title}
                          </CardTitle>
                          <CardDescription>
                            {tutorial.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                          <Clock className="h-4 w-4" />
                          {tutorial.estimatedTime} min
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {tutorial.tags.slice(0, 4).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tutorial.tags.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tutorial.tags.length - 4} more
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tutorial.sections.length} section
                          {tutorial.sections.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {tutorial.prerequisites &&
                        tutorial.prerequisites.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-600">
                              Prerequisites:{" "}
                              {tutorial.prerequisites.length} tutorial
                              {tutorial.prerequisites.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
