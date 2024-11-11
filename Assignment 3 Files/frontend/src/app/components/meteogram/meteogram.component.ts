import { Component, Input, OnInit, OnChanges, SimpleChanges, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import More from 'highcharts/highcharts-more';
import Windbarb from 'highcharts/modules/windbarb';
import { LocationInfo } from '../../interfaces/weather.interface';  // Adjust the path as needed


if (typeof window !== 'undefined') {
  More(Highcharts);
  Windbarb(Highcharts);
}

@Component({
  selector: 'app-meteogram',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
  template: `
    <div class="meteogram-container">
      @if (shouldShowChart) {
        <highcharts-chart 
          [Highcharts]="Highcharts"
          [options]="meteogramOptions"
          style="width: 100%; height: 480px; display: block;">
        </highcharts-chart>
      } @else {
        <div class="loading-placeholder">
          Loading weather chart...
        </div>
      }
    </div>
  `
})
export class MeteogramComponent implements OnInit, OnChanges {
  @Input() weatherData: any[] = [];
  @Input() location: LocationInfo | null = null;
  
  Highcharts: typeof Highcharts = Highcharts;
  meteogramOptions: Highcharts.Options = {};
  isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  get shouldShowChart(): boolean {
    return this.isBrowser && Array.isArray(this.weatherData) && this.weatherData.length > 0;
  }

  private getWindDescription(speed: number): string {
    if (speed < 1) return 'Calm';
    if (speed < 4) return 'Light';
    if (speed < 8) return 'Gentle breeze';
    if (speed < 14) return 'Moderate';
    if (speed < 21) return 'Fresh';
    return 'Strong';
  }

  private updateMeteogram(data: any[]) {
    const self = this;

    // Validate and clean data points
    const validData = data.filter(point => 
      point.time && 
      !isNaN(point.values.temperature) && 
      !isNaN(point.values.humidity) && 
      !isNaN(point.values.pressure)
    );
  
    if (validData.length === 0) {
      console.error('No valid data points found');
      return;
    }

    const humidityData = validData.map(point => ({
      x: new Date(point.time).getTime(),
      y: Math.max(0, Math.min(100, point.values.humidity)),
      dataLabels: {
        enabled: true,
        format: '{y:.0f}',
        style: {
          fontSize: '10px',
          fontWeight: 'normal'
        },
        y: -5
      }
    }));
  
    const temperatureData = validData.map(point => ({
      x: new Date(point.time).getTime(),
      y: point.values.temperature
    }));
  
    const pressureData = validData.map(point => ({
      x: new Date(point.time).getTime(),
      y: point.values.pressure
    }));
  
    const windData = validData.map(point => ({
      x: new Date(point.time).getTime(),
      value: Math.max(0, point.values.windSpeed),
      direction: point.values.windDirection % 360
    }));


    this.meteogramOptions = {
      chart: {
        height: 400,
        marginTop: 50,
        marginRight: 50,
        marginLeft: 50,
        marginBottom: 100,
        spacingBottom: 20
      },
      title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
        style: { fontSize: '16px' },
        margin: 35
      },
      xAxis: [{
        type: 'datetime',
        tickInterval: 4 * 3600 * 1000,
        minorTickInterval: undefined,
        gridLineWidth: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
        labels: {
          format: '{value:%H}',
          style: { fontSize: '12px' },
          y: 20
        },
        tickWidth: 0,
        minorTickWidth: 0,
        minorTickLength: 0,
        tickLength: 0,
        tickPosition: 'outside',
        lineWidth: 1,
        lineColor: '#666',
        offset: 40
      }, {
        type: 'datetime',
        linkedTo: 0,
        opposite: true,
        tickInterval: 24 * 3600 * 1000,
        labels: {
          formatter: function() {
            const date = new Date(this.value);
            return `<b>${date.toLocaleDateString('en-US', { weekday: 'short' })}</b> ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          },
          style: { fontSize: '12px' },
          useHTML: true
        }
      }],
      yAxis: [{
        labels: {
          format: '{value}°',
          style: { fontSize: '12px' }
        },
        gridLineWidth: 1,
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
        tickInterval: 10,
        title: { text: null },
        lineColor: '#666',
        lineWidth: 1,
        showFirstLabel: true
      }, {
        title: { text: null },
        labels: { enabled: false },
        gridLineWidth: 0,
        min: 0,
        max: 100
      }, {
        opposite: true,
        min: 29.0,
        max: 31.5,
        tickInterval: 0.5,
        labels: {
          format: '{value:.1f}',
          align: 'left',
          x: 5,
          style: {
            color: '#FFA500',
            fontSize: '12px'
          }
        },
        title: {
          text: 'inHg',
          align: 'high',
          rotation: 0,
          offset: 0,
          x: 5,
          y: 15,
          style: {
            color: '#FFA500',
            fontSize: '12px'
          }
        },
        gridLineWidth: 0,
        lineColor: '#666',
        lineWidth: 1,
        showFirstLabel: true,
        showLastLabel: false,
        endOnTick: false,
        maxPadding: 0.1
      }],
      legend: {
        enabled: false
      },
      tooltip: {
        shared: true,
        useHTML: true,
        headerFormat: '<span style="font-size: 10px">{point.key}</span><br/>',
        pointFormatter: function(this: any) {
          const icon = '●';
          const color = this.color;
          const name = this.series.name;
          const value = this.y;

          if (name === 'Wind') {
            const windDesc = self.getWindDescription(this.value);
            return `<span style="color: black">
              <span style="color: ${color}">${icon}</span>
              Wind: <b>${this.value.toFixed(1)} mph</b> (${windDesc})<br/>
            </span>`;
          }

          let unit = '';
          if (name === 'Temperature') unit = '°F';
          else if (name === 'Humidity') unit = ' %';
          else if (name === 'Pressure') unit = ' inHg';

          return `<span style="color: black">
            <span style="color: ${color}">${icon}</span>
            ${name}: <b>${value.toFixed(2)}${unit}</b>
          </span><br/>`;
        }
      },
      plotOptions: {
        series: {
          states: {
            hover: { enabled: true }
          }
        },
        windbarb: {
          crisp: false,
          pointPadding: 0,
          groupPadding: 0
        }
      },
      series: [{
        name: 'Humidity',
        type: 'column',
        data: humidityData,
        color: '#87CEEB',
        yAxis: 1,
        zIndex: 3,
        pointWidth: 8,
        groupPadding: 0.05,
        pointPadding: 0.05
      }, {
        name: 'Temperature',
        type: 'spline',
        data: temperatureData,
        color: '#FF0000',
        lineWidth: 2,
        marker: { enabled: false },
        zIndex: 3
      }, {
        name: 'Pressure',
        type: 'spline',
        data: pressureData,
        color: '#FFA500',
        dashStyle: 'ShortDot' as Highcharts.DashStyleValue,
        yAxis: 2,
        marker: { enabled: false },
        zIndex: 3
      }, {
        name: 'Wind',
        type: 'windbarb',
        data: windData,
        color: '#FF0000',
        lineWidth: 1,
        vectorLength: 15,
        yOffset: -20,
        xOffset: 0,
        zIndex: 1,
        clip: false,
        pointRange: 4 * 3600 * 1000
      }] as any
    };
  }

  ngOnInit(): void {
    if (this.weatherData?.length) {
      this.updateMeteogram(this.weatherData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['weatherData'] && this.weatherData?.length) {
      this.updateMeteogram(this.weatherData);
    }
  }

}