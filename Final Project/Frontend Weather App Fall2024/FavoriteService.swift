//
//  FavoriteService.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 12/6/24.
//

import Foundation
import SwiftUI

class FavoriteService: ObservableObject {
    static let shared = FavoriteService() // Singleton instance
    
    @Published private(set) var favorites: [FavoriteItem] = [] {
            didSet {
                saveFavorites()  // Save whenever favorites changes
            }
        }
    private let favoritesKey = "weatherapp.favorites"
    
    struct FavoriteItem: Codable, Identifiable, Equatable {
        let id: String
        let city: String
        let state: String
        let timestamp: Date
        
        init(city: String, state: String) {
            self.id = UUID().uuidString
            self.city = city
            self.state = state
            self.timestamp = Date()
        }
    }
    
    init() {
        loadFavorites()
        NotificationCenter.default.addObserver(
                    self,
                    selector: #selector(userDefaultsDidChange),
                    name: UserDefaults.didChangeNotification,
                    object: nil
                )
        
    }
    
    func addFavorite(city: String, state: String, weatherData: WeatherData) {
            DispatchQueue.main.async {
                if !self.favorites.contains(where: { $0.city == city && $0.state == state }) {
                    withAnimation {
                        let newFavorite = FavoriteItem(city: city, state: state)
                        self.favorites.append(newFavorite)
                        self.objectWillChange.send()
                    }
                }
            }
        }
        
        func removeFavorite(id: String) {
            DispatchQueue.main.async {
                withAnimation {
                    self.favorites.removeAll(where: { $0.id == id })
                    self.objectWillChange.send()
                }
            }
        }
    @objc private func userDefaultsDidChange(_ notification: Notification) {
            loadFavorites()
        }
    func isFavorite(city: String, state: String) -> (isFavorite: Bool, id: String?) {
        if let favorite = favorites.first(where: { $0.city == city && $0.state == state }) {
            return (true, favorite.id)
        }
        return (false, nil)
    }
    
    private func loadFavorites() {
            DispatchQueue.main.async {
                if let data = UserDefaults.standard.data(forKey: self.favoritesKey) {
                    do {
                        let loadedFavorites = try JSONDecoder().decode([FavoriteItem].self, from: data)
                        if self.favorites != loadedFavorites {
                            withAnimation {
                                self.favorites = loadedFavorites
                                self.objectWillChange.send()
                            }
                        }
                    } catch {
                        print("Error loading favorites: \(error)")
                    }
                }
            }
        }
    
    private func saveFavorites() {
            do {
                let data = try JSONEncoder().encode(favorites)
                UserDefaults.standard.set(data, forKey: favoritesKey)
            } catch {
                print("Error saving favorites: \(error)")
            }
        }
}
