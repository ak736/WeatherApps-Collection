import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HighchartsChartModule } from 'highcharts-angular';
import { routes } from './app.routes';
import { importProvidersFrom } from '@angular/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    importProvidersFrom(HighchartsChartModule),
  ]
};