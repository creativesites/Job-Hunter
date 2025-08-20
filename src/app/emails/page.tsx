import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EmailHistoryView from "@/components/emails/email-history-view";

export default async function EmailsPage() {
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
              <h1 className="text-2xl font-bold text-gray-900">Email Management</h1>
            </div>
            <div className="text-sm text-gray-600">
              Track your outreach campaigns and email queue
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <EmailHistoryView />
      </div>
    </div>
  );
}