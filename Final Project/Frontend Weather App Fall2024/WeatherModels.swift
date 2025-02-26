//
//  WeatherModels.swift
//  Weather App Fall2024
//
//  Created by Aniket Kumar on 11/20/24.
//

import Foundation

struct WeatherData: Codable {
    let location: LocationData
    let forecast: ForecastData
}

struct LocationData: Codable {
    let city: String
    let state: String
    let lat: Double
    let lon: Double
    let street: String?
}

struct ForecastData: Codable {
    let timelines: [Timeline]
    let data: TimelineContainer?
    
    private enum CodingKeys: String, CodingKey {
        case timelines
        case data
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        // Try to decode timelines directly first
        if let directTimelines = try? container.decode([Timeline].self, forKey: .timelines) {
            self.timelines = directTimelines
            self.data = nil
        } else {
            // If that fails, try to decode from the nested data structure
            let dataContainer = try container.decode(TimelineContainer.self, forKey: .data)
            self.timelines = dataContainer.timelines
            self.data = dataContainer
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(timelines, forKey: .timelines)
        try container.encodeIfPresent(data, forKey: .data)
    }
}

struct TimelineContainer: Codable {
    let timelines: [Timeline]
}

struct TimelineData: Codable {
    let timelines: [Timeline]
}

struct Timeline: Codable {
    let intervals: [Interval]
}

struct Interval: Codable {
    let startTime: String
    let values: WeatherValues
}

struct WeatherValues: Codable {
    let temperatureMax: Double
    let temperatureMin: Double
    let temperatureApparent: Double?
    let windSpeed: Double?
    let weatherCode: Int?
    let sunriseTime: String?
    let sunsetTime: String?
    let humidity: Double?
    let visibility: Double?
    let cloudCover: Double?
    let pressureSurfaceLevel: Double?
    let precipitationProbability: Double?
    let moonPhase: Double?
    let windDirection: Double?
    let uvIndex: Double?
}

struct AutocompleteResult: Codable, Identifiable {
    let city: String
    let state: String
    let description: String
    
    var id: String { "\(city),\(state)" }
}
