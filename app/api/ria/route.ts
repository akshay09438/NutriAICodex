import { NextResponse } from "next/server";
import {
  calculateMealNutrition,
  getBasePrice,
  getCatchUpSuggestions,
  getRelevantFoods,
  getTopProteinFoods,
} from "@/lib/indianFoodDB";
import { detectRiaIntent, getScenarioGuidance } from "@/lib/riaPlaybook";

type RiaRequest = {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  profile?: {
    diet_type?: "veg" | "egg" | "nonveg";
    daily_budget?: number;
    daily_protein_goal?: number;
    daily_calorie_goal?: number;
    goal?: string;
    lifestyle?: string;
  } | null;
  progress?: {
    protein_left?: number;
    budget_left?: number;
    calories_left?: number;
    protein_consumed?: number;
    budget_spent?: number;
    calories_consumed?: number;
  } | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RiaRequest;
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    if (!apiKey) {
      return NextResponse.json({ reply: "Ria is not connected yet. Add the OpenAI key and try again." }, { status: 200 });
    }

    const dietType = body.profile?.diet_type || "veg";
    const progress = body.progress || {};
    const intents = detectRiaIntent(body.message);
    const scenarioGuidance = getScenarioGuidance(intents);
    const relevantFoods = getRelevantFoods(body.message, 14);
    const proteinValueFoods = getTopProteinFoods(Math.max(25, body.progress?.budget_left || 999), dietType).slice(0, 10);
    const catchUps = getCatchUpSuggestions(body.progress?.budget_left || 0, dietType, []);
    const practicalCombos = buildPracticalCombos(relevantFoods, progress.protein_left || 0, progress.budget_left || 0);
    const oneMealOptions = buildOneMealOptions(proteinValueFoods, progress.protein_left || 0, progress.budget_left || 0);
    const tastyFoods = relevantFoods
      .filter((f) =>
        /biryani|paneer|wrap|roll|paratha|masala|fried|rice|bowl|omelette|sandwich|poha|upma|dosa|taco|pizza|burger|subway|burrito/i.test(
          f.name,
        ),
      )
      .slice(0, 8);

    const system = [
      "You are Ria, a practical nutritionist for Indian students age 18-25.",
      "You sound natural, calm, sharp, and useful. Never sound corporate, robotic, or preachy.",
      "You specialize in budget nutrition, protein planning, hostel/canteen eating, delivery choices, and realistic Indian meals.",
      "Core objective: help the user get as close as possible to protein and calorie targets without unrealistic advice.",
      "Always optimize for what is practical, affordable, and believable for a student.",
      "Never suggest absurd portions like 1kg soya, 20 eggs, or impossible budgets.",
      "If a target cannot realistically be met in one meal or with remaining budget, say that clearly and give the best realistic fallback.",
      "When needed, explain tradeoffs: more protein may need extra spend, or the user may finish slightly under target today.",
      "If the user asks for something tasty, suggest foods that feel satisfying while still helping protein.",
      "Prefer combinations over single foods when combinations are more realistic.",
      "Use only foods from the provided context when giving concrete macros or prices.",
      "If the food name includes a place or brand, keep that in the suggestion because the user values practical ordering context.",
      "Use rupees as Rs.",
    ].join(" ");

    const context = {
      profile: body.profile,
      progress,
      detectedIntents: intents,
      scenarioGuidance,
      topProteinFoods: proteinValueFoods.map((f) => ({
        name: f.name,
        protein: f.protein,
        basePrice: f.basePrice,
        proteinPerRupee: f.proteinPerRupee,
        diet: f.diet,
        costLabel: f.costLabel,
      })),
      catchUps: catchUps.map((f) => ({
        name: f.name,
        protein: f.protein,
        cost: f.estCost,
        diet: f.diet,
      })),
      practicalCombos,
      oneMealOptions,
      tastyFoods: tastyFoods.map((f) => ({
        name: f.name,
        protein: f.protein,
        calories: f.cal,
        price: getBasePrice(f),
        diet: f.diet,
      })),
      relevantFoods: relevantFoods.map((f) => ({
        name: f.name,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        calories: f.cal,
        price: getBasePrice(f),
        diet: f.diet,
        place: f.place,
        note: f.note,
      })),
    };

    const messages = [
      { role: "system", content: system },
      {
        role: "system",
        content: `Grounding context in JSON: ${JSON.stringify(context)}`,
      },
      {
        role: "system",
        content:
          "Reply style rules: be direct, practical, and student-friendly. If user asks 'what should i eat', give 3 strong options with why. If they ask 'i have one meal left', give realistic combinations and mention whether target is fully reachable. If they ask for tasty food, recommend fun but sensible options. If budget is tight, optimize for protein per rupee and mention the cheapest add-on like banana, curd, or eggs when useful.",
      },
      ...(body.history || []).slice(-8).map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: body.message },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        {
          reply:
            process.env.NODE_ENV === "development"
              ? `Ria upstream error: ${text}`
              : "Ria hit a connection issue. Try again in a moment.",
        },
        { status: 200 },
      );
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      "I have an idea, but I could not phrase it properly. Ask me again in one line.";

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      {
        reply:
          process.env.NODE_ENV === "development"
            ? `Ria route error: ${error instanceof Error ? error.message : "unknown"}`
            : "Ria ran into a small issue. Try asking again.",
      },
      { status: 200 },
    );
  }
}

