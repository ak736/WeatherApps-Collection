import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { PlacePrediction } from '../interfaces/place-prediction.interface';
import { environment } from '../../environments/environment';
// import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private apiUrl = environment.apiUrl;
  private isAutocompleteEnabled = true;

  constructor(private http: HttpClient) { }

  getPlacePredictions(input: string): Observable<PlacePrediction[]> {
    // Return empty if autocomplete is disabled or no input
    if (!this.isAutocompleteEnabled || !input?.trim()) {
      return of([]);
    }

    return this.http.get<any>(`${this.apiUrl}/places/autocomplete`, {
      params: {
        input: input.trim(),
        types: '(cities)' // Restrict to cities only
      }
    }).pipe(
      map(predictions => {
        console.log('Raw API response:', predictions);
        if (!predictions || !Array.isArray(predictions)) {
          this.isAutocompleteEnabled = false;
          return [];
        }
        
        return predictions.map((prediction, index) => {
          try {
            const parts: string[] = prediction.description.split(',').map((part: string) => part.trim());
            return {
              id: `${parts[0]}-${parts[1]}-${index}`, // Add unique identifier
              city: parts[0],
              state: parts[1]?.replace('USA', '').trim() || '',
              description: prediction.description,
              place_id: prediction.place_id
            };
          } catch (error) {
            console.error('Error parsing prediction:', error);
            return null;
          }
        }).filter(p => p !== null) as PlacePrediction[]; // Remove any failed parses
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        this.isAutocompleteEnabled = false; // Disable on error
        return of([]);
      })
    );
  }
}