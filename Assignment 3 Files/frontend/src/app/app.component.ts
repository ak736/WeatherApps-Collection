import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchFormComponent } from './components/search-form/search-form.component';
import { WeatherDetailsComponent } from './components/weather-details/weather-details.component';
import { DetailsPaneComponent } from './components/details-pane/details-pane.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SearchFormComponent, WeatherDetailsComponent, DetailsPaneComponent],
  template: `
    <div class="app-container">
      <app-search-form></app-search-form>
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
  onLocationChange(data: any) {
    this.locationDetails = {
      street: data.street || '',
      city: data.city,
      state: data.state
    };
    this.weatherData = data.weatherData;
  }
  onDaySelected(day: any) {
    this.selectedDay = day;
  }
}