"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CircularProgress } from "./CircularProgress";
import { useCategories } from "@/hooks/useCategories";

export function HomeScreen() {
  const [today, setToday] = useState<string>("");
  const { categories, loading, error } = useCategories();

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  // Calculate overall progress from categories
  const overallProgress = React.useMemo(() => {
    const totalSessions = categories.reduce((sum, cat) => sum + cat.total_sessions, 0);
    const completedSessions = categories.reduce((sum, cat) => sum + cat.completed, 0);
    const percentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100 * 100) / 100 : 0;

    return {
      completed: completedSessions,
      total: totalSessions,
      percentage
    };
  }, [categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">Error loading categories: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-gray-900">{today}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Overall Progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-gray-900">Today's Progress</h2>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-2xl font-medium text-gray-900">
                  {overallProgress.completed}/{overallProgress.total}
                </div>
                <div className="text-lg text-gray-600">
                  ({overallProgress.percentage}%)
                </div>
              </div>
              <Progress value={overallProgress.percentage} className="mt-3" />
            </div>
            <div className="ml-6">
              <CircularProgress
                percentage={overallProgress.percentage}
                size={64}
              />
            </div>
          </div>
        </Card>

        {/* Category Cards */}
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-gray-900">{category.name}</h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <Progress
                      value={category.percentage}
                      className="flex-1 h-2"
                    />
                    <span className="text-sm text-gray-600 min-w-fit">
                      {category.completed}/{category.total_sessions}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage}% complete
                  </div>
                </div>
                <Link href={`/category/${category.id}`}>
                  <Button
                    className="ml-4 bg-green-500 hover:bg-green-600 text-white"
                  >
                    {category.completed > 0 ? 'Continue' : 'Start'}
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}