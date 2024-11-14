import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap, timeout } from 'rxjs/operators';
import { Favorite } from '../interfaces/favorite.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private apiUrl = `${environment.apiUrl}/favorites`;
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }
  private weatherCache = new Map<
    string,
    {
      data: any;
      meteogramData: any;
      timestamp: number;
    }
  >();

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.error || error.message;
    }
    return throwError(() => new Error(errorMessage));
  }

  private loadFavorites() {
    this.http
      .get<Favorite[]>(this.apiUrl)
      .pipe(
        timeout(10000),
        catchError((error) => {
          console.error('Error loading favorites:', error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (favorites) => {
          console.log('Loaded favorites:', favorites);
          this.favoritesSubject.next(favorites || []);
        },
        error: (error) => {
          console.error('Favorites load error:', error);
          this.favoritesSubject.next([]);
        },
      });
  }

  getFavorites(): Observable<Favorite[]> {
    return this.favoritesSubject.asObservable();
  }

  addFavorite(city: string, state: string): Observable<Favorite> {
    return this.http.post<Favorite>(this.apiUrl, { city, state }).pipe(
      tap((favorite) => {
        const currentFavorites = this.favoritesSubject.value;
        this.favoritesSubject.next([...currentFavorites, favorite]);
      }),
      catchError(this.handleError)
    );
  }

  removeFavorite(city: string, state: string): Observable<void> {
    const favorite = this.favoritesSubject.value.find(
      (f) =>
        f.city.toLowerCase() === city.toLowerCase() &&
        f.state.toLowerCase() === state.toLowerCase()
    );

    if (!favorite?._id) {
      return throwError(() => new Error('Favorite not found'));
    }

    return this.http.delete<void>(`${this.apiUrl}/${favorite._id}`).pipe(
      tap(() => {
        const currentFavorites = this.favoritesSubject.value;
        this.favoritesSubject.next(
          currentFavorites.filter((f) => f._id !== favorite._id)
        );
      }),
      catchError(this.handleError)
    );
  }

  isFavorite(city: string, state: string): Observable<boolean> {
    return this.favoritesSubject
      .asObservable()
      .pipe(
        map((favorites) =>
          favorites.some(
            (f) =>
              f.city.toLowerCase() === city.toLowerCase() &&
              f.state.toLowerCase() === state.toLowerCase()
          )
        )
      );
  }

  // New methods for weather data caching

  private getCacheKey(city: string, state: string): string {
    return `${city.toLowerCase()},${state.toLowerCase()}`;
  }

  private clearWeatherCache(city: string, state: string) {
    this.weatherCache.delete(this.getCacheKey(city, state));
  }

  getCachedWeatherData(
    city: string,
    state: string
  ): {
    weatherData: any;
    meteogramData: any;
    isFresh: boolean;
  } | null {
    const cacheKey = this.getCacheKey(city, state);
    const cachedData = this.weatherCache.get(cacheKey);

    if (!cachedData) {
      return null;
    }

    // Check if data is less than 1 hour old
    const isFresh = Date.now() - cachedData.timestamp < 3600000;

    return {
      weatherData: cachedData.data,
      meteogramData: cachedData.meteogramData,
      isFresh,
    };
  }

  cacheWeatherData(
    city: string,
    state: string,
    weatherData: any,
    meteogramData: any
  ) {
    const cacheKey = this.getCacheKey(city, state);
    this.weatherCache.set(cacheKey, {
      data: weatherData,
      meteogramData: meteogramData,
      timestamp: Date.now(),
    });
  }

  clearAllWeatherCache() {
    this.weatherCache.clear();
  }
}
