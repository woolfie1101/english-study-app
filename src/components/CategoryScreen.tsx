"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, CheckCircle, Play, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Database } from "@/types/database";

type Session = Database['public']['Tables']['sessions']['Row']

interface SessionWithStatus extends Session {
  status: 'completed' | 'in-progress' | 'locked';
}

interface CategoryScreenProps {
  category: {
    id: string;
    name: string;
    slug: string | null;
    completed: number;
    total_sessions: number;
    sessions: Session[];
  };
  onRefetch?: () => void;
}

// Map category slug to Google Sheet name
// Sheet names now match category slugs exactly
const SHEET_NAME_MAP: Record<string, string> = {
  'daily-phrases': 'daily-phrases',
  'news-phrases': 'news-phrases',
  'real-talk': 'real-talk',
  'real-talk-examples': 'real-talk-examples',
  'shadowing': 'shadowing',
  'english-order': 'english-order'
};

export function CategoryScreen({ category, onRefetch }: CategoryScreenProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncData = async () => {
    if (!category.slug) {
      toast.error('카테고리 슬러그가 없습니다.');
      return;
    }

    const sheetName = SHEET_NAME_MAP[category.slug];
    if (!sheetName) {
      toast.error('이 카테고리는 아직 자동 동기화를 지원하지 않습니다.');
      return;
    }

    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/sync-google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetName }),
      });

      // Check content type before parsing
      const contentType = response.headers.get('content-type');

      let data;
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        // Server returned HTML/text instead of JSON (likely an error page)
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error(
          `서버 에러 (HTTP ${response.status}): 환경 변수가 올바르게 설정되었는지 확인해주세요. ` +
          `GCP 로그를 확인하세요.`
        );
      }

      if (!response.ok) {
        const errorDetails = data.details ? `\n${data.details}` : '';
        throw new Error(`${data.error || '서버 에러'}${errorDetails}`);
      }

      toast.success(data.message, {
        description: `${data.synced}개의 데이터가 업데이트되었습니다.`,
        duration: 3000,
      });

      // Refetch data without page reload
      if (onRefetch) {
        setTimeout(() => {
          onRefetch();
        }, 1000); // Wait 1 second to show the toast
      }
    } catch (error) {
      console.error('Sync error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error('동기화 실패', {
        description: errorMessage,
        duration: 8000,
      });
    } finally {
      setSyncing(false);
    }
  };

  // Add status to sessions based on completion
  const sessionsWithStatus: SessionWithStatus[] = category.sessions.map((session, index) => ({
    ...session,
    status: index < category.completed ? 'completed' : index === category.completed ? 'in-progress' : 'locked'
  }));

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
          <h1 className="text-gray-900">{category.name}</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncData}
          disabled={syncing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? '동기화 중...' : '데이터 업데이트'}
        </Button>
      </div>

      {/* Progress Summary */}
      <div className="px-6 py-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-medium mb-1 text-gray-900">
              {category.completed}/{category.sessions.length}
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
          {sessionsWithStatus.map((session) => {
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
                      <span className="text-gray-900">{session.session_number}</span>
                    </div>
                    <div>
                      <h3 className="text-gray-900">Session {session.session_number}</h3>
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
              <Link key={session.id} href={`/category/${category.slug}/session/${session.session_number}`}>
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