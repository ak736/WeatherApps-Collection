// src/app/services/favourites.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Favorite } from '../interfaces/favorite.interface';
import { map } from 'rxjs/operators';  // Add this import

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = 'http://localhost:3000/api/favorites';
  private favoritesSubject = new BehaviorSubject<Favorite[]>([]);

  constructor(private http: HttpClient) {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.http.get<Favorite[]>(this.apiUrl)
      .subscribe(favorites => {
        this.favoritesSubject.next(favorites);
      });
  }
  isFavorite(city: string, state: string): Observable<boolean> {
    return this.favoritesSubject.pipe(
      map(favorites => favorites.some(f => 
        f.city.toLowerCase() === city.toLowerCase() && 
        f.state.toLowerCase() === state.toLowerCase()
      ))
    );
  }

  getFavorites(): Observable<Favorite[]> {
    return this.favoritesSubject.asObservable();
  }

  addFavorite(city: string, state: string): Observable<Favorite> {
    return new Observable(observer => {
      this.http.post<Favorite>(this.apiUrl, { city, state }).subscribe({
        next: (favorite) => {
          const currentFavorites = this.favoritesSubject.value;
          this.favoritesSubject.next([...currentFavorites, favorite]);
          observer.next(favorite);
          observer.complete();
        },
        error: (error) => observer.error(error)
      });
    });
  }

  removeFavorite(city: string, state: string): Observable<void> {
    return new Observable(observer => {
      const favorite = this.favoritesSubject.value.find(f => 
        f.city.toLowerCase() === city.toLowerCase() && 
        f.state.toLowerCase() === state.toLowerCase()
      );

      if (favorite && favorite._id) {
        this.http.delete(`${this.apiUrl}/${favorite._id}`).subscribe({
          next: () => {
            const currentFavorites = this.favoritesSubject.value;
            this.favoritesSubject.next(
              currentFavorites.filter(f => f._id !== favorite._id)
            );
            observer.next();
            observer.complete();
          },
          error: (error) => observer.error(error)
        });
      }
    });
  }
}