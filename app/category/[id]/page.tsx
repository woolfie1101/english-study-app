"use client";

import { CategoryScreen } from "@/components/CategoryScreen";
import { useParams, useRouter } from "next/navigation";

// Mock data matching HomeScreen categories
const CATEGORIES = {
  "daily-expression": {
    id: "daily-expression",
    name: "Daily Expression",
    completed: 12,
    total: 20,
  },
  "pattern": {
    id: "pattern",
    name: "Pattern",
    completed: 5,
    total: 10,
  },
  "grammar": {
    id: "grammar",
    name: "Grammar",
    completed: 3,
    total: 8,
  },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];

  if (!category) {
    router.push("/");
    return null;
  }

  return <CategoryScreen category={category} />;
}
