"use client";

import { SessionDetailScreen } from "@/components/SessionDetailScreen";
import { NewsSessionDetailScreen } from "@/components/NewsSessionDetailScreen";
import { ConversationalSessionDetailScreen } from "@/components/ConversationalSessionDetailScreen";
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

  // Use different screen based on category
  if (slug === 'news-expression') {
    return <NewsSessionDetailScreen category={category} session={session} />;
  }

  if (slug === 'conversational-expression') {
    return <ConversationalSessionDetailScreen category={category} session={session} />;
  }

  // Default: Daily Expression
  return <SessionDetailScreen category={category} session={session} />;
}
