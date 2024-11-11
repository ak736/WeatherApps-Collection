import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WeatherUtilsService } from '../../services/weather-utils.service';
import { LocationInfo } from '../../interfaces/weather.interface';

declare const google: any;
declare global {
  interface Window {
    google: typeof google;
  }
}

@Component({
  selector: 'app-details-pane',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-pane.component.html',
  styleUrl: './details-pane.component.css',
  providers: [DatePipe, WeatherUtilsService],
})
export class DetailsPaneComponent implements OnInit {
  @Input() locationInfo!: LocationInfo | null;
  @Input() weatherDetails: any;
  @Output() back = new EventEmitter<void>();
  private map: any;
  private marker: any;

  constructor(
    private datePipe: DatePipe,
    private weatherUtils: WeatherUtilsService
  ) {}

  formatTime(time: string): string {
    if (!time) return '';
    const date = new Date(time);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    return `${hours} ${ampm}`;
  }

  formatPercent(value: number): string {
    if (value == null) return '';
    return `${Math.round(value)}%`;
  }

  formatNumber(value: number, decimals: number = 2): string {
    if (value == null) return '';
    return value.toFixed(decimals);
  }

  ngOnInit() {
    console.log('Location Info in details-pane:', this.locationInfo);
    if (this.locationInfo?.lat && this.locationInfo?.lon) {
      this.initMap();
    }
  }
  private waitForGoogleMaps(): Promise<void> {
    return new Promise((resolve) => {
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle);
          resolve();
        }
      }, 100);
    });
  }

  private initMap(): void {
    if (!this.locationInfo?.lat || !this.locationInfo?.lon) {
      console.error('Location information is missing', this.locationInfo);
      return;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Map element not found');
      return;
    }

    try {
      const position = {
        lat: Number(this.locationInfo.lat),
        lng: Number(this.locationInfo.lon),
      };

      const mapOptions = {
        zoom: 13,
        center: position,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapId: '7159bbeb33d6a024',
        disableDefaultUI: false,
        clickableIcons: false,
      };

      this.map = new google.maps.Map(mapElement, mapOptions);

      // Use regular Marker instead of AdvancedMarkerElement
      new google.maps.Marker({
        position: position,
        map: this.map,
        title: `${this.locationInfo.city}, ${this.locationInfo.state}`,
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  getWeatherDescription(code: number): string {
    return this.weatherUtils.getWeatherDescription(code);
  }

  getTweetUrl(): void {
    const locationParts = [];

    if (this.locationInfo?.street?.trim()) {
      locationParts.push(this.locationInfo.street);
    }
    if (this.locationInfo?.city) locationParts.push(this.locationInfo.city);
    if (this.locationInfo?.state) locationParts.push(this.locationInfo.state);

    const location =
      locationParts.length > 0 ? locationParts.join(', ') : 'Unknown Location';

    const date = this.datePipe.transform(
      this.weatherDetails?.startTime,
      'EEEE, MMM. d, y'
    );
    const temperature = this.weatherDetails?.values?.temperatureMax?.toFixed(2);
    const weatherCode = this.weatherDetails?.values?.weatherCode;
    const conditions = this.weatherUtils.getWeatherDescription(weatherCode);

    const tweetText = `The temperature in ${location} on ${date} is ${temperature}°F and the conditions are ${conditions} #CSCI571WeatherForecast`;

    console.log('Tweet text:', tweetText); // Debug log

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      '_blank'
    );
  }
}
