document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('weather-form')
  const autoDetectCheckbox = document.getElementById('auto-detect')
  const streetInput = document.getElementById('street')
  const cityInput = document.getElementById('city')
  const stateSelect = document.getElementById('state')

  const streetTooltip = document.getElementById('street-tooltip')
  const cityTooltip = document.getElementById('city-tooltip')
  const stateTooltip = document.getElementById('state-tooltip')

  const weatherResults = document.getElementById('weather-results')
  const forecastSection = document.getElementById('forecast-section')

  const locationEl = document.getElementById('location')
  const temperatureEl = document.getElementById('temperature')
  const humidityEl = document.getElementById('humidity')
  const pressureEl = document.getElementById('pressure')
  const windSpeedEl = document.getElementById('wind-speed')
  const visibilityEl = document.getElementById('visibility')
  const cloudCoverEl = document.getElementById('cloud-cover')
  const uvLevelEl = document.getElementById('uv-level')

  const weatherCodeMap = {
    1000: { img: 'clear_day.svg', description: 'Clear Day' },
    1001: { img: 'cloudy.svg', description: 'Cloudy' },
    4000: { img: 'drizzle.svg', description: 'Drizzle' },
    5001: { img: 'flurries.svg', description: 'Flurries' },
    2100: { img: 'fog_light.svg', description: 'Light Fog' },
    2000: { img: 'fog.svg', description: 'Fog' },
    6000: { img: 'freezing_drizzle.svg', description: 'Freezing Drizzle' },
    6201: {
      img: 'freezing_rain_heavy.svg',
      description: 'Heavy Freezing Rain',
    },
    6200: {
      img: 'freezing_rain_light.svg',
      description: 'Light Freezing Rain',
    },
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
  }

  // Function to clear tooltips
  const clearTooltips = () => {
    streetTooltip.textContent = ''
    cityTooltip.textContent = ''
    stateTooltip.textContent = ''
  }

  const US_STATES = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ]

  // Get the dropdown element
  const dropdown = document.getElementById('state')

  // Populate the dropdown with options
  US_STATES.forEach((state) => {
    let option = document.createElement('option')
    option.value = state
    option.textContent = state
    dropdown.appendChild(option)
  })

  const toggleWeatherChartButton = document.getElementById(
    'toggle-weather-chart-button'
  )

  const weatherHighChartText = document.getElementById(
    'weather-high-chart-text'
  )
  const weatherHighChartContainer = document.getElementById(
    'weather-high-chart-container'
  )
  const meteogramContainer = document.getElementById('meteogram-container')

  // **Function to Render the Highcharts Arearange Graph**
  const renderTemperatureRangeChart = (chartData) => {
    Highcharts.chart('weather-chart-container', {
      chart: {
        type: 'arearange',
        zoomType: 'x',
        panning: true,
        panKey: 'shift',
      },
      boost: {
        useGPUTranslations: true,
      },
      title: {
        text: 'Temperature Range (Min, Max)',
      },
      xAxis: {
        type: 'datetime',
        crosshair: true,
        title: {
          text: 'Date',
        },
        labels: {
          format: '{value:%d %b}', // Format: "15 Oct"
          style: {
            fontSize: '10px',
          },
        },
        tickInterval: 24 * 3600 * 1000, // One day in milliseconds
        min: (function () {
          // Calculate the start of today (midnight)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return today.getTime()
        })(),
        max: (function () {
          // Calculate the end of the fourth day from today (inclusive)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return today.getTime() + 4 * 24 * 3600 * 1000 // Today + 4 days + end of day
        })(),
        // Ensure the axis starts and ends exactly on the specified min and max
        startOnTick: true,
        endOnTick: true,
        // Remove any additional padding
        minPadding: 0,
        maxPadding: 0,
      },

      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          let s = `<small>${Highcharts.dateFormat(
            '%A, %b %e',
            this.x
          )}</small><br/>` // Tooltip shows date without time
          this.points.forEach(function (point) {
            s += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${point.point.low}°F - ${point.point.high}°F</b><br/>`
          })
          return s
        },
      },
      yAxis: {
        title: {
          text: 'Temperature (°F)',
        },
        labels: {
          format: '{value}°',
          style: {
            fontSize: '10px',
          },
          x: -3,
        },
        plotLines: [
          {
            value: 0,
            color: '#BBBBBB',
            width: 1,
            zIndex: 2,
          },
        ],
        min: 55, // Set minimum value to 55°F
        max: 80, // Set maximum value to 80°F
        tickInterval: 5, // Set tick interval to 5°F
        gridLineColor: 'rgba(128, 128, 128, 0.1)',
      },
      series: [
        {
          name: 'Temperature Range',
          data: chartData,
          type: 'arearange',
          lineWidth: 1, // Reduced line thickness
          color: 'orange',
          fillOpacity: 0.1,
          marker: {
            enabled: true,
            radius: 5,
            fillColor: '#2baffd',
          },
          tooltip: {
            pointFormat:
              '<span style="color:{series.color}">\u25CF</span> Temp Range: <b>{point.low}°F - {point.high}°F</b><br/>',
          },
          zIndex: 1,
        },
      ],
      plotOptions: {
        series: {
          fillColor: {
            linearGradient: [0, 100, 0, 250],
            stops: [
              [0, 'rgba(255, 165, 0, 0.6)'],
              [1, 'rgba(43, 175, 253, 0.6)'],
            ],
          },
        },
      },
    })
  }

  // **Meteogram Class for Tomorrow.io API**
  class Meteogram {
    constructor(json, container) {
      this.json = json
      this.container = container

      this.temperatures = []
      this.humidities = []
      this.pressures = []
      this.windSpeeds = []
      console.log('Initializing Meteogram with data:', this.json)

      this.parseTomorrowData()
    }

    /**
     * Build and return the Highcharts options structure
     */
    getChartOptions() {
      return {
        chart: {
          type: 'spline',
          zoomType: 'x',
          panning: true,
          panKey: 'shift',
          marginBottom: 70,
          marginRight: 60,
          marginTop: 50,
          plotBorderWidth: 1,
          height: 310,
          alignTicks: false,
          scrollablePlotArea: {
            minWidth: 720,
          },
        },

        title: {
          text: 'Hourly Weather for Next 5 Days',
          align: 'center',
          style: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          },
        },

        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function () {
            let s = `<small>${Highcharts.dateFormat(
              '%A, %b %e, %H:%M',
              this.x
            )}</small><br/>`
            let windInfo = null

            this.points.forEach(function (point) {
              let seriesName = point.series.name
              let color = point.color || point.series.color

              if (seriesName === 'Wind') {
                windInfo = point.point
              } else {
                let value = point.y
                let unit =
                  seriesName === 'Temperature'
                    ? '°F'
                    : seriesName === 'Humidity'
                    ? '%'
                    : seriesName === 'Air Pressure'
                    ? ' inHg'
                    : ''
                s += `<span style="color:${color}">\u25CF</span> ${seriesName}: <b>${value}${unit}</b><br/>`
              }
            })

            // Add wind information last, if available
            if (windInfo) {
              s += `<span style="color:${
                Highcharts.getOptions().colors[1]
              }">\u25CF</span> Wind: <b>${windInfo.value} mph (${
                windInfo.windDescription
              })</b><br/>`
            }

            return s
          },
        },
        xAxis: [
          {
            type: 'datetime',
            crosshair: true,
            title: {
              text: 'Time',
            },
            labels: {
              format: '{value:%H}',
              step: 1,
              rotation: 0,
            },
            tickInterval: 6 * 3600 * 1000, // 6 hours
            minTickInterval: 6 * 3600 * 1000,
            startOnTick: true,
            endOnTick: false,
            min: this.calculateMinX(),
            max: this.calculateMaxX(),
            tickPositioner: function () {
              const start =
                Math.floor(this.dataMin / (24 * 3600 * 1000)) * 24 * 3600 * 1000 // Start at midnight of the current day
              const positions = []
              for (let i = start; i <= this.dataMax; i += 6 * 3600 * 1000) {
                positions.push(i)
              }
              return positions
            },
          },
          {
            // Secondary X-axis (Top) for Dates
            type: 'datetime',
            linkedTo: 0,
            opposite: true,
            title: {
              text: 'Date',
            },
            labels: {
              formatter: function () {
                return Highcharts.dateFormat('%a %b %e', this.value) // Format: 'Fri Sep 13'
              },
            },
            tickInterval: 24 * 3600 * 1000, // 1 day
            // Ensure ticks start from the current day and include next 4 days
            tickPositions: this.getTopXAxisTickPositions(),
          },
        ],

        yAxis: [
          {
            // Temperature axis
            title: {
              text: 'Temperature (°F)',
            },
            labels: {
              format: '{value}°',
              style: {
                fontSize: '10px',
              },
              x: -3,
            },
            plotLines: [
              {
                // Zero plane
                value: 0,
                color: '#BBBBBB',
                width: 1,
                zIndex: 2,
              },
            ],
            min: 0,
            max: 105,
            tickInterval: 7,
            tickPositioner: function () {
              const positions = []
              const tick = Math.ceil(this.min / 7) * 7
              for (let i = tick; i <= this.max; i += 7) {
                positions.push(i)
              }
              return positions
            },
            gridLineColor: 'rgba(128, 128, 128, 0.1)',
          },
          {
            // Humidity axis
            title: {
              text: 'Humidity (%)',
            },
            labels: {
              format: '{value}%',
              style: {
                fontSize: '10px',
              },
              x: -3,
            },
            opposite: true,
            gridLineWidth: 0,
            tickLength: 0,
            min: 0,
            max: 100,
          },
          {
            // Air Pressure axis
            title: {
              text: 'Air Pressure (inHg)',
              align: 'high',
              rotation: 0,
              style: {
                fontSize: '10px',
                color: Highcharts.getOptions().colors[2],
              },
              textAlign: 'left',
              x: 3,
            },
            labels: {
              style: {
                fontSize: '8px',
                color: Highcharts.getOptions().colors[2],
              },
              y: 2,
              x: 3,
            },
            gridLineWidth: 0,
            opposite: true,
            showLastLabel: false,
          },
          {
            // Wind Speed axis
            title: {
              text: 'Wind Speed (mph)',
            },
            labels: {
              format: '{value} mph',
              style: {
                fontSize: '10px',
              },
              x: -3,
            },
            opposite: true,
            gridLineWidth: 0,
            tickLength: 0,
            min: 0,
            max: 50,
          },
        ],

        legend: {
          enabled: false,
        },

        plotOptions: {
          series: {
            pointPlacement: 'between',
            marker: {
              enabled: false,
            },
          },
        },

        series: [
          {
            name: 'Temperature',
            data: this.temperatures,
            type: 'spline',
            lineWidth: 1,
            color: '#FF3333',
            negativeColor: '#48AFE8',
            tooltip: {
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}°F</b><br/>',
            },
            zIndex: 1,
          },
          {
            name: 'Humidity',
            data: this.humidities,
            type: 'column',
            color: '#68CFE8',
            yAxis: 1,
            fillOpacity: 0.3,
            dataLabels: {
              enabled: true,
              format: '{y}%',
              align: 'center',
              style: {
                fontSize: '8px',
                color: '#000',
              },
            },
            tooltip: {
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}%</b><br/>',
            },
            zIndex: 2,
          },
          {
            name: 'Air Pressure',
            data: this.pressures,
            type: 'spline',
            color: Highcharts.getOptions().colors[2],
            yAxis: 2,
            dashStyle: 'shortdot',
            marker: {
              enabled: false,
            },
            tooltip: {
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} inHg</b><br/>',
            },
            zIndex: 3,
          },
          {
            name: 'Wind',
            type: 'windbarb',
            data: this.windSpeeds,
            yAxis: 3,
            color: Highcharts.getOptions().colors[1],
            lineWidth: 1.5,
            vectorLength: 18,
            yOffset: -15,
            tooltip: {
              valueSuffix: ' mph',
              pointFormat:
                '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.value} mph ({point.windDescription})</b><br/>',
            },
            zIndex: 5,
          },
        ],
      }
    }

    /**
     * Calculate the minimum X value based on the data to ensure proper scaling
     */
    calculateMinX() {
      if (this.temperatures.length === 0) return null
      // Find the earliest timestamp
      let minX = this.temperatures[0][0]
      this.temperatures.forEach((point) => {
        if (point[0] < minX) {
          minX = point[0]
        }
      })
      return minX
    }

    /**
     * Calculate the maximum X value based on the data to ensure proper scaling
     */
    calculateMaxX() {
      if (this.temperatures.length === 0) return null
      // Find the latest timestamp
      let maxX = this.temperatures[0][0]
      this.temperatures.forEach((point) => {
        if (point[0] > maxX) {
          maxX = point[0]
        }
      })
      return maxX
    }

    /**
     * Get tick positions for the top X-axis to start from the current day's midnight
     * and include the next 4 days (total 5 days).
     */
    getTopXAxisTickPositions() {
      if (this.temperatures.length === 0) return []
      const tickPositions = []
      const minX = this.calculateMinX()
      const maxX = this.calculateMaxX()
      const oneDay = 24 * 3600 * 1000

      // Create a Date object from minX
      const minDate = new Date(minX)
      // Set to midnight of the current day
      minDate.setHours(0, 0, 0, 0)
      const currentMidnight = minDate.getTime()

      // Add the current day's midnight and the next 4 days' midnights (total 5)
      for (let i = 0; i < 5; i++) {
        const tick = currentMidnight + i * oneDay
        if (tick > maxX) break
        tickPositions.push(tick)
      }

      return tickPositions
    }

    /**
     * Post-process the chart from the callback function, the second argument
     * Highcharts.Chart.
     */
    onChartLoad(chart) {
      // Meteogram post-load actions can be added here if needed
      // For example, custom annotations or interactions
      // Since we're removing meteogramLoading, no action is needed here
    }

    /**
     * Create the chart. This function is called once the data is parsed.
     */
    createChart() {
      Highcharts.chart(this.container, this.getChartOptions(), (chart) => {
        this.onChartLoad(chart)
      })
    }

    /**
     * Handle the data from Tomorrow.io's API
     */
    parseTomorrowData() {
      if (!this.json || !this.json.timelines) {
        this.error()
        return
      }

      const timelines = this.json.timelines
      const hourlyTimeline = timelines.find((t) => t.timestep === '1h')
      if (!hourlyTimeline) {
        this.error()
        return
      }

      hourlyTimeline.intervals.forEach((interval) => {
        const time = Date.parse(interval.startTime)
        const values = interval.values

        // Temperature
        if (values.temperature !== undefined) {
          this.temperatures.push([time, values.temperature])
        }

        // Humidity
        if (values.humidity !== undefined) {
          this.humidities.push([time, values.humidity])
        }

        // Air Pressure
        if (values.pressureSeaLevel !== undefined) {
          this.pressures.push([time, values.pressureSeaLevel])
        }

        // Wind Speed and Direction
        if (
          values.windSpeed !== undefined &&
          values.windDirection !== undefined
        ) {
          const windSpeed = values.windSpeed
          let windDescription = this.getWindDescription(windSpeed)

          this.windSpeeds.push({
            x: time,
            value: windSpeed,
            direction: values.windDirection,
            windDescription: windDescription,
          })
        }
      })

      this.createChart()
    }

    // Helper method to get wind description
    getWindDescription(windSpeed) {
      if (windSpeed < 1) return 'Calm'
      if (windSpeed < 4) return 'Light Air'
      if (windSpeed < 7) return 'Light Breeze'
      if (windSpeed < 11) return 'Gentle Breeze'
      if (windSpeed < 16) return 'Moderate Breeze'
      if (windSpeed < 22) return 'Fresh Breeze'
      if (windSpeed < 28) return 'Strong Breeze'
      if (windSpeed < 34) return 'Near Gale'
      if (windSpeed < 41) return 'Gale'
      if (windSpeed < 48) return 'Severe Gale'
      if (windSpeed < 56) return 'Storm'
      if (windSpeed < 64) return 'Violent Storm'
      return 'Hurricane'
    }

    error() {
      // Display an error message within the container
      const container = document.getElementById(this.container)
      if (container) {
        container.innerHTML =
          '<i class="fa fa-frown-o"></i> Failed loading meteogram data, please try again later'
      } else {
        console.error('Meteogram container not found.')
      }
    }
  }

  /**
   * Mapping of the weather code from Tomorrow.io's API to the corresponding descriptions.
   * Since we are not using symbols, only descriptions are mapped.
   */
  Meteogram.dictionary = {
    0: { description: 'Clear Day' },
    1: { description: 'Cloudy' },
    2: { description: 'Drizzle' },
    3: { description: 'Flurries' },
    4: { description: 'Light Fog' },
    5: { description: 'Fog' },
    6: { description: 'Freezing Drizzle' },
    7: { description: 'Heavy Freezing Rain' },
    8: { description: 'Light Freezing Rain' },
    9: { description: 'Freezing Rain' },
    10: { description: 'Heavy Ice Pellets' },
    11: { description: 'Light Ice Pellets' },
    12: { description: 'Ice Pellets' },
    13: { description: 'Mostly Clear' },
    14: { description: 'Mostly Cloudy' },
    15: { description: 'Partly Cloudy' },
    16: { description: 'Heavy Rain' },
    17: { description: 'Light Rain' },
    18: { description: 'Rain' },
    19: { description: 'Heavy Snow' },
    20: { description: 'Light Snow' },
    21: { description: 'Snow' },
    22: { description: 'Thunderstorm' },
    // Add more mappings as needed
  }

  toggleWeatherChartButton.addEventListener('click', () => {
    if (
      weatherHighChartContainer.style.display === 'none' ||
      weatherHighChartContainer.style.display === ''
    ) {
      weatherHighChartContainer.style.display = 'block'
      toggleWeatherChartButton.src = '/static/images/point-up-512.png'
      toggleWeatherChartButton.alt = 'Hide Weather High Chart'

      // Use setTimeout to delay the scroll action
      setTimeout(() => {
        // Scroll to the top of the weather high chart container
        weatherHighChartContainer.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }, 100) // Adjust the delay as needed (100 milliseconds here)

      if (window.weatherChartData && !window.weatherChartRendered) {
        renderTemperatureRangeChart(window.weatherChartData)
        window.weatherChartRendered = true
      }

      if (window.weatherData && !window.meteogramRendered) {
        window.meteogram = new Meteogram(
          window.weatherData,
          'meteogram-container'
        )
        window.meteogramRendered = true
        meteogramContainer.style.display = 'block' // Ensure container is visible
      } else {
        meteogramContainer.style.display = 'block' // Show container even if already rendered
      }
    } else {
      weatherHighChartContainer.style.display = 'none'
      toggleWeatherChartButton.src = '/static/images/point-down-512.png'
      toggleWeatherChartButton.alt = 'Show Weather High Chart'
    }
  })

  form.addEventListener('reset', () => {
    // Hide all result sections
    weatherResults.style.display = 'none'
    document.getElementById('forecast-section').style.display = 'none'
    document.getElementById('daily-weather-details').style.display = 'none'
    document.getElementById('weather-chart').style.display = 'none' // Optionally hide the chart section

    // Clear any tooltips
    clearTooltips()

    // Re-enable input fields if they were disabled by auto-detect
    streetInput.disabled = false
    cityInput.disabled = false
    stateSelect.disabled = false

    // Uncheck the auto-detect checkbox
    autoDetectCheckbox.checked = false

    // **Reset the toggle button and hide the chart text**
    weatherHighChartText.style.display = 'none'
    toggleWeatherChartButton.src = '/static/images/point-down-512.png' // Ensure it resets to point down
    toggleWeatherChartButton.alt = 'Show Weather High Chart'

    if (window.meteogram) {
      window.meteogram.chart.destroy()
      window.meteogram = null
      window.meteogramRendered = false
      meteogramContainer.innerHTML = '' // Removed loading indicator
      meteogramContainer.style.display = 'none'
    }
  })

  // Function to display tooltips
  const showTooltip = (element, message) => {
    element.textContent = message
  }

  // Handle auto-detect checkbox behavior
  autoDetectCheckbox.addEventListener('change', () => {
    if (autoDetectCheckbox.checked) {
      streetInput.disabled = true
      cityInput.disabled = true
      stateSelect.disabled = true
      clearTooltips()
    } else {
      streetInput.disabled = false
      cityInput.disabled = false
      stateSelect.disabled = false
    }
  })

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault() // Prevent default form submission

    clearTooltips() // Clear previous tooltips
    document.getElementById('daily-weather-details').style.display = 'none'
    document.getElementById('weather-chart').style.display = 'none'
    weatherResults.style.display = 'none' // Hide previous results

    const street = streetInput.value.trim()
    const city = cityInput.value.trim()
    const state = stateSelect.value
    const autoDetect = autoDetectCheckbox.checked

    let valid = true // Flag to track validity of inputs

    // Validate inputs if auto-detect is not checked
    if (!autoDetect) {
      if (street === '') {
        showTooltip(streetTooltip, 'Street is required.')
        valid = false
      }
      if (city === '') {
        showTooltip(cityTooltip, 'City is required.')
        valid = false
      }
      if (state === '') {
        showTooltip(stateTooltip, 'State is required.')
        valid = false
      }
    }

    // If not valid, stop the process
    if (!valid) {
      return // Stop if validation fails
    }

    // Construct query parameters
    const params = new URLSearchParams()
    if (autoDetect) {
      params.append('auto_detect', 'true')
    } else {
      params.append('street', street)
      params.append('city', city)
      params.append('state', state)
    }

    // Send GET request to Flask backend
    fetch(`/get_weather?${params.toString()}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('No records have been found')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Weather data received:', data) // Log data for debugging
        if (data.error) {
          weatherResults.innerHTML = `<p class="error">${data.error}</p>`
          weatherResults.style.display = 'block' // Show error if any
        } else {
          displayWeather(data, autoDetect)
        }
      })
      .catch((error) => {
        console.error('Fetch error:', error)
        weatherResults.innerHTML = `<p class="error">${error.message}</p>`
        weatherResults.style.display = 'block' // Show error if any
      })
  })

  const displayWeather = (data, autoDetect) => {
    try {
      const weatherData1 = data.weather.data ? data.weather.data : data.weather
      const timelines = weatherData1.timelines
      const currentTimeline = timelines.find((t) => t.timestep === 'current')
      const interval = currentTimeline.intervals[0]
      const currentValues = interval.values
      const weatherCode = currentValues.weatherCode

      const meteogramData = data.weather.timelines
      window.weatherData = weatherData1 // Ensure weatherData is assigned

      // Prepare chart data for today and the next 15 days (total 16 days)
      const chartData = []
      const temperatureTimeline = timelines.find((t) => t.timestep === '1d')
      if (temperatureTimeline) {
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Set to midnight for consistency

        for (let i = 0; i < 16; i++) {
          // Loop for today + next 15 days
          const targetDate = new Date(today.getTime() + i * 24 * 3600 * 1000)
          const targetTimestamp = targetDate.getTime()

          // Find the interval matching the target date
          const interval = temperatureTimeline.intervals.find((interval) => {
            const intervalDate = new Date(interval.startTime)
            intervalDate.setHours(0, 0, 0, 0) // Normalize to midnight
            return intervalDate.getTime() === targetTimestamp
          })

          if (interval) {
            const tempMin = interval.values.temperatureMin || null
            const tempMax = interval.values.temperatureMax || null
            if (tempMin !== null && tempMax !== null) {
              chartData.push([
                Date.UTC(
                  targetDate.getFullYear(),
                  targetDate.getMonth(),
                  targetDate.getDate()
                ),
                tempMin,
                tempMax,
              ])
            }
          }
        }
      }

      // Assign chart data to window for global access
      window.weatherChartData = chartData

      // Get weather data from the map
      const weatherDataMap = weatherCodeMap[weatherCode] || {
        img: 'default.svg',
        description: 'Unknown Condition',
      }
      const weatherIconPath = `/static/images/weather_codes/${weatherDataMap.img}`
      const weatherDescription = weatherDataMap.description

      // Update the current weather section
      if (autoDetect && data.location) {
        // Auto-detected location
        locationEl.textContent = `${data.location.city}, ${data.location.region}`
      } else {
        // Manually entered address with detailed components
        const street = data.address.street || ''
        const city = data.address.city || ''
        const state = data.address.state || ''
        const postal = data.address.postal ? ` ${data.address.postal}` : ''
        let country = data.address.country || 'USA'

        // Map "United States" to "USA" if necessary
        if (country === 'United States') {
          country = 'USA'
        }

        // **Ensure country is prefixed with a comma and space**
        country = `, ${country}`

        // **Construct the formatted address**
        locationEl.textContent = `${street}, ${city}, ${state}${postal}${country}`
      }

      temperatureEl.textContent =
        currentValues.temperature !== undefined
          ? `${currentValues.temperature}°`
          : 'N/A'

      humidityEl.textContent = `${currentValues.humidity || 'N/A'}%`
      pressureEl.textContent = `${currentValues.pressureSeaLevel || 'N/A'} inHg`
      windSpeedEl.textContent = `${currentValues.windSpeed || 'N/A'} mph`
      visibilityEl.textContent = `${currentValues.visibility || 'N/A'} mi`
      cloudCoverEl.textContent = `${currentValues.cloudCover || 'N/A'}%`
      uvLevelEl.textContent = currentValues.uvIndex || 'N/A'

      // Set the image source and alt text for current weather
      const weatherIconEl = document.getElementById('weather-icon')
      if (weatherIconEl) {
        weatherIconEl.src = weatherIconPath
        weatherIconEl.alt = `Weather Condition: ${weatherDescription}`
      } else {
        console.error('Element with id "weather-icon" not found.')
      }

      // Set the weather condition description
      const weatherDescriptionEl = document.getElementById(
        'weather-description'
      )
      if (weatherDescriptionEl) {
        weatherDescriptionEl.textContent = weatherDescription
      } else {
        console.error('Element with id "weather-description" not found.')
      }

      // Display the current weather section
      weatherResults.style.display = 'block'

      // Now handle the forecast for the next 7 days
      const forecastSection = document.getElementById('forecast-section')
      const forecastTableBody = document.querySelector('#forecast-table tbody')
      forecastTableBody.innerHTML = ''
      const dailyTimeline = timelines.find((t) => t.timestep === '1d')
      if (dailyTimeline) {
        const dailyIntervals = dailyTimeline.intervals

        // Get today's date at midnight for comparison
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Filter intervals to include only today and the next 6 days
        const filteredIntervals = dailyIntervals.filter((interval) => {
          const intervalDate = new Date(interval.startTime)
          intervalDate.setHours(0, 0, 0, 0)
          return intervalDate >= today
        })

        // Limit to the next 7 days
        const nextSevenDays = filteredIntervals.slice(0, 7)

        nextSevenDays.forEach((interval) => {
          const dateObj = new Date(interval.startTime)

          // Extract date components
          const weekday = dateObj.toLocaleDateString('en-GB', {
            weekday: 'long',
          })
          const day = dateObj.toLocaleDateString('en-GB', { day: 'numeric' })
          const month = dateObj.toLocaleDateString('en-GB', { month: 'short' })
          const year = dateObj.toLocaleDateString('en-GB', { year: 'numeric' })

          // Manually construct the date string
          const date = `${weekday}, ${day} ${month} ${year}`

          // Extract values for this specific day
          const values = interval.values

          const tempHigh =
            values.temperatureMax !== undefined
              ? `${values.temperatureMax}`
              : 'N/A'
          const tempLow =
            values.temperatureMin !== undefined
              ? `${values.temperatureMin}`
              : 'N/A'
          const windSpeed =
            values.windSpeed !== undefined ? `${values.windSpeed}` : 'N/A'

          const weatherCode = values.weatherCode
          const weatherDataMap = weatherCodeMap[weatherCode] || {
            img: 'default.svg',
            description: 'Unknown Condition',
          }
          const weatherIconPath = `/static/images/weather_codes/${weatherDataMap.img}`
          const weatherDescription = weatherDataMap.description

          // Create a new table row
          const row = document.createElement('tr')

          // Create cells
          const dateCell = document.createElement('td')
          dateCell.textContent = date

          const statusCell = document.createElement('td')
          statusCell.classList.add('status-cell')

          const statusImg = document.createElement('img')
          statusImg.src = weatherIconPath
          statusImg.alt = weatherDescription
          statusImg.className = 'forecast-icon'

          const statusText = document.createElement('span')
          statusText.textContent = weatherDescription

          statusCell.appendChild(statusImg)
          statusCell.appendChild(statusText)

          // Add event listener to status cell
          row.addEventListener('click', function () {
            // Hide 'weather-results' and 'forecast-section'
            weatherResults.style.display = 'none'
            forecastSection.style.display = 'none'

            // Show 'daily-weather-details' section
            const dailyWeatherDetails = document.getElementById(
              'daily-weather-details'
            )
            dailyWeatherDetails.style.display = 'block'

            // **Show the Weather High Chart Section**
            const weatherChart = document.getElementById('weather-chart')
            weatherChart.style.display = 'block'

            // For the card, extract required data
            const tempMax =
              values.temperatureMax !== undefined
                ? `${values.temperatureMax}°F`
                : 'N/A'
            const tempMin =
              values.temperatureMin !== undefined
                ? `${values.temperatureMin}°F`
                : 'N/A'
            const tempRange = `${tempMax}/${tempMin}`

            const precipitationTypeMap = {
              0: 'N/A',
              1: 'Rain',
              2: 'Snow',
              4: 'Ice Pellets',
            }

            const precipitationTypeCode =
              values.precipitationType !== undefined
                ? values.precipitationType
                : 0
            const precipitation =
              precipitationTypeMap[precipitationTypeCode] || 'N/A'

            const chanceOfRain =
              values.precipitationProbability !== undefined
                ? `${values.precipitationProbability}%`
                : 'N/A'

            const windSpeedDetail =
              values.windSpeed !== undefined ? `${values.windSpeed} mph` : 'N/A'

            const humidityDetail =
              values.humidity !== undefined ? `${values.humidity}%` : 'N/A'

            const visibilityDetail =
              values.visibility !== undefined
                ? `${values.visibility} mi`
                : 'N/A'

            // Format Sunrise and Sunset times
            const formatTime = (timeStr) => {
              if (!timeStr) return 'N/A'
              const dateObj = new Date(timeStr)
              const hours = dateObj.getHours()
              const minutes = dateObj.getMinutes()
              const ampm = hours >= 12 ? 'PM' : 'AM'
              const hours12 = hours % 12 || 12 // Convert 0 to 12
              return `${hours12}${ampm}`
            }

            const sunrise = formatTime(values.sunriseTime)
            const sunset = formatTime(values.sunsetTime)
            const sunriseSunset = `${sunrise}/${sunset}`

            // Now generate the HTML for the card
            document.getElementById('card-date').textContent = date

            const cardStatusIcon = document.getElementById('card-status-icon')
            cardStatusIcon.src = weatherIconPath
            cardStatusIcon.alt = weatherDescription

            document.getElementById('card-status-text').textContent =
              weatherDescription

            document.getElementById('card-temperature-range').textContent =
              tempRange

            document.getElementById('card-precipitation').textContent =
              precipitation
            document.getElementById('card-chance-of-rain').textContent =
              chanceOfRain
            document.getElementById('card-wind-speed').textContent =
              windSpeedDetail
            document.getElementById('card-humidity').textContent =
              humidityDetail
            document.getElementById('card-visibility').textContent =
              visibilityDetail
            document.getElementById('card-sunrise-sunset').textContent =
              sunriseSunset
          })

          const tempHighCell = document.createElement('td')
          tempHighCell.textContent = tempHigh

          const tempLowCell = document.createElement('td')
          tempLowCell.textContent = tempLow

          const windSpeedCell = document.createElement('td')
          windSpeedCell.textContent = windSpeed

          // Append cells to the row
          row.appendChild(dateCell)
          row.appendChild(statusCell)
          row.appendChild(tempHighCell)
          row.appendChild(tempLowCell)
          row.appendChild(windSpeedCell)

          forecastTableBody.appendChild(row)
        })

        // Display the forecast section
        forecastSection.style.display = 'block'
      } else {
        console.error('Daily weather data not available.')
      }
    } catch (err) {
      console.error('Error parsing weather data:', err)
      weatherResults.innerHTML = `<p class="error">Failed to parse weather data.</p>`
    }
  }
})

document
  .getElementById('weather-form')
  .addEventListener('submit', function (event) {
    event.preventDefault() // Prevent the default form submission

    const formData = new FormData(this)

    fetch('/handleRequest?' + new URLSearchParams(formData), {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data) // Process the response data here
      })
      .catch((error) => {
        console.error('Error:', error)
      })
  })