function buildPracticalCombos(
  foods: Array<{ name: string; protein: number; cal: number; cost_per_100g: number }>,
  proteinLeft: number,
  budgetLeft: number,
) {
  const shortlist = foods.filter((f) => f.protein >= 3).slice(0, 8);

  const combos: Array<{ combo: string; protein: number; estCost: number; note: string }> = [];
  for (let i = 0; i < shortlist.length; i += 1) {
    const a = shortlist[i];
    const aMed = calculateMealNutrition(a as any, "medium");
    combos.push({
      combo: a.name,
      protein: Number(aMed.protein_g),
      estCost: aMed.estimated_cost,
      note: "single practical option",
    });
    for (let j = i + 1; j < shortlist.length; j += 1) {
      const b = shortlist[j];
      const bMed = calculateMealNutrition(b as any, "medium");
      const protein = Number((aMed.protein_g + bMed.protein_g).toFixed(1));
      const estCost = aMed.estimated_cost + bMed.estimated_cost;
      if (budgetLeft <= 0 || estCost <= budgetLeft + 20) {
        combos.push({
          combo: `${a.name} + ${b.name}`,
          protein,
          estCost,
          note: protein >= proteinLeft && proteinLeft > 0 ? "can cover remaining protein" : "balanced combo",
        });
      }
    }
  }

  return combos
    .sort((a, b) => {
      const aDelta = proteinLeft > 0 ? Math.abs(a.protein - proteinLeft) : -a.protein;
      const bDelta = proteinLeft > 0 ? Math.abs(b.protein - proteinLeft) : -b.protein;
      if (aDelta !== bDelta) return aDelta - bDelta;
      return a.estCost - b.estCost;
    })
    .slice(0, 8);
}

function buildOneMealOptions(
  foods: Array<{ name: string; protein: number; cost_per_100g: number; cal: number }>,
  proteinLeft: number,
  budgetLeft: number,
) {
  return foods
    .map((food) => {
      const medium = calculateMealNutrition(food as any, "medium");
      const large = calculateMealNutrition(food as any, "large");
      return {
        name: food.name,
        medium_protein: medium.protein_g,
        medium_cost: medium.estimated_cost,
        large_protein: large.protein_g,
        large_cost: large.estimated_cost,
        realistic_fit: proteinLeft > 0 ? large.protein_g >= proteinLeft : false,
        budget_ok: budgetLeft > 0 ? medium.estimated_cost <= budgetLeft || large.estimated_cost <= budgetLeft : true,
      };
    })
    .slice(0, 8);
}
