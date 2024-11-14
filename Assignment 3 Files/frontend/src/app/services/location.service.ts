// location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LocationInfo } from '../interfaces/weather.interface';

interface IpInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  timezone: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private ipinfoToken = environment.ipInfoToken;

  constructor(private http: HttpClient) {}

  getCurrentLocation(): Observable<LocationInfo> {
    return this.http.get<IpInfoResponse>(`https://ipinfo.io/json?token=${this.ipinfoToken}`).pipe(
      map(ipData => {
        const [lat, lon] = ipData.loc.split(',').map(Number);
        return {
          street: '',
          city: ipData.city,
          state: ipData.region,
          lat,
          lon
        };
      })
    );
  }
}