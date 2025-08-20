import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FollowUpSequences from "@/components/dashboard/follow-up-sequences";

export default async function SequencesPage() {
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
              <h1 className="text-2xl font-bold text-gray-900">Follow-Up Sequences</h1>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="text-sm text-gray-600">
                Welcome back, {user.firstName || 'Winston'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <FollowUpSequences />
      </div>
    </div>
  );
}