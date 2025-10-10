"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { Database } from "@/types/database";
import { useProgress } from "@/hooks/useProgress";
import { getNextSession } from "@/hooks/useSession";

type Expression = Database['public']['Tables']['expressions']['Row']
type Session = Database['public']['Tables']['sessions']['Row']

interface RealTalkExamplesScreenProps {
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

export function RealTalkExamplesScreen({ category, session }: RealTalkExamplesScreenProps) {
  const router = useRouter();
  const {
    completeSession,
    updateDailyStats,
    loading
  } = useProgress();

  // TODO: Replace with actual user authentication
  const userId = '00000000-0000-0000-0000-000000000001';

  // Get pattern audio URL and conversational_num from metadata
  const metadata = session.metadata as any;
  const patternAudioUrl = metadata?.pattern_audio_url || '';
  const conversationalNum = metadata?.conversational_num;

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

  const handleGoToRealTalk = () => {
    if (conversationalNum) {
      // Navigate to the corresponding Real Talk session
      router.push(`/category/real-talk/session/${conversationalNum}`);
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
        {conversationalNum && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoToRealTalk}
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            <span className="text-xs">Real Talk #{conversationalNum}</span>
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
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
            <Card key={expression.id} className="p-4 border-l-4 border-l-pink-500">
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="text-pink-600 font-semibold text-sm min-w-[24px]">{index + 1}.</span>
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
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {loading ? 'Saving...' : 'Complete Session'}
          </Button>
        )}

        {/* Next Session Button */}
        {sessionCompleted && (
          <Button
            onClick={handleNextSession}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center space-x-2"
          >
            <span>Next Session</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
