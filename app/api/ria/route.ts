import { NextResponse } from "next/server";
import {
  calculateMealNutrition,
  getBasePrice,
  getCatchUpSuggestions,
  getRelevantFoods,
  getTopProteinFoods,
  type IndianFood,
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
    const model = "gpt-4o-mini";

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

    const system = `You are Ria, a nutrition guide for Indian students aged 18-25.
You speak like a knowledgeable older friend — warm, real, never preachy.
You know Indian food deeply. You think in katoris, rotis, rupees, not grams and dollars.

You respond in structured markdown that renders in a mobile chat interface.
Follow these formatting rules on every single response, no exceptions.

---

FORMATTING RULES:

Use **bold** for all food names and section headings.
Every food item gets its own line — never run items together.
Use bullet points (- ) for lists of foods or options.
Use ### for section headings when giving multiple options.
Add a blank line between each section.
End every response with a CTA line starting with [CTA].

---

RESPONSE LENGTH RULES:

Simple question (what to eat, best protein etc)  max 10 lines
Recommendation with options  max 15 lines
Full day plan  max 20 lines
Never exceed 20 lines under any circumstance.
If you need more space, give top 3 and ask if they want more.

---

RESPONSE STRUCTURE — use this template for food recommendations:

### [Heading that describes the goal]

- **[Food name]** — [X]g protein  ₹[cost]
- **[Food name]** — [X]g protein  ₹[cost]
- **[Food name]** — [X]g protein  ₹[cost]

[One line summary — the most important takeaway]

[CTA][Action text]

---

EXAMPLE — user asks "want to achieve 40g protein, what to order from zomato":

### Order for 40g Protein 🍕

- **Domino's Peppy Paneer (Regular)** — 34g protein  ₹229
- **Subway Paneer Tikka 6-inch** — 24g protein  ₹219
- **KFC Rice Bowl (Veg)** — 18g protein  ₹179

Domino's gets you closest to 40g in one order.
Pair with a dahi from home to close the gap.

[CTA]Order Domino's on Zomato

---

EXAMPLE — user asks "best protein under rs50":

### Best Protein Under ₹50

- **Soya Chunks** — 18g protein  ₹6 per katori
- **Boiled Eggs (2)** — 13g protein  ₹14
- **Sprouts** — 8g protein  ₹5 per katori
- **Peanuts** — 8g protein  ₹10 per handful
- **Rajma (katori)** — 9g protein  ₹12

Soya chunks win on protein per rupee every time.

[CTA]Log one of these

---

EXAMPLE — user asks something casual like "suggest something tasty":

Hey, tasty with protein — great combo 😄

Quick question first:
**Veg or non-veg today?**
And roughly **what's your budget** for this meal?

[CTA]Tell me veg/non-veg

---

TONE RULES:

Never say "Great question!", "Certainly!", "As an AI", "I recommend",
"It is important to", "Please note that", "I hope this helps".

Say things like:
"Honestly, soya chunks are your best bet here."
"Skip the Maggi tonight —"
"Quick answer:"
"Real talk —"
"This one's easy:"

When recommending restaurant food always include chain name + dish name.
Never say "a restaurant" — be specific.

When user logs food, confirm in exactly 2 lines:
Line 1: what was logged + protein amount
Line 2: how much protein is left today`;

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
        temperature: 0.75,
        max_tokens: 350,
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
  foods: IndianFood[],
  proteinLeft: number,
  budgetLeft: number,
) {
  const shortlist = foods.filter((f) => f.protein >= 3).slice(0, 8);

  const combos: Array<{ combo: string; protein: number; estCost: number; note: string }> = [];
  for (let i = 0; i < shortlist.length; i += 1) {
    const a = shortlist[i];
    const aMed = calculateMealNutrition(a, "medium");
    combos.push({
      combo: a.name,
      protein: Number(aMed.protein_g),
      estCost: aMed.estimated_cost,
      note: "single practical option",
    });
    for (let j = i + 1; j < shortlist.length; j += 1) {
      const b = shortlist[j];
      const bMed = calculateMealNutrition(b, "medium");
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
  foods: IndianFood[],
  proteinLeft: number,
  budgetLeft: number,
) {
  return foods
    .map((food) => {
      const medium = calculateMealNutrition(food, "medium");
      const large = calculateMealNutrition(food, "large");
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
