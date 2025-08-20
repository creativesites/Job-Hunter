import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface JobIntroductionEmailProps {
  recipientName?: string;
  recipientTitle?: string;
  companyName?: string;
  senderName?: string;
  senderExperience?: string;
  city?: string;
  state?: string;
}

export const JobIntroductionEmail = ({
  recipientName = 'Hiring Manager',
  recipientTitle = 'Decision Maker',
  companyName = 'Your Company',
  senderName = '[Your Name]',
  senderExperience = 'automotive industry professional',
  city = 'your area',
  state = '',
}: JobIntroductionEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Exploring career opportunities at {companyName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Career Opportunity Inquiry
        </Heading>
        
        <Text style={text}>
          Dear {recipientName},
        </Text>
        
        <Text style={text}>
          I hope this message finds you well. I came across {companyName} and was impressed by your operations in {city}{state ? `, ${state}` : ''}.
        </Text>
        
        <Text style={text}>
          As an {senderExperience} with a strong background in dealership operations and customer relations, I'm actively exploring new opportunities where I can contribute to continued success and growth.
        </Text>
        
        <Text style={text}>
          My experience includes:
        </Text>
        
        <Text style={bulletPoint}>
          • Sales and customer relationship management
        </Text>
        <Text style={bulletPoint}>
          • Dealership operations and process optimization
        </Text>
        <Text style={bulletPoint}>
          • Digital marketing and lead generation
        </Text>
        <Text style={bulletPoint}>
          • Team leadership and training
        </Text>
        
        <Text style={text}>
          I would welcome the chance to discuss how my experience could benefit {companyName}. Would you be open to a brief conversation about potential opportunities within your organization?
        </Text>
        
        <Text style={text}>
          Thank you for your time and consideration. I look forward to hearing from you.
        </Text>
        
        <Text style={signature}>
          Best regards,<br />
          {senderName}
        </Text>
        
        <Text style={footer}>
          This email was sent as part of a professional networking outreach.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default JobIntroductionEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 24px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const bulletPoint = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 8px',
  paddingLeft: '16px',
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '24px 0 16px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
};