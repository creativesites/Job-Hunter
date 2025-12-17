import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GENKIT_API_KEY || '');

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { messages } = body;
    
    // Check if messages exist and is an array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ 
        choices: [{ 
          message: { 
            content: "Hello! I'm your AI assistant. How can I help you today?",
            role: 'assistant'
          } 
        }] 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Get the last message from the user
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage?.content || lastMessage?.message?.content || 'Hello';
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return new Response(JSON.stringify({ 
      choices: [{ 
        message: { 
          content: text,
          role: 'assistant'
        } 
      }] 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('CopilotKit API error:', error);
    return new Response(JSON.stringify({ 
      choices: [{ 
        message: { 
          content: "I'm sorry, I'm having trouble processing that request. Please try again.",
          role: 'assistant'
        } 
      }] 
    }), {
      status: 200, // Return 200 to avoid breaking the UI
      headers: { 'Content-Type': 'application/json' }
    });
  }
};