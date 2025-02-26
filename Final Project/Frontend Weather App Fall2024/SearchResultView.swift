//
//  SearchResultView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/29/24.
//

import SwiftUI

struct SearchResultView: View {
    let weather: WeatherData
    @StateObject private var favoriteService = FavoriteService.shared
    @State private var showToast = false
    @State private var toastMessage = ""
    @State private var showingDetails = false
    
    private var favoriteStatus: (isFavorite: Bool, id: String?) {
        favoriteService.isFavorite(city: weather.location.city, state: weather.location.state)
    }
    
    var body: some View {
        ZStack {
            VStack(spacing: 20) {
                Color.clear
                    .frame(height: 40)
                    .overlay(alignment: .topTrailing) {
                        Button(action: {
                            toggleFavorite()
                        }) {
                            Image(favoriteStatus.isFavorite ? "close-circle" : "plus-circle")
                                .font(.system(size: 14))
                                .padding(4)
                        }
                        .padding(.trailing, 30)
                        .padding(.top, 20)
                    }
                
                VStack(spacing: 20) {
                    FirstSubView(weather: weather, onTap: {
                                showingDetails = true
                            }, isSearchResult: true)
                    SecondSubView(weather: weather)
                    ThirdSubView(weather: weather)
                }
                .padding()
            }
            
            ToastView(message: toastMessage, isShowing: showToast)
        }
        .fullScreenCover(isPresented: $showingDetails) {  // Add this modifier
                    WeatherDetailView(weather: weather)
                }
    }
    
    private func toggleFavorite() {
        if favoriteStatus.isFavorite {
            if let id = favoriteStatus.id {
                favoriteService.removeFavorite(id: id)
                showToastMessage("\(weather.location.city) was removed from the Favorite List")
            }
        } else {
            favoriteService.addFavorite(
                city: weather.location.city,
                state: weather.location.state,
                weatherData: weather
            )
            showToastMessage("\(weather.location.city) was added to the Favorite List")
        }
    }
    
    private func showToastMessage(_ message: String) {
        toastMessage = message
        showToast = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            showToast = false
        }
    }
}
