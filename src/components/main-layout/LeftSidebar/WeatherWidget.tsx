import * as React from "react";
import { Cloud, CloudRain, Loader2, MapPin, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

type WeatherIconType = "sun" | "cloud" | "rain";
type TemperatureUnit = "celsius" | "fahrenheit";
type WeatherLoadState = "loading" | "ready" | "error";

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

const TEMPERATURE_UNIT_STORAGE_KEY = "zbc-weather-temperature-unit";
const NYC_TIMEZONE = "America/New_York";
const NYC_LOCATION = { city: "New York", state: "NY" };

function readStoredTemperatureUnit(): TemperatureUnit {
  if (typeof window === "undefined") return "celsius";

  const stored = window.localStorage.getItem(TEMPERATURE_UNIT_STORAGE_KEY);
  if (stored === "fahrenheit") return "fahrenheit";
  return "celsius";
}

function formatForecastDayLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: NYC_TIMEZONE,
  }).format(date);
}

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

function WeatherWidgetShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xs bg-gradient-to-r from-primary-500 to-primary text-primary-foreground shadow-sm">
      <div className="p-4">{children}</div>
    </section>
  );
}

function TemperatureUnitToggle({
  unit,
  onChange,
  disabled = false,
}: {
  unit: TemperatureUnit;
  onChange: (unit: TemperatureUnit) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-1 font-inter text-[10px] font-semibold uppercase tracking-wide text-primary-foreground"
      role="group"
      aria-label="Temperature unit"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("celsius")}
        className={cn(
          "rounded-xs px-1 py-0.5 transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
          unit === "celsius" ? "opacity-100 underline underline-offset-2" : "opacity-70 hover:opacity-100",
        )}
        aria-pressed={unit === "celsius"}
      >
        °C
      </button>
      <span className="opacity-70" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("fahrenheit")}
        className={cn(
          "rounded-xs px-1 py-0.5 transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
          unit === "fahrenheit" ? "opacity-100 underline underline-offset-2" : "opacity-70 hover:opacity-100",
        )}
        aria-pressed={unit === "fahrenheit"}
      >
        °F
      </button>
    </div>
  );
}

function WeatherWidgetLoading({ unit }: { unit: TemperatureUnit }) {
  return (
    <WeatherWidgetShell>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-5 shrink-0" />
          <p className="truncate font-inter text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {NYC_LOCATION.city}, {NYC_LOCATION.state}
          </p>
        </div>
        <TemperatureUnitToggle unit={unit} onChange={() => undefined} disabled />
      </div>
      <div className="mt-2 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary-foreground/80" aria-hidden="true" />
          <p className="font-inter text-sm font-medium text-primary-foreground/90">Loading weather...</p>
        </div>
        <div className="size-15 shrink-0 animate-pulse rounded-full bg-white/20" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-3 gap-1 border-t border-white/20 px-2 py-2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2 text-center">
            <div className="mx-auto h-3 w-8 animate-pulse rounded bg-white/20" />
            <div className="mx-auto size-4 animate-pulse rounded-full bg-white/20" />
            <div className="mx-auto h-3 w-14 animate-pulse rounded bg-white/20" />
          </div>
        ))}
      </div>
    </WeatherWidgetShell>
  );
}

function WeatherWidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <WeatherWidgetShell>
      <div className="flex min-w-0 items-center gap-2">
        <MapPin className="size-5 shrink-0" />
        <p className="truncate font-inter text-xs font-semibold uppercase tracking-wide text-primary-foreground">
          {NYC_LOCATION.city}, {NYC_LOCATION.state}
        </p>
      </div>
      <div className="mt-4 text-center">
        <p className="font-inter text-sm text-primary-foreground/90">Unable to load weather right now.</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xs border border-white/30 px-3 py-1.5 font-inter text-xs font-semibold text-primary-foreground transition-colors hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    </WeatherWidgetShell>
  );
}

export function WeatherWidget() {
  const [weather, setWeather] = React.useState<WeatherState | null>(null);
  const [loadState, setLoadState] = React.useState<WeatherLoadState>("loading");
  const [temperatureUnit, setTemperatureUnit] = React.useState<TemperatureUnit>(readStoredTemperatureUnit);
  const [reloadKey, setReloadKey] = React.useState(0);

  const unitSuffix = temperatureUnit === "fahrenheit" ? "F" : "C";

  const handleUnitChange = React.useCallback((unit: TemperatureUnit) => {
    setTemperatureUnit(unit);
    window.localStorage.setItem(TEMPERATURE_UNIT_STORAGE_KEY, unit);
  }, []);

  const handleRetry = React.useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      setLoadState("loading");
      setWeather(null);

      try {
        const latitude = 40.7128;
        const longitude = -74.006;
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
          "&current=temperature_2m,weather_code" +
          "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
          `&forecast_days=3&temperature_unit=${temperatureUnit}&timezone=${encodeURIComponent(NYC_TIMEZONE)}`;

        const response = await fetch(url);
        if (!response.ok) {
          if (!cancelled) setLoadState("error");
          return;
        }

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
          if (!cancelled) setLoadState("error");
          return;
        }

        const currentDisplay = mapWeatherCodeToDisplay(currentCode);

        const nextForecast: WeatherDay[] = daily.time.slice(0, 3).map((isoDate, index) => {
          const forecastCode = daily.weather_code?.[index] ?? 0;
          const display = mapWeatherCodeToDisplay(forecastCode);
          return {
            label: formatForecastDayLabel(isoDate),
            high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
            low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
            icon: display.icon,
          };
        });

        if (!cancelled && nextForecast.length === 3) {
          setWeather({
            location: NYC_LOCATION,
            temperature: Math.round(currentTemp),
            condition: currentDisplay.condition,
            icon: currentDisplay.icon,
            forecast: nextForecast,
          });
          setLoadState("ready");
          return;
        }

        if (!cancelled) setLoadState("error");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    }

    void loadWeather();
    return () => {
      cancelled = true;
    };
  }, [temperatureUnit, reloadKey]);

  if (loadState === "loading") {
    return <WeatherWidgetLoading unit={temperatureUnit} />;
  }

  if (loadState === "error" || !weather) {
    return <WeatherWidgetError onRetry={handleRetry} />;
  }

  return (
    <WeatherWidgetShell>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-5 shrink-0" />
          <p className="truncate font-inter text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {weather.location.city}, {weather.location.state}
          </p>
        </div>
        <TemperatureUnitToggle unit={temperatureUnit} onChange={handleUnitChange} />
      </div>
      <div className="mt-2 mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="font-inter text-[32px] font-extrabold leading-none tracking-tight text-primary-foreground">
            {weather.temperature}°{unitSuffix}
          </p>
          <p className="mt-1 font-inter text-xs font-normal text-primary-foreground">{weather.condition}</p>
        </div>
        <WeatherIcon type={weather.icon} className="size-15 shrink-0 text-primary-foreground" />
      </div>
      <div className="grid grid-cols-3 gap-1 border-t border-white/20 px-2 py-2.5">
        {weather.forecast.map((day) => (
          <div key={day.label} className="text-center">
            <p className="font-inter text-xs font-semibold text-primary-foreground">{day.label}</p>
            <WeatherIcon type={day.icon} className="mx-auto my-1" />
            <p className="font-inter text-xs font-normal text-primary-foreground">
              {day.high}°{unitSuffix} /{" "}
              <span className="font-inter text-xs font-normal text-primary-foreground">
                {day.low}°{unitSuffix}
              </span>
            </p>
          </div>
        ))}
      </div>
    </WeatherWidgetShell>
  );
}
