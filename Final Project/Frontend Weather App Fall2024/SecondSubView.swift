//
//  SecondSubView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/23/24.
//

import SwiftUI

struct WeatherMetricView: View {
    let iconName: String
    let value: String
    let unit: String
    let title: String
    
    var body: some View {
        VStack(spacing: 8) {
            // Title at top
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(.black)
            
            // Icon in middle
            Image(iconName)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 40, height: 40)
                .padding(.top, 10)
            
            // Value and unit at bottom
            Text("\(value)\(unit)")
                .font(.system(size: 15))
                .foregroundColor(.black)
                .padding(.top, 10)
        }
        .frame(maxWidth: .infinity)
    }
}

struct SecondSubView: View {
    let weather: WeatherData
    
    private var currentWeather: WeatherValues? {
        weather.forecast.timelines.first?.intervals.first?.values
    }
    
    var body: some View {
        HStack(alignment: .center, spacing: 0) {
            // Humidity
            WeatherMetricView(
                iconName: "Humidity",
                value: getHumidity(),
                unit: " %",
                title: "Humidity"
            )
            
            // Wind Speed
            WeatherMetricView(
                iconName: "WindSpeed",
                value: getWindSpeed(),
                unit: " mph",
                title: "Wind Speed"
            )
            
            // Visibility
            WeatherMetricView(
                iconName: "Visibility",
                value: getVisibility(),
                unit: " mi",
                title: "Visibility"
            )
            
            // Pressure
            WeatherMetricView(
                iconName: "Pressure",
                value: getPressure(),
                unit: " inHg",
                title: "Pressure"
            )
        }
        .padding(.vertical, 5)
        .frame(maxWidth: .infinity)
        .cornerRadius(10)
        .padding(.horizontal)
    }
    
    private func getHumidity() -> String {
        if let humidity = currentWeather?.humidity {
            return String(format: "%.1f", humidity)
        }
        return "N/A"
    }
    
    private func getWindSpeed() -> String {
        if let windSpeed = currentWeather?.windSpeed {
            return String(format: "%.2f", windSpeed)
        }
        return "N/A"
    }
    
    private func getVisibility() -> String {
        if let visibility = currentWeather?.visibility {
            return String(format: "%.2f", visibility)
        }
        return "N/A"
    }
    
    private func getPressure() -> String {
        if let pressure = currentWeather?.pressureSurfaceLevel {
            return String(format: "%.2f", pressure)
        }
        return "N/A"
    }
}
