import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WeatherUtilsService } from '../../services/weather-utils.service';
// import { GoogleMapsModule } from '@angular/google-maps';
// import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-details-pane',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './details-pane.component.html',
  styleUrl: './details-pane.component.css',
  providers: [DatePipe, WeatherUtilsService]
})
export class DetailsPaneComponent {
  @Input() weatherDetails: any;
  @Input() locationInfo: any; // Add this to receive location details
  @Output() back = new EventEmitter<void>();

  constructor(
    private datePipe: DatePipe,
    private weatherUtils: WeatherUtilsService
  ) {}

  getTweetUrl(): void {
    const street = this.weatherDetails?.location?.street || 'Unknown Street';
    const city = this.weatherDetails?.location?.city || 'Unknown City';
    const state = this.weatherDetails?.location?.state || 'Unknown State';
    const date = new Date(this.weatherDetails?.startTime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const temperature = this.weatherDetails?.values?.temperatureMax || 'N/A';
    const weatherCode = this.weatherDetails?.values?.weatherCode;
    const conditions = this.weatherUtils.getWeatherDescription(weatherCode);
    // const description = this.getWeatherDescription(this.weatherDetails?.values?.weatherCode) || 'Unknown';
  
    const tweetText = `The temperature in ${street}, ${city}, ${state} on ${date} is ${temperature}°F and the conditions are ${conditions} #CSCI571WeatherForecast`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
  
    window.open(url, '_blank');
  }
}