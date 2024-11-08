import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { GooglePlacesService } from '../../services/google-places.service';
import { PlacePrediction } from '../../interfaces/place-prediction.interface';
import { WeatherUtilsService } from '../../services/weather-utils.service';
import { WeatherResponse } from '../../interfaces/weather.interface';
import { HttpClient } from '@angular/common/http';
import { DailyTempChartComponent } from '../daily-temp-chart/daily-temp-chart.component';
import { MeteogramComponent } from '../meteogram/meteogram.component';

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    DailyTempChartComponent,
    MeteogramComponent,
  ],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.css',
})
export class SearchFormComponent implements OnInit {
  searchForm!: FormGroup;
  filteredCities$!: Observable<PlacePrediction[]>;
  weatherData: any = null;
  isLoading = false;
  error: string | null = null;
  activeTab: 'results' | 'favorites' = 'results';
  showResults = false;
  currentLocation: { city: string; state: string } | null = null;
  // Add to existing properties
  currentView: 'day' | 'temp' | 'meteogram' = 'day';

  // Add this new method
  switchView(view: 'day' | 'temp' | 'meteogram'): void {
    this.currentView = view;
  }

  states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ];

  favorites: any[] = [];

  constructor(
    private fb: FormBuilder,
    private placesService: GooglePlacesService,
    private http: HttpClient,
    private weatherUtils: WeatherUtilsService
  ) {
    this.initForm();
  }

  getWeatherDescription(code: number): string {
    return this.weatherUtils.getWeatherDescription(code);
  }

  getWeatherIcon(code: number): string {
    return this.weatherUtils.getWeatherIcon(code);
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      useCurrentLocation: [false],
    });

    this.searchForm
      .get('useCurrentLocation')
      ?.valueChanges.subscribe((checked) => {
        const controls = ['street', 'city', 'state'];
        controls.forEach((control) => {
          const formControl = this.searchForm.get(control);
          if (checked) {
            formControl?.disable();
            // this.fetchWeatherUsingCurrentLocation();
          } else {
            formControl?.enable();
          }
        });
      });
  }

  ngOnInit(): void {
    this.filteredCities$ = this.searchForm.get('city')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value || typeof value === 'object') return of([]);
        return this.placesService.getPlacePredictions(value);
      })
    );
  }

  displayFn = (prediction: any): string => {
    if (!prediction) return '';
    return typeof prediction === 'object' ? prediction.city : prediction;
  };

  onOptionSelected = (event: MatAutocompleteSelectedEvent): void => {
    const prediction = event.option.value;
    console.log('Option selected:', prediction);

    if (prediction && prediction.city) {
      this.searchForm.patchValue({
        city: prediction.city,
        state: prediction.state || '',
      });
    }
  };

  switchTab(tab: 'results' | 'favorites'): void {
    this.activeTab = tab;
  }

  // search-form.component.ts
  onSubmit(): void {
    if (
      this.searchForm.invalid &&
      !this.searchForm.get('useCurrentLocation')?.value
    ) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.showResults = true; // Set this to true when search is clicked

    if (this.searchForm.get('useCurrentLocation')?.value) {
      this.fetchWeatherUsingCurrentLocation();
    } else {
      this.fetchWeatherUsingAddress();
    }
  }

  private filterCurrentAndFutureDates(intervals: any[]): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return intervals
      .map((interval) => ({
        startTime: interval.startTime,
        values: {
          ...interval.values,
          // If weatherCode is missing, use the one from minutely data
          weatherCode: interval.values.weatherCode,
          // Ensure windSpeed is properly mapped
          windSpeed: interval.values.windSpeed,
        },
      }))
      .filter((interval) => {
        const intervalDate = new Date(interval.startTime);
        intervalDate.setHours(0, 0, 0, 0);
        return intervalDate >= today;
      })
      .slice(0, 7);
  }

  // Update your fetchWeatherUsingCurrentLocation method
  fetchWeatherUsingCurrentLocation(): void {
    this.isLoading = true;
    this.error = null;

    this.http
      .get<WeatherResponse>('http://localhost:3000/api/location-weather')
      .subscribe({
        next: (response) => {
          console.log('Weather response:', response);

          const filteredIntervals = this.filterCurrentAndFutureDates(
            response.forecast.data.timelines[0].intervals
          );
          this.weatherData = filteredIntervals;
          this.currentLocation = {
            city: response.location.city,
            state: response.location.state,
          };
          this.isLoading = false;
          this.activeTab = 'results';
        },
        error: (error) => {
          console.error('Error:', error);
          this.error =
            'Failed to fetch weather data: ' +
            (error.message || 'Unknown error');
          this.isLoading = false;
        },
      });
  }

  // Update your fetchWeatherUsingAddress method
  fetchWeatherUsingAddress(): void {
    if (this.searchForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const params = {
      street: this.searchForm.get('street')?.value,
      city: this.searchForm.get('city')?.value,
      state: this.searchForm.get('state')?.value,
    };

    this.http
      .get<WeatherResponse>('http://localhost:3000/api/address-weather', {
        params,
      })
      .subscribe({
        next: (response) => {
          const filteredIntervals = this.filterCurrentAndFutureDates(
            response.forecast.data.timelines[0].intervals
          );
          this.weatherData = filteredIntervals;
          this.currentLocation = {
            city: params.city,
            state: params.state,
          };
          this.isLoading = false;
          this.activeTab = 'results';
        },
        error: (error) => {
          console.error('Error:', error);
          this.error =
            'Failed to fetch weather data: ' +
            (error.message || 'Unknown error');
          this.isLoading = false;
        },
      });
  }

  // Update your onClear method
  onClear(): void {
    this.searchForm.reset();
    this.searchForm.get('useCurrentLocation')?.setValue(false);
    this.weatherData = null;
    this.error = null;
    this.showResults = false; // Hide results when clearing
    this.currentLocation = null;
  }
}
