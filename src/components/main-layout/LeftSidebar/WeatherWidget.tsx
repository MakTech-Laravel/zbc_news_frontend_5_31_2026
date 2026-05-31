import { Cloud, CloudRain, MapPin, Sun } from "lucide-react";

import { weatherForecast, weatherLocation } from "@/data/dummy/sidebar";
import type { WeatherDay } from "@/data/dummy/types";
import { cn } from "@/lib/utils";

function WeatherIcon({ type, className }: { type: WeatherDay["icon"]; className?: string }) {
  const props = { className: cn("size-4", className), "aria-hidden": true as const };
  if (type === "sun") return <Sun {...props} />;
  if (type === "rain") return <CloudRain {...props} />;
  return <Cloud {...props} />;
}

export function WeatherWidget() {
  return (
    <section className="overflow-hidden rounded-xs bg-gradient-to-r from-primary-500 to-primary text-primary-foreground shadow-sm">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="size-5" />
          <p className="font-inter text-xs font-semibold uppercase tracking-wide text-primary-foreground">
            {weatherLocation.city}, {weatherLocation.state}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 mb-3">
          <div>
            <p className="font-inter text-[32px] font-extrabold leading-none tracking-tight text-primary-foreground">
              {weatherLocation.temperature}°
            </p>
            <p className="mt-1 font-inter font-normal text-xs text-primary-foreground">{weatherLocation.condition}</p>
          </div>
          <Cloud className="size-15 shrink-0 text-primary-foreground" aria-hidden strokeWidth={1.5} />
        </div>
        <div className="grid grid-cols-3 gap-1 border-t border-white/20 px-2 py-2.5">
          {weatherForecast.map((day) => (
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
