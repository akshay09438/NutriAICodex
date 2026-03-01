import type { DietType, MealSize } from "@/lib/storage";
import extendedFoods from "@/data/indian_food_extended.json";

export type PriceMode = "per100g" | "serving";

export type IndianFood = {
  name: string;
  aliases?: string[];
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  cost_per_100g: number;
  diet: DietType;
  note?: string;
  place?: string;
  price_mode?: PriceMode;
};

export const INDIAN_COMPOSITE_DISHES: IndianFood[] = [
  { name: "Idli", aliases: ["idly", "idlis"], cal: 58, protein: 2.0, carbs: 11.0, fat: 0.4, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Dosa", aliases: ["dose", "dosai", "plain dosa"], cal: 168, protein: 3.9, carbs: 28.0, fat: 4.8, cost_per_100g: 12, diet: "veg", price_mode: "per100g" },
  { name: "Upma", cal: 113, protein: 2.8, carbs: 19.5, fat: 2.9, cost_per_100g: 6, diet: "veg", price_mode: "per100g" },
  { name: "Poha", aliases: ["pohe"], cal: 130, protein: 2.5, carbs: 24.0, fat: 3.1, cost_per_100g: 6, diet: "veg", price_mode: "per100g" },
  { name: "Paratha", aliases: ["parantha"], cal: 260, protein: 5.8, carbs: 35.0, fat: 10.5, cost_per_100g: 10, diet: "veg", price_mode: "per100g" },
  { name: "Dal Rice", aliases: ["dal chawal", "daal chawal"], cal: 150, protein: 5.8, carbs: 28.0, fat: 2.1, cost_per_100g: 10, diet: "veg", price_mode: "per100g" },
  { name: "Rajma Chawal", aliases: ["rajma rice"], cal: 170, protein: 7.5, carbs: 30.0, fat: 2.8, cost_per_100g: 15, diet: "veg", price_mode: "per100g" },
  { name: "Chole Chawal", aliases: ["chana chawal"], cal: 165, protein: 7.2, carbs: 29.0, fat: 3.0, cost_per_100g: 15, diet: "veg", price_mode: "per100g" },
  { name: "Khichdi", aliases: ["khichri"], cal: 125, protein: 4.8, carbs: 22.0, fat: 2.5, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Roti", aliases: ["chapati", "phulka"], cal: 297, protein: 8.5, carbs: 57.0, fat: 3.7, cost_per_100g: 5, diet: "veg", price_mode: "per100g" },
  { name: "Dal Tadka", aliases: ["dal fry"], cal: 90, protein: 5.5, carbs: 12.0, fat: 3.0, cost_per_100g: 12, diet: "veg", price_mode: "per100g" },
  { name: "Sambar", cal: 50, protein: 2.8, carbs: 7.5, fat: 1.5, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Palak Paneer", cal: 150, protein: 8.5, carbs: 6.0, fat: 10.5, cost_per_100g: 30, diet: "veg", price_mode: "per100g" },
  { name: "Paneer Bhurji", cal: 220, protein: 14.0, carbs: 5.5, fat: 15.0, cost_per_100g: 35, diet: "veg", price_mode: "per100g" },
  { name: "Egg Curry", aliases: ["anda curry"], cal: 145, protein: 10.5, carbs: 5.5, fat: 9.5, cost_per_100g: 20, diet: "egg", price_mode: "per100g" },
  { name: "Chicken Curry", aliases: ["murgh curry"], cal: 165, protein: 18.5, carbs: 5.0, fat: 8.0, cost_per_100g: 45, diet: "nonveg", price_mode: "per100g" },
  { name: "Chicken Biryani", aliases: ["chicken biriyani"], cal: 195, protein: 12.0, carbs: 26.0, fat: 5.5, cost_per_100g: 50, diet: "nonveg", price_mode: "per100g" },
  { name: "Veg Biryani", aliases: ["veg biriyani"], cal: 180, protein: 4.5, carbs: 32.0, fat: 4.5, cost_per_100g: 30, diet: "veg", price_mode: "per100g" },
  { name: "Curd Rice", aliases: ["dahi chawal"], cal: 135, protein: 4.0, carbs: 25.0, fat: 2.5, cost_per_100g: 10, diet: "veg", price_mode: "per100g" },
  { name: "Boiled Egg", aliases: ["anda", "egg", "boiled anda"], cal: 143, protein: 12.5, carbs: 0.8, fat: 9.5, cost_per_100g: 10, diet: "egg", price_mode: "per100g" },
  { name: "Omelette", aliases: ["egg omelette", "omlet"], cal: 165, protein: 11.5, carbs: 1.2, fat: 12.5, cost_per_100g: 12, diet: "egg", price_mode: "per100g" },
  { name: "Boiled Chicken Breast", aliases: ["chicken breast"], cal: 165, protein: 31.0, carbs: 0, fat: 3.6, cost_per_100g: 40, diet: "nonveg", price_mode: "per100g" },
  { name: "Soya Chunks", aliases: ["soya", "meal maker", "nutrela"], cal: 140, protein: 18.0, carbs: 10.0, fat: 1.5, cost_per_100g: 6, diet: "veg", price_mode: "per100g" },
  { name: "Paneer", aliases: ["cottage cheese"], cal: 296, protein: 18.3, carbs: 2.7, fat: 22.7, cost_per_100g: 35, diet: "veg", price_mode: "per100g" },
  { name: "Moong Dal", aliases: ["mung dal"], cal: 105, protein: 7.0, carbs: 16.5, fat: 0.9, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Chana Dal", cal: 164, protein: 9.0, carbs: 27.0, fat: 2.0, cost_per_100g: 7, diet: "veg", price_mode: "per100g" },
  { name: "Rajma", aliases: ["kidney beans"], cal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, cost_per_100g: 12, diet: "veg", price_mode: "per100g" },
  { name: "Chole", aliases: ["chickpeas", "kabuli chana"], cal: 164, protein: 8.9, carbs: 27.0, fat: 2.6, cost_per_100g: 10, diet: "veg", price_mode: "per100g" },
  { name: "Dahi", aliases: ["curd", "yogurt"], cal: 60, protein: 3.1, carbs: 4.7, fat: 3.2, cost_per_100g: 6, diet: "veg", price_mode: "per100g" },
  { name: "Milk", aliases: ["doodh"], cal: 67, protein: 3.4, carbs: 4.7, fat: 4.0, cost_per_100g: 5, diet: "veg", price_mode: "per100g" },
  { name: "Peanuts", aliases: ["moongfali"], cal: 585, protein: 25.0, carbs: 20.0, fat: 44.0, cost_per_100g: 15, diet: "veg", price_mode: "per100g" },
  { name: "Peanut Butter", aliases: ["pb"], cal: 588, protein: 25.0, carbs: 20.0, fat: 50.0, cost_per_100g: 30, diet: "veg", price_mode: "per100g" },
  { name: "Sprouts", aliases: ["moong sprouts"], cal: 97, protein: 8.0, carbs: 16.0, fat: 0.6, cost_per_100g: 5, diet: "veg", price_mode: "per100g" },
  { name: "Vada Pav", aliases: ["wadapav"], cal: 290, protein: 7.0, carbs: 45.0, fat: 9.5, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Samosa", cal: 250, protein: 4.5, carbs: 32.0, fat: 12.0, cost_per_100g: 12, diet: "veg", price_mode: "per100g" },
  { name: "Maggi", aliases: ["instant noodles"], cal: 205, protein: 5.8, carbs: 28.0, fat: 8.0, cost_per_100g: 10, diet: "veg", price_mode: "per100g" },
  { name: "Banana", aliases: ["kela"], cal: 89, protein: 1.1, carbs: 23.0, fat: 0.3, cost_per_100g: 3, diet: "veg", price_mode: "per100g" },
  { name: "Apple", aliases: ["seb"], cal: 52, protein: 0.3, carbs: 14.0, fat: 0.2, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Bread", aliases: ["white bread"], cal: 245, protein: 7.9, carbs: 48.0, fat: 2.5, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Rice", aliases: ["chawal"], cal: 130, protein: 2.7, carbs: 28.0, fat: 0.3, cost_per_100g: 4, diet: "veg", price_mode: "per100g" },
  { name: "Chai", aliases: ["tea", "masala chai"], cal: 30, protein: 1.0, carbs: 3.5, fat: 1.5, cost_per_100g: 3, diet: "veg", price_mode: "per100g" },
  { name: "Lassi", cal: 98, protein: 3.5, carbs: 14.5, fat: 3.2, cost_per_100g: 8, diet: "veg", price_mode: "per100g" },
  { name: "Biscuits", aliases: ["parle g", "biscuit"], cal: 385, protein: 7.0, carbs: 70.0, fat: 7.5, cost_per_100g: 12, diet: "veg", price_mode: "per100g" },
];

const EXTENDED_FOODS = (extendedFoods as IndianFood[]).map((f) => ({
  ...f,
  aliases: f.aliases || [],
  price_mode: f.price_mode || "serving",
}));

const MASTER_FOODS: IndianFood[] = (() => {
  const map = new Map<string, IndianFood>();
  for (const food of [...INDIAN_COMPOSITE_DISHES, ...EXTENDED_FOODS]) {
    map.set(food.name.toLowerCase(), food);
  }
  return Array.from(map.values());
})();

export function getMasterFoods() {
  return MASTER_FOODS;
}

export const SIZE_MULTIPLIERS: Record<MealSize, number> = {
  small: 0.6,
  medium: 1,
  large: 1.5,
  xlarge: 2.2,
};

export function getBasePrice(food: IndianFood) {
  return Number(food.cost_per_100g || 0);
}

export function isServingFood(food: IndianFood) {
  return food.price_mode === "serving";
}

export function getCostDescriptor(food: IndianFood) {
  return isServingFood(food) ? "base serving" : "100g";
}

export function searchFood(query: string): IndianFood | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const foundMaster = MASTER_FOODS.find(
    (food) =>
      food.name.toLowerCase().includes(q) ||
      food.aliases?.some((a) => a.toLowerCase().includes(q)),
  );
  if (foundMaster) return foundMaster;
  return null;
}

export function calculateMealNutrition(food: IndianFood, size: MealSize) {
  const multiplier = SIZE_MULTIPLIERS[size];
  return {
    calories: Math.round(food.cal * multiplier),
    protein_g: Number((food.protein * multiplier).toFixed(1)),
    carbs_g: Number((food.carbs * multiplier).toFixed(1)),
    fat_g: Number((food.fat * multiplier).toFixed(1)),
    estimated_cost: Math.round(getBasePrice(food) * multiplier),
  };
}

export function getTopProteinFoods(maxCostPer100g = 999, dietType: DietType = "veg") {
  const allowed: Record<DietType, DietType[]> = {
    veg: ["veg"],
    egg: ["veg", "egg"],
    nonveg: ["veg", "egg", "nonveg"],
  };
  const permitted = allowed[dietType] ?? allowed.veg;
  return MASTER_FOODS
    .filter((f) => permitted.includes(f.diet))
    .filter((f) => getBasePrice(f) <= maxCostPer100g)
    .map((f) => ({
      ...f,
      proteinPerRupee: Number(((f.protein / Math.max(1, getBasePrice(f))) * 10).toFixed(1)),
      costLabel: getCostDescriptor(f),
      basePrice: getBasePrice(f),
    }))
    .sort((a, b) => b.proteinPerRupee - a.proteinPerRupee);
}

export function getCatchUpSuggestions(
  remainingBudget: number,
  dietType: DietType,
  alreadyEatenNames: string[] = [],
) {
  const allowed: Record<DietType, DietType[]> = {
    veg: ["veg"],
    egg: ["veg", "egg"],
    nonveg: ["veg", "egg", "nonveg"],
  };
  const permitted = allowed[dietType] ?? allowed.veg;
  return MASTER_FOODS
    .filter((f) => permitted.includes(f.diet))
    .filter((f) => f.protein >= 8)
    .filter((f) => getBasePrice(f) <= Math.max(6, remainingBudget / 2))
    .filter(
      (f) => !alreadyEatenNames.some((n) => n.toLowerCase().includes(f.name.toLowerCase())),
    )
    .sort((a, b) => b.protein - a.protein)
    .slice(0, 3)
    .map((f) => ({ ...f, estCost: Math.round(getBasePrice(f)) }));
}

export function getRelevantFoods(query: string, limit = 12) {
  const q = query.toLowerCase().trim();
  if (!q) return MASTER_FOODS.slice(0, limit);
  return MASTER_FOODS
    .map((food) => {
      let score = 0;
      if (food.name.toLowerCase() === q) score += 100;
      if (food.name.toLowerCase().includes(q)) score += 50;
      if (food.aliases?.some((a) => a.toLowerCase().includes(q))) score += 40;
      for (const token of q.split(/\s+/)) {
        if (food.name.toLowerCase().includes(token)) score += 8;
        if (food.aliases?.some((a) => a.toLowerCase().includes(token))) score += 6;
        if (food.place?.toLowerCase().includes(token)) score += 10;
      }
      score += Math.min(food.protein, 30) / 10;
      return { food, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.food);
}
