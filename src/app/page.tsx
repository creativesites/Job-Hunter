import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      

      <main>
        
        {/* <!-- Navigation --> */}
        <nav>
            <div className="logo">
                <i className="fas fa-briefcase"></i>
                <span>JobHunterCRM</span>
            </div>
            
            <div className="nav-links">
                <a href="#">Features</a>
                <a href="#">How It Works</a>
                <a href="#">Pricing</a>
                <a href="#">Testimonials</a>
            </div>
            
            <div className="nav-buttons">
                <SignedOut>
                  <SignInButton>
                    <Button variant="outline" className="btn btn-outline">Sign In</Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="btn btn-primary">Sign Up</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
            </div>
        </nav>
        
        {/* <!-- Hero Section --> */}
        <section className="hero">
            <h1 className="animate">Transform Your <span className="hero-gradient">Job Search</span> with AI-Powered CRM</h1>
            <p className="animate delay-1">Streamline your job hunt with intelligent lead qualification, personalized outreach, and comprehensive analytics—all in one platform.</p>
            <div className="hero-buttons animate delay-2">
                
                <SignedOut>
                  <div className="space-x-4">
                    <SignUpButton>
                      <Button size="lg" className="btn btn-primary">
                        Get Started Free
                      </Button>
                    </SignUpButton>
                    <SignInButton>
                      <Button variant="outline" size="lg" className="text-lg text-gray-600 px-8 py-3">
                        Sign In
                      </Button>
                    </SignInButton>
                  </div>
                </SignedOut>
                
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="btn btn-outline">
                      Go to Dashboard
                    </Button>
                  </Link>
                </SignedIn>
            </div>
            {/* <Image src="/images/one.png" width={600} height={400} alt="JobHunterCRM Dashboard" className="hero-image animate delay-3"/> */}
        </section>
        
        {/* <!-- Features Section --> */}
        <section className="features">
            <div className="section-header animate">
                <h2>Powerful Features for Job Seekers</h2>
                <p>Everything you need to manage your job search efficiently and effectively</p>
            </div>
            
            <div className="features-grid">
                <div className="feature-card animate delay-1">
                    <div className="feature-icon">
                        <i className="fas fa-brain"></i>
                    </div>
                    <h3>AI Lead Qualification</h3>
                    <p>Our AI analyzes job postings and company data to prioritize opportunities that match your skills and preferences.</p>
                </div>
                
                <div className="feature-card animate delay-2">
                    <div className="feature-icon">
                        <i className="fas fa-envelope"></i>
                    </div>
                    <h3>Personalized Outreach</h3>
                    <p>Generate tailored resumes and cover letters that highlight your most relevant experience for each position.</p>
                </div>
                
                <div className="feature-card animate delay-3">
                    <div className="feature-icon">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <h3>Application Tracking</h3>
                    <p>Track every application, follow-up, and interview in one place with our intuitive visual pipeline.</p>
                </div>
            </div>
        </section>
        
        {/* <!-- How It Works --> */}
        <section className="how-it-works">
            <div className="section-header animate">
                <h2>How JobHunterCRM Works</h2>
                <p>Streamline your job search process in four simple steps</p>
            </div>
            
            <div className="steps">
                <div className="step animate">
                    <div className="step-content">
                        <div className="step-number">01</div>
                        <h3>Import Opportunities</h3>
                        <p>Connect your job search accounts or manually add opportunities. Our system automatically enriches data with company information.</p>
                    </div>
                    <div className="step-image">
                        <Image src="/images/one.png" width={120} height={120} alt="Import Opportunities"></Image>
                    </div>
                </div>
                
                <div className="step animate delay-1">
                    <div className="step-content">
                        <div className="step-number">02</div>
                        <h3>AI Qualification & Scoring</h3>
                        <p>Our AI analyzes each opportunity based on your profile, skills, and preferences to prioritize your efforts.</p>
                    </div>
                    <div className="step-image">
                        <Image src="/images/one.png" width={120} height={120}  alt="AI Qualification"/>
                    </div>
                </div>
                
                <div className="step animate delay-2">
                    <div className="step-content">
                        <div className="step-number">03</div>
                        <h3>Personalized Application Materials</h3>
                        <p>Generate tailored resumes and cover letters that highlight your most relevant experience for each position.</p>
                    </div>
                    <div className="step-image">
                        <Image src="/images/one.png" width={120} height={120}  alt="Personalized Applications"/>
                    </div>
                </div>
                
                <div className="step animate delay-3">
                    <div className="step-content">
                        <div className="step-number">04</div>
                        <h3>Track & Optimize</h3>
                        <p>Monitor application status, response rates, and interview conversions with detailed analytics and insights.</p>
                    </div>
                    <div className="step-image">
                        <Image src="/images/one.png" width={120} height={120}  alt="Track and Optimize"/>
                    </div>
                </div>
            </div>
        </section>
        
        {/* <!-- Testimonials --> */}
        <section className="testimonials">
            <div className="section-header animate">
                <h2>Success Stories from Job Seekers</h2>
                <p>Join thousands of users who found their dream job with JobHunterCRM</p>
            </div>
            
            <div className="testimonials-grid">
                <div className="testimonial-card animate">
                    <div className="testimonial-content">
                        "JobHunterCRM completely transformed my job search. The AI recommendations helped me focus on opportunities that actually matched my skills, and I landed a role in half the time!"
                    </div>
                    <div className="testimonial-author">
                        <div className="author-avatar">SD</div>
                        <div className="author-details">
                            <h4>Sarah Daniels</h4>
                            <p>Product Manager at TechCorp</p>
                        </div>
                    </div>
                </div>
                
                <div className="testimonial-card animate delay-1">
                    <div className="testimonial-content">
                        "The personalized outreach feature saved me hours of work. My response rate increased by 300% after using JobHunterCRM's tailored application materials."
                    </div>
                    <div className="testimonial-author">
                        <div className="author-avatar">MJ</div>
                        <div className="author-details">
                            <h4>Michael Johnson</h4>
                            <p>Marketing Director at BrandWorks</p>
                        </div>
                    </div>
                </div>
                
                <div className="testimonial-card animate delay-2">
                    <div className="testimonial-content">
                        "As someone who was applying to 5+ jobs daily, the tracking features kept me organized and the analytics helped me understand what was working in my approach."
                    </div>
                    <div className="testimonial-author">
                        <div className="author-avatar">AL</div>
                        <div className="author-details">
                            <h4>Amanda Lewis</h4>
                            <p>UX Designer at AppInnovate</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        {/* <!-- CTA Section --> */}
        <section className="cta">
            <h2 className="animate">Ready to Transform Your Job Search?</h2>
            <p className="animate delay-1">Join thousands of job seekers who found their dream role with JobHunterCRM</p>
            <div className="cta-buttons animate delay-2">
                <a href="#" className="btn btn-light">Get Started Free</a>
                <a href="#" className="btn btn-transparent">Schedule a Demo</a>
            </div>
        </section>
        
        {/* <!-- Footer --> */}
        <footer>
            <div className="footer-grid">
                <div className="footer-column">
                    <h3>JobHunterCRM</h3>
                    <p>AI-powered CRM for job seekers to streamline their search and land their dream role faster.</p>
                </div>
                
                <div className="footer-column">
                    <h3>Product</h3>
                    <ul className="footer-links">
                        <li><a href="#">Features</a></li>
                        <li><a href="#">Pricing</a></li>
                        <li><a href="#">Use Cases</a></li>
                        <li><a href="#">Integrations</a></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h3>Resources</h3>
                    <ul className="footer-links">
                        <li><a href="#">Blog</a></li>
                        <li><a href="#">Tutorials</a></li>
                        <li><a href="#">Documentation</a></li>
                        <li><a href="#">Support</a></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h3>Company</h3>
                    <ul className="footer-links">
                        <li><a href="#">About</a></li>
                        <li><a href="#">Careers</a></li>
                        <li><a href="#">Contact</a></li>
                        <li><a href="#">Legal</a></li>
                    </ul>
                </div>
            </div>
            
            <div className="footer-bottom">
                <p>&copy; 2023 JobHunterCRM. All rights reserved.</p>
            </div>
        </footer>
      </main>
    </div>
  );
}
