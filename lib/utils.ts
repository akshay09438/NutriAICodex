import { format } from "date-fns";

export function getTodayKeyDate() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getTodayReadable() {
  return format(new Date(), "EEEE, d MMMM");
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 23) return "Good evening";
  return "Still up?";
}

export function formatInt(value: number) {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isAfter2PM() {
  return new Date().getHours() >= 14;
}

export function isAfter8PM() {
  return new Date().getHours() >= 20;
}
