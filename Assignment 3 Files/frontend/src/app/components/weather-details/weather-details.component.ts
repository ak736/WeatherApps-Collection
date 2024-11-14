import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FavoritesService } from '../../services/favourites.service';
@Component({
  selector: 'app-weather-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-details.component.html',
  styleUrls: ['./weather-details.component.css']
})
export class WeatherDetailsComponent implements OnInit {
  @Output() daySelected = new EventEmitter<any>();
  weatherData: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['favoriteId']) {
        // Get weather data from favorites
        this.favoritesService.getFavorites().subscribe(favorites => {
          const favorite = favorites.find(f => f._id === params['favoriteId']);
          if (favorite?.weatherData) {
            this.weatherData = favorite.weatherData;
          }
        });
      }
    });
  }

  showDetails(day: any) {
    this.daySelected.emit(day);
  }
}