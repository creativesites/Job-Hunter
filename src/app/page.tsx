import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900">Job Hunter CRM</h1>
        </div>
        <div className="flex items-center space-x-4">
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered CRM for
            <span className="text-blue-600"> Automotive Dealerships</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your outreach to automotive dealership decision makers with 
            intelligent lead qualification, personalized email generation, and comprehensive analytics.
          </p>
          
          <SignedOut>
            <div className="space-x-4">
              <SignUpButton>
                <Button size="lg" className="text-lg px-8 py-3">
                  Get Started Free
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Go to Dashboard
              </Button>
            </Link>
          </SignedIn>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              🎯
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Lead Qualification</h3>
            <p className="text-gray-600">
              Intelligent scoring and prioritization of automotive dealership contacts
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              ✉️
            </div>
            <h3 className="font-semibold text-lg mb-2">Personalized Outreach</h3>
            <p className="text-gray-600">
              AI-generated emails tailored to each dealership and decision maker
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              📊
            </div>
            <h3 className="font-semibold text-lg mb-2">Comprehensive Analytics</h3>
            <p className="text-gray-600">
              Track performance, response rates, and ROI with detailed insights
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
