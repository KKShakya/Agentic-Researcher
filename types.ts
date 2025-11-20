export interface TopicAnalytics {
  complexity: number; // 0-100
  relevance: number; // 0-100
  sentiment: number; // 0-100 (Negative to Positive)
  readingTimeMinutes: number;
  keyTopics: Array<{ name: string; value: number }>; // For charts
}

export interface ResearchResult {
  summary: string;
  enhancedContent: string;
  groundingChunks: Array<{
    web?: { uri: string; title: string };
  }>;
  analytics: TopicAnalytics;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
  data: ResearchResult;
}