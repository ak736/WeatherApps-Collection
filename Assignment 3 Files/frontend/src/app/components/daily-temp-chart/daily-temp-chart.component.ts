import { Component, Input, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-daily-temp-chart',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    @if (isBrowser && chartOptions) {
      <div class="tab-pane fade" [class.show]="true" [class.active]="true">
        <highcharts-chart 
          [Highcharts]="Highcharts"
          [options]="chartOptions"
          style="width: 100%; height: 400px; display: block;">
        </highcharts-chart>
      </div>
    }
  `
})
export class DailyTempChartComponent implements OnInit {
  @Input() weatherData: any[] = [];
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions?: Highcharts.Options;
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    // Initialize Highcharts modules only in browser
    if (this.isBrowser) {
      HC_more(Highcharts);
    }
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.initializeChart();
    }
  }

  private initializeChart() {
    if (!this.weatherData?.length) return;

    const tempChartData = this.weatherData.map((interval: any) => ({
      x: new Date(interval.startTime).getTime(),
      low: Number(interval.values.temperatureMin.toFixed(2)),
      high: Number(interval.values.temperatureMax.toFixed(2))
    }));

    const options: Highcharts.Options = {
      chart: {
        type: 'arearange'
      },
      title: {
        text: 'Temperature Ranges (Min, Max)'
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: {
          day: '%e %b'
        }
      },
      yAxis: {
        title: {
          text: null
        },
        gridLineWidth: 1
      },
      tooltip: {
        shared: true,
        valueSuffix: '°F',
        xDateFormat: '%A, %b %e',
        pointFormat: '<span style="color:{series.color}">Temperature</span><br/>High: {point.high}°F<br/>Low: {point.low}°F'
      },
      legend: {
        enabled: false
      },
      plotOptions: {
        arearange: {
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, '#efb750'],
              [1, '#dacfb0']
            ]
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          marker: {
            enabled: true,
            radius: 4
          },
          threshold: null
        }
      },
      series: [{
        name: 'Temperature',
        type: 'arearange',
        data: tempChartData,
        color: '#2196f3',
        fillOpacity: 0.3,
        lineColor: '#2196f3',
        zIndex: 0
      }]
    };

    this.chartOptions = options;
  }
}