document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('weather-form');
    const autoDetectCheckbox = document.getElementById('auto-detect');
    const streetInput = document.getElementById('street');
    const cityInput = document.getElementById('city');
    const stateSelect = document.getElementById('state');
  
    const streetTooltip = document.getElementById('street-tooltip');
    const cityTooltip = document.getElementById('city-tooltip');
    const stateTooltip = document.getElementById('state-tooltip');
  
    const weatherResults = document.getElementById('weather-results');
    const locationEl = document.getElementById('location');
    const temperatureEl = document.getElementById('temperature');
    // const weatherConditionEl = document.getElementById('weather-condition');
    const humidityEl = document.getElementById('humidity');
    const pressureEl = document.getElementById('pressure');
    const windSpeedEl = document.getElementById('wind-speed');
    const visibilityEl = document.getElementById('visibility');
    const cloudCoverEl = document.getElementById('cloud-cover');
    const uvLevelEl = document.getElementById('uv-level');
    // const sunriseEl = document.getElementById('sunrise');
    // const sunsetEl = document.getElementById('sunset');
  
    const weatherCodeMap = {
      1000: { img: 'clear_day.svg', description: 'Clear Day' },
      1001: { img: 'cloudy.svg', description: 'Cloudy' },
      4000: { img: 'drizzle.svg', description: 'Drizzle' },
      5001: { img: 'flurries.svg', description: 'Flurries' },
      2100: { img: 'fog_light.svg', description: 'Light Fog' },
      2000: { img: 'fog.svg', description: 'Fog' },
      6000: { img: 'freezing_drizzle.svg', description: 'Freezing Drizzle' },
      6201: { img: 'freezing_rain_heavy.svg', description: 'Heavy Freezing Rain' },
      6200: { img: 'freezing_rain_light.svg', description: 'Light Freezing Rain' },
      6001: { img: 'freezing_rain.svg', description: 'Freezing Rain' },
      7101: { img: 'ice_pellets_heavy.svg', description: 'Heavy Ice Pellets' },
      7102: { img: 'ice_pellets_light.svg', description: 'Light Ice Pellets' },
      7000: { img: 'ice_pellets.svg', description: 'Ice Pellets' },
      1100: { img: 'mostly_clear_day.svg', description: 'Mostly Clear' },
      1102: { img: 'mostly_cloudy.svg', description: 'Mostly Cloudy' },
      1101: { img: 'partly_cloudy_day.svg', description: 'Partly Cloudy' },
      4201: { img: 'rain_heavy.svg', description: 'Heavy Rain' },
      4200: { img: 'rain_light.svg', description: 'Light Rain' },
      4001: { img: 'rain.svg', description: 'Rain' },
      5101: { img: 'snow_heavy.svg', description: 'Heavy Snow' },
      5100: { img: 'snow_light.svg', description: 'Light Snow' },
      5000: { img: 'snow.svg', description: 'Snow' },
      8000: { img: 'tstorm.svg', description: 'Thunderstorm' },
    };
  
    // Function to clear tooltips
    const clearTooltips = () => {
      streetTooltip.textContent = '';
      cityTooltip.textContent = '';
      stateTooltip.textContent = '';
    };
  
    // Function to display tooltips
    const showTooltip = (element, message) => {
      element.textContent = message;
    };
  
    // Handle auto-detect checkbox behavior
    autoDetectCheckbox.addEventListener('change', () => {
      if (autoDetectCheckbox.checked) {
        streetInput.disabled = true;
        cityInput.disabled = true;
        stateSelect.disabled = true;
        clearTooltips();
      } else {
        streetInput.disabled = false;
        cityInput.disabled = false;
        stateSelect.disabled = false;
      }
    });
  
    // Handle form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form submission
  
      clearTooltips(); // Clear previous tooltips
      weatherResults.style.display = 'none'; // Hide previous results
  
      const street = streetInput.value.trim();
      const city = cityInput.value.trim();
      const state = stateSelect.value;
      const autoDetect = autoDetectCheckbox.checked;
  
      let valid = true;
  
      // Validate inputs if auto-detect is not checked
      if (!autoDetect) {
        if (street === '') {
          showTooltip(streetTooltip, 'Street is required.');
          valid = false;
        }
        if (city === '') {
          showTooltip(cityTooltip, 'City is required.');
          valid = false;
        }
        if (state === '') {
          showTooltip(stateTooltip, 'State is required.');
          valid = false;
        }
      }
  
      if (!valid) {
        return; // Stop if validation fails
      }
  
      // Construct query parameters
      const params = new URLSearchParams();
      if (autoDetect) {
        params.append('auto_detect', 'true');
      } else {
        params.append('street', street);
        params.append('city', city);
        params.append('state', state);
      }
  
      // Send GET request to Flask backend
      fetch(`/get_weather?${params.toString()}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Weather data received:', data); // Log data for debugging
          if (data.error) {
            weatherResults.innerHTML = `<p class="error">${data.error}</p>`;
          } else {
            displayWeather(data, autoDetect);
          }
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          weatherResults.innerHTML = `<p class="error">An unexpected error occurred: ${error.message}</p>`;
        });
    });
  
    // Function to display weather data
    const displayWeather = (data, autoDetect) => {
      try {
        let locationDetails = '';
        if (autoDetect && data.location) {
          locationDetails = `
            <li><strong>City:</strong> ${data.location.city || 'N/A'}</li>
            <li><strong>Region:</strong> ${data.location.region || 'N/A'}</li>
            <li><strong>Country:</strong> ${data.location.country || 'N/A'}</li>
            <li><strong>Postal Code:</strong> ${data.location.postal || 'N/A'}</li>
          `;
        } else if (data.address) {
          locationDetails = `
            <li><strong>Street:</strong> ${data.address.street}</li>
            <li><strong>City:</strong> ${data.address.city}</li>
            <li><strong>State:</strong> ${data.address.state}</li>
          `;
        }
  
        const timelines = data.weather.data ? data.weather.data.timelines : data.weather.timelines;
        const currentTimeline = timelines.find(t => t.timestep === 'current');
        const interval = currentTimeline.intervals[0];
        const values = interval.values;
        const weatherCode = values.weatherCode;
  
        // Get weather data from the map
        const weatherData = weatherCodeMap[weatherCode] || { img: 'default.svg', description: 'Unknown Condition' };
        const weatherIconPath = `/static/images/weather_codes/${weatherData.img}`;
        const weatherDescription = weatherData.description;
  
        // Set the image source and alt text
        const weatherIconEl = document.getElementById('weather-icon');
        if (weatherIconEl) {
          weatherIconEl.src = weatherIconPath;
          weatherIconEl.alt = `Weather Condition: ${weatherDescription}`;
        } else {
          console.error('Element with id "weather-icon" not found.');
        }
  
        // Set the weather condition description
        const weatherDescriptionEl = document.getElementById('weather-description');
        if (weatherDescriptionEl) {
          weatherDescriptionEl.textContent = weatherDescription;
        } else {
          console.error('Element with id "weather-description" not found.');
        }
  
        // const sunrise = values.sunriseTime
        //   ? new Date(values.sunriseTime).toLocaleTimeString([], {
        //       hour: '2-digit',
        //       minute: '2-digit',
        //     })
        //   : 'N/A';
        // const sunset = values.sunsetTime
        //   ? new Date(values.sunsetTime).toLocaleTimeString([], {
        //       hour: '2-digit',
        //       minute: '2-digit',
        //     })
        //   : 'N/A';
  
        locationEl.textContent =
          autoDetect && data.location
            ? `${data.location.city}, ${data.location.region}`
            : `${data.address.city}, ${data.address.state}`;
        temperatureEl.textContent = values.temperature !== undefined ? `${values.temperature}°` : 'N/A';
        humidityEl.textContent = `${values.humidity || 'N/A'}%`;
        pressureEl.textContent = `${values.pressureSeaLevel || 'N/A'} inHg`;
        windSpeedEl.textContent = `${values.windSpeed || 'N/A'} mph`;
        visibilityEl.textContent = `${values.visibility || 'N/A'} mi`;
        cloudCoverEl.textContent = `${values.cloudCover || 'N/A'}%`;
        uvLevelEl.textContent = values.uvIndex || 'N/A';
        // sunriseEl.textContent = sunrise;
        // sunsetEl.textContent = sunset;
  
        weatherResults.style.display = 'block';
      } catch (err) {
        console.error('Error parsing weather data:', err);
        weatherResults.innerHTML = `<p class="error">Failed to parse weather data.</p>`;
      }
    };
  });
  