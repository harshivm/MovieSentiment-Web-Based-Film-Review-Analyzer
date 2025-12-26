// Remove the circular dependency issue
export interface SentimentResult {
  type: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  summary: string;
}