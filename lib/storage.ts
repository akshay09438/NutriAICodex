import { format } from "date-fns";
import type { GoalType, LifestyleType, SexType } from "@/lib/calculations";
import type { TargetsPlanV1 } from "@/services/targets_v1";

export type DietType = "veg" | "egg" | "nonveg";

export type NutriProfile = {
  age: number;
  height_cm: number;
  weight_kg: number;
  biological_sex: SexType;
  lifestyle: LifestyleType;
  goal: GoalType;
  diet_type: DietType;
  daily_budget: number;
  meal_budget: number;
  budget_meals_count: number;
  has_pre_activity_snack: boolean;
  pre_activity_snack_budget: number;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_targets_plan?: TargetsPlanV1 | null;
  setup_complete: boolean;
  created_at: string;
};

export type MealSize = "small" | "medium" | "large" | "xlarge";

export type MealLog = {
  id: string;
  name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cost: number;
  size: MealSize;
  logged_at: string;
  source: "manual" | "ria";
};

export type DayLog = {
  date: string;
  meals: MealLog[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    cost: number;
  };
};

const PROFILE_KEY = "nutriai_profile";

function todayKeyDate() {
  return format(new Date(), "yyyy-MM-dd");
}

function dayKey(date: string) {
  return `nutriai_log_${date}`;
}

function defaultDayLog(date: string): DayLog {
  return {
    date,
    meals: [],
    totals: { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, cost: 0 },
  };
}

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getProfile() {
  const s = storage();
  if (!s) return null;
  const raw = s.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NutriProfile;
  } catch {
    return null;
  }
}

export function saveProfile(data: NutriProfile) {
  const s = storage();
  if (!s) return;
  s.setItem(PROFILE_KEY, JSON.stringify(data));
}

export function getLogForDate(dateString: string) {
  const s = storage();
  if (!s) return defaultDayLog(dateString);
  const raw = s.getItem(dayKey(dateString));
  if (!raw) return defaultDayLog(dateString);
  try {
    return JSON.parse(raw) as DayLog;
  } catch {
    return defaultDayLog(dateString);
  }
}

export function getTodayLog() {
  return getLogForDate(todayKeyDate());
}

function saveDayLog(log: DayLog) {
  const s = storage();
  if (!s) return;
  s.setItem(dayKey(log.date), JSON.stringify(log));
}

function computeTotals(meals: MealLog[]) {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein_g += meal.protein_g;
      acc.carbs_g += meal.carbs_g;
      acc.fat_g += meal.fat_g;
      acc.cost += meal.cost;
      return acc;
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, cost: 0 },
  );
}

export function addMealToLog(meal: MealLog) {
  const log = getTodayLog();
  const meals = [meal, ...log.meals];
  saveDayLog({ ...log, meals, totals: computeTotals(meals) });
}

export function deleteMealFromLog(mealId: string) {
  const log = getTodayLog();
  const meals = log.meals.filter((meal) => meal.id !== mealId);
  saveDayLog({ ...log, meals, totals: computeTotals(meals) });
}

export function resetTodayLog() {
  saveDayLog(defaultDayLog(todayKeyDate()));
}

export function getRemainingToday() {
  const profile = getProfile();
  const log = getTodayLog();
  if (!profile) {
    return {
      calories_left: 0,
      protein_left: 0,
      budget_left: 0,
      calories_consumed: 0,
      protein_consumed: 0,
      budget_spent: 0,
    };
  }

  return {
    calories_left: profile.daily_calorie_goal - log.totals.calories,
    protein_left: profile.daily_protein_goal - log.totals.protein_g,
    budget_left: profile.daily_budget - log.totals.cost,
    calories_consumed: log.totals.calories,
    protein_consumed: log.totals.protein_g,
    budget_spent: log.totals.cost,
  };
}

export function getWeeklyData() {
  const profile = getProfile();
  const today = new Date();
  const days: Array<{
    date: string;
    dayLabel: string;
    calories_consumed: number;
    protein_consumed: number;
    budget_spent: number;
    meals_count: number;
    hit_protein_goal: boolean;
  }> = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const log = getLogForDate(dateStr);
    const protein = log.totals.protein_g || 0;
    const goal = profile?.daily_protein_goal || 1;
    days.push({
      date: dateStr,
      dayLabel: format(date, "EEE"),
      calories_consumed: log.totals.calories || 0,
      protein_consumed: protein,
      budget_spent: log.totals.cost || 0,
      meals_count: log.meals.length,
      hit_protein_goal: protein >= goal * 0.9,
    });
  }

  const total = days.reduce(
    (acc, d) => {
      acc.calories += d.calories_consumed;
      acc.protein += d.protein_consumed;
      acc.budget += d.budget_spent;
      return acc;
    },
    { calories: 0, protein: 0, budget: 0 },
  );

  return {
    days,
    avg_calories: Math.round(total.calories / 7),
    avg_protein: Math.round(total.protein / 7),
    total_budget_spent: total.budget,
    total_budget_limit: (profile?.daily_budget || 200) * 7,
    goal_hit_count: days.filter((d) => d.hit_protein_goal).length,
    best_protein_day: days.reduce<(typeof days)[number] | null>(
      (best, d) => (d.protein_consumed > (best?.protein_consumed || 0) ? d : best),
      null,
    ),
  };
}
