import requests
import os
from dotenv import load_dotenv
import logging

load_dotenv()

def get_geoloc_from_ip(ip=None):
    token = os.getenv('IP_INFO_TOKEN')
    url = f"https://ipinfo.io/{ip}/json" if ip else "https://ipinfo.io/json"
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    response = requests.get(url, headers=headers)
    logging.debug(f"IPInfo API Response Status: {response.status_code}")
    logging.debug(f"IPInfo API Response Body: {response.text}")

    if response.status_code != 200:
        raise Exception("Failed to retrieve location from IP.")
    data = response.json()
    loc = data.get('loc')
    if not loc:
        raise Exception("Location data not found in IPInfo response.")
    try:
        lat, lon = map(float, loc.split(','))
        return lat, lon
    except ValueError:
        raise Exception("Invalid location format received from IPInfo.")

def get_location_info_from_ip(ip=None):
    token = os.getenv('IP_INFO_TOKEN')
    url = f"https://ipinfo.io/{ip}/json" if ip else "https://ipinfo.io/json"
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    response = requests.get(url, headers=headers)
    logging.debug(f"IPInfo API Response Status: {response.status_code}")
    logging.debug(f"IPInfo API Response Body: {response.text}")

    if response.status_code != 200:
        raise Exception("Failed to retrieve location from IP.")
    data = response.json()
    city = data.get('city')
    region = data.get('region')
    country = data.get('country')
    postal = data.get('postal')
    return {'city': city, 'region': region, 'country': country, 'postal': postal}

def get_geoloc_from_address(street, city, state):
    api_key = os.getenv('GEOCODING_API_KEY')
    address = f"{street}, {city}, {state}, USA"
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception("Failed to perform geocoding.")
    data = response.json()
    if data['status'] != 'OK':
        raise Exception(f"Geocoding error: {data['status']}")
    location = data['results'][0]['geometry']['location']
    return location['lat'], location['lng']

def reverse_geocode(lat, lon):
    """
    Converts latitude and longitude into detailed address components using Google Geocoding API.
    Returns a dictionary with street, city, state (abbreviated), postal code, and country.
    """
    api_key = os.getenv('GEOCODING_API_KEY')
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'latlng': f"{lat},{lon}",
        'key': api_key,
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise Exception("Failed to perform reverse geocoding.")
    data = response.json()
    if data['status'] != 'OK':
        raise Exception(f"Reverse Geocoding error: {data['status']}")

    # Parse the address components
    components = data['results'][0]['address_components']
    address_info = {}
    for component in components:
        types = component['types']
        if 'street_number' in types:
            address_info['street_number'] = component['long_name']
        if 'route' in types:
            address_info['route'] = component['long_name']
        if 'locality' in types:
            address_info['city'] = component['long_name']
        if 'administrative_area_level_1' in types:
            address_info['state'] = component['short_name']  # Abbreviated state
        if 'postal_code' in types:
            address_info['postal'] = component['long_name']
        if 'country' in types:
            address_info['country'] = component['long_name']

    # Construct the street address
    street_number = address_info.get('street_number', '')
    route = address_info.get('route', '')
    street = f"{street_number} {route}".strip()

    return {
        'street': street,
        'city': address_info.get('city', ''),
        'state': address_info.get('state', ''),
        'postal': address_info.get('postal', ''),
        'country': address_info.get('country', 'USA'),
    }

def get_weather(lat, lon):
    api_key = os.getenv('TOMORROWIO_API_KEY')
    url = "https://api.tomorrow.io/v4/timelines"
    payload = {
        'apikey': api_key,
        'location': f"{lat},{lon}",
        'fields': ['temperature','temperatureMax','temperatureMin','weatherCode', 'windSpeed', 'precipitationProbability','precipitationType','humidity', 'sunriseTime','sunsetTime', 'visibility', 'moonPhase', 'cloudCover', 'pressureSurfaceLevel', 'pressureSeaLevel', 'windSpeed', 'windDirection','uvIndex'],
        'units': 'imperial',
        'timezone': 'America/Los_Angeles',
        'timesteps': ['current', '1h','1d'],
    }
    headers = {
        "accept": "application/json",
        "Accept-Encoding": "gzip"
    }
    response = requests.get(url, headers=headers, params=payload)
    if response.status_code != 200:
        raise Exception("Failed to retrieve weather data.")
    return response.json()
