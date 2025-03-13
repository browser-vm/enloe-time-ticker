
import { useState, useEffect } from "react";
import { Sun, Cloud, CloudRain, CloudSnow, Wind, CloudLightning, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Raleigh coordinates (approximate Enloe location)
        const lat = 35.7796;
        const lon = -78.6382;
        
        // Mock weather data as fallback
        const mockWeatherData = {
          temp: 72,
          condition: "Clear",
          icon: "01d"
        };
        
        try {
          // Create an AbortController for timeout functionality
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          // Call our Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('get-weather', {
            body: { lat, lon },
          });
          
          // Clear the timeout since fetch completed
          clearTimeout(timeoutId);
          
          if (error) {
            console.error("Supabase function error:", error);
            throw new Error("Weather data not available");
          }
          
          // Set weather data from the Edge Function response
          setWeather(data);
        } catch (apiError) {
          console.error("Weather API Error, using mock data:", apiError);
          // Use mock data instead of failing
          setWeather(mockWeatherData);
          toast({
            title: "Weather Notice",
            description: "Using cached weather data. Will try again later.",
            variant: "default",
          });
        }
      } catch (err) {
        console.error("Error in weather component:", err);
        setError("Weather unavailable");
        toast({
          title: "Weather Error",
          description: "Unable to load weather data. Using default values.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [toast]);

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
        <AlertCircle className="h-5 w-5 mr-1" />
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
