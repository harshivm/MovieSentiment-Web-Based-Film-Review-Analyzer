import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SentimentService {
  
  // Fallback hardcoded movies
  private fallbackMovies = [
    {
      title: "Inception",
      year: 2010,
      director: "Christopher Nolan",
      genre: "Action, Sci-Fi",
      rating: 8.3,
      posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      voteCount: 30000,
      overview: "A thief who steals corporate secrets through dream-sharing technology."
    },
    {
      title: "The Dark Knight",
      year: 2008,
      director: "Christopher Nolan",
      genre: "Action, Crime",
      rating: 8.5,
      posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", 
      voteCount: 28000,
      overview: "Batman faces the Joker, a criminal mastermind."
    },
    {
      title: "Pulp Fiction",
      year: 1994,
      director: "Quentin Tarantino",
      genre: "Crime, Drama",
      rating: 8.9,
      posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      voteCount: 22000,
      overview: "The lives of two mob hitmen, a boxer, and others intertwine."
    }
  ];

  private moviesData: any[] = [];
  private isDataLoaded = false;

  constructor(private http: HttpClient) {
    this.loadMovieData();
  }

  private loadMovieData() {
    // Load BOTH JSON files
    const movies1$ = this.http.get('assets/data/movies.json').pipe(
      catchError(() => of([]))
    );
    
    // const movies2$ = this.http.get('assets/data/movies2.json').pipe(
    //   catchError(() => of([]))
    // );

    // Combine both results
    forkJoin([movies1$]).subscribe({
      next: ([data1]) => {
        // Process first file
        const processed1 = this.processData(data1);
        
        // Process second file
        // const processed2 = this.processData(data2);
        
        // Combine both arrays
        this.moviesData = [...processed1];
        this.isDataLoaded = true;
        
        console.log(`✅ Loaded ${this.moviesData.length} movies (${processed1.length}`);
      },
      error: (err) => {
        console.error('Error loading movies:', err);
        this.moviesData = this.fallbackMovies;
        this.isDataLoaded = true;
      }
    });
  }

  private processData(response: any): any[] {
    // Handle different JSON formats
    if (Array.isArray(response)) {
      return response;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.results && Array.isArray(response.results)) {
      return response.results;
    } else if (response.movies && Array.isArray(response.movies)) {
      return response.movies;
    } else {
      return [];
    }
  }

  analyzeMovieSentiment(movieTitle: string): Observable<any> {
    const searchTerm = movieTitle.toLowerCase().trim();
    
    if (!this.isDataLoaded) {
      return of(this.findMovieInData(this.fallbackMovies, searchTerm, movieTitle));
    }
    
    return of(this.findMovieInData(this.moviesData, searchTerm, movieTitle));
  }

  private findMovieInData(data: any[], searchTerm: string, originalTitle: string): any {
    // Try to find movie with different search strategies
    let movie = null;
    
    // 1. Exact match
    movie = data.find(m => 
      m.title && m.title.toLowerCase() === searchTerm
    );
    
    // 2. Contains match  
    if (!movie) {
      movie = data.find(m => 
        m.title && m.title.toLowerCase().includes(searchTerm)
      );
    }
    
    // 3. Partial match
    if (!movie) {
      movie = data.find(m => 
        m.title && searchTerm.includes(m.title.toLowerCase().substring(0, 4))
      );
    }
    
    // 4. Fuzzy match for short queries
    if (!movie && searchTerm.length > 3) {
      movie = data.find(m => 
        m.title && m.title.toLowerCase().startsWith(searchTerm.substring(0, 3))
      );
    }

    if (movie) {
      console.log(`🎬 Found: ${movie.title}`);
      return this.createAnalysis(movie, true);
    } else {
      console.log(`📝 Not found, using mock: ${originalTitle}`);
      return this.createAnalysis({title: originalTitle}, false);
    }
  }

  private createAnalysis(movie: any, isReal: boolean): any {
    if (isReal) {
      // Extract data from Kaggle format
      const rating = movie.vote_average || movie.rating || 5.0;
      const voteCount = movie.vote_count || movie.voteCount || 1000;
      const year = movie.release_date ? movie.release_date.substring(0, 4) : 
                  movie.year || 'N/A';
      const title = movie.title || 'Unknown';
      
      // Calculate sentiment
      const sentimentType = rating >= 7 ? 'positive' : rating >= 5 ? 'neutral' : 'negative';
      const score = rating / 10;

      return {
        real: true,
        movie: {
          title: title,
          year: year,
          director: movie.director || 'Various Directors',
          genre: this.parseGenres(movie.genres) || 'Various',
          rating: rating,
          posterUrl: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : movie.posterUrl || `https://via.placeholder.com/300x450?text=${title}`,
          overview: movie.overview || 'No description available.',
          voteCount: voteCount,
          popularity: movie.popularity || 0
        },
        sentiment: {
          type: sentimentType,
          score: Math.min(Math.max(score, 0.1), 0.95),
          confidence: 0.8 + (voteCount / 50000),
          summary: this.generateSummary(rating, voteCount, title, true)
        },
        confidence: 0.8,
        reviewCount: voteCount,
        timestamp: new Date(),
        source: 'Movie Database'
      };
    } else {
      // Mock analysis
      const title = movie.title;
      const rating = 5 + Math.random() * 3;
      const voteCount = Math.floor(Math.random() * 5000) + 1000;
      const sentimentType = rating >= 7 ? 'positive' : rating >= 5 ? 'neutral' : 'negative';
      
      return {
        real: false,
        movie: {
          title: title,
          year: new Date().getFullYear() - Math.floor(Math.random() * 20),
          director: 'Unknown Director',
          genre: 'Various Genres',
          rating: rating,
          posterUrl: `https://via.placeholder.com/300x450/667eea/ffffff?text=${encodeURIComponent(title.substring(0, 15))}`,
          overview: 'This movie data is not available in our dataset.',
          voteCount: voteCount
        },
        sentiment: {
          type: sentimentType,
          score: rating / 10,
          confidence: 0.7,
          summary: this.generateSummary(rating, voteCount, title, false)
        },
        confidence: 0.7,
        reviewCount: voteCount,
        timestamp: new Date(),
        source: 'Demo Mode'
      };
    }
  }

  private parseGenres(genres: any): string {
    if (!genres) return 'Various';
    
    try {
      if (typeof genres === 'string') {
        // Parse JSON string like '[{"id":28,"name":"Action"}]'
        const parsed = JSON.parse(genres.replace(/'/g, '"'));
        return parsed.map((g: any) => g.name).join(', ');
      } else if (Array.isArray(genres)) {
        return genres.map(g => g.name).join(', ');
      }
    } catch (e) {
      console.log('Error parsing genres:', e);
    }
    
    return 'Various';
  }

  private generateSummary(rating: number, votes: number, title: string, isReal: boolean): string {
    const roundedRating = rating.toFixed(1);
    
    if (isReal) {
      if (rating >= 8.0) {
        return `"${title}" is highly acclaimed with ${roundedRating}/10 rating from ${votes.toLocaleString()} votes. Critics and audiences love it!`;
      } else if (rating >= 6.0) {
        return `"${title}" has generally positive reviews (${roundedRating}/10). ${votes.toLocaleString()} viewers rated it above average.`;
      } else {
        return `"${title}" has mixed to negative reviews (${roundedRating}/10). Reception is divided among ${votes.toLocaleString()} voters.`;
      }
    } else {
      return `Demo analysis for "${title}". In production, this would show real ratings from thousands of viewers.`;
    }
  }

  // NEW: Get statistics about loaded data
  getMovieStats() {
    return {
      totalMovies: this.moviesData.length,
      loaded: this.isDataLoaded,
      sampleMovies: this.moviesData.slice(0, 5).map(m => m.title)
    };
  }
}