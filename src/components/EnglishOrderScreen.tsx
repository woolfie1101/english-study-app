"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { Database } from "@/types/database";
import { useProgress } from "@/hooks/useProgress";
import { getNextSession } from "@/hooks/useSession";

type Expression = Database['public']['Tables']['expressions']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface EnglishOrderScreenProps {
  category: {
    id: string;
    name: string;
    slug: string | null;
    total_sessions: number;
  };
  session: Session & {
    expressions: Expression[];
  };
}

export function EnglishOrderScreen({ category, session }: EnglishOrderScreenProps) {
  const router = useRouter();
  const {
    completeSession,
    updateDailyStats,
  } = useProgress();

  // TODO: Replace with actual user authentication
  const userId = '00000000-0000-0000-0000-000000000001';

  // Get pattern audio URL and question from metadata
  const metadata = session.metadata as any;
  const patternAudioUrl = metadata?.pattern_audio_url || '';
  const question = metadata?.question || '';

  const [showEnglish, setShowEnglish] = useState<Record<string, boolean>>({});
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteSession = async () => {
    try {
      setIsCompleting(true);
      await completeSession(userId, session.id, category.id);
      await updateDailyStats(userId, category.id);
      setSessionCompleted(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to save progress. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleNextSession = async () => {
    try {
      const nextSessionNumber = await getNextSession(category.id, session.session_number);

      if (nextSessionNumber) {
        router.push(`/category/${category.slug}/session/${nextSessionNumber}`);
      } else {
        alert('Congratulations! You completed all sessions in this category.');
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load next session:', error);
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
            <p className="text-sm text-gray-600">Session {session.session_number}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

        {/* Question Section */}
        {question && (
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="flex items-start space-x-2">
              <span className="text-emerald-600 font-semibold">Q.</span>
              <p className="text-base text-gray-900 font-medium">{question}</p>
            </div>
          </Card>
        )}

        {/* Example Sentences */}
        <div className="space-y-4">

          {/* Audio Player */}
          {patternAudioUrl && (
            <AudioPlayer
              audioUrl={patternAudioUrl}
              duration={12}
            />
          )}

          {session.expressions.map((expression, index) => (
            <Card key={expression.id} className="p-4 border-l-4 border-l-emerald-500">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-emerald-600 font-semibold text-sm min-w-[24px]">{index + 1}.</span>
                  <div className="flex-1 space-y-2">
                    {/* Korean text - always visible */}
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{expression.korean}</p>

                    {/* English text - hidden by default, click to reveal */}
                    <div
                      onClick={() => setShowEnglish(prev => ({ ...prev, [expression.id]: !prev[expression.id] }))}
                      className="cursor-pointer"
                    >
                      {showEnglish[expression.id] ? (
                        <p className="pl-4 border-l-2 border-emerald-300 text-gray-700">{expression.english}</p>
                      ) : (
                        <p className="pl-4 border-l-2 border-emerald-300 text-gray-400">클릭하여 영어 보기</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Complete Session Button */}
        {!sessionCompleted && (
          <Button
            onClick={handleCompleteSession}
            disabled={isCompleting}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
          >
            {isCompleting ? 'Saving...' : 'Complete Session'}
          </Button>
        )}

        {/* Next Session Button */}
        {sessionCompleted && (
          <Button
            onClick={handleNextSession}
            className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2"
          >
            <span>Next Session</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
