import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherResponse, LocationInfo } from '../interfaces/weather.interface';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly API_URL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getLocationWeather(): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.API_URL}/location-weather`);
  }

  getAddressWeather(location: LocationInfo): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.API_URL}/address-weather`, {
      params: {
        street: location.street || '',
        city: location.city || '',
        state: location.state || ''
      }
    });
  }
}