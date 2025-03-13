
import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

interface WeatherProps {
  className?: string;
}

const Weather = ({ className }: WeatherProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Raleigh coordinates (approximate Enloe location)
        const lat = 35.7796;
        const lon = -78.6382;
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=6ef7f04ad106957b8936ba87544ca187&units=imperial`
        );
        
        if (!response.ok) {
          throw new Error("Weather data not available");
        }
        
        const data = await response.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].main,
          icon: data.weather[0].icon
        });
      } catch (err) {
        console.error("Error fetching weather:", err);
        setError("Unable to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="h-5 w-5" />;
    
    const condition = weather.condition.toLowerCase();
    if (condition.includes("clear")) return <Sun className="h-5 w-5" />;
    if (condition.includes("cloud")) return <Cloud className="h-5 w-5" />;
    if (condition.includes("rain")) return <CloudRain className="h-5 w-5" />;
    if (condition.includes("snow")) return <CloudSnow className="h-5 w-5" />;
    if (condition.includes("thunder")) return <CloudLightning className="h-5 w-5" />;
    if (condition.includes("wind") || condition.includes("mist")) return <Wind className="h-5 w-5" />;
    
    return <Sun className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className={cn("flex items-center text-enloe-green dark:text-enloe-yellow", className)}>
        <span className="text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center text-enloe-green dark:text-enloe-yellow", className)}>
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center text-enloe-green dark:text-enloe-yellow", className)}>
      {getWeatherIcon()}
      <span className="text-sm font-medium ml-1">
        {weather?.temp}°F {weather?.condition}
      </span>
    </div>
  );
};

export default Weather;
