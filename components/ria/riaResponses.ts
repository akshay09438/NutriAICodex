import { calculateMealNutrition, searchFood } from "@/lib/indianFoodDB";
import { getProfile, getRemainingToday } from "@/lib/storage";
import { isAfter8PM } from "@/lib/utils";

const englishTriggers = [
  "i had",
  "i ate",
  "i just ate",
  "i just had",
  "for breakfast",
  "for lunch",
  "for dinner",
  "ate this",
  "had this",
];

const hindiTriggers = [
  "khaya",
  "kha liya",
  "maine khaya",
  "lunch mein",
  "dinner mein",
  "breakfast mein",
  "subah khaya",
  "raat ko khaya",
];

const numberWords: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
};

function detectCount(text: string) {
  const match = text.match(/\b(\d+)\b/);
  if (match) return Number(match[1]);
  for (const [word, value] of Object.entries(numberWords)) {
    if (text.includes(word)) return value;
  }
  return 1;
}

function detectSize(text: string) {
  if (/(small|half|thoda)/.test(text)) return "small" as const;
  if (/(large|big|zyada|double)/.test(text)) return "large" as const;
  if (/(xlarge|extra)/.test(text)) return "xlarge" as const;
  return "medium" as const;
}

export function detectFoodLog(message: string) {
  const text = message.toLowerCase();
  const isFoodLog = [...englishTriggers, ...hindiTriggers].some((t) => text.includes(t));
  if (!isFoodLog) return { isFoodLog: false, detectedFoods: [], mentionedCost: 0 };

  const tokens = text.replace(/[,.;!?]/g, " ").split(/\s+/).filter(Boolean);
  const detectedFoods: Array<{
    name: string;
    size: "small" | "medium" | "large" | "xlarge";
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }> = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const tri = `${tokens[i]} ${tokens[i + 1] || ""} ${tokens[i + 2] || ""}`.trim();
    const bi = `${tokens[i]} ${tokens[i + 1] || ""}`.trim();
    const candidates = [tri, bi, tokens[i]].filter((v) => v.length > 1);
    for (const c of candidates) {
      const found = searchFood(c);
      if (found && !detectedFoods.some((d) => d.name === found.name)) {
        const size = detectSize(text);
        const count = detectCount(text);
        const base = calculateMealNutrition(found, size);
        detectedFoods.push({
          name: found.name,
          size,
          calories: Math.round(base.calories * count),
          protein_g: Number((base.protein_g * count).toFixed(1)),
          carbs_g: Number((base.carbs_g * count).toFixed(1)),
          fat_g: Number((base.fat_g * count).toFixed(1)),
        });
      }
    }
  }

  const costMatch = text.match(/(?:paid|rs|rupees|₹)\s*(\d+)/);
  const mentionedCost = costMatch ? Number(costMatch[1]) : 0;
  return { isFoodLog: detectedFoods.length > 0, detectedFoods, mentionedCost };
}

export function getProgressReply() {
  const profile = getProfile();
  const remaining = getRemainingToday();
  if (!profile) return "set up your profile first and i will track progress properly.";

  const caloriePct = Math.round((remaining.calories_consumed / profile.daily_calorie_goal) * 100);
  const proteinPct = Math.round((remaining.protein_consumed / profile.daily_protein_goal) * 100);
  const budgetPct = Math.round((remaining.budget_spent / profile.daily_budget) * 100);

  let note = "you are on a good path. keep it up.";
  if (caloriePct > 80 && proteinPct > 80) note = "excellent day. you are smashing your goals.";
  else if (proteinPct < 40 && new Date().getHours() > 14) {
    note = "protein is low for this time. add soya chunks, eggs, or paneer in your next meal.";
  } else if (budgetPct > 90) {
    note = "you are close to budget. keep next meal simple like dal rice or eggs.";
  }

  return `here's your day so far:\n🔥 calories: ${Math.round(remaining.calories_consumed)} / ${profile.daily_calorie_goal} kcal (${caloriePct}%)\n💪 protein: ${Math.round(remaining.protein_consumed)}g / ${profile.daily_protein_goal}g (${proteinPct}%)\n₹ budget: Rs${Math.round(remaining.budget_spent)} of Rs${profile.daily_budget} (${budgetPct}%)\n\n${note}`;
}

export function getPostAddFollowup() {
  const profile = getProfile();
  const remaining = getRemainingToday();
  if (!profile) return "done. logged it.";

  let tail = "keep going, you are on track.";
  if (remaining.protein_consumed >= profile.daily_protein_goal) {
    tail = "you have hit your protein goal today. incredible.";
  } else if (profile.daily_protein_goal - remaining.protein_consumed < 20) {
    tail = `almost there. just ${Math.round(profile.daily_protein_goal - remaining.protein_consumed)}g left.`;
  } else if (isAfter8PM() && profile.daily_protein_goal - remaining.protein_consumed > 30) {
    tail = `still ${Math.round(profile.daily_protein_goal - remaining.protein_consumed)}g short tonight. quick option: eggs or dahi before bed.`;
  }

  return `done. added to your day.\ncalories: ${Math.round(remaining.calories_consumed)} / ${profile.daily_calorie_goal} kcal\nprotein: ${Math.round(remaining.protein_consumed)}g / ${profile.daily_protein_goal}g\n\n${tail}`;
}

export function getRiaResponse(message: string) {
  const text = message.toLowerCase();
  if (/(how am i doing|my progress|kitna hua|status)/.test(text)) return getProgressReply();
  if (/(soya|nutrela|meal maker)/.test(text)) {
    const profile = getProfile();
    return `soya chunks are top value protein in india. 50g dry gives around 26g protein after cooking and costs around Rs8-10. your goal is ${profile?.daily_protein_goal || 0}g today.`;
  }
  if (/(gym|workout|exercise|before gym)/.test(text)) {
    return "before workout, have carbs + protein: banana + peanut butter toast, poha + peanuts, or rice + dal + egg. avoid heavy oily food right before.";
  }
  if (/(vegetarian protein|veg protein|no meat|shaakahari)/.test(text)) {
    return "veg protein ladder: soya chunks, paneer, peanuts, rajma, chole, moong dal, dahi, sprouts. mix two in each meal and you can hit your target.";
  }
  if (/(mess|canteen|hostel food|hostel mein)/.test(text)) {
    return "mess strategy: never skip dal/sambar, add rajma/chole when available, add curd/egg whenever possible, and avoid filling only on rice.";
  }
  if (/(budget.*protein|cheap protein|protein under|kam paise)/.test(text)) {
    return "cheap protein picks: soya chunks, eggs, dal, chole, peanuts, dahi. focus on protein-per-rupee, not fancy foods.";
  }
  return "good question. keep it simple: hit your protein target, eat balanced indian meals, and stay inside budget. tell me exactly what you ate and i can log it.";
}
