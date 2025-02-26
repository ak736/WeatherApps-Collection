//
//  FirstSubView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/23/24.
//

import SwiftUI

struct FirstSubView: View {
    let weather: WeatherData
    var onTap: () -> Void
    var isSearchResult: Bool = false
    
    private var currentWeather: WeatherValues? {
        weather.forecast.timelines.first?.intervals.first?.values
    }
    
    var body: some View {
            Button(action: onTap) {
                HStack(alignment: .center, spacing: 15) {
                    // Weather Icon
                    if let weatherCode = currentWeather?.weatherCode {
                        Image(getWeatherIconName(code: weatherCode))
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(width: 120, height: 120)
                    }
                    
                    VStack(alignment: .leading, spacing: 2) {
                        // Temperature
                        if let temp = currentWeather?.temperatureApparent {
                            Text("\(Int(temp))°F")
                                .font(.system(size: 28, weight: .bold))
                                .padding(.leading, 10)

                        }
                        
                        // Weather Description
                        if let weatherCode = currentWeather?.weatherCode {
                            Text(getWeatherDescription(code: weatherCode))
                                .font(.system(size: 18))
                                .padding(.top, 15)
                                .padding(.leading, 10)
                        }
                        
                        // City Name
                        Text(weather.location.city)
                            .font(.system(size: 20, weight: .bold))
                            .padding(.top, 15)
                            .padding(.leading, 10)
                    }
                    
                    Spacer()
                }
                .padding(.vertical, isSearchResult ? 15 : 25)
                .padding(.horizontal, 20)
                .frame(maxWidth: .infinity)
                .background(Color.white.opacity(0.5))
                .cornerRadius(10)
                .padding(.horizontal)
                .padding(.top, isSearchResult ? 5 : 25)
            }
            .buttonStyle(PlainButtonStyle())
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
