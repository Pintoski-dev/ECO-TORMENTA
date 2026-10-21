/**
 * Open-Meteo Live Meteorology Service
 * Consumes real-time wind speed, direction, temperature, and atmospheric conditions.
 */

export interface WeatherData {
  city: string;
  country: string;
  temperature: number; // in Celsius
  windSpeed: number; // in km/h
  windDirection: number; // in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  humidity: number; // percentage
  weatherCode: number;
  weatherDescription: string;
  isDay: boolean;
  latitude: number;
  longitude: number;
  fetchedAt: string;
}

export interface CityPreset {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export const CITY_PRESETS: CityPreset[] = [
  { name: 'Madrid', country: 'España', lat: 40.4168, lon: -3.7038 },
  { name: 'Ciudad de México', country: 'México', lat: 19.4326, lon: -99.1332 },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721 },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  { name: 'Lima', country: 'Perú', lat: -12.0464, lon: -77.0428 },
  { name: 'Nueva York', country: 'EE.UU.', lat: 40.7128, lon: -74.0060 },
  { name: 'Tokio', country: 'Japón', lat: 35.6762, lon: 139.6503 },
  { name: 'Londres', country: 'Reino Unido', lat: 51.5074, lon: -0.1278 },
  { name: 'Reikiavik', country: 'Islandia (Alta Energía Eólica)', lat: 64.1466, lon: -21.9426 }
];

function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Cielo Despejado (Óptima Energía Solar)';
  if (code >= 1 && code <= 3) return 'Parcialmente Nublado';
  if (code >= 45 && code <= 48) return 'Niebla / Inversión Térmica';
  if (code >= 51 && code <= 55) return 'Llovizna Ligera';
  if (code >= 61 && code <= 65) return 'Lluvia Moderada / Ácida potencial';
  if (code >= 71 && code <= 77) return 'Nieve / Bajas Temperaturas';
  if (code >= 80 && code <= 82) return 'Chubascos Intensos';
  if (code >= 95 && code <= 99) return 'Tormenta Eléctrica / Vientos Fuertes';
  return 'Condiciones Atmosféricas Variables';
}

export async function fetchLiveWeather(lat: number, lon: number, cityName = 'Ubicación Actual', countryName = ''): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    const current = data.current;

    return {
      city: cityName,
      country: countryName,
      temperature: Math.round(current.temperature_2m * 10) / 10,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windDirection: current.wind_direction_10m,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code,
      weatherDescription: interpretWeatherCode(current.weather_code),
      isDay: Boolean(current.is_day),
      latitude: lat,
      longitude: lon,
      fetchedAt: new Date().toLocaleTimeString()
    };
  } catch (error) {
    console.warn('Error fetching Open-Meteo live data, using realistic fallback:', error);
    // Graceful offline fallback with realistic meteorological values
    return {
      city: cityName,
      country: countryName,
      temperature: 22.4,
      windSpeed: 18.5,
      windDirection: 90,
      humidity: 55,
      weatherCode: 1,
      weatherDescription: 'Parcialmente Nublado (Simulación)',
      isDay: true,
      latitude: lat,
      longitude: lon,
      fetchedAt: new Date().toLocaleTimeString()
    };
  }
}
