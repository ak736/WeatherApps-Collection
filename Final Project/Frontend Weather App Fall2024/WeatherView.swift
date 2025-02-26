//
//  WeatherView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/20/24.
//

import SwiftUI

struct WeatherDataView: View {
    let title: String
    let value: String
    let unit: String
    
    var body: some View {
        VStack(alignment: .center, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.black)
            Text("\(value)\(unit)")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.black)
        }
    }
}

struct WeatherView: View {
    let weather: WeatherData
    @State private var showingDetails = false
    
    var body: some View {
        VStack(spacing: 20) {
            // First Sub View
            FirstSubView(weather: weather,
                                    onTap: {
                            showingDetails = true
                        },
                                    isSearchResult: false)
            .padding(.top, 25)
            
            // Second Sub View
            SecondSubView(weather: weather)
            
            // Third Sub View
            ThirdSubView(weather: weather)
        }
        .padding()
        .fullScreenCover(isPresented: $showingDetails) { // Changed from .sheet to .fullScreenCover
                    WeatherDetailView(weather: weather)
                }
    }
}
