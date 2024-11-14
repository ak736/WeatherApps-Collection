import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favourites.service';
import { WeatherService } from '../../services/weather.service';
import { Favorite } from '../../interfaces/favorite.interface';

@Component({
  selector: 'app-favorites-table',
  standalone: true,
  imports: [CommonModule],
  styles: [
    `
      .alert-warning {
        color: #856404;
        background-color: #fff3cd;
        border-color: #ffeeba;
        padding: 0.75rem 1.25rem;
        margin: 1rem 0;
        border: 1px solid transparent;
        border-radius: 0.25rem;
      }
      .city-link {
        color: #007bff;
        cursor: pointer;
        text-decoration: none;
      }
      .city-link:hover {
        text-decoration: underline;
      }
      .material-icons {
        font-size: 1.25rem;
        vertical-align: middle;
      }
    `,
  ],
  template: `
    <!-- Error Message -->
    @if (error) {
    <div class="p-4 mb-4 bg-red-100 rounded-lg">
      <p class="text-red-800">{{ error }}</p>
    </div>
    }
    <!-- Loading Progress Bar -->
    @if (isLoading) {
    <div class="row mt-3">
      <div class="col-md-8 offset-md-2">
        <div
          class="progress"
          role="progressbar"
          [attr.aria-valuenow]="loadingProgress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="progress-bar progress-bar-striped progress-bar-animated bg-primary"
            [style.width.%]="loadingProgress"
          ></div>
        </div>
      </div>
    </div>
    } @else {
    <!-- Table (only shown when not loading) -->
    @if (favorites.length === 0) {
    <div class="alert alert-warning">Sorry! No records found.</div>
    } @else {
    <div class="table-responsive mt-4">
      <table class="table table-hover">
        <thead>
          <tr>
            <th>#</th>
            <th>City</th>
            <th>State</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (favorite of favorites; track favorite._id) {
          <tr>
            <td>{{ $index + 1 }}</td>
            <td>
              <span
                class="city-link"
                (click)="onLocationChange(favorite.city, favorite.state)"
              >
                {{ favorite.city }}
              </span>
            </td>
            <td>
              <span
                class="city-link"
                (click)="onLocationChange(favorite.city, favorite.state)"
              >
                {{ favorite.state }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-link text-danger"
                (click)="removeFavorite(favorite.city, favorite.state)"
              >
                <span class="material-icons">delete</span>
              </button>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
    } }
  `,
})
export class FavoritesTableComponent implements OnInit {
  favorites: Favorite[] = [];
  @Output() locationChange = new EventEmitter<any>();
  isLoading = false;
  loadingProgress = 0;
  private progressInterval: any;
  error: string | null = null;

  constructor(
    private favoritesService: FavoritesService,
    private weatherService: WeatherService
  ) {}

  ngOnInit() {
    this.favoritesService.getFavorites().subscribe({
      next: (favorites) => (this.favorites = favorites),
      error: (error) => console.error('Error loading favorites:', error),
    });
  }

  // Add loading state management methods
  private handleLoadingState(loading: boolean) {
    if (!loading) {
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      this.loadingProgress = 0;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.loadingProgress = 0;
    this.simulateProgress();
  }

  private simulateProgress() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    this.progressInterval = setInterval(() => {
      if (this.loadingProgress < 90) {
        this.loadingProgress += 15;
      } else {
        clearInterval(this.progressInterval);
      }
    }, 200);
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  // Update onLocationChange to use loading state
  onLocationChange(city: string, state: string) {
    this.handleLoadingState(true);
    // this.error = null;
    this.weatherService
      .getAddressWeather({
        city,
        state,
        street: '',
      })
      .subscribe({
        next: (response) => {
          const filteredIntervals =
            response.forecast.data.timelines[0].intervals;
          this.weatherService
            .getMeteogramData(
              Number(response.location.lat),
              Number(response.location.lon)
            )
            .subscribe({
              next: (meteogramData) => {
                this.locationChange.emit({
                  street: '',
                  city,
                  state,
                  lat: response.location.lat,
                  lon: response.location.lon,
                  weatherData: filteredIntervals,
                  meteogramData: meteogramData,
                  location: response.location,
                  view: 'day',
                  error: null
                });
                this.handleLoadingState(false);
              },
              error: (error) => {
                // Instead of setting local error, emit it with the location change
                this.locationChange.emit({
                  street: '',
                  city,
                  state,
                  error: error.status === 429 ? 
                    'An error occurred please try again later' : 
                    (error.error?.error || 'An error occurred. Please try again later.')
                });
                this.handleLoadingState(false);
              },
            });
        },
        error: (error) => {
          // Instead of setting local error, emit it with the location change
          this.locationChange.emit({
            street: '',
            city,
            state,
            error: error.status === 429 ? 
              'An error occurred please try again later' : 
              (error.error?.error || 'An error occurred. Please try again later.')
          });
          this.handleLoadingState(false);
        },
      });
  }

  removeFavorite(city: string, state: string) {
    this.favoritesService.removeFavorite(city, state).subscribe({
      next: () => {
        this.favoritesService
          .getFavorites()
          .subscribe((favorites) => (this.favorites = favorites));
      },
      error: (error) => console.error('Error removing favorite:', error),
    });
  }
}
