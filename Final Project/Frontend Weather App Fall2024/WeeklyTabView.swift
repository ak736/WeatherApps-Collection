//
//  WeeklyTabView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//

import SwiftUI
import Highcharts

struct WeeklyTabView: View {
    let weather: WeatherData
    private let chartView = HIChartView()
    
    private var currentWeather: WeatherValues? {
        weather.forecast.timelines.first?.intervals.first?.values
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Weekly Weather Summary View
                HStack {
                    if let weatherCode = currentWeather?.weatherCode {
                        // Left side with icon
                        Image(getWeatherIconName(code: weatherCode))
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 120, height: 120)
                            .padding(.leading, 30)
                        
                        // Right side with text
                        VStack(alignment: .leading) {
                            Text(getWeatherDescription(code: weatherCode))
                                .font(.system(size: 20))
                                .padding(.top, 20)  // Push text to top
                            
                            Spacer()  // Creates space between text and temperature
                            
                            if let temp = currentWeather?.temperatureApparent {
                                Text("\(Int(temp))°F")
                                    .font(.system(size: 35))
                                    .padding(.bottom, 20)  // Add some bottom padding
                            }
                            
                            Spacer()  // Creates space at the bottom
                        }
                        .padding(.leading, 50)
                        Spacer()
                    }
                }
                .padding(.vertical, 50)
                .background(Color.white.opacity(0.5))
                .cornerRadius(10)
                .padding(.horizontal, 24)
                .padding(.trailing, 22)
                .padding(.top, 30)
                .padding(.bottom, 40)
                
                // Temperature Chart
                ChartView(weather: weather)
                    .frame(height: 300)
                    .padding(.horizontal, 8)
                    .padding(.bottom, 20)
            }
        }
    }
    
    private func getWeatherIconName(code: Int) -> String {
        switch code {
        case 1000: return "Clear"
        case 1001: return "Cloudy"
        case 4000: return "Drizzle"
        case 5001: return "Flurries"
        case 2000: return "Fog"
        case 2100: return "Light Fog"
        case 6000: return "Freezing Drizzle"
        case 6201: return "Heavy Freezing Rain"
        case 6200: return "Light Freezing Rain"
        case 6001: return "Freezing Rain"
        case 7101: return "Heavy Ice Pellets"
        case 7102: return "Light Ice Pellets"
        case 7000: return "Ice Pellets"
        case 1100: return "Mostly Clear"
        case 1102: return "Mostly Cloudy"
        case 1101: return "Partly Cloudy"
        case 4201: return "Heavy Rain"
        case 4200: return "Light Rain"
        case 4001: return "Rain"
        case 5101: return "Heavy Snow"
        case 5100: return "Light Snow"
        case 5000: return "Snow"
        case 8000: return "Thunderstorm"
        default: return "Clear"
        }
    }
    
    private func getWeatherDescription(code: Int) -> String {
        switch code {
        case 1000: return "Clear"
        case 1001: return "Cloudy"
        case 4000: return "Drizzle"
        case 5001: return "Flurries"
        case 2000: return "Fog"
        case 2100: return "Light Fog"
        case 6000: return "Freezing Drizzle"
        case 6201: return "Heavy Freezing Rain"
        case 6200: return "Light Freezing Rain"
        case 6001: return "Freezing Rain"
        case 7101: return "Heavy Ice Pellets"
        case 7102: return "Light Ice Pellets"
        case 7000: return "Ice Pellets"
        case 1100: return "Mostly Clear"
        case 1102: return "Mostly Cloudy"
        case 1101: return "Partly Cloudy"
        case 4201: return "Heavy Rain"
        case 4200: return "Light Rain"
        case 4001: return "Rain"
        case 5101: return "Heavy Snow"
        case 5100: return "Light Snow"
        case 5000: return "Snow"
        case 8000: return "Thunderstorm"
        default: return "Clear"
        }
    }
}

struct ChartView: UIViewRepresentable {
    let weather: WeatherData
    
    func makeUIView(context: Context) -> HIChartView {
        let chartView = HIChartView(frame: .zero)
        let options = HIOptions()
        
        // Chart type and title
        let chart = HIChart()
        chart.type = "arearange"
        options.chart = chart
        
        let title = HITitle()
        title.text = "Temperature Variation by Day"
        options.title = title
        
        // X-axis configuration
        let xAxis = HIXAxis()
        xAxis.type = "category"
        xAxis.tickPositions = [0, 2, 4, 6]
        xAxis.labels = HILabels()
        xAxis.labels.style = HICSSObject()
        xAxis.labels.style.fontSize = "12px"
        xAxis.labels.padding = 5
        options.xAxis = [xAxis]
        
        // Y-axis configuration
        let yAxis = HIYAxis()
        yAxis.title = HITitle()
        yAxis.title.text = "Temperature (°F)"
        yAxis.min = 0
        yAxis.max = 100
        yAxis.gridLineWidth = 1
        options.yAxis = [yAxis]
        
        // Configure tooltip
        let tooltip = HITooltip()
        tooltip.shared = true
        tooltip.valueSuffix = "°F"
        tooltip.pointFormat = "High: {point.high}°F<br/>Low: {point.low}°F"
        options.tooltip = tooltip
        
        // Configure plotOptions
        let plotOptions = HIPlotOptions()
        let arearange = HIArearange()
        
        // Set fill color using the iOS syntax
        arearange.fillColor = HIColor(linearGradient:
            ["x1": 0, "y1": 0, "x2": 0, "y2": 1],
            stops: [
                [0, "#eace9b"],
                [1, "#cbd3d7"]
            ]
        )
        
        arearange.lineWidth = 0
        let states = HIStates()
        let hover = HIHover()
        hover.lineWidth = 1
        states.hover = hover
        arearange.states = states
        
        let marker = HIMarker()
        marker.enabled = true
        marker.radius = 4
        arearange.marker = marker
        
        plotOptions.arearange = arearange
        options.plotOptions = plotOptions
        
        // Series data
        let series = HIArearange()
        series.name = "Temperature"
        series.data = getCombinedTemperatures()
        series.color = HIColor(name: "#0f0f0f")
        
        series.showInLegend = false
        options.series = [series]
        
        chartView.options = options
        return chartView
    }
    
    func updateUIView(_ uiView: HIChartView, context: Context) {
        // Update logic if needed
    }
    

    
    private func getCombinedTemperatures() -> [[Double]] {
        let intervals = Array(weather.forecast.timelines.first?.intervals.prefix(7) ?? [])
        
        let selectedIndices = [0, 1, 2, 3, 4, 5, 6]  // All seven days
        return selectedIndices.compactMap { dayIndex in
            guard dayIndex < intervals.count else { return nil }
            
            // Map the day index to our desired x position
            let xPosition = Double(dayIndex)
            
            return [
                xPosition,
                intervals[dayIndex].values.temperatureMin,
                intervals[dayIndex].values.temperatureMax
            ]
        }
    }
}
