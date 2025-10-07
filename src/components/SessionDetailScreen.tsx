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

interface ExpressionWithStatus extends Expression {
  completed: boolean;
}

interface SessionDetailScreenProps {
  category: {
    id: string;
    name: string;
    total_sessions: number;
  };
  session: Session & {
    expressions: Expression[];
  };
}

export function SessionDetailScreen({ category, session }: SessionDetailScreenProps) {
  const router = useRouter();
  const {
    completeExpression,
    getCompletedExpressions,
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

  const [expressionsWithStatus, setExpressionsWithStatus] = useState<ExpressionWithStatus[]>(
    session.expressions.map(exp => ({ ...exp, completed: false }))
  );

  // Load completed expressions on mount
  useEffect(() => {
    const loadCompletedExpressions = async () => {
      const completed = await getCompletedExpressions(userId, session.id);
      const completedIds = new Set(completed.map(c => c.expression_id));

      setExpressionsWithStatus(prev =>
        prev.map(exp => ({
          ...exp,
          completed: completedIds.has(exp.id)
        }))
      );
    };

    loadCompletedExpressions();
  }, [session.id]);

  const handleCompleteExpression = async (expressionId: string) => {
    try {
      // Optimistic update
      setExpressionsWithStatus(prev =>
        prev.map(exp =>
          exp.id === expressionId
            ? { ...exp, completed: true }
            : exp
        )
      );

      // Save to Supabase
      await completeExpression(
        userId,
        expressionId,
        session.id,
        category.id
      );
    } catch (error) {
      console.error('Failed to complete expression:', error);

      // Revert on error
      setExpressionsWithStatus(prev =>
        prev.map(exp =>
          exp.id === expressionId
            ? { ...exp, completed: false }
            : exp
        )
      );

      alert('Failed to save progress. Please try again.');
    }
  };

  const allCompleted = expressionsWithStatus.every(exp => exp.completed);
  const [sessionCompleted, setSessionCompleted] = React.useState(false);

  // Auto-complete session when all expressions are completed
  useEffect(() => {
    const handleSessionCompletion = async () => {
      // Only complete once
      if (allCompleted && expressionsWithStatus.length > 0 && !sessionCompleted) {
        try {
          // Complete session
          await completeSession(userId, session.id, category.id);
          console.log('Session completed successfully');

          // Update daily stats
          await updateDailyStats(
            userId,
            category.id
          );
          console.log('Daily stats updated successfully');

          // Mark as completed to prevent duplicate calls
          setSessionCompleted(true);
        } catch (error) {
          console.error('Failed to complete session:', error);
        }
      }
    };

    handleSessionCompletion();
  }, [allCompleted, expressionsWithStatus.length, sessionCompleted]);

  const handleNextSession = async () => {
    try {
      // Get next session number
      const nextSessionNumber = await getNextSession(category.id, session.session_number);

      if (nextSessionNumber) {
        // Navigate to next session
        router.push(`/category/${category.id}/session/${nextSessionNumber}`);
      } else {
        // No more sessions, go to home
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

          {/* Pattern Description - from session */}
          {session.description && (
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <span className="text-blue-600 font-semibold text-sm">💡</span>
                <p className="text-sm text-blue-800 leading-relaxed">{session.description}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Expression Cards */}
        <div className="space-y-4">
          {expressionsWithStatus.map((expression, index) => (
            <Card key={expression.id} className="p-6 border-l-4 border-l-blue-500">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-lg text-gray-900 bg-gray-100 p-3 rounded-lg">{expression.english}</p>
                  <p className="pl-4 border-l-2 border-gray-300 text-gray-400 mt-3">{expression.korean}</p>
                </div>
                
                <AudioPlayer
                  audioUrl={expression.audio_url || ''}
                  duration={12}
                />
                
                <Button
                  onClick={() => handleCompleteExpression(expression.id)}
                  disabled={expression.completed || loading}
                  className={`w-full ${
                    expression.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {loading ? 'Saving...' : expression.completed ? '✅ Completed' : 'Complete'}
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