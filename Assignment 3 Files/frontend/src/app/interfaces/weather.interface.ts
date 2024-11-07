export interface WeatherResponse {
  location: {
    city: string;
    state: string;
    lat: string;
    lon: string;
  };
  forecast: {
    data: {
      timelines: {
        intervals: Array<{
          startTime: string;
          values: {
            temperature: number;
            temperatureMax: number;
            temperatureMin: number;
            weatherCode: number;
            windSpeed: number;
          };
        }>;
      }[];
    };
  };
}