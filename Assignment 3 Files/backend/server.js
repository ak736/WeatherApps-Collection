const express = require('express')
const cors = require('cors')
const axios = require('axios')
const mongoose = require('mongoose');
const app = express();
require('dotenv').config()

app.use(
  cors({
    origin: 'http://localhost:4200', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

app.use(express.json())

app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input } = req.query

    // Call to Google Places API
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/autocomplete/json',
      {
        params: {
          input: input,
          types: '(cities)', // Restrict to cities only
          key: process.env.GOOGLE_API_KEY,
        },
      }
    )

    // Modify the response to include only what we need
    const predictions = response.data.predictions.map((prediction) => ({
      city: prediction.terms[0].value,
      state: prediction.terms[1].value,
      description: prediction.terms[0].value, // Just the city name
    }))

    res.json(predictions)
  } catch (error) {
    console.error('Error fetching predictions:', error)
    res.status(500).json({ error: 'Failed to fetch predictions' })
  }
})

async function getWeatherData(lat, lon) {
  try {
    const tomorrowApiKey = process.env.TOMORROW_API_KEY
    const startTime = new Date()
    startTime.setHours(0, 0, 0, 0)
    const url = 'https://api.tomorrow.io/v4/weather/forecast'
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
      params: {
        location: `${lat},${lon}`,
        fields: [
          'temperature',
          'temperatureMax',
          'temperatureMin',
          'temperatureApparent',
          'weatherCode',
          'windSpeed',
          'precipitationProbability',
          'humidity',
          'sunriseTime',
          'sunsetTime',
          'visibility',
          'moonPhase',
          'cloudCover',
          'pressureSurfaceLevel',
          'windDirection',
          'uvIndex',
        ],
        timesteps: ['1h', '1d'],
        startTime: startTime.toISOString(),
        endTime: getEndTime(startTime, 7).toISOString(),
        units: 'imperial',
        apikey: tomorrowApiKey,
      },
    })

    // Transform the data
    return {
      data: {
        timelines: [
          {
            intervals: response.data.timelines.daily.map((day) => ({
              startTime: day.time,
              values: {
                temperatureMax: day.values.temperatureMax,
                temperatureMin: day.values.temperatureMin,
                temperatureApparent:
                  day.values.temperatureApparentAvg ||
                  day.values.temperatureApparentMin,
                windSpeed: day.values.windSpeedAvg,
                weatherCode: day.values.weatherCodeMin,
                sunriseTime: day.values.sunriseTime,
                sunsetTime: day.values.sunsetTime,
                humidity: day.values.humidityAvg || day.values.humidityMin,
                visibility:
                  day.values.visibilityAvg || day.values.visibilityMin,
                cloudCover:
                  day.values.cloudCoverAvg || day.values.cloudCoverMin,
                pressureSurfaceLevel:
                  day.values.pressureSurfaceLevelAvg ||
                  day.values.pressureSurfaceLevel,
              },
            })),
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error in getWeatherData:', error.message)
    throw error
  }
}

// In server.js, modify the getMeteogramData function and endpoint:
// In server.js, update the getMeteogramData function:
async function getMeteogramData(lat, lon) {
  try {
    const tomorrowApiKey = process.env.TOMORROW_API_KEY;
    const startTime = new Date();
    startTime.setHours(0, 0, 0, 0);
    const url = 'https://api.tomorrow.io/v4/weather/forecast';
    
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
      },
      params: {
        location: `${lat},${lon}`,
        fields: [
          'temperature',
          'humidity',
          'pressureSurfaceLevel',
          'windSpeed',
          'windDirection'
        ],
        timesteps: ['1h'],
        startTime: startTime.toISOString(),
        endTime: getEndTime(startTime, 5).toISOString(),
        units: 'imperial',
        apikey: tomorrowApiKey,
      },
    });


    // Check for hourly data in the response
    if (!response.data?.timelines?.hourly) {
      throw new Error('No hourly data found in API response');
    }

    const meteogramData = response.data.timelines.hourly.map(hour => ({
      time: hour.time,
      values: {
        temperature: hour.values.temperature,
        humidity: hour.values.humidity,
        pressure: hour.values.pressureSurfaceLevel,
        windSpeed: hour.values.windSpeed,
        windDirection: hour.values.windDirection || 0
      }
    }));

    return meteogramData;

  } catch (error) {
    console.error('Detailed error in getMeteogramData:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    throw error;
  }
}

app.get('/api/meteogram-data', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const meteogramData = await getMeteogramData(parseFloat(lat), parseFloat(lon));
    res.json(meteogramData);
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to fetch meteogram data', 
      details: error.message,
      apiError: error.response?.data 
    });
  }
});

// Current location weather endpoint
app.get('/api/location-weather', async (req, res) => {
  try {
    const ipinfoToken = process.env.IP_INFO_TOKEN
    const ipinfoResponse = await axios.get(
      `https://ipinfo.io?token=${ipinfoToken}`
    )
    const location = ipinfoResponse.data
    const [lat, lon] = location.loc.split(',')

    const weatherData = await getWeatherData(lat, lon)

    res.json({
      location: {
        street: '',
        city: location.city,
        state: location.region,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      },
      forecast: weatherData, // This will include the data property
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: 'Failed to fetch location or weather data' })
  }
})

function getEndTime(startDate, days) {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + days)
  return endDate
}

// Address-based weather endpoint
app.get('/api/address-weather', async (req, res) => {
  try {
    const { street, city, state } = req.query
    const address = `${street}, ${city}, ${state}`

    // Get coordinates from Google Geocoding API
    const geocodeResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address: address,
          key: process.env.GOOGLE_API_KEY,
        },
      }
    )

    if (!geocodeResponse.data.results.length) {
      return res.status(404).json({ error: 'Address not found' })
    }

    const location = geocodeResponse.data.results[0].geometry.location
    const weatherData = await getWeatherData(location.lat, location.lng)

    res.json({
      location: {
        street: street || '',
        city,
        state,
        lat: location.lat,
        lon: location.lng,
      },
      forecast: weatherData,
    })
  } catch (error) {
    console.error('Error:', error.message)
    res.status(500).json({ error: 'Failed to fetch weather data' })
  }
})

// MongoDB connection
mongoose.connect('mongodb+srv://aniketkir63:4CtyQURJMRzAaobN@weather-cluster.rctjc.mongodb.net/?retryWrites=true&w=majority&appName=Weather-Cluster', {
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Create MongoDB Schema and Model
const favoriteSchema = new mongoose.Schema({
  city: String,
  state: String
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

// API Routes
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find();
    res.json(favorites.map(favorite => ({
      _id: favorite._id,
      city: favorite.city,
      state: favorite.state
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const favorite = new Favorite(req.body);
    await favorite.save();
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/favorites/:id', async (req, res) => {
  try {
    await Favorite.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Favorite deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
