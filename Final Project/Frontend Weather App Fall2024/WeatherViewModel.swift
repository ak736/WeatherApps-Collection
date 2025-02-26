import Foundation
import CoreLocation
import SwiftUI

class WeatherViewModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var searchText = ""
    @Published var searchResults: [AutocompleteResult] = []
    @Published var currentWeather: WeatherData?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentLocation: CLLocation?
    @Published var locationAuthorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var isShowingSearchResult = false
    @Published var selectedCity: String?
   
    
    private let locationManager = CLLocationManager()
    private let baseURL = "https://weatherappfall2024.uc.r.appspot.com"
    private struct StateData: Codable {
        let selectedCity: String
        let isShowingSearchResult: Bool
        let weatherData: WeatherData?
    }
    func saveTwitterState(cityName: String, stateName: String) {
        UserDefaults.standard.set(true, forKey: "is_twitter_sharing")
        UserDefaults.standard.set(cityName, forKey: "twitter_share_city")
        UserDefaults.standard.set(stateName, forKey: "twitter_share_state")
    }

    func restoreTwitterState() {
        let city = UserDefaults.standard.string(forKey: "twitter_share_city") ?? ""
        let state = UserDefaults.standard.string(forKey: "twitter_share_state") ?? ""
        
        if !city.isEmpty && !state.isEmpty {
            fetchWeatherForCity(city: city, state: state)
            UserDefaults.standard.set(false, forKey: "is_twitter_sharing")
        }
    }
    func clearTwitterState() {
        UserDefaults.standard.set(false, forKey: "is_twitter_sharing")
        UserDefaults.standard.removeObject(forKey: "twitter_share_city")
        UserDefaults.standard.removeObject(forKey: "twitter_share_state")
    }

    
    
    override init() {
        super.init()

        clearAllStates()
            setupLocationManager()
    }
    func clearAllStates() {
        // Clear Twitter state
        clearTwitterState()
        
        // Reset search-related states
        isShowingSearchResult = false
        selectedCity = nil
        searchText = ""
        searchResults = []
        
        // Clear any stored state in UserDefaults
        UserDefaults.standard.removeObject(forKey: "is_twitter_sharing")
        UserDefaults.standard.removeObject(forKey: "twitter_share_city")
        UserDefaults.standard.removeObject(forKey: "twitter_share_state")
        UserDefaults.standard.removeObject(forKey: "last_search_state")
    }
    
    
    private func setupLocationManager() {
        locationManager.delegate = self

            locationManager.desiredAccuracy = kCLLocationAccuracyKilometer
            locationManager.distanceFilter = kCLDistanceFilterNone
            locationManager.activityType = .other
            locationManager.pausesLocationUpdatesAutomatically = true

        }
    func resetToCurrentLocation() {
        isShowingSearchResult = false
        selectedCity = nil
        if let location = currentLocation {
            fetchWeatherForLocation(latitude: location.coordinate.latitude,
                                  longitude: location.coordinate.longitude)
        } else {
            startLocationUpdates()
        }
    }
    
    func startLocationUpdates() {
            isLoading = true
            errorMessage = nil
            print("Starting location updates...")
            
            let status = locationManager.authorizationStatus
            locationAuthorizationStatus = status
            
            switch status {
            case .notDetermined:
                print("Location authorization not determined")
                locationManager.requestWhenInUseAuthorization()
                
            case .authorizedWhenInUse, .authorizedAlways:
                print("Location authorization granted")
                isLoading = true
                locationManager.startUpdatingLocation()
                
            case .denied:
                print("Location authorization denied")
                isLoading = false
                errorMessage = "Please enable location access in Settings to see weather for your location."
                
            case .restricted:
                print("Location authorization restricted")
                isLoading = false
                errorMessage = "Location access is restricted."
                
            @unknown default:
                print("Unknown location authorization status")
                isLoading = false
                errorMessage = "Unknown location authorization status"
            }
        }
    

    
    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
            print("Location authorization changed to: \(manager.authorizationStatus.rawValue)")
            locationAuthorizationStatus = manager.authorizationStatus
            
            switch manager.authorizationStatus {
            case .authorizedWhenInUse, .authorizedAlways:
                print("Authorization granted, starting updates")
                isLoading = true
                locationManager.startUpdatingLocation()
                
            case .denied, .restricted:
                print("Authorization denied or restricted")
                isLoading = false
                errorMessage = "Location access is denied. Please enable it in Settings to use location features."
                
            default:
                break
            }
        }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else {
            print("No location data received")
            return
        }
        
        currentLocation = location
        if !isShowingSearchResult {
                fetchWeatherForLocation(latitude: location.coordinate.latitude,
                                      longitude: location.coordinate.longitude)
            }
    }
    
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
            print("Location error: \(error.localizedDescription)")
            isLoading = false
            
            if let clError = error as? CLError {
                switch clError.code {
                case .denied:
                    errorMessage = "Location access denied. Please enable it in Settings."
                case .network:
                    errorMessage = "Network error. Please check your connection."
                case .locationUnknown:
                    if locationManager.authorizationStatus == .authorizedWhenInUse {
                        // Retry if we have permission
                        locationManager.startUpdatingLocation()
                    }
                    return
                default:
                    errorMessage = "Location error: \(error.localizedDescription)"
                }
            } else {
                errorMessage = "Error accessing location: \(error.localizedDescription)"
            }
        }
    
    // MARK: - API Methods
    
    func fetchWeatherForLocation(latitude: Double, longitude: Double) {
        isLoading = true
        errorMessage = nil
        print("Fetching weather for lat: \(latitude), lon: \(longitude)")
        
        guard let url = URL(string: "\(baseURL)/api/weatherSearch?lat=\(latitude)&long=\(longitude)") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }
        
        let task = URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                if let error = error {
                    print("Network error: \(error)")
                    self?.errorMessage = "Network error: \(error.localizedDescription)"
                    return
                }
                
                guard let data = data else {
                    print("No data received")
                    self?.errorMessage = "No data received"
                    return
                }
                
                // Print the raw JSON response
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("Raw JSON Response: \(jsonString)")
                    
                    // Try to parse it as a dictionary for debugging
                    if let jsonData = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                        print("JSON Structure:")
                        print(jsonData.keys) // Print top-level keys
                    }
                }
                
                do {
                    let decoder = JSONDecoder()
                    let weather = try decoder.decode(WeatherData.self, from: data)
                    self?.currentWeather = weather
                    print("Successfully decoded weather data")
                } catch let DecodingError.keyNotFound(key, context) {
                    print("Key not found: \(key)")
                    print("Coding path: \(context.codingPath)")
                    print("Debug description: \(context.debugDescription)")
                    self?.errorMessage = "Missing data for: \(key.stringValue)"
                } catch let DecodingError.valueNotFound(type, context) {
                    print("Value of type \(type) not found: \(context.debugDescription)")
                    self?.errorMessage = "Missing value of type: \(type)"
                } catch let DecodingError.typeMismatch(type, context) {
                    print("Type mismatch: expected \(type)")
                    print("Coding path: \(context.codingPath)")
                    self?.errorMessage = "Data type mismatch"
                } catch {
                    print("Other decoding error: \(error)")
                    self?.errorMessage = "Error decoding weather data: \(error.localizedDescription)"
                }
            }
        }
        task.resume()
    }
    func fetchAutocomplete(query: String) {
        guard !query.isEmpty,
              let encodedQuery = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/api/places/autocomplete?input=\(encodedQuery)") else {
            return
        }
        
        let task = URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self?.errorMessage = "Network error: \(error.localizedDescription)"
                    return
                }
                
                guard let data = data else { return }
                
                do {
                    let results = try JSONDecoder().decode([AutocompleteResult].self, from: data)
                    self?.searchResults = results
                } catch {
                    self?.errorMessage = "Error decoding search results"
                }
            }
        }
        task.resume()
    }
}

extension WeatherViewModel {
    func fetchWeatherForCity(city: String, state: String) {
        isLoading = true
        errorMessage = nil
        isShowingSearchResult = true
        selectedCity = city
        
        
        // URL encode the city and state
        guard let encodedCity = city.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let encodedState = state.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
              let url = URL(string: "\(baseURL)/api/address-weather?city=\(encodedCity)&state=\(encodedState)") else {
            errorMessage = "Invalid URL"
            isLoading = false
            return
        }
        
        URLSession.shared.dataTask(with: url) { [weak self] data, response, error in
            DispatchQueue.main.async {
                self?.isLoading = false
                
                if let error = error {
                    self?.errorMessage = "Network error: \(error.localizedDescription)"

                    return
                }
                
                guard let data = data else {
                    self?.errorMessage = "No data received"
                    return
                }
                
                
                do {
                    let decoder = JSONDecoder()
                    let weather = try decoder.decode(WeatherData.self, from: data)
                    self?.currentWeather = weather
                    
    
                } catch {
                    print("Decoding error: \(error)")
                    self?.errorMessage = "Error decoding weather data: \(error.localizedDescription)"
                }
            }
        }.resume()
    }
}
