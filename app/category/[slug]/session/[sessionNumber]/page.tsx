"use client";

import { DailyPhrasesScreen } from "@/components/DailyPhrasesScreen";
import { NewsPhrasesScreen } from "@/components/NewsPhrasesScreen";
import { RealTalkScreen } from "@/components/RealTalkScreen";
import { RealTalkExamplesScreen } from "@/components/RealTalkExamplesScreen";
import { ShadowingScreen } from "@/components/ShadowingScreen";
import { EnglishOrderScreen } from "@/components/EnglishOrderScreen";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useCategory } from "@/hooks/useCategory";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const sessionNumber = parseInt(params.sessionNumber as string);

  const { category, loading: categoryLoading } = useCategory(slug);
  const { session, loading: sessionLoading, error } = useSession(slug, sessionNumber);

  const loading = categoryLoading || sessionLoading;

  useEffect(() => {
    if (!loading && !session && !error) {
      router.push(`/category/${slug}`);
    }
  }, [loading, session, error, router, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  if (!session || !category) {
    return null;
  }

  // Use different screen based on category slug
  if (slug === 'news-phrases') {
    return <NewsPhrasesScreen category={category} session={session} />;
  }

  if (slug === 'real-talk') {
    return <RealTalkScreen category={category} session={session} />;
  }

  if (slug === 'real-talk-examples') {
    return <RealTalkExamplesScreen category={category} session={session} />;
  }

  if (slug === 'shadowing') {
    return <ShadowingScreen category={category} session={session} />;
  }

  if (slug === 'english-order') {
    return <EnglishOrderScreen category={category} session={session} />;
  }

  // Default: Daily Phrases
  return <DailyPhrasesScreen category={category} session={session} />;
}
