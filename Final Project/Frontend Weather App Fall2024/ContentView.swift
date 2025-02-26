//
//  ContentView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/19/24.
//

import SwiftUI
import SwiftSpinner

struct ContentView: View {
    @StateObject private var viewModel = WeatherViewModel()
    @ObservedObject private var favoriteService = FavoriteService.shared
    @State private var searchText = ""
    private func handleTwitterReturn() {
        if UserDefaults.standard.bool(forKey: "is_twitter_sharing") {
            let city = UserDefaults.standard.string(forKey: "twitter_share_city") ?? ""
            let state = UserDefaults.standard.string(forKey: "twitter_share_state") ?? ""
            
            if !city.isEmpty && !state.isEmpty {
                SwiftSpinner.show("Fetching Weather Details for \(city)...")
                viewModel.fetchWeatherForCity(city: city, state: state)
                UserDefaults.standard.set(false, forKey: "is_twitter_sharing")
                viewModel.clearTwitterState()
            }
        }
    }

    var body: some View {
        ZStack(alignment: .top) {
            // Background Image
            Image("App_background")
                .resizable()
                .scaledToFill()
                .ignoresSafeArea()
                .offset(y: !viewModel.isShowingSearchResult ? 70 : 50)
            
            VStack(spacing: 0) {
                        if !viewModel.isShowingSearchResult {
                            ZStack(alignment: .top) {
                                // TabView for horizontal scrolling
                                // Inside ContentView body
                                TabView {
                                    // Current Location Weather
                                    if let weather = viewModel.currentWeather {
                                        WeatherView(weather: weather)
                                            .padding(.top, 60)
                                    }
                                    
                                    // Favorite Cities Weather - Add id for forcing refresh
                                    ForEach(FavoriteService.shared.favorites) { favorite in
                                        FavoriteWeatherPage(
                                            favorite: favorite,
                                            onRemove: {
                                                withAnimation(.easeInOut(duration: 0.3)) {
                                                    // Add a slight delay to ensure proper animation
                                                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                                                        FavoriteService.shared.removeFavorite(id: favorite.id)
                                                    }
                                                }
                                            }
                                        )
                                        .padding(.top, 60)
                                        .id("main-\(favorite.id)")
                                    }
                                }
                                .tabViewStyle(.page)
                                .id("main-content-tabview-\(favoriteService.favorites.count)")
                                // Search Bar (stays fixed at top)
                                SearchBarView(text: $searchText,
                                            results: viewModel.searchResults) { result in
                                    searchText = ""
                                    SwiftSpinner.show("Fetching Weather Details for \(result.city)...")
                                    viewModel.fetchWeatherForCity(city: result.city, state: result.state)
                                }
                                .padding(.top, 8)
                                .zIndex(1)
                            }
                        }  else if let cityName = viewModel.selectedCity {
                    // Search Result View
                    VStack(spacing: 0) {
                        // Navigation Bar
                        CustomNavigationBar(
                            cityName: cityName,
                            onBackTapped: {
                                viewModel.resetToCurrentLocation()
                            },
                            onTwitterTapped: {
                                shareToTwitter(cityName: cityName)
                            }
                        )
                        
                        // Weather Content for search results
                        if let weather = viewModel.currentWeather {
                            SearchResultView(weather: weather)
                        }
                    }
                }else if !viewModel.isLoading {
                    // Error view
                    VStack {
                        Spacer()
                        Text("Unable to get weather data")
                            .foregroundColor(.white)
                        Button("Retry") {
                            viewModel.startLocationUpdates()
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        Spacer()
                    }
                }
                // Error message
                                if let errorMessage = viewModel.errorMessage {
                                    Text(errorMessage)
                                        .foregroundColor(.white)
                                        .padding()
                                        .background(Color.red.opacity(0.8))
                                        .cornerRadius(10)
                                        .padding()
                                }
                            }
                        }
                        .onChange(of: viewModel.isLoading) { _, newValue in
                            if !newValue {
                                SwiftSpinner.hide()
                            }
                        }
                        .onChange(of: searchText) { _, newValue in
                            viewModel.fetchAutocomplete(query: newValue)
                        }
                        .onAppear {
                            if UserDefaults.standard.bool(forKey: "is_twitter_sharing") {
                                    handleTwitterReturn()
                                } else {
                                    // If not returning from Twitter, always start with location weather
                                    if viewModel.currentWeather == nil {
                                        SwiftSpinner.show("Getting your location's weather...")
                                        viewModel.startLocationUpdates()
                                    }
                                }
                        }
                    }
    
    private func shareToTwitter(cityName: String) {
        
        if let weather = viewModel.currentWeather,
           let interval = weather.forecast.timelines.first?.intervals.first,
           let weatherCode = interval.values.weatherCode {  // Only proceed if we have a valid weather code
            
            let temperature = Int(interval.values.temperatureApparent ?? 0)
            let weatherConditions = getWeatherDescription(code: weatherCode)

            let tweetText = "The temperature at \(cityName) is \(temperature)°F. The weather conditions are \(weatherConditions) #CSCI571WeatherSearch"
            
            if let encodedText = tweetText.addingPercentEncoding(withAllowedCharacters: CharacterSet.urlQueryAllowed),
               let url = URL(string: "https://twitter.com/intent/tweet?text=\(encodedText)") {
                let city = weather.location.city
                    let state = weather.location.state
                viewModel.saveTwitterState(cityName: city, stateName: state)
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


//#Preview {
//    ContentView()
//}
