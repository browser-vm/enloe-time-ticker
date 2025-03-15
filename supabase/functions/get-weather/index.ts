
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { lat, lon } = await req.json();
    
    // Validate parameters
    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENWEATHERMAP_API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
    
    if (!OPENWEATHERMAP_API_KEY) {
      console.error("Missing OpenWeatherMap API key");
      throw new Error("Weather API key is not configured");
    }
    
    console.log(`Fetching weather data for coordinates: ${lat}, ${lon}`);
    
    // Fetch weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=imperial`,
      { method: 'GET' }
    );

    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
      throw new Error(`Weather API error: ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();
    console.log("Weather API response:", weatherData);
    
    // Format the response to match the WeatherData interface expected by the client
    const formattedData = {
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      temp_min: weatherData.main.temp_min,
      temp_max: weatherData.main.temp_max,
      humidity: weatherData.main.humidity,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      wind_speed: weatherData.wind?.speed || 0
    };

    console.log("Formatted weather data:", formattedData);

    // Return the weather data
    return new Response(
      JSON.stringify(formattedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error in get-weather function:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch weather data",
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
