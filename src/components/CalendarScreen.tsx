"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendar, CalendarDayData } from "@/hooks/useCalendar";

export function CalendarScreen() {
  const [mounted, setMounted] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);

  // Initialize with null to prevent hydration mismatch
  const [year, setYear] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);

  useEffect(() => {
    // Set date only on client side
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setMounted(true);
  }, []);

  const { monthData, loading, error } = useCalendar(
    year || new Date().getFullYear(),
    month || new Date().getMonth() + 1
  );

  // Set today as default selected day when data loads
  useEffect(() => {
    if (monthData.length > 0 && !selectedDay) {
      const today = new Date();
      const todayData = monthData.find(day =>
        day.studyDate.getDate() === today.getDate() &&
        day.studyDate.getMonth() === today.getMonth() &&
        day.studyDate.getFullYear() === today.getFullYear()
      );

      // Only set if today has study data
      if (todayData && todayData.status !== 'not-studied') {
        setSelectedDay(todayData);
      }
    }
  }, [monthData]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = year && month ? new Date(year, month - 1, 1).getDay() : 0;

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!year || !month) return;

    const currentDate = new Date(year, month - 1, 1);
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    setYear(currentDate.getFullYear());
    setMonth(currentDate.getMonth() + 1);
    setSelectedDay(null);
  };

  const handleDayClick = (dayData: CalendarDayData) => {
    if (dayData.status !== 'not-studied') {
      setSelectedDay(dayData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'partial':
        return 'bg-yellow-400 text-white';
      default:
        return 'bg-gray-200 text-gray-500';
    }
  };

  const getStatusIndicator = (dayData: CalendarDayData) => {
    switch (dayData.status) {
      case 'completed':
        return '✅';
      case 'partial':
        return `${dayData.percentage}%`;
      default:
        return '●';
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-background flex items-center justify-center">
        <div className="text-red-500">Error loading calendar data</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto pb-10">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <h1 className="text-center">Study Calendar</h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 pb-6">
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl">
            {year && month ? `${monthNames[month - 1]} ${year}` : ''}
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="px-6 pb-6">
          {/* Calendar Grid */}
          <Card className="p-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before the first day of month */}
              {Array.from({ length: firstDayOfMonth }, (_, i) => (
                <div key={`empty-${i}`} className="p-2"></div>
              ))}
              
              {/* Days of the month */}
              {monthData.map((dayData) => {
                const today = new Date();
                const isToday = dayData.studyDate.getDate() === today.getDate() &&
                               dayData.studyDate.getMonth() === today.getMonth() &&
                               dayData.studyDate.getFullYear() === today.getFullYear();

                const isSelected = selectedDay?.date === dayData.date;

                return (
                  <div
                    key={dayData.date}
                    onClick={() => handleDayClick(dayData)}
                    className={`
                      p-2 text-center cursor-pointer rounded-lg transition-colors relative
                      ${getStatusColor(dayData.status)}
                      ${dayData.status !== 'not-studied' ? 'hover:opacity-80' : 'cursor-not-allowed'}
                      ${isToday ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      ${isSelected ? 'ring-2 ring-purple-500 ring-offset-1' : ''}
                    `}
                  >
                    <div className="text-sm font-medium">{dayData.studyDate.getDate()}</div>
                    <div className="text-xs mt-1">
                      {getStatusIndicator(dayData)}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Legend */}
        <div className="px-6 pb-4">
          <Card className="p-4">
            <div className="flex justify-around text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Partial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <span>Not studied</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="px-6 pb-6">
            <Card className="p-4">
              <h3 className="mb-3">
                {monthNames[selectedDay.studyDate.getMonth()]} {selectedDay.studyDate.getDate()}, {selectedDay.studyDate.getFullYear()}
              </h3>
              <div className="mb-3 text-sm text-muted-foreground">
                Total: {selectedDay.sessionsCompleted}/{selectedDay.totalSessions} sessions ({selectedDay.percentage}%)
              </div>
              <div className="space-y-2">
                {selectedDay.categoryBreakdown.length > 0 ? (
                  selectedDay.categoryBreakdown.map((category) => {
                    const percentage = category.total > 0 ? Math.round((category.completed / category.total) * 100) : 0;
                    return (
                      <div key={category.categoryId} className="flex justify-between items-center">
                        <span className="text-sm">{category.categoryName}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.completed}/{category.total} ({percentage}%)
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">No study data for this day</div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
