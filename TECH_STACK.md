# Job Hunter CRM - Technology Stack

## Full-Stack Framework
- **Framework**: Next.js 14+ with TypeScript (App Router)
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: shadcn/ui + Radix UI primitives
- **Charts**: Recharts for analytics visualizations
- **Forms**: React Hook Form with Zod validation
- **State Management**: Zustand for client state

## Backend as a Service
- **Database & API**: Supabase (PostgreSQL + Real-time + Auth)
- **Authentication**: Clerk.js for user management
- **AI Integration**: CopilotKit for AI-powered features
- **Email Templates**: React Email + @react-email/components
- **Email Sending**: Resend API (integrated with React Email)

## Data Schema (Based on CSV Analysis)
The CSV contains automotive dealership contacts with these fields:
- **Company**: Dealership name
- **Industry**: "new car GM" (General Manager)
- **Title**: Job titles (COO, Manager, Dealer, etc.)
- **Name**: First Name, Last Name
- **Email**: Primary contact email
- **Address**: Full address details (Address, City, State, Zip)
- **Website**: Web Address
- **Phone**: Contact phone numbers
- **Digital Dealer**: Conference attendance flag

## Development Tools
- **Package Manager**: npm or pnpm
- **Linting**: ESLint with Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest + React Testing Library
- **Database**: Supabase CLI for migrations
- **Environment**: .env.local for Next.js

## Infrastructure & Deployment
- **Hosting**: Vercel (seamless Next.js deployment)
- **Database**: Supabase PostgreSQL
- **File Storage**: Supabase Storage for CSV imports
- **Email Service**: Resend for transactional emails
- **Domain**: Custom domain with Vercel

## Key Libraries & Packages
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@clerk/nextjs": "^4.0.0",
    "@supabase/supabase-js": "^2.0.0",
    "copilotkit": "latest",
    "react-email": "^1.0.0",
    "@react-email/components": "^0.0.0",
    "resend": "^2.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "^1.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "zustand": "^4.0.0",
    "recharts": "^2.0.0",
    "papaparse": "^5.0.0",
    "date-fns": "^2.0.0",
    "lucide-react": "^0.300.0"
  }
}
```

## Project Structure
```
job-hunter/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── leads/           # Lead management pages
│   │   ├── emails/          # Email composition & templates
│   │   ├── analytics/       # Analytics dashboard
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   │   ├── leads/           # Lead CRUD operations
│   │   ├── emails/          # Email sending & tracking
│   │   └── analytics/       # Analytics data
│   ├── auth/                # Clerk authentication pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/               # Reusable UI components
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard-specific components
│   ├── forms/               # Form components
│   └── email-templates/     # React Email templates
├── lib/                     # Utility functions
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   ├── utils.ts            # Helper functions
│   └── validations.ts      # Zod schemas
├── hooks/                   # Custom React hooks
├── store/                   # Zustand stores
├── contacts/                # CSV data files
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies
```

## Security Considerations
- **API Keys**: Store in environment variables, never commit to code
- **Database**: Use connection pooling and prepared statements
- **Authentication**: Implement proper JWT token validation
- **Email**: Follow Gmail API best practices and rate limiting
- **Data Encryption**: Encrypt sensitive contact information at rest
- **Input Validation**: Validate all user inputs on both client and server

## Performance Optimizations
- **Frontend**: Code splitting, lazy loading, React.memo for expensive components
- **Backend**: Database indexing, connection pooling, caching frequently accessed data
- **API**: Implement pagination for large datasets
- **Email**: Queue processing to handle bulk operations efficiently