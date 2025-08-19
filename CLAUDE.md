# Job Hunter CRM

## Project Overview
Job Hunter is a personal CRM application designed for targeted outreach to decision makers at automotive dealerships across the US. It combines AI-powered lead qualification, personalized email generation, and comprehensive analytics to optimize sales outreach efforts.

## Core Functionality
- **AI Lead Qualification**: Intelligent scoring and reasoning for lead prioritization
- **Email Automation**: AI-generated personalized emails with manual editing capabilities
- **Send Management**: Daily quota management (10 emails/day) with Gmail API integration
- **Response Tracking**: Automatic response detection, categorization, and sentiment analysis
- **Analytics Dashboard**: Comprehensive metrics on performance, A/B testing, and ROI

## Key Constraints
- Maximum 10 emails per day to avoid spam detection
- Gmail API integration for legitimate email sending
- Focus on automotive dealership decision makers
- Personal use application (single user)

## Development Guidelines
- Prioritize data privacy and email deliverability best practices
- Build modular components for easy feature expansion
- Implement robust error handling for email sending operations
- Focus on user experience with clean, intuitive dashboard design

## Commands to Run
- Linting: `npm run lint`
- Type checking: `npm run typecheck`
- Testing: `npm test`
- Development server: `npm run dev`
- Build: `npm run build`

## Security Considerations
- Secure API key management for Gmail API
- Data encryption for contact information
- Compliance with email marketing regulations (CAN-SPAM Act)
- Rate limiting to prevent abuse