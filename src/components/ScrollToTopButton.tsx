"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Find the scroll container (the div with overflow-y-auto)
    const container = document.querySelector('.overflow-y-auto') as HTMLElement;
    setScrollContainer(container);

    if (!container) return;

    const toggleVisibility = () => {
      // Show button when scrolled past the container's viewport height
      if (container.scrollTop > container.clientHeight) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    container.addEventListener("scroll", toggleVisibility);

    return () => {
      container.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-32 right-6 z-50 w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-800 text-white shadow-lg"
      size="icon"
    >
      <ArrowUp className="w-5 h-5" />
    </Button>
  );
}
