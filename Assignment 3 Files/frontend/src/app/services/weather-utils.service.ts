import { Injectable } from '@angular/core';

interface WeatherCode {
  img: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherUtilsService {
  private weatherCodeMap: { [key: number]: WeatherCode } = {
    1000: { img: 'clear_day.svg', description: 'Clear' },
    1001: { img: 'cloudy.svg', description: 'Cloudy' },
    4000: { img: 'drizzle.svg', description: 'Drizzle' },
    5001: { img: 'flurries.svg', description: 'Flurries' },
    2100: { img: 'fog_light.svg', description: 'Light Fog' },
    2000: { img: 'fog.svg', description: 'Fog' },
    6000: { img: 'freezing_drizzle.svg', description: 'Freezing Drizzle' },
    6201: { img: 'freezing_rain_heavy.svg', description: 'Heavy Freezing Rain' },
    6200: { img: 'freezing_rain_light.svg', description: 'Light Freezing Rain' },
    6001: { img: 'freezing_rain.svg', description: 'Freezing Rain' },
    7101: { img: 'ice_pellets_heavy.svg', description: 'Heavy Ice Pellets' },
    7102: { img: 'ice_pellets_light.svg', description: 'Light Ice Pellets' },
    7000: { img: 'ice_pellets.svg', description: 'Ice Pellets' },
    1100: { img: 'mostly_clear_day.svg', description: 'Mostly Clear' },
    1102: { img: 'mostly_cloudy.svg', description: 'Mostly Cloudy' },
    1101: { img: 'partly_cloudy_day.svg', description: 'Partly Cloudy' },
    4201: { img: 'rain_heavy.svg', description: 'Heavy Rain' },
    4200: { img: 'rain_light.svg', description: 'Light Rain' },
    4001: { img: 'rain.svg', description: 'Rain' },
    5101: { img: 'snow_heavy.svg', description: 'Heavy Snow' },
    5100: { img: 'snow_light.svg', description: 'Light Snow' },
    5000: { img: 'snow.svg', description: 'Snow' },
    8000: { img: 'tstorm.svg', description: 'Thunderstorm' }
  };

  getWeatherDescription(code: number): string {
    return this.weatherCodeMap[code]?.description || 'Clear Day';
  }

  getWeatherIcon(code: number): string {
    return this.weatherCodeMap[code]?.img || 'clear_day.svg';
  }
}