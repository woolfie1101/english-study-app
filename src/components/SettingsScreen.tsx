"use client";

import { useState } from "react";
import { Card } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { ChevronRight, Volume2, Moon, Zap, User, Target, RotateCcw, Clock } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export function SettingsScreen() {
  const {
    settings,
    loading,
    error,
    toggleAutoPlayAudio,
    toggleDailyReminder,
    toggleDarkMode,
    updateDailyGoal,
    updateReminderTime,
    resetProgress
  } = useSettings();

  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 진행 상황 초기화 핸들러
  const handleResetProgress = async () => {
    try {
      setIsResetting(true);
      await resetProgress();
      setShowResetConfirm(false);

      // 성공 메시지 표시
      alert('All learning progress has been reset successfully!');

      // 페이지 새로고침하여 변경사항 반영
      window.location.reload();
    } catch (err) {
      console.error('Reset error:', err);
      alert('Failed to reset progress. Please try again.');
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Failed to load settings</div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: "Study Settings",
      items: [
        {
          icon: Volume2,
          label: "Auto-play audio",
          description: "Automatically play pronunciation when viewing expressions",
          type: "switch",
          value: settings.auto_play_audio,
          onChange: toggleAutoPlayAudio
        },
        {
          icon: Zap,
          label: "Daily reminder",
          description: "Get notified to study at your reminder time",
          type: "switch",
          value: settings.daily_reminder,
          onChange: toggleDailyReminder
        },
        {
          icon: Target,
          label: "Daily goal",
          description: "Number of expressions to study per day",
          type: "number",
          value: settings.daily_goal,
          onChange: updateDailyGoal
        },
        {
          icon: Clock,
          label: "Reminder time",
          description: "When to send daily study reminder",
          type: "time",
          value: settings.reminder_time,
          onChange: updateReminderTime,
          disabled: !settings.daily_reminder
        }
      ]
    },
    {
      title: "Appearance",
      items: [
        {
          icon: Moon,
          label: "Dark mode",
          description: "Switch to dark theme (Coming soon)",
          type: "switch",
          value: settings.dark_mode,
          onChange: toggleDarkMode,
          disabled: true
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
                  <div key={itemIndex} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <Icon className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <div className="text-gray-900">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500 mt-0.5">{item.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        {item.type === 'switch' && (
                          <Switch
                            checked={item.value as boolean}
                            onCheckedChange={async () => {
                              await item.onChange?.();
                            }}
                            disabled={item.disabled}
                          />
                        )}
                        {item.type === 'number' && (
                          <input
                            type="number"
                            value={item.value as number}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val >= 1 && val <= 100) {
                                item.onChange?.(val);
                              }
                            }}
                            className="w-16 px-2 py-1 text-right border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={1}
                            max={100}
                            disabled={item.disabled}
                          />
                        )}
                        {item.type === 'time' && (
                          <input
                            type="time"
                            value={(item.value as string)?.slice(0, 5) || '09:00'}
                            onChange={(e) => item.onChange?.(e.target.value + ':00')}
                            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={item.disabled}
                          />
                        )}
                        {item.type === 'navigation' && (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Data Management */}
        <div className="space-y-3">
          <h2 className="text-sm text-gray-600 uppercase tracking-wide">
            Data Management
          </h2>
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <RotateCcw className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <div className="text-gray-900 font-medium">Reset Progress</div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    This will delete all your completed expressions, session progress, and daily statistics. This action cannot be undone.
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                disabled={isResetting}
                className="ml-4 shrink-0"
              >
                Reset
              </Button>
            </div>
          </Card>
        </div>

        {/* Version Info */}
        <div className="pt-8 text-center">
          <p className="text-sm text-gray-500">Version 1.0.0</p>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="m-4 p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-2">Reset Progress</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to reset all your learning progress? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleResetProgress}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}