"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";

interface Expression {
  id: string;
  english: string;
  korean: string;
  audioUrl: string;
  completed: boolean;
}

interface SessionDetailScreenProps {
  category: {
    id: string;
    name: string;
  };
  session: {
    number: number;
  };
}

export function SessionDetailScreen({ category, session }: SessionDetailScreenProps) {
  const router = useRouter();
  // Mock data for Daily Expression
  const mainPattern = {
    english: "How long does it take to ~?",
    korean: "~하는 데 얼마나 걸리나요?"
  };

  const [expressions, setExpressions] = useState<Expression[]>([
    {
      id: "1",
      english: "How long does it take to edit a video?",
      korean: "영상 편집하는 데 얼마나 걸리나요?",
      audioUrl: "/mock-audio-1.mp3",
      completed: false
    },
    {
      id: "2", 
      english: "How long does it take to learn English?",
      korean: "영어 배우는 데 얼마나 걸리나요?",
      audioUrl: "/mock-audio-2.mp3",
      completed: false
    }
  ]);

  const handleCompleteExpression = (expressionId: string) => {
    setExpressions(prev => 
      prev.map(exp => 
        exp.id === expressionId 
          ? { ...exp, completed: true }
          : exp
      )
    );
  };

  const allCompleted = expressions.every(exp => exp.completed);

  const handleNextSession = () => {
    // In a real app, this would navigate to the next session
    router.back(); // For now, just go back to category
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-gray-900">{category.name}</h1>
          <p className="text-sm text-gray-600">Session {session.number}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Main Pattern */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="mb-3 text-blue-900">Today's Pattern</h2>
          <div className="space-y-2">
            <p className="text-lg text-blue-900">{mainPattern.english}</p>
            <p className="text-lg text-blue-700">{mainPattern.korean}</p>
          </div>
        </Card>

        {/* Expression Cards */}
        <div className="space-y-4">
          {expressions.map((expression, index) => (
            <Card key={expression.id} className="p-6 border-l-4 border-l-blue-500">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-lg text-gray-900 bg-gray-100 p-3 rounded-lg">{expression.english}</p>
                  <p className="pl-4 border-l-2 border-gray-300 text-gray-400 mt-3">{expression.korean}</p>
                </div>
                
                <AudioPlayer 
                  audioUrl={expression.audioUrl}
                  duration={12}
                />
                
                <Button
                  onClick={() => handleCompleteExpression(expression.id)}
                  disabled={expression.completed}
                  className={`w-full ${
                    expression.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {expression.completed ? '✅ Completed' : 'Complete'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Next Session Button */}
        {allCompleted && (
          <Button 
            onClick={handleNextSession}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center space-x-2"
          >
            <span>Next Session</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}