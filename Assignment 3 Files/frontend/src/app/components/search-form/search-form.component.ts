import { Component, OnInit, EventEmitter, Output } from '@angular/core';
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
import { debounceTime, distinctUntilChanged, switchMap, finalize, take } from 'rxjs/operators';
import { GooglePlacesService } from '../../services/google-places.service';
import { PlacePrediction } from '../../interfaces/place-prediction.interface';
import { WeatherUtilsService } from '../../services/weather-utils.service';
import { WeatherResponse } from '../../interfaces/weather.interface';
import { HttpClient } from '@angular/common/http';
import { DailyTempChartComponent } from '../daily-temp-chart/daily-temp-chart.component';
import { MeteogramComponent } from '../meteogram/meteogram.component';
import { DetailsPaneComponent } from '../details-pane/details-pane.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { LocationInfo } from '../../interfaces/weather.interface'; // Add this import
import { FavoritesService } from '../../services/favourites.service'; 
import { FavoritesTableComponent } from '../favorites-table/favorites-table.component';  // Add this import

interface ProcessedData {
  hourly: any[];
  // Add other properties if needed
}

interface MeteogramDataPoint {
  time: string;
  values: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  };
}
type TabType = 'results' | 'favorites';

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
    DetailsPaneComponent,
    FavoritesTableComponent
  ],
  animations: [
    trigger('slideAnimation', [
      // Slide in from right
      transition(':enter', [
        style({
          transform: 'translateX(100%)',
          position: 'absolute',
          width: '100%',
        }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' })),
      ]),
      // Slide out to right
      transition(':leave', [
        style({ position: 'absolute', width: '100%' }),
        animate('300ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
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
  isFavorite = false;
  activeTab: TabType = 'results';  // Initialize with type safety
  loadingProgress = 75;
  private progressInterval: any;
  
  
  switchTab(tab: TabType) {  // Type-safe parameter
    this.activeTab = tab;
  }
  showResults = false;
  currentLocation: LocationInfo | null = null;
  @Output() daySelected = new EventEmitter<any>();
  @Output() locationChange = new EventEmitter<any>();
  day: any;
  showDetails = false;
  selectedDayDetails: any = null;
  processedData: ProcessedData = {
    hourly: [],
  };
  meteogramData: MeteogramDataPoint[] = [];

  // Update the onDaySelected method
  onDaySelected(selectedDay: any): void {
    this.selectedDayDetails = selectedDay;
    this.showDetails = true;
  }

  // Add this method
  onBackToList() {
    this.showDetails = false;
    this.selectedDayDetails = null;
  }

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
    private weatherUtils: WeatherUtilsService,
    private favoritesService: FavoritesService,
  ) {
    this.initForm();
  }
 

  addToFavorites() {
    if (this.currentLocation) {
      this.favoritesService.addFavorite(
        this.currentLocation.city,
        this.currentLocation.state
      );
    }
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
    this.checkIfFavorite();
  }
  // Add this method to check favorite status
  private checkIfFavorite(): void {
    if (this.currentLocation) {
      this.favoritesService.isFavorite(
        this.currentLocation.city,
        this.currentLocation.state
      ).subscribe({
        next: (isFav: boolean) => {  // Add type annotation here
          this.isFavorite = isFav;
        }
      });
    }
  }
  displayFn = (prediction: any): string => {
    if (!prediction) return '';
    return typeof prediction === 'object' ? prediction.city : prediction;
  };

  onOptionSelected = (event: MatAutocompleteSelectedEvent): void => {
    const prediction = event.option.value;
    if (prediction && prediction.city) {
      this.searchForm.patchValue({
        city: prediction.city,
        state: prediction.state || '',
      });
    }
  };

  // search-form.component.ts
  onSubmit(): void {
    if (
      this.searchForm.invalid &&
      !this.searchForm.get('useCurrentLocation')?.value
    ) {
      return;
    }

    this.handleLoadingState(true);
    this.error = null;
    this.showResults = true; // Set this to true when search is clicked

    if (this.searchForm.get('useCurrentLocation')?.value) {
      this.fetchWeatherUsingCurrentLocation();
    } else {
      this.fetchWeatherUsingAddress();
    }
  }

  private fetchMeteogramData(lat: number | string, lon: number | string) {
    return this.http.get<any[]>('http://localhost:3000/api/meteogram-data', {
      params: { lat: lat.toString(), lon: lon.toString() },
    });
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
          temperatureApparent: interval.values.temperatureApparent,
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
  // Update your existing method that handles loading state
  private async handleLoadingState(loading: boolean) {
    if (!loading) {
      // Immediately clear everything when loading is false
      if (this.progressInterval) {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
      this.loadingProgress = 0;
      this.isLoading = false;
      await Promise.resolve();
      return;
    }
    
    this.isLoading = true;
    this.loadingProgress = 0;
    this.simulateProgress();
  }

  private simulateProgress() {
    // Clear any existing interval first
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    
    this.progressInterval = setInterval(() => {
      if (this.isLoading && this.loadingProgress < 90) {
        this.loadingProgress += 15;
      } else {
        clearInterval(this.progressInterval);
        this.progressInterval = null;
      }
    }, 200);
  }
  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }


  public transformWeatherData(intervals: any[]): any[] {
    return intervals.map((interval) => ({
      time: new Date(interval.startTime).getTime(),
      temp:
        (interval.values.temperatureMax + interval.values.temperatureMin) / 2, // Using average temp
      humidity: interval.values.humidity,
      pressure: interval.values.pressureSurfaceLevel,
      windSpeed: interval.values.windSpeed,
      windDirection: 0, // Add this if you have wind direction data
    }));
  }

  // Update your fetchWeatherUsingCurrentLocation method
  fetchWeatherUsingCurrentLocation(): void {
    this.handleLoadingState(true);
    this.error = null;

    this.http
      .get<WeatherResponse>('http://localhost:3000/api/location-weather')
      .pipe(
        take(1),
        switchMap((response) => {
          if (!response?.forecast?.data?.timelines?.[0]?.intervals) {
            throw new Error('Unable to fetch weather data for current location');
          }
          const filteredIntervals = this.filterCurrentAndFutureDates(
            response.forecast.data.timelines[0].intervals
          );
          if (!filteredIntervals.length) {
            throw new Error('No weather data available for current location');
          }
          this.weatherData = filteredIntervals;
          this.currentLocation = {
            street: '',
            city: response.location.city,
            state: response.location.state,
            lat: Number(response.location.lat), // Convert to number
          lon: Number(response.location.lon)  // Convert to number
          };

          // Fetch meteogram data
          return this.fetchMeteogramData(
            Number(response.location.lat),
            Number(response.location.lon)
          ).pipe(take(1));
        }),
        finalize(() => {
          this.handleLoadingState(false); // This ensures loading state is always cleared
        })
      )
      .subscribe({
        next: (meteogramData) => {
          this.meteogramData = meteogramData;
          this.locationChange.emit({
            street: '',
            city: this.currentLocation?.city,
            state: this.currentLocation?.state,
            lat: this.currentLocation?.lat,
            lon: this.currentLocation?.lon,
            weatherData: this.weatherData,
            meteogramData: meteogramData,
          });
          this.handleLoadingState(false);
          this.activeTab = 'results';
          this.checkIfFavorite();
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = error.message || 'An error occurred. Please try again later.';
          // this.handleLoadingState(false);
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
      street: this.searchForm.get('street')?.value || '',
      city: this.searchForm.get('city')?.value,
      state: this.searchForm.get('state')?.value,
    };

    this.http
      .get<WeatherResponse>('http://localhost:3000/api/address-weather', {
        params,
      })
      .pipe(
        switchMap((response) => {
          if (!response?.forecast?.data?.timelines?.[0]?.intervals) {
            throw new Error('Invalid address or no weather data available');
          }
          const filteredIntervals = this.filterCurrentAndFutureDates(
            response.forecast.data.timelines[0].intervals
          );
          if (!filteredIntervals.length) {
            throw new Error('No weather data available for this location');
          }
          
          this.weatherData = filteredIntervals;
          this.currentLocation = {
            street: params.street,
            city: params.city,
            state: params.state,
            lat: Number(response.location.lat), // Convert to number
            lon: Number(response.location.lon)
          };

          // Fetch meteogram data
          return this.fetchMeteogramData(
            Number(response.location.lat),
          Number(response.location.lon)
          );
        }),
        finalize(() => {
          this.handleLoadingState(false); // This ensures loading state is always cleared
        })
      )
      .subscribe({
        next: (meteogramData) => {
          this.meteogramData = meteogramData;
          this.locationChange.emit({
            street: params.street,
            city: params.city,
            state: params.state,
            lat: this.currentLocation?.lat,
            lon: this.currentLocation?.lon,
            weatherData: this.weatherData,
            meteogramData: meteogramData,
          });
          this.handleLoadingState(false);
          this.activeTab = 'results';
          this.checkIfFavorite();
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = error.message || 'An error occurred. Please try again later.';
          this.handleLoadingState(false);
        },
      });
  }

  toggleFavorite(): void {
    if (!this.currentLocation) return;

    if (this.isFavorite) {
      this.favoritesService.removeFavorite(
        this.currentLocation.city,
        this.currentLocation.state
      ).subscribe(() => {
        this.isFavorite = false;
      });
    } else {
      this.favoritesService.addFavorite(
        this.currentLocation.city,
        this.currentLocation.state
      ).subscribe(() => {
        this.isFavorite = true;
      });
    }
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
