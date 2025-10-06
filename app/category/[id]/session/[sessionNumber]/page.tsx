"use client";

import { SessionDetailScreen } from "@/components/SessionDetailScreen";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/hooks/useSession";
import { useCategory } from "@/hooks/useCategory";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const sessionNumber = parseInt(params.sessionNumber as string);

  const { category, loading: categoryLoading } = useCategory(categoryId);
  const { session, loading: sessionLoading, error } = useSession(categoryId, sessionNumber);

  const loading = categoryLoading || sessionLoading;

  useEffect(() => {
    if (!loading && !session && !error) {
      router.push(`/category/${categoryId}`);
    }
  }, [loading, session, error, router, categoryId]);

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

  return (
    <SessionDetailScreen
      category={category}
      session={session}
    />
  );
}
