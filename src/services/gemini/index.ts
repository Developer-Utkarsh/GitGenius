import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { ProcessedGitHubData, processDataForGemini } from "./data-processor";
import { ChatMessage } from "./types";
import { Repository } from "@/types/github";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const SAFETY_SETTINGS = [
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

const CHAT_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

export async function getChatResponse(
  userInput: string,
  chatHistory: ChatMessage[],
  githubData: {
    userData: any;
    stats: any;
    repositories: Repository[];
  }
): Promise<string> {
  try {
    // Process the combined data
    const processedData = processDataForGemini({
      stats: {
        ...githubData.stats,
        ...githubData.userData,
        contributions: githubData.stats.contributions?.contributionsCollection,
      },
      repositories: githubData.repositories,
    });

    // Validate data
    if (!processedData || !processedData.contributions) {
      throw new Error("Invalid GitHub data: missing contributions");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Create system context from GitHub data
    const systemContext = generateSystemContext(processedData);

    // Format chat history for Gemini
    const formattedHistory = [
      { role: "user" as const, parts: [{ text: systemContext }] },
      ...chatHistory.map((msg) => ({
        role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
        parts: [{ text: msg.content }],
      })),
    ];

    // Start chat with safety checks
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: CHAT_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });

    // Send message and get response
    const result = await chat.sendMessage(userInput);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}

function generateSystemContext(data: ProcessedGitHubData): string {
  const totalContributions =
    data.contributions.totalCommits + data.contributions.totalPRs;

  return `You are a GitHub profile analyzer. Here are the user's GitHub statistics:

Basic Stats:
- Total Contributions: ${totalContributions}
- Total Commits: ${data.contributions.totalCommits}
- Total Pull Requests: ${data.contributions.totalPRs}
- Total Issues: ${data.contributions.totalIssues}
- Current Streak: ${data.contributions.contributionStreak} days
- Longest Streak: ${data.contributions.maxStreak} days

Code Quality Analysis:
- PR Merge Rate: ${(data.codeQuality.prMergeRate * 100).toFixed(1)}%
- Documentation Rate: ${(data.codeQuality.documentationRate * 100).toFixed(1)}%
- Maintained Active Repositories: ${data.codeQuality.maintainedRepos}
- Average Issue Resolution Time: ${formatDuration(
    data.codeQuality.averageIssueResolutionTime
  )}

Community Impact:
- Issue Comments: ${data.communityEngagement.issueComments}
- PR Reviews: ${data.communityEngagement.prReviews}
- Discussion Participation: ${data.communityEngagement.discussionParticipation}

Repository Analysis:
- Total Repositories: ${data.repositories.total}
- Most Used Languages: ${data.repositories.topLanguages
    .map(([lang]) => lang)
    .join(", ")}
- Popular Repositories: ${data.repositories.popularRepos
    .map((repo) => repo.name)
    .join(", ")}

Please analyze this data and provide insights when asked.`;
}

// Helper functions for formatting
function formatDuration(ms: number) {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days} days`;
}

export type { ChatMessage };
