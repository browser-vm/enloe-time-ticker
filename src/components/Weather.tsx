
import { useState, useEffect } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import { supabaseClient } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WeatherData {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
}

// Raleigh coordinates
const RALEIGH_LAT = 35.7796;
const RALEIGH_LON = -78.6382;

const Weather = ({ className }: { className?: string }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: apiError } = await supabaseClient.functions.invoke('get-weather', {
          body: { lat: RALEIGH_LAT, lon: RALEIGH_LON }
        });
        
        if (apiError) {
          console.error('Error fetching weather:', apiError);
          setError('Could not load weather data');
          setLoading(false);
          return;
        }
        
        if (data && typeof data === 'object') {
          setWeather(data as WeatherData);
        } else {
          console.error('Invalid weather data format:', data);
          setError('Weather data format error');
        }
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Weather icon mapping function with error handling
  const getWeatherIcon = (description: string | undefined) => {
    if (!description) return <Cloud className="h-4 w-4" />;
    
    const desc = description.toLowerCase();
    
    if (desc.includes('thunderstorm') || desc.includes('lightning')) {
      return <CloudLightning className="h-4 w-4" />;
    } else if (desc.includes('drizzle')) {
      return <CloudDrizzle className="h-4 w-4" />;
    } else if (desc.includes('rain')) {
      return <CloudRain className="h-4 w-4" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow className="h-4 w-4" />;
    } else if (desc.includes('fog') || desc.includes('mist')) {
      return <CloudFog className="h-4 w-4" />;
    } else if (desc.includes('cloud')) {
      return <Cloud className="h-4 w-4" />;
    } else if (desc.includes('clear') || desc.includes('sun')) {
      return <Sun className="h-4 w-4" />;
    } else if (desc.includes('wind')) {
      return <Wind className="h-4 w-4" />;
    } else {
      return <Cloud className="h-4 w-4" />;
    }
  };

  // Function to format temperature
  const formatTemp = (temp: number) => {
    return `${Math.round(temp)}°F`;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center text-xs", className)}>
        <div className="animate-pulse flex space-x-1 items-center">
          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center text-xs text-gray-500 dark:text-gray-400", className)}>
        <Cloud className="h-4 w-4 mr-1" />
        <span>Weather unavailable</span>
      </div>
    );
  }

  // Add fallback if weather data is missing
  if (!weather) {
    return (
      <div className={cn("flex items-center text-xs text-gray-500 dark:text-gray-400", className)}>
        <Cloud className="h-4 w-4 mr-1" />
        <span>Weather data missing</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center text-xs", className)}>
      {getWeatherIcon(weather.description)}
      <span className="ml-1 font-medium">{formatTemp(weather.temp)}</span>
      <span className="text-gray-500 dark:text-gray-400 ml-1">{weather.description}</span>
    </div>
  );
};

export default Weather;
