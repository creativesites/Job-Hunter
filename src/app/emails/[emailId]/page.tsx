import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EmailDetailView from "@/components/emails/email-detail-view";

interface EmailDetailPageProps {
  params: {
    emailId: string;
  };
}

export default async function EmailDetailPage({ params }: EmailDetailPageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmailDetailView emailId={params.emailId} />
    </div>
  );
}