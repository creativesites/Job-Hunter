import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import LeadsList from "@/components/dashboard/leads-list";
import ImportCSV from "@/components/dashboard/import-csv";
import EmailQueueWidget from "@/components/dashboard/email-queue-widget";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import DailyCurationPanel from "@/components/dashboard/daily-curation-panel";
import NotificationsWidget from "@/components/dashboard/notifications-widget";
import ManualCurationButton from "@/components/dashboard/manual-curation-button";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        userName={user.firstName || user.emailAddresses[0]?.emailAddress || 'User'}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          <DashboardStats />
          
          {/* AI Curation Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <DailyCurationPanel />
            <ManualCurationButton />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LeadsList />
            </div>
            <div className="space-y-8">
              <NotificationsWidget />
              <EmailQueueWidget />
              <ImportCSV />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}