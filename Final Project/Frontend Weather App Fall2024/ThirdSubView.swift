//
//  ThirdSubView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/23/24.
//

import SwiftUI

struct ForecastDayCell: View {
    let date: String
    let weatherCode: Int
    let sunriseTime: String
    let sunsetTime: String
    
    private func formatTime(_ timeString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
        formatter.timeZone = TimeZone(abbreviation: "PST")
        
        guard let date = formatter.date(from: timeString) else { return "N/A" }
        
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: date)
    }
    
    private func formatDate(_ dateString: String) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZ"
        guard let date = formatter.date(from: dateString) else { return "N/A" }
        
        formatter.dateFormat = "MM/dd/yyyy"
        return formatter.string(from: date)
    }
    
    var body: some View {
        HStack {
            // Date
            Text(formatDate(date))
                .font(.system(size: 14))
                .frame(width: 80, alignment: .leading)
            
            // Weather Icon
            Image(getWeatherIconName(code: weatherCode))
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 24, height: 24)
            
            Spacer()
            
            // Sunrise
            Image("sun-rise")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 24, height: 24)
            Text(formatTime(sunriseTime))
                .font(.system(size: 14))
            
            Spacer()
            
            // Sunset
            Image("sun-set")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(width: 24, height: 24)
            Text(formatTime(sunsetTime))
                .font(.system(size: 14))
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
        .background(Color.white.opacity(0.8))
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
}

struct ThirdSubView: View {
    let weather: WeatherData
    
    var forecastData: [Interval] {
        weather.forecast.timelines.first?.intervals ?? []
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 1) {
                ForEach(forecastData.prefix(7), id: \.startTime) { interval in
                    ForecastDayCell(
                        date: interval.startTime,
                        weatherCode: interval.values.weatherCode ?? 1000,
                        sunriseTime: interval.values.sunriseTime ?? "",
                        sunsetTime: interval.values.sunsetTime ?? ""
                    )
                }
            }
            .cornerRadius(10)
            .padding(.horizontal)
        }
    }
}
