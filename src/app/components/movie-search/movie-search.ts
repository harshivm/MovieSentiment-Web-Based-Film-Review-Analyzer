import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-movie-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movie-search.html',
  styleUrls: ['./movie-search.css']
})
export class MovieSearchComponent {
  @Output() search = new EventEmitter<string>();
  
  searchForm: FormGroup;
  isSubmitted = false;
  recentSearches: string[] = ['Inception', 'Parasite', 'Interstellar', 'The Dark Knight'];

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      movieTitle: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;
    
    if (this.searchForm.valid) {
      const movieTitle = this.searchForm.get('movieTitle')?.value.trim();
      this.search.emit(movieTitle);
      
      // Add to recent searches
      if (!this.recentSearches.includes(movieTitle)) {
        this.recentSearches.unshift(movieTitle);
        if (this.recentSearches.length > 5) {
          this.recentSearches.pop();
        }
      }
    }
  }

  clearSearch(): void {
    this.searchForm.reset();
    this.isSubmitted = false;
  }

  setSearchValue(movieTitle: string): void {
    this.searchForm.patchValue({ movieTitle });
  }

  get movieTitleControl() {
    return this.searchForm.get('movieTitle');
  }

  getErrorMessage(): string {
    const control = this.movieTitleControl;
    
    if (control?.hasError('required')) {
      return 'Movie title is required';
    }
    
    if (control?.hasError('minlength')) {
      return 'Movie title must be at least 2 characters';
    }
    
    return '';
  }
}