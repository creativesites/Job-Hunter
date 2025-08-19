import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardStats from "@/components/dashboard/dashboard-stats";
import LeadsList from "@/components/dashboard/leads-list";
import ImportCSV from "@/components/dashboard/import-csv";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-600">
              Welcome back, {user.firstName || user.emailAddresses[0]?.emailAddress}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-8">
          <DashboardStats />
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <LeadsList />
            </div>
            <div>
              <ImportCSV />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}