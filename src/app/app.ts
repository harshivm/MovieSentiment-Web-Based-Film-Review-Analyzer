import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SentimentDisplayComponent } from './components/sentiment-display/sentiment-display';
import { SentimentService } from './services/sentiment.service';
import { RouterOutlet } from '@angular/router';
import { MovieSearchComponent } from "./components/movie-search/movie-search";
@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, CommonModule, RouterOutlet, SentimentDisplayComponent, SentimentDisplayComponent, MovieSearchComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
   movieAnalysis: any = null;
  isLoading = false;
  error: string | null = null;

  constructor(private sentimentService: SentimentService) {}

  onSearch(movieTitle: string): void {
    if (!movieTitle.trim()) return;

    this.isLoading = true;
    this.error = null;
    this.movieAnalysis = null;

    this.sentimentService.analyzeMovieSentiment(movieTitle).subscribe({
      next: (analysis) => {
        this.movieAnalysis = analysis;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to analyze movie sentiment. Please try again.';
        this.isLoading = false;
        console.error('Analysis error:', err);
      }
    });
  }

  clearAnalysis(): void {
    this.movieAnalysis = null;
    this.error = null;
  }
}
