import * as React from "react";
import { Cloud, CloudRain, MapPin, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type WeatherIconType = "sun" | "cloud" | "rain";

type WeatherDay = {
  label: string;
  high: number;
  low: number;
  icon: WeatherIconType;
};

type WeatherState = {
  location: { city: string; state: string };
  temperature: number;
  condition: string;
  icon: WeatherIconType;
  forecast: WeatherDay[];
};

const FALLBACK_WEATHER: WeatherState = {
  location: { city: "New York", state: "NY" },
  temperature: 72,
  condition: "Partly Cloudy",
  icon: "cloud",
  forecast: [
    { label: "Mon", high: 74, low: 62, icon: "sun" },
    { label: "Tue", high: 71, low: 60, icon: "cloud" },
    { label: "Wed", high: 68, low: 58, icon: "rain" },
  ],
};

function mapWeatherCodeToDisplay(code: number): { condition: string; icon: WeatherIconType } {
  if (code === 0) return { condition: "Clear Sky", icon: "sun" };
  if ([1, 2, 3, 45, 48].includes(code)) return { condition: "Partly Cloudy", icon: "cloud" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { condition: "Rain", icon: "rain" };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: "Snow", icon: "cloud" };
  if ([95, 96, 99].includes(code)) return { condition: "Thunderstorm", icon: "rain" };
  return { condition: "Cloudy", icon: "cloud" };
}

function WeatherIcon({ type, className }: { type: WeatherIconType; className?: string }) {
  const props = { className: cn("size-4", className), "aria-hidden": true as const };
  if (type === "sun") return <Sun {...props} />;
  if (type === "rain") return <CloudRain {...props} />;
  return <Cloud {...props} />;
}

export function WeatherWidget() {
  const [weather, setWeather] = React.useState<WeatherState>(FALLBACK_WEATHER);

  React.useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      try {
        // New York City coordinates
        const latitude = 40.7128;
        const longitude = -74.006;
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          "&current=temperature_2m,weather_code" +
          "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
          "&forecast_days=3&temperature_unit=fahrenheit&timezone=America%2FNew_York";

        const response = await fetch(url);
        if (!response.ok) return;
        const data = (await response.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
          daily?: {
            time?: string[];
            weather_code?: number[];
            temperature_2m_max?: number[];
            temperature_2m_min?: number[];
          };
        };

        const currentTemp = data.current?.temperature_2m;
        const currentCode = data.current?.weather_code;
        const daily = data.daily;

        if (
          typeof currentTemp !== "number" ||
          typeof currentCode !== "number" ||
          !daily?.time ||
          !daily.weather_code ||
          !daily.temperature_2m_max ||
          !daily.temperature_2m_min
        ) {
          return;
        }

        const currentDisplay = mapWeatherCodeToDisplay(currentCode);
        const dayFormatter = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          timeZone: "America/New_York",
        });

        const nextForecast: WeatherDay[] = daily.time.slice(0, 3).map((isoDate, index) => {
          const forecastCode = daily.weather_code?.[index] ?? 0;
          const display = mapWeatherCodeToDisplay(forecastCode);
          return {
            label: dayFormatter.format(new Date(`${isoDate}T00:00:00`)),
            high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
            low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
            icon: display.icon,
          };
        });

        if (!cancelled && nextForecast.length === 3) {
          setWeather({
            location: { city: "New York", state: "NY" },
            temperature: Math.round(currentTemp),
            condition: currentDisplay.condition,
            icon: currentDisplay.icon,
            forecast: nextForecast,
          });
        }
      } catch {
        // Keep fallback weather on network/API errors.
      }
    }

    void loadWeather();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-xs bg-gradient-to-r from-primary-500 to-primary text-primary-foreground shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="size-5" />
          <p className="font-inter text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {weather.location.city}, {weather.location.state}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="font-inter text-[32px] font-extrabold leading-none tracking-tight text-primary-foreground">
              {weather.temperature}°
            </p>
            <p className="mt-1 font-inter font-normal text-xs text-primary-foreground">{weather.condition}</p>
          </div>
          <WeatherIcon type={weather.icon} className="size-15 shrink-0 text-primary-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-white/20 px-2 py-2.5">
          {weather.forecast.map((day) => (
            <div key={day.label} className="text-center">
              <p className="font-inter text-xs font-semibold text-primary-foreground">{day.label}</p>
              <WeatherIcon type={day.icon} className="mx-auto my-1" />
              <p className="font-inter text-xs font-normal text-primary-foreground">
                {day.high}°{" "}/ <span className="font-inter text-xs font-normal text-primary-foreground">{day.low}°</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
