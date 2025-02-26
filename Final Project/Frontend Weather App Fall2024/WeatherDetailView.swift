//
//  WeatherDetailView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/20/24.
//

import SwiftUI

struct WeatherDetailView: View {
    let weather: WeatherData
    @Environment(\.dismiss) private var dismiss
    @State private var selectedTab = 0
//    @StateObject private var viewModel = WeatherViewModel()
    
    var body: some View {
        ZStack {
            // Background
            Image("App_background")
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()
                .offset(y: 50)
            
            VStack(spacing: 0) {
                            // Navigation Bar Container
                            VStack(spacing: 0) {
                                CustomNavigationBar(
                                    cityName: weather.location.city,
                                    onBackTapped: {
                                        dismiss()
                                    },
                                    onTwitterTapped: {
                                        shareToTwitter(cityName: weather.location.city)
                                    }
                                    
                                ).padding(.trailing, 24) // Increased from 16 to 20
                                    .padding(.vertical, 8)
                            }
                
                // Tab View
                TabView(selection: $selectedTab) {
                    TodayTabView(weather: weather)
                        .tag(0)
                    WeeklyTabView(weather: weather)
                        .tag(1)
                    WeatherDataTabView(weather: weather)
                        .tag(2)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                .gesture(DragGesture(minimumDistance: 0).onChanged { _ in })

                // Custom Tab Bar
                VStack(spacing: 0) {
                    HStack(spacing: 50) { // Reduced spacing between buttons
                        Spacer()
                        
                        TabButton(title: "TODAY", isSelected: selectedTab == 0) {
                            selectedTab = 0
                        }
                        TabButton(title: "WEEKLY", isSelected: selectedTab == 1) {
                            selectedTab = 1
                        }
                        TabButton(title: "WEATHER DATA", isSelected: selectedTab == 2) {
                            selectedTab = 2
                        }
                        Spacer()
                    }
                    .frame(height: 49)
                    .padding(.vertical, 16) // Add padding top and bottom
                }
                .background(
                    Rectangle()
                        .fill(Color.white)
                        .edgesIgnoringSafeArea(.bottom)
                )
            }
        }
        .ignoresSafeArea(.all, edges: .bottom)
    }
    
    private func shareToTwitter(cityName: String) {
        if let weather = weather.forecast.timelines.first?.intervals.first,
           let weatherCode = weather.values.weatherCode {
            let temperature = Int(weather.values.temperatureApparent ?? 0)
            let weatherConditions = getWeatherDescription(code: weatherCode)
            
            let tweetText = "The temperature at \(cityName) is \(temperature)°F. The weather conditions are \(weatherConditions) #CSCI571WeatherSearch"
            
            if let encodedText = tweetText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
               let url = URL(string: "https://twitter.com/intent/tweet?text=\(encodedText)") {
               
                UIApplication.shared.open(url)
            }
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

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                // Icon image based on tab name
                Image(getTabIcon())
                    .resizable()
                    .renderingMode(.template) // Allow color changes
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 24, height: 24)
                
                Text(title)
                    .font(.system(size: 10))
            }
            .foregroundColor(isSelected ? .blue : .gray)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
        }
    }
    
    private func getTabIcon() -> String {
        switch title {
        case "TODAY":
            return "Today_Tab"
        case "WEEKLY":
            return "Weekly_Tab"
        case "WEATHER DATA":
            return "Weather_Data_Tab"
        default:
            return ""
        }
    }
}
