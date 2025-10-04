"use client";

import { SessionDetailScreen } from "@/components/SessionDetailScreen";
import { useParams, useRouter } from "next/navigation";

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

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const sessionNumber = parseInt(params.sessionNumber as string);

  const category = CATEGORIES[categoryId as keyof typeof CATEGORIES];

  if (!category) {
    router.push("/");
    return null;
  }

  return (
    <SessionDetailScreen
      category={category}
      session={{ number: sessionNumber }}
    />
  );
}
