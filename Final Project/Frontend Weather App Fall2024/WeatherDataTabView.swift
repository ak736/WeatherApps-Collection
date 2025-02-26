//
//  WeatherDataTabView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//
import SwiftUI
import Highcharts
import UIKit

struct WeatherDataTabView: View {
    let weather: WeatherData
    
    private var currentWeather: WeatherValues? {
        weather.forecast.timelines.first?.intervals.first?.values
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Weather Summary Card
                WeatherSummaryCard(weatherValues: currentWeather)
                    .padding(.top, 20)
                
                // Activity Gauge Chart
                ActivityGaugeView(weatherValues: currentWeather)
                    .frame(height: 400)
                    .padding(.top, 25)
                    
                   
            }
            .padding(.horizontal, 10)
            .padding(.bottom, 36)
        }
    }
}

struct WeatherSummaryCard: View {
    let weatherValues: WeatherValues?
    
    var body: some View {
        VStack(spacing: 16) {
            rowView(
                icon: "Precipitation",
                text: "Precipitation:",
                value: String(format: "%.0f", weatherValues?.precipitationProbability ?? 0)
            )
            
            rowView(
                icon: "Humidity",
                text: "Humidity:",
                value: String(format: "%.0f", weatherValues?.humidity ?? 0)
            )
            
            rowView(
                icon: "CloudCover",
                text: "Cloud Cover:",
                value: String(format: "%.0f", weatherValues?.cloudCover ?? 0)
            )
        }
        .padding(.vertical, 20)
        .background(Color.white.opacity(0.5))
        .cornerRadius(12)
        .padding(.horizontal, 20)
        .padding(.trailing, 20)
        // The parent container will stretch, allowing the content to be centered.
        .frame(maxWidth: .infinity, alignment: .center)
    }
    
    private func rowView(icon: String, text: String, value: String) -> some View {
        HStack(spacing: 12) { // Control spacing between icon and text
            Image(icon)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 40, height: 40)
            
            // Group text and value together to appear as a unit
            HStack(spacing: 4) {
                Text(text)
                    .foregroundColor(.black)
                
                Text("\(value)%") // Add a space before '%'
                    .foregroundColor(.black)
            }
        }
        // Make sure each row is centered horizontally
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.horizontal, 20)
    }
}

// Highcharts Activity Gauge
struct ActivityGaugeView: UIViewRepresentable {
    let weatherValues: WeatherValues?
    
    func makeUIView(context: Context) -> HIChartView {
        let chartView = HIChartView(frame: .zero)
        chartView.plugins = ["solid-gauge"]
        return chartView
    }
    
    func updateUIView(_ chartView: HIChartView, context: Context) {
        let options = HIOptions()
        
        // Chart configuration
        let chart = HIChart()
        chart.type = "solidgauge"
        chart.height = "90%"
        options.chart = chart
        
        // Title configuration
        let title = HITitle()
        title.text = "Weather Data"
        title.style = HICSSObject()
        title.style.fontSize = "24px"
        options.title = title
        
        // Configure the pane
        let pane = HIPane()
        pane.startAngle = 0
        pane.endAngle = 360
        pane.background = []
        
        // Background configuration for three concentric rings
        let precipitation = HIBackground()
        precipitation.backgroundColor = HIColor(rgba: 82, green: 192, blue: 55, alpha: 0.35)
        precipitation.outerRadius = "112%"
        precipitation.innerRadius = "88%"
        
        let humidity = HIBackground()
        humidity.backgroundColor = HIColor(rgba: 135, green: 206, blue: 235, alpha: 0.35)
        humidity.outerRadius = "87%"
        humidity.innerRadius = "63%"
        
        let cloudCover = HIBackground()
        cloudCover.backgroundColor = HIColor(rgba: 255, green: 99, blue: 71, alpha: 0.35)
        cloudCover.outerRadius = "62%"
        cloudCover.innerRadius = "38%"
        
        pane.background = [precipitation, humidity, cloudCover]
        options.pane = [pane]

        // Y-axis configuration
        let yAxis = HIYAxis()
        yAxis.min = 0
        yAxis.max = 100
        yAxis.lineWidth = 0
        yAxis.labels = HILabels()
            yAxis.labels.enabled = false  // Hide labels
            yAxis.tickWidth = 0  // Remove tick marks
            yAxis.tickLength = 0
            yAxis.tickPosition = "none"
            yAxis.minorTickLength = 0
            yAxis.minorTickWidth = 0
            options.yAxis = [yAxis]
        // Plot options
            let plotOptions = HIPlotOptions()
            plotOptions.solidgauge = HISolidgauge()
        // Configure data labels
            let dataLabels = HIDataLabels()
            dataLabels.enabled = false  // Hide data labels
            plotOptions.solidgauge.dataLabels = [dataLabels]
            
            plotOptions.solidgauge.linecap = "round"
            plotOptions.solidgauge.rounded = true
            plotOptions.solidgauge.stickyTracking = false
            options.plotOptions = plotOptions
        
        // Create the series
        let precipitationSeries = createGaugeSeries(
            name: "Precipitation",
            value: weatherValues?.precipitationProbability ?? 0,
            color: HIColor(rgba: 82, green: 192, blue: 55, alpha: 1),
            outerRadius: "112%",
            innerRadius: "88%"
        )
        
        let humiditySeries = createGaugeSeries(
            name: "Humidity",
            value: weatherValues?.humidity ?? 0,
            color: HIColor(rgba: 135, green: 206, blue: 235, alpha: 1),
            outerRadius: "87%",
            innerRadius: "63%"
        )
        
        let cloudCoverSeries = createGaugeSeries(
            name: "Cloud Cover",
            value: weatherValues?.cloudCover ?? 0,
            color: HIColor(rgba: 255, green: 99, blue: 71, alpha: 1),
            outerRadius: "62%",
            innerRadius: "38%"
        )
        
        options.series = [precipitationSeries, humiditySeries, cloudCoverSeries]
        
        chartView.options = options
    }
    
    private func createGaugeSeries(name: String, value: Double, color: HIColor, outerRadius: String, innerRadius: String) -> HISolidgauge {
        let series = HISolidgauge()
        series.name = name
        
        let data = HIData()
        data.color = color
        data.radius = outerRadius
        data.innerRadius = innerRadius
        data.y = NSNumber(value: value)
        
        series.data = [data]
        return series
    }
}
