import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { WeatherDetailsComponent } from './components/weather-details/weather-details.component';
import { DetailsPaneComponent } from './components/details-pane/details-pane.component';
import { WeatherService } from './services/weather.service';
import { LocationInfo } from './interfaces/weather.interface';
import { FavoritesTableComponent } from './components/favorites-table/favorites-table.component';
// app.component.ts
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SearchFormComponent, WeatherDetailsComponent, DetailsPaneComponent, FavoritesTableComponent],
  template: `
    <div class="app-container">
      <app-search-form
        (locationChange)="onLocationChange($event)"
      ></app-search-form>
      <div class="content-area">
        <div class="weather-content" [class.slide-out]="selectedDay">
          <app-weather-details 
            (daySelected)="onDaySelected($event)"
          ></app-weather-details>
        </div>
        <div class="details-content" [class.slide-in]="selectedDay">
          <app-details-pane 
            *ngIf="selectedDay" 
            [weatherDetails]="selectedDay"
            [locationInfo]="locationDetails"
            (back)="selectedDay = null"
          ></app-details-pane>
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  selectedDay: any = null;
  locationDetails: any = null;
  weatherData: any = null;
  activeTab = 'Favorites';
  constructor(private weatherService: WeatherService) {}
  handleLocationSearch(location: LocationInfo) {
    // Switch to Results tab
    this.activeTab = 'Results';
    
    // Trigger the weather search
    this.weatherService.getAddressWeather(location).subscribe({
      next: (response) => {
        // Handle the weather data same way as your normal search
        // Update your results display
      },
      error: (error) => console.error('Error loading weather:', error)
    });
  }

  onLocationChange(data: any) {
    console.log('Location data received:', data); // Debug log
    this.locationDetails = {
      street: data.street || '',
      city: data.city,
      state: data.state,
      lat: data.location?.lat || data.lat,  // Add these
    lon: data.location?.lon || data.lon    // Add these
    };
    this.weatherData = data.weatherData;
  }

  onDaySelected(day: any) {
    console.log('Day selected:', day); // Debug log
    console.log('Current location details:', this.locationDetails); // Debug log
    this.selectedDay = day;
  }
}