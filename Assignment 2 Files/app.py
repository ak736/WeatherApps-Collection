from flask import Flask, render_template, request, jsonify
from weather import get_geoloc_from_ip, get_geoloc_from_address, get_weather, get_location_info_from_ip
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
    return render_template('home.html', states=US_STATES)

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
            response_data['address'] = {
                'street': street,
                'city': city,
                'state': state
            }
            app.logger.debug(f"Geocoded address. Latitude: {lat}, Longitude: {lon}")
        
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
