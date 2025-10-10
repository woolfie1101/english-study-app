"use client";

import React, { useState, useEffect } from 'react';
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

interface NewsSessionDetailScreenProps {
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

export function NewsSessionDetailScreen({ category, session }: NewsSessionDetailScreenProps) {
  const router = useRouter();
  const {
    completeSession,
    updateDailyStats,
    loading
  } = useProgress();

  // TODO: Replace with actual user authentication
  const userId = '00000000-0000-0000-0000-000000000001';

  const mainPattern = {
    english: session.pattern_english || session.title,
    korean: session.pattern_korean || ""
  };

  // Get pattern audio URL from metadata
  const patternAudioUrl = (session.metadata as any)?.pattern_audio_url || '';

  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const handleCompleteSession = async () => {
    try {
      await completeSession(userId, session.id, category.id);
      await updateDailyStats(userId, category.id);
      setSessionCompleted(true);
    } catch (error) {
      console.error('Failed to complete session:', error);
      alert('Failed to save progress. Please try again.');
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
          <p className="text-sm text-gray-600">Session {session.session_number}</p>
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

          {/* Pattern Description */}
          {session.description && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold text-sm">💡</span>
                <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{session.description}</p>
              </div>
            </div>
          )}

          {/* Pattern Audio */}
          {patternAudioUrl && (
            <div className="mt-4">
              <AudioPlayer
                audioUrl={patternAudioUrl}
                duration={12}
              />
            </div>
          )}
        </Card>

        {/* Example Sentences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Examples</h3>
          {session.expressions.map((expression, index) => (
            <Card key={expression.id} className="p-4 border-l-4 border-l-green-500">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600 font-semibold text-sm min-w-[24px]">{index + 1}.</span>
                  <div className="flex-1 space-y-2">
                    <p className="text-base text-gray-900 bg-gray-50 p-3 rounded-lg">{expression.english}</p>
                    <div
                      onClick={() => setShowTranslation(prev => ({ ...prev, [expression.id]: !prev[expression.id] }))}
                      className="cursor-pointer"
                    >
                      {showTranslation[expression.id] ? (
                        <p className="pl-4 border-l-2 border-gray-300 text-gray-700">{expression.korean}</p>
                      ) : (
                        <p className="pl-4 border-l-2 border-gray-300 text-gray-400">클릭하여 해석 보기</p>
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
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? 'Saving...' : 'Complete Session'}
          </Button>
        )}

        {/* Next Session Button */}
        {sessionCompleted && (
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
