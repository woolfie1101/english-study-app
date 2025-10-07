"use client";

import React from "react";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useCategories } from "@/hooks/useCategories";

export function CategoriesScreen() {
  const { categories, loading, error } = useCategories();

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
        <h1 className="text-gray-900">Categories</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
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
