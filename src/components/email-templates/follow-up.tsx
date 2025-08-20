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

interface FollowUpEmailProps {
  recipientName?: string;
  companyName?: string;
  senderName?: string;
  originalDate?: string;
  specificDetail?: string;
}

export const FollowUpEmail = ({
  recipientName = 'there',
  companyName = 'Your Company',
  senderName = '[Your Name]',
  originalDate = 'last week',
  specificDetail = 'potential opportunities',
}: FollowUpEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Following up on career opportunities at {companyName}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          Following Up: Career Opportunities
        </Heading>
        
        <Text style={text}>
          Hi {recipientName},
        </Text>
        
        <Text style={text}>
          I wanted to follow up on my previous message from {originalDate} regarding {specificDetail} at {companyName}.
        </Text>
        
        <Text style={text}>
          I understand you're likely very busy managing daily operations, but I remain genuinely interested in exploring how I might contribute to your team's continued success.
        </Text>
        
        <Text style={text}>
          If now isn't the right time, I completely understand. However, if you have just a few minutes for a brief conversation in the coming weeks, I would greatly appreciate the opportunity to learn more about {companyName} and discuss how my background might align with your needs.
        </Text>
        
        <Text style={text}>
          Would a quick 10-15 minute call be possible sometime this week or next?
        </Text>
        
        <Text style={signature}>
          Thank you for your consideration,<br />
          {senderName}
        </Text>
        
        <Text style={footer}>
          This is a follow-up to a previous professional inquiry.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default FollowUpEmail;

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