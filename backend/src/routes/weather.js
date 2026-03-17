const express = require('express');
const axios = require('axios');
const router = express.Router();

const WMO = {
  0:  { icon: '☀️',  desc: 'clear sky' },
  1:  { icon: '🌤',  desc: 'mainly clear' },
  2:  { icon: '⛅',  desc: 'partly cloudy' },
  3:  { icon: '☁️',  desc: 'overcast' },
  45: { icon: '🌫',  desc: 'fog' },
  48: { icon: '🌫',  desc: 'icy fog' },
  51: { icon: '🌦',  desc: 'light drizzle' },
  53: { icon: '🌦',  desc: 'drizzle' },
  55: { icon: '🌦',  desc: 'heavy drizzle' },
  61: { icon: '🌧',  desc: 'light rain' },
  63: { icon: '🌧',  desc: 'rain' },
  65: { icon: '🌧',  desc: 'heavy rain' },
  71: { icon: '❄️',  desc: 'light snow' },
  73: { icon: '❄️',  desc: 'snow' },
  75: { icon: '❄️',  desc: 'heavy snow' },
  77: { icon: '🌨',  desc: 'snow grains' },
  80: { icon: '🌧',  desc: 'rain showers' },
  81: { icon: '🌧',  desc: 'showers' },
  82: { icon: '⛈',  desc: 'heavy showers' },
  85: { icon: '🌨',  desc: 'snow showers' },
  86: { icon: '🌨',  desc: 'heavy snow showers' },
  95: { icon: '⛈',  desc: 'thunderstorm' },
  96: { icon: '⛈',  desc: 'thunderstorm + hail' },
  99: { icon: '⛈',  desc: 'thunderstorm + hail' },
};

let geoCache = null;

async function geocode(location) {
  if (geoCache) return geoCache;

  // "San Jose, California" → try "San Jose" with US country code first
  const cityOnly = location.split(',')[0].trim();

  // Try with full string first, fall back to city-only + US
  const attempts = [
    { name: cityOnly, countryCode: 'US' },
    { name: location },
    { name: cityOnly },
  ];

  for (const params of attempts) {
    const { data } = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { ...params, count: 1, language: 'en', format: 'json' },
      timeout: 8000,
    });
    const r = data.results?.[0];
    if (r) {
      geoCache = { lat: r.latitude, lon: r.longitude, name: r.name };
      return geoCache;
    }
  }

  throw new Error(`Location not found: ${location}`);
}

router.get('/', async (req, res) => {
  const location = process.env.WEATHER_LOCATION || 'New York';

  try {
    const { lat, lon, name } = await geocode(location);

    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,precipitation_probability,weathercode',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        timezone: 'auto',
      },
      timeout: 8000,
    });

    const current = data.current;
    const wmo = WMO[current.weathercode] || { icon: '🌐', desc: 'unknown' };

    res.json({
      temp: Math.round(current.temperature_2m),
      rain: current.precipitation_probability ?? 0,
      location: name,
      icon: wmo.icon,
      description: wmo.desc,
    });
  } catch (err) {
    console.error('Weather error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
