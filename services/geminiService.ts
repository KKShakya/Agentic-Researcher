import { GoogleGenAI, Type } from "@google/genai";
import { ResearchResult, TopicAnalytics } from "../types";

// Initialize Gemini Client
// Note: API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Step 1: Gather resources using Google Search Grounding
 */
export const gatherAndEnhance = async (query: string): Promise<{ text: string; groundingChunks: any[] }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are an expert research agent. 
      Research the following topic: "${query}".
      
      Provide a response in two distinct sections:
      
      SECTION 1: EXECUTIVE SUMMARY
      A concise, high-level overview of the topic (approx 100 words).
      
      SECTION 2: ENHANCED DEEP DIVE
      A structured, easy-to-read detailed explanation. Use bullet points, bold text for key terms, and clear paragraph breaks. 
      Explain complex concepts simply.
      
      Ensure the information is accurate and up-to-date based on the search results.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No content generated.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, groundingChunks };
  } catch (error) {
    console.error("Error in gatherAndEnhance:", error);
    throw error;
  }
};

/**
 * Step 2: Analyze the gathered content to generate metrics
 * We perform a second pass to ensure clean JSON output without conflict with Grounding tools.
 */
export const generateAnalytics = async (content: string): Promise<TopicAnalytics> => {
  try {
    const model = 'gemini-2.5-flash';

    const prompt = `
      Analyze the following text and provide structural metrics for a dashboard.
      
      Text to analyze:
      """
      ${content.substring(0, 8000)} 
      """
      
      Return a JSON object with:
      1. complexity: A score 0-100 (0=Simple, 100=Academic/Dense).
      2. relevance: A score 0-100 indicating how information-dense the text is.
      3. sentiment: A score 0-100 (0=Negative, 50=Neutral, 100=Positive).
      4. readingTimeMinutes: Estimated reading time (number).
      5. keyTopics: An array of exactly 5 objects, each having a "name" (string) and "value" (number 0-100) representing the prominence of sub-themes.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            complexity: { type: Type.NUMBER },
            relevance: { type: Type.NUMBER },
            sentiment: { type: Type.NUMBER },
            readingTimeMinutes: { type: Type.NUMBER },
            keyTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
              },
            },
          },
          required: ["complexity", "relevance", "sentiment", "readingTimeMinutes", "keyTopics"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analytics generated");

    return JSON.parse(jsonText) as TopicAnalytics;

  } catch (error) {
    console.error("Error in generateAnalytics:", error);
    // Fallback in case of error to prevent app crash
    return {
      complexity: 50,
      relevance: 80,
      sentiment: 50,
      readingTimeMinutes: 2,
      keyTopics: [
        { name: "Analysis Failed", value: 0 }
      ]
    };
  }
};
