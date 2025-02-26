//
//  SearchBarView.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/20/24.
//

import SwiftUI

struct SearchBarView: View {
    @Binding var text: String
    let results: [AutocompleteResult]
    var onResultSelected: (AutocompleteResult) -> Void
    
    var body: some View {
        ZStack(alignment: .top) {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    
                    TextField("Enter City Name", text: $text)
                        .textFieldStyle(PlainTextFieldStyle())
                    
                    if !text.isEmpty {
                        Button(action: {
                            text = ""
                        }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding(.horizontal, 25)
                .zIndex(2)
            }
            
            // Results Overlay
            if !results.isEmpty && !text.isEmpty {
                VStack(spacing: 0) {
                    ForEach(results) { result in
                        Button(action: {
                            onResultSelected(result)
                        }) {
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(result.city)
                                        .font(.system(size: 17))
                                        .foregroundColor(.black)
                                    Text(result.state)
                                        .font(.system(size: 14))
                                        .foregroundColor(.gray)
                                }
                                Spacer()
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal, 45)
                        }
                        
                        if result.id != results.last?.id {
                            Divider()
                                .background(Color.gray.opacity(0.2))
                        }
                    }
                }
                .background(Color.white.opacity(0.90))
                .clipShape(
                    RoundedCorner(radius: 10, corners: [.bottomLeft, .bottomRight])
                )
                .padding(.horizontal, 25)
                .offset(y: calculateOffset(for: results.count))
                .zIndex(1)
            }
        }
    }
    
    private func calculateOffset(for resultCount: Int) -> CGFloat {
        let searchBarHeight: CGFloat = 44
        return searchBarHeight - 1
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}
