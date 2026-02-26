import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CloudSun, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind, Droplets, Thermometer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale, getWeatherDescription } from "@/i18n/translations";

interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipProb: number;
  windSpeed: number;
  uvIndex: number;
}

interface CurrentWeather {
  temp: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  apparentTemp: number;
}

const getWeatherIcon = (code: number, size = "h-6 w-6") => {
  if (code === 0 || code === 1) return <Sun className={`${size} text-amber-500`} />;
  if (code === 2) return <CloudSun className={`${size} text-amber-400`} />;
  if (code === 3 || code === 45 || code === 48) return <Cloud className={`${size} text-muted-foreground`} />;
  if (code >= 51 && code <= 55) return <CloudDrizzle className={`${size} text-blue-400`} />;
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return <CloudRain className={`${size} text-blue-500`} />;
  if (code >= 71 && code <= 75) return <CloudSnow className={`${size} text-sky-300`} />;
  if (code >= 95) return <CloudLightning className={`${size} text-yellow-500`} />;
  return <CloudSun className={`${size} text-muted-foreground`} />;
};

const Weather = () => {
  const { tripId } = useParams();
  const { t, language } = useLanguage();
  const [destination, setDestination] = useState("");
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DayForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) return;
    supabase.from("trips").select("destination").eq("id", tripId).single()
      .then(({ data }) => {
        if (data?.destination) { setDestination(data.destination); fetchWeather(data.destination); }
        else { setLoading(false); setError(t.noDestination); }
      });
  }, [tripId]);

  const fetchWeather = async (dest: string) => {
    try {
      const langCode = language === "pt" ? "pt" : language === "it" ? "it" : language === "fr" ? "fr" : language === "en" ? "en" : "es";
      // Use only the city name (first part) for geocoding, as Open-Meteo works best with simple names
      const cityName = dest.split(",")[0].trim();
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=${langCode}`);
      const geoData = await geoRes.json();
      if (!geoData.results?.length) { setError(`${t.locationNotFound} "${dest}".`); setLoading(false); return; }
      // Try to match by country/admin if available for better accuracy
      const parts = dest.split(",").map(p => p.trim().toLowerCase());
      let best = geoData.results[0];
      if (parts.length > 1) {
        const matched = geoData.results.find((r: any) => {
          const admin = (r.admin1 || "").toLowerCase();
          const country = (r.country || "").toLowerCase();
          return parts.some(p => admin.includes(p) || country.includes(p));
        });
        if (matched) best = matched;
      }
      const { latitude, longitude, name } = best;
      setDestination(name);
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=auto&forecast_days=10`);
      const weatherData = await weatherRes.json();
      setCurrent({
        temp: Math.round(weatherData.current.temperature_2m),
        weatherCode: weatherData.current.weather_code,
        windSpeed: Math.round(weatherData.current.wind_speed_10m),
        humidity: weatherData.current.relative_humidity_2m,
        apparentTemp: Math.round(weatherData.current.apparent_temperature),
      });
      setForecast(weatherData.daily.time.map((date: string, i: number) => ({
        date, tempMax: Math.round(weatherData.daily.temperature_2m_max[i]), tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
        weatherCode: weatherData.daily.weather_code[i], precipProb: weatherData.daily.precipitation_probability_max[i],
        windSpeed: Math.round(weatherData.daily.wind_speed_10m_max[i]), uvIndex: Math.round(weatherData.daily.uv_index_max[i]),
      })));
    } catch { setError(t.weatherError); } finally { setLoading(false); }
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.getTime() === today.getTime()) return t.today;
    if (d.getTime() === tomorrow.getTime()) return t.tomorrow;
    return d.toLocaleDateString(getLocale(language), { weekday: "short", day: "numeric", month: "short" });
  };

  if (loading) return <div className="animate-fade-in flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  if (error) return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-foreground">{t.theWeather}</h2></div>
      <Card className="p-6 text-center"><CloudSun className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">{error}</p></Card>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-foreground">{t.theWeather}</h2></div>

      {current && (
        <Card className="p-5 mb-4 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-muted-foreground">{destination} · {t.now}</p>
            {getWeatherIcon(current.weatherCode, "h-10 w-10")}
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-5xl font-bold text-foreground">{current.temp}°</span>
            <span className="text-sm text-muted-foreground mb-2">{t.feelsLike} {current.apparentTemp}°</span>
          </div>
          <p className="text-sm text-foreground mb-3">{getWeatherDescription(current.weatherCode, t)}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-blue-400" /><span className="text-xs text-muted-foreground">{current.humidity}%</span></div>
            <div className="flex items-center gap-1.5"><Wind className="h-4 w-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">{current.windSpeed} km/h</span></div>
            <div className="flex items-center gap-1.5"><Thermometer className="h-4 w-4 text-orange-400" /><span className="text-xs text-muted-foreground">{current.apparentTemp}°</span></div>
          </div>
        </Card>
      )}

      <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t.next10Days}</h3>
      <div className="space-y-1.5">
        {forecast.map((day) => (
          <Card key={day.date} className="px-4 py-3 flex items-center gap-3">
            <span className="text-sm font-medium text-foreground w-20 shrink-0 capitalize">{formatDay(day.date)}</span>
            {getWeatherIcon(day.weatherCode, "h-5 w-5")}
            <div className="flex-1 flex items-center gap-1.5 min-w-0">
              <span className="text-xs text-blue-400 w-8 text-right">{day.tempMin}°</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-orange-500"
                  style={{ marginLeft: `${Math.max(0, ((day.tempMin + 10) / 50) * 100)}%`, width: `${Math.max(10, ((day.tempMax - day.tempMin) / 50) * 100)}%` }} />
              </div>
              <span className="text-xs text-orange-400 w-8">{day.tempMax}°</span>
            </div>
            {day.precipProb > 0 && <span className="text-[11px] text-blue-400 w-10 text-right shrink-0">{day.precipProb}%</span>}
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground text-center mt-4">{t.dataBy}</p>
    </div>
  );
};

export default Weather;
