"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle, Play } from "lucide-react";

interface Session {
  id: number;
  number: number;
  status: 'completed' | 'in-progress' | 'locked';
  title: string;
}

interface CategoryScreenProps {
  category: {
    id: string;
    name: string;
    completed: number;
    total: number;
  };
}

export function CategoryScreen({ category }: CategoryScreenProps) {
  const router = useRouter();
  // Mock sessions data with real content titles
  const getSessionTitles = (categoryName: string): string[] => {
    switch (categoryName) {
      case 'Daily Expression':
        return [
          'How are you doing?',
          'What brings you here?',
          'I\'m looking forward to it',
          'Let me know if you need anything',
          'That makes sense',
          'I appreciate it',
          'Sorry for the inconvenience',
          'It\'s up to you',
          'Take your time',
          'I\'ll get back to you',
          'Long time no see',
          'What do you do for fun?',
          'I\'m not sure about that',
          'Could you say that again?',
          'That\'s a good point',
          'I couldn\'t agree more',
          'How do you feel about...?',
          'I\'m sorry to hear that',
          'Congratulations!',
          'Good luck with that!'
        ];
      case 'Pattern':
        return [
          'How long does it take to ~?',
          'I\'m planning to ~',
          'Would you mind ~?',
          'I was wondering if ~',
          'It depends on ~',
          'I\'m not used to ~',
          'The thing is ~',
          'I can\'t help ~ing',
          'I\'m about to ~',
          'What if ~?'
        ];
      case 'Grammar':
        return [
          'Present Simple vs Present Continuous',
          'Past Simple vs Present Perfect',
          'Future Tenses (will, going to, present continuous)',
          'Modal Verbs (can, could, should, must)',
          'Conditionals (Zero, First, Second)',
          'Passive Voice',
          'Relative Clauses',
          'Reported Speech'
        ];
      default:
        return Array.from({ length: 20 }, (_, i) => `Session ${i + 1} Content`);
    }
  };

  const sessionTitles = getSessionTitles(category.name);
  const sessions: Session[] = Array.from({ length: category.total }, (_, i) => ({
    id: i + 1,
    number: i + 1,
    status: i < category.completed ? 'completed' : i === category.completed ? 'in-progress' : 'locked',
    title: sessionTitles[i] || `Session ${i + 1} Content`
  }));

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
        <h1 className="text-gray-900">{category.name}</h1>
      </div>

      {/* Progress Summary */}
      <div className="px-6 py-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-medium mb-1 text-gray-900">
              {category.completed}/{category.total}
            </div>
            <div className="text-sm text-gray-600">
              Sessions Completed
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="space-y-3">
          {sessions.map((session) => {
            const SessionContent = (
              <Card
                className={`p-4 transition-colors ${
                  session.status === 'locked'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                      <span className="text-gray-900">{session.number}</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900">Session {session.number}</h3>
                      <p className="text-sm text-gray-600">
                        {session.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {session.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {session.status === 'in-progress' && (
                      <Play className="w-6 h-6 text-blue-500" />
                    )}
                    {session.status === 'locked' && (
                      <div className="w-6 h-6 rounded-full bg-gray-300" />
                    )}
                  </div>
                </div>
              </Card>
            );

            return session.status !== 'locked' ? (
              <Link key={session.id} href={`/category/${category.id}/session/${session.number}`}>
                {SessionContent}
              </Link>
            ) : (
              <div key={session.id}>
                {SessionContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}