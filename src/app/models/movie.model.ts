// Remove the SentimentResult import issue by defining it here
export interface Movie {
  id: number;
  title: string;
  year: number;
  director: string;
  genre: string;
  rating: number;
  posterUrl: string;
}

export interface MovieAnalysis {
  movie: Movie;
  sentiment: {
    type: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    summary: string;
  };
  confidence: number;
  reviewCount: number;
  timestamp: Date;
}