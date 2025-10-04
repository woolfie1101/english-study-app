import React from "react";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DayStatus {
  date: number;
  status: 'completed' | 'partial' | 'not-studied';
  percentage?: number;
  breakdown?: {
    'Daily Expression': { completed: number; total: number };
    'Pattern': { completed: number; total: number };
    'Grammar': { completed: number; total: number };
  };
}

interface CalendarScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function CalendarScreen({ onNavigate }: CalendarScreenProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Mock data for the calendar
  const generateMockData = (): DayStatus[] => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const today = new Date().getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      if (day < today - 5) {
        return {
          date: day,
          status: 'completed' as const,
          percentage: 100,
          breakdown: {
            'Daily Expression': { completed: 2, total: 2 },
            'Pattern': { completed: 1, total: 1 },
            'Grammar': { completed: 1, total: 1 }
          }
        };
      } else if (day < today) {
        return {
          date: day,
          status: 'partial' as const,
          percentage: 60,
          breakdown: {
            'Daily Expression': { completed: 2, total: 2 },
            'Pattern': { completed: 1, total: 1 },
            'Grammar': { completed: 0, total: 1 }
          }
        };
      }
      return {
        date: day,
        status: 'not-studied' as const,
        percentage: 0
      };
    });
  };

  const monthData = generateMockData();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDay(null);
  };

  const handleDayClick = (dayData: DayStatus) => {
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

  const getStatusIndicator = (dayData: DayStatus) => {
    switch (dayData.status) {
      case 'completed':
        return '✅';
      case 'partial':
        return `${dayData.percentage}%`;
      default:
        return '●';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h1>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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
            {monthData.map((dayData) => (
              <div
                key={dayData.date}
                onClick={() => handleDayClick(dayData)}
                className={`
                  p-2 text-center cursor-pointer rounded-lg transition-colors
                  ${getStatusColor(dayData.status)}
                  ${dayData.status !== 'not-studied' ? 'hover:opacity-80' : 'cursor-not-allowed'}
                `}
              >
                <div className="text-sm">{dayData.date}</div>
                <div className="text-xs mt-1">
                  {getStatusIndicator(dayData)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Day Detail */}
        {selectedDay && (
          <Card className="p-6">
            <h3 className="mb-4 text-gray-900">
              Day {selectedDay.date} - Study Breakdown
            </h3>
            {selectedDay.breakdown && (
              <div className="space-y-3">
                {Object.entries(selectedDay.breakdown).map(([category, data]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-gray-700">{category}</span>
                    <span className="text-gray-900">
                      {data.completed}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}