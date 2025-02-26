//
//  CustomNavigationBar.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/26/24.
//

import SwiftUI

struct CustomNavigationBar: View {
    let cityName: String
    let onBackTapped: () -> Void
    let onTwitterTapped: () -> Void
    
    var body: some View {
        ZStack {
            // Left aligned back button
            HStack {
                Button(action: onBackTapped) {
                    HStack(spacing: 5) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.blue)
                        Text("Weather")
                            .foregroundColor(.blue)
                    }
                }
                .padding(.leading, 22)
                .padding(.vertical, 8)
                Spacer()
            }
            
            // Center aligned title
            HStack {
                Spacer()
                Text(cityName)
                    .font(.headline)
                Spacer()
            }
            
            // Right aligned Twitter button
            HStack {
                Spacer()
                Button(action: onTwitterTapped) {
                    Image("twitter")
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 20, height: 20)
                        .foregroundColor(.blue)
                        
                }
            }
            .padding(.trailing, 24) // Increased from 16 to 20
            .padding(.vertical, 8)  // Added vertical padding
        }
        .frame(height: 44)
    }
}

