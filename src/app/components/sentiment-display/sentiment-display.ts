import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sentiment-display',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-display.html',
  styleUrls: ['./sentiment-display.css']
})
export class SentimentDisplayComponent implements OnChanges {
  @Input() analysis: any = null;
  @Input() isLoading: boolean = false;

  sentimentColors = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#f59e0b'
  };

  sentimentIcons = {
    positive: 'sentiment_very_satisfied',
    negative: 'sentiment_very_dissatisfied',
    neutral: 'sentiment_neutral'
  };

  sentimentLabels = {
    positive: 'Positive',
    negative: 'Negative',
    neutral: 'Neutral'
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['analysis'] && this.analysis) {
      // Any additional logic when analysis changes
    }
  }

  getSentimentColor(type: string): string {
    if (type === 'positive' || type === 'negative' || type === 'neutral') {
      return this.sentimentColors[type];
    }
    return '#666';
  }

  getProgressBarValue(score: number): number {
    return score * 100;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}