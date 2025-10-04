"use client";

import { Home, BookOpen, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNavigation() {
  const pathname = usePathname();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'categories', label: 'Categories', icon: BookOpen, href: '/' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
  ];

  const getActiveTab = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/calendar') return 'calendar';
    if (pathname === '/settings') return 'settings';
    if (pathname?.startsWith('/category')) return 'home';
    return 'home';
  };

  const activeTab = getActiveTab();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors
                ${isActive
                  ? 'text-blue-500 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}