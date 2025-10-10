"use client";

import { CategoryScreen } from "@/components/CategoryScreen";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCategory } from "@/hooks/useCategory";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { category, loading, error, refetch } = useCategory(slug);

  useEffect(() => {
    if (!loading && !category && !error) {
      router.push("/");
    }
  }, [loading, category, error, router]);

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

  if (!category || !category.slug) {
    return null;
  }

  return <CategoryScreen category={category} onRefetch={refetch} />;
}
