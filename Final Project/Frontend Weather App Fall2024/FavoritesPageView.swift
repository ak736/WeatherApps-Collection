//
//  FavoritesPageView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//

import SwiftUI
import SwiftSpinner

struct FavoriteDetailView: View {
    let weather: WeatherData
    let favorite: FavoriteService.FavoriteItem
    let onRemove: () -> Void
    @ObservedObject private var favoriteService = FavoriteService.shared
    @State private var showToast = false
    @State private var toastMessage = ""
    
    var body: some View {
        ZStack {
            VStack(spacing: 20) {
                // Top button area
                Color.clear
                    .frame(height: 40)
                    .overlay(alignment: .topTrailing) {
                        Button(action: {
                            handleRemove()
                        }) {
                            Image("close-circle")
                                .font(.system(size: 14))
                                .padding(4)
                        }
                        .padding(.trailing, 30)
                        .padding(.top, 20)
                    }
                
                // Weather content
                VStack(spacing: 20) {
                    FirstSubView(weather: weather,
                                                   onTap: {
                                            // Handle details view if needed
                                        },
                                                   isSearchResult: true)
                    SecondSubView(weather: weather)
                    ThirdSubView(weather: weather)
                }
                .padding()
            }
            
            if showToast {
                ToastView(message: toastMessage, isShowing: showToast)
            }
        }
    }
    
    private func handleRemove() {
        // Show toast first
        toastMessage = "\(weather.location.city) was removed from the Favorite List"
        showToast = true
        
        // Then trigger removal with animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            withAnimation(.easeInOut(duration: 0.3)) {
                favoriteService.removeFavorite(id: favorite.id)
                onRemove()
            }
        }
        
        // Hide toast after delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            showToast = false
        }
    }
}

struct FavoritesPageView: View {
    @StateObject private var viewModel = WeatherViewModel()
    @ObservedObject private var favoriteService = FavoriteService.shared
    @State private var currentPage = 0
    @State private var searchText = ""
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Search Bar at top
                SearchBarView(
                    text: $searchText,
                    results: viewModel.searchResults,
                    onResultSelected: { result in
                        searchText = ""
                        SwiftSpinner.show("Fetching Weather Details for \(result.city)...")
                        viewModel.fetchWeatherForCity(city: result.city, state: result.state)
                    }
                )
                .padding(.horizontal)
                .padding(.top, 8)
                .zIndex(1)
                
                // Content area with TabView
                ZStack(alignment: .bottom) {
                    if let weather = viewModel.currentWeather {
                        TabView(selection: $currentPage) {
                            // Home weather
                            SearchResultView(weather: weather)
                                .tag(0)
                            
                            // Favorites
                            ForEach(favoriteService.favorites) { favorite in
                                FavoriteWeatherPage(
                                    favorite: favorite,
                                    onRemove: {
                                        handleFavoriteRemoval(favorite: favorite)
                                    }
                                )
                                .tag(favoriteService.favorites.firstIndex(where: { $0.id == favorite.id })! + 1)
                                .id("favorite-\(favorite.id)")
                            }
                        }
                        .tabViewStyle(.page(indexDisplayMode: .never))
                        .id("tabview-\(favoriteService.favorites.count)")
                        .frame(height: geometry.size.height - 120)
                    }
                    
                    // Dots always visible, outside weather condition
                    VStack {
                        Spacer()
                        PageIndicatorView(currentPage: currentPage, totalPages: max(1, favoriteService.favorites.count + 1))
                            .padding(.bottom, 10)
                    }
                }
            }
        }
        .onAppear {
            if viewModel.currentWeather == nil {
                viewModel.startLocationUpdates()
            }
        }
    }
    
    private func handleFavoriteRemoval(favorite: FavoriteService.FavoriteItem) {
        withAnimation(.easeInOut(duration: 0.3)) {
            let currentIndex = favoriteService.favorites.firstIndex(where: { $0.id == favorite.id })
            let totalFavorites = favoriteService.favorites.count
            
            // Remove the favorite
            favoriteService.removeFavorite(id: favorite.id)
            
            // Delay the page change slightly for smooth animation
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                // Smart navigation logic
                if totalFavorites > 1 {
                    if let index = currentIndex {
                        if index == totalFavorites - 1 {
                            withAnimation {
                                currentPage = index
                            }
                        } else {
                            withAnimation {
                                currentPage = index + 1
                            }
                        }
                    }
                } else {
                    withAnimation {
                        currentPage = 0
                    }
                }
            }
        }
    }
}

struct PageIndicatorView: View {
    let currentPage: Int
    let totalPages: Int
    
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<totalPages, id: \.self) { index in
                Circle()
                    .fill(currentPage == index ? Color.blue : Color.gray)
                    .frame(width: 8, height: 8)
                    .animation(.easeInOut, value: currentPage)
            }
        }
        .padding(.vertical, 30)
        .background(
            Rectangle()
                .fill(Color.clear)
                .frame(height: 40)
        )
    }
}

struct FavoriteWeatherPage: View {
    let favorite: FavoriteService.FavoriteItem
    let onRemove: () -> Void
    @StateObject private var viewModel = WeatherViewModel()
    
    var body: some View {
        Group {
            if let weather = viewModel.currentWeather {
                FavoriteDetailView(
                    weather: weather,
                    favorite: favorite,
                    onRemove: onRemove
                )
            }
        }
        .onAppear {
            viewModel.fetchWeatherForCity(city: favorite.city, state: favorite.state)
        }
    }
}
