from flask import Flask, render_template, request, jsonify
from weather import (
    get_geoloc_from_ip, 
    get_geoloc_from_address, 
    get_weather, 
    get_location_info_from_ip,
    reverse_geocode  # Imported reverse_geocode
)
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
]

@app.route('/')
def index():
    return app.send_static_file('home.html')

@app.route('/get_weather', methods=['GET'])
def get_weather_route():
    try:
        auto_detect = request.args.get('auto_detect', 'false').lower() == 'true'
        response_data = {}
        if auto_detect:
            # Use IP-based geolocation
            lat, lon = get_geoloc_from_ip()
            location_info = get_location_info_from_ip()
            response_data['location'] = location_info
            app.logger.debug(f"Auto-detect enabled. Latitude: {lat}, Longitude: {lon}")
            app.logger.debug(f"Location Info: {location_info}")
        else:
            # Get address parameters
            street = request.args.get('street', '').strip()
            city = request.args.get('city', '').strip()
            state = request.args.get('state', '').strip()
            if not street or not city or not state:
                app.logger.warning("Missing address fields.")
                return jsonify({'error': 'Street, City, and State are required unless auto-detect is enabled.'}), 400
            lat, lon = get_geoloc_from_address(street, city, state)
            app.logger.debug(f"Geocoded address. Latitude: {lat}, Longitude: {lon}")

            # Perform reverse geocoding to get detailed address components
            address_info = reverse_geocode(lat, lon)
            response_data['address'] = {
                'street': address_info.get('street', street),
                'city': address_info.get('city', city),
                'state': address_info.get('state', state),  # Already abbreviated
                'postal': address_info.get('postal', ''),
                'country': address_info.get('country', 'USA'),
            }
            app.logger.debug(f"Reverse Geocoded Address Info: {response_data['address']}")

        # Get weather data
        weather_data = get_weather(lat, lon)
        response_data['weather'] = weather_data
        app.logger.debug(f"Weather data retrieved: {weather_data}")
        return jsonify(response_data)

    except Exception as e:
        app.logger.error(f"Error in /get_weather: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/get_location', methods=['GET'])
def get_location():
    try:
        location = get_location_info_from_ip()
        return jsonify(location)
    except Exception as e:
        app.logger.error(f"Error in /get_location: {e}")
        return jsonify({'error': str(e)}), 500
    
@app.route("/handleRequest", methods=['GET'])
def handle_request():
    # Get input parameters from the request
    street = request.args.get('street', default='', type=str)
    city = request.args.get('city', default='', type=str)
    state = request.args.get('state', default='', type=str)

    # Check if inputs are provided
    if not street or not city or not state:
        return jsonify({"error": "Street, City, and State are required."}), 400

    try:
        # Get the latitude and longitude from the address
        lat, lon = get_geoloc_from_address(street, city, state)

        # Get the weather data using the latitude and longitude
        weather_data = get_weather(lat, lon)

        # Construct the full address
        full_address = f"{street}, {city}, {state}"

        # Prepare the response with weather data and full address
        response = {
            "address": full_address,
            "weather": weather_data
        }

        # Return the response as JSON
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
