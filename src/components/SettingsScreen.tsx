"use client";

import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { ChevronRight, Volume2, Moon, Zap, User } from "lucide-react";

export function SettingsScreen() {
  const settingsSections = [
    {
      title: "Study Settings",
      items: [
        {
          icon: Volume2,
          label: "Auto-play audio",
          type: "switch",
          value: true
        },
        {
          icon: Zap,
          label: "Daily reminder",
          type: "switch", 
          value: false
        },
        {
          icon: Moon,
          label: "Dark mode",
          type: "switch",
          value: false
        }
      ]
    },
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Profile",
          type: "navigation"
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <h1 className="text-gray-900">Settings</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h2 className="text-sm text-gray-600 uppercase tracking-wide">
              {section.title}
            </h2>
            <Card className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div key={itemIndex} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-900">{item.label}</span>
                    </div>
                    <div>
                      {item.type === 'switch' && (
                        <Switch defaultChecked={item.value} />
                      )}
                      {item.type === 'navigation' && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Version Info */}
        <div className="pt-8 text-center">
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}