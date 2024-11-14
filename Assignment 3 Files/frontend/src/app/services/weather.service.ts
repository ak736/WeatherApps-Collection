import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeatherResponse, LocationInfo } from '../interfaces/weather.interface';
import { environment } from '../../environments/environment';
// import { environment } from '../../environments/environment.development';

interface MeteogramDataPoint {
  time: string;
  values: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  }
}

@Injectable({
  providedIn: 'root'
})

export class WeatherService {
  // private readonly API_URL = environment.apiUrl;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getLocationWeather(): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/location-weather`);
  }

  getAddressWeather(location: LocationInfo): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.apiUrl}/address-weather`, {
      params: {
        street: location.street || '',
        city: location.city || '',
        state: location.state || ''
      }
    });
  }
  getMeteogramData(lat: number, lon: number): Observable<MeteogramDataPoint[]> {
    return this.http.get<MeteogramDataPoint[]>(`${this.apiUrl}/meteogram-data`, {
      params: {
        lat: lat.toString(),
        lon: lon.toString()
      }
    });
  }
}