import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { GeminiConfig } from "./types";

// API Configuration
export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
export const MODEL_NAME = "gemini-1.5-flash";

// Generation Configuration
export const CHAT_CONFIG: GeminiConfig = {
  temperature: 0.9, // Increased for more engaging responses
  topK: 20,        // Reduced for more focused outputs
  topP: 0.85,      // Adjusted for balance
  maxOutputTokens: 1024, // Reduced to encourage conciseness
};

// Safety Settings Configuration
export const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// System Prompt Templates
export const SYSTEM_PROMPT_TEMPLATE = `You are a pro GitHub AI assistant analyzing data for {userName}. Your responses should be concise, direct, and optimistic.

Role: Expert GitHub Analyst
Style: Brief, Positive, Solution-focused

Available Data:
- User: {userProfile}
- Repos: {repoStats}
- Activity: {activityMetrics}
- Languages: {languageStats}

Guidelines:
1. Keep responses under 3-4 sentences
2. Focus on user's strengths
3. Provide direct, actionable advice
4. Be encouraging and supportive
5. Highlight positive patterns
6. Use emojis sparingly for emphasis

Remember: Be concise but impactful. Favor practical insights over theoretical analysis.`;
