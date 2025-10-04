import React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { CircularProgress } from "./CircularProgress";

interface Category {
  id: string;
  name: string;
  completed: number;
  total: number;
  percentage: number;
}

interface HomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const overallProgress = {
    completed: 3,
    total: 38,
    percentage: 7.89
  };

  const categories: Category[] = [
    {
      id: 'daily-expression',
      name: 'Daily Expression',
      completed: 5,
      total: 20,
      percentage: 25
    },
    {
      id: 'pattern',
      name: 'Pattern',
      completed: 2,
      total: 10,
      percentage: 20
    },
    {
      id: 'grammar',
      name: 'Grammar',
      completed: 0,
      total: 8,
      percentage: 0
    }
  ];

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
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage}% complete
                  </div>
                </div>
                <Button 
                  onClick={() => onNavigate('category', { category })}
                  className="ml-4 bg-green-500 hover:bg-green-600 text-white"
                >
                  {category.completed > 0 ? 'Continue' : 'Start'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}