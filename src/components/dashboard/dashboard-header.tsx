"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import EnhancedUserSettingsModal from "./enhanced-user-settings-modal";

interface DashboardHeaderProps {
  userName: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <Link href="/sequences">
                <Button variant="outline" size="sm">
                  Sequences
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  Analytics
                </Button>
              </Link>
              <Link href="/emails">
                <Button variant="outline" size="sm">
                  Email History
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                size="sm"
              >
                Settings
              </Button>
              <div className="text-sm text-gray-600">
                Welcome back, {userName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnhancedUserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}