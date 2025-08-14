const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || (window as any).__API_BASE__ || "http://localhost:5217";

export type WeatherForecast = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string | null;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const api = {
  health: () => http<{ status: string; env: string }>("/"),
  weather: () => http<WeatherForecast[]>("/weatherforecast"),
};
