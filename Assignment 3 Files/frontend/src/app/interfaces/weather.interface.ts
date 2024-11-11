export interface WeatherResponse {
  location: {
    city: string;
    state: string;
    lat: string | number;
    lon: string | number;
    street?: string;
  };
  forecast: {
    data: {
      timelines: Array<{
        intervals: Array<{
          startTime: string;
          values: {
            temperatureMax: number;
            temperatureMin: number;
            temperatureApparent?: number;
            windSpeed?: number;
            weatherCode?: number;
            sunriseTime?: string;
            sunsetTime?: string;
            humidity?: number;
            visibility?: number;
            cloudCover?: number;
          };
        }>;
      }>;
    };
  };
}

export interface LocationInfo {
  street?: string;
  city?: string;
  state?: string;
  lat?: number | string;
  lon?: number | string;
}
