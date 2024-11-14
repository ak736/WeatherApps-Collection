// src/app/interfaces/favorite.interface.ts
export interface Favorite {
  _id?: string;  // MongoDB's document ID
  city: string;
  state: string;
  weatherData?: any;  // Store the initial weather data
  lastUpdated?: Date;
}