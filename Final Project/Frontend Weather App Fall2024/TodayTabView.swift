//
//  TodayTabView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//
import SwiftUI

struct TodayTabView: View {
    let weather: WeatherData
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 15), count: 3)
    
    private var currentWeather: WeatherValues? {
        weather.forecast.timelines.first?.intervals.first?.values
    }
    
    var body: some View {
        ScrollView {
            HStack(spacing: 8) {
                LazyVGrid(columns: columns, spacing: 20) {
                    // Wind Speed
                    WeatherItemView(
                        icon: "WindSpeed",
                        value: String(format: "%.2f", currentWeather?.windSpeed ?? 0),
                        unit: "mph",
                        title: "Wind Speed"
                    )
                    
                    // Pressure
                    WeatherItemView(
                        icon: "Pressure",
                        value: String(format: "%.2f", currentWeather?.pressureSurfaceLevel ?? 0),
                        unit: "inHG",
                        title: "Pressure"
                    )
                    
                    // Precipitation
                    WeatherItemView(
                        icon: "Precipitation",
                        value: String(format: "%.0f", currentWeather?.precipitationProbability ?? 0),
                        unit: "%",
                        title: "Precipitation"
                    )
                    
                    // Temperature
                    WeatherItemView(
                        icon: "Temperature",
                        value: String(format: "%.0f", currentWeather?.temperatureApparent ?? currentWeather?.temperatureApparent ?? 0),
                        unit: "°F",
                        title: "Temperature"
                    )
                    
                    // Weather
                    WeatherItemView(
                        icon: getWeatherIconName(code: currentWeather?.weatherCode ?? 1000),
                        value: getWeatherDescription(code: currentWeather?.weatherCode ?? 1000),
                        unit: "",
                        title: "Weather"
                    )
                    
                    // Humidity
                    WeatherItemView(
                        icon: "Humidity",
                        value: String(format: "%.0f", currentWeather?.humidity ?? 0),
                        unit: "%",
                        title: "Humidity"
                    )
                    
                    // Visibility
                    WeatherItemView(
                        icon: "Visibility",
                        value: String(format: "%.2f", currentWeather?.visibility ?? 0),
                        unit: "mi",
                        title: "Visibility"
                    )
                    
                    // Cloud Cover
                    WeatherItemView(
                        icon: "CloudCover",
                        value: String(format: "%.0f", currentWeather?.cloudCover ?? 0),
                        unit: "%",
                        title: "Cloud Cover"
                    )
                    
                    // UV Index
                    WeatherItemView(
                        icon: "UVIndex",
                        value: String(format: "%.0f", currentWeather?.uvIndex ?? 0),
                        unit: "",
                        title: "UV Index"
                    )
                }
                
            }
            .padding(.horizontal, 24)
            .padding(.trailing, 22)  // Added vertical padding
            .padding(.vertical, 36)
        }}
    
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

struct WeatherItemView: View {
    let icon: String
    let value: String
    let unit: String
    let title: String
    
    var body: some View {
        VStack(spacing: 12) {
            Image(icon)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 50, height: 50)
            
            Text("\(value)\(unit)")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.black)
            
            Text(title)
                .font(.system(size: 14))
                .foregroundColor(.black)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 130)
        .padding(.vertical, 16)
        .padding(.horizontal, 12)
        .background(Color.white.opacity(0.55))
        .cornerRadius(10)
    }
}
