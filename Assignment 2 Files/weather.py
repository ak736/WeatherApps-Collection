import requests
import os
from dotenv import load_dotenv
import ipinfo

load_dotenv()

# def get_geoloc():
    # hostname = socket.gethostname()
    # IPAddress = socket.gethostbyname(hostname)
    # token = "a299ed4e40e3c5"
    # handler = ipinfo.getHandler(token)
    # details = handler.getDetails(handler)
    # print(details.loc)
    # url = f"https://ipinfo.io/{IPAddress}/loc?token={token}"
    # response_geo = requests.get(url)
    # print(response_geo)
    # url = f"https://ipinfo.io/json?token={token}"
    # response_geo = requests.get(url)
    # if response_geo.status_code == 200:
    #     data = response_geo.json()
    #     loc = data['loc']  
    #     lat, lon = loc.split(',')
    #     return float(lat), float(lon)
    # else:
    #     print("Error fetching geolocation.")
    #     return None, None

def get_geoloc():
    token = os.getenv('IP_INFO_TOKEN')  # Replace with your IPInfo token
    handler = ipinfo.getHandler(token)
    details = handler.getDetails()  # Uses the request's IP address
    loc = details.loc  # 'loc' is a string in "lat,long" format
    lat, lon = loc.split(',')
    return float(lat), float(lon)

def get_weather():
    lat, lon = get_geoloc()
    api_key = os.getenv('TOMORROWIO_API_KEY')
    url = "https://api.tomorrow.io/v4/timelines"
    payload = {
        'apikey': api_key,
        'location': f"{lat},{lon}",
        'fields': ['temperatureMax','temperatureMin','weatherCode', 'windSpeed', 'precipitationProbability','precipitationType','humidity', 'sunriseTime','sunsetTime', 'visibility', 'moonPhase', 'cloudCover', 'pressureSurfaceLevel', 'pressureSeaLevel', 'windSpeed'],
        'units': 'imperial',
        'timesteps': ['1d']
    }

    headers = {
        "accept": "application/json",
        "Accept-Encoding": "gzip"
    }
    response = requests.get(url, headers=headers, params=payload)
    # return response.json()
    data = response.json()

    # Add the location to the response data
    data['location'] = {
        'latitude': lat,
        'longitude': lon
    }

    return data
  