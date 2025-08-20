import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SmartNotifications from "@/components/dashboard/smart-notifications";

export default async function NotificationsPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Smart Notifications</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/analytics">
                <Button variant="outline" size="sm">
                  Analytics
                </Button>
              </Link>
              <Link href="/sequences">
                <Button variant="outline" size="sm">
                  Sequences
                </Button>
              </Link>
              <div className="text-sm text-gray-600">
                Welcome back, {user.firstName || 'Winston'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <SmartNotifications />
      </div>
    </div>
  );
}