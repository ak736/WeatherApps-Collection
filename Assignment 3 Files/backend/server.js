const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()

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
    console.log('Making request to Tomorrow.io API...')
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
        timesteps: ['1d', '1h'],
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
                windSpeed: day.values.windSpeedMin,
                weatherCode: day.values.weatherCodeMin,
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
        city: location.city,
        state: location.region,
        lat,
        lon,
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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
