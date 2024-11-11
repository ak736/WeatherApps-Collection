import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favourites.service';
import { Favorite } from '../../interfaces/favorite.interface';

@Component({
  selector: 'app-favorites-table',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .alert-warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
      padding: 0.75rem 1.25rem;
      margin: 1rem 0;
      border: 1px solid transparent;
      border-radius: 0.25rem;
    }
  `],
  template: `
    @if (favorites.length === 0) {
      <div class="alert-warning">
        Sorry! No records found.
      </div>
    } @else {
      <div class="table-responsive mt-4">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>City</th>
              <th>State</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (favorite of favorites; track favorite._id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ favorite.city }}</td>
                <td>{{ favorite.state }}</td>
                <td>
                  <button class="btn btn-link" (click)="removeFavorite(favorite.city, favorite.state)">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class FavoritesTableComponent implements OnInit {
  favorites: Favorite[] = [];

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    this.favoritesService.getFavorites().subscribe(
      favorites => this.favorites = favorites
    );
  }

  removeFavorite(city: string, state: string) {
    this.favoritesService.removeFavorite(city, state).subscribe();
  }
}