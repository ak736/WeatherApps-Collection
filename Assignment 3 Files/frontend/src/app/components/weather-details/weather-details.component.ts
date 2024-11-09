import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weather-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-details.component.html',
  styleUrls: ['./weather-details.component.css']
})
export class WeatherDetailsComponent {
  @Output() daySelected = new EventEmitter<any>();

  weatherData: any[] = []; // Assuming you have weather data available

  showDetails(day: any) {
    this.daySelected.emit(day);
  }
}