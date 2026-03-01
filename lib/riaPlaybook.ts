export type RiaIntent =
  | "one_meal_left"
  | "tasty"
  | "hostel_canteen"
  | "night_snack"
  | "gym"
  | "low_budget"
  | "veg_bored"
  | "progress"
  | "food_log"
  | "general";

export function detectRiaIntent(message: string): RiaIntent[] {
  const text = message.toLowerCase();
  const intents = new Set<RiaIntent>();

  if (/(one meal|last meal|one meal left|last meal left)/.test(text)) intents.add("one_meal_left");
  if (/(tasty|yummy|craving|crave|something nice|something good|maza|chatpata)/.test(text)) intents.add("tasty");
  if (/(hostel|mess|canteen|pg food)/.test(text)) intents.add("hostel_canteen");
  if (/(night|late night|before bed|bedtime)/.test(text)) intents.add("night_snack");
  if (/(gym|workout|pre workout|post workout|training|exercise)/.test(text)) intents.add("gym");
  if (/(cheap|budget|rs|rupees|paise|money|afford|under \d+)/.test(text)) intents.add("low_budget");
  if (/(veg and bored|vegetarian and bored|veg boring|boring veg|veg options)/.test(text)) intents.add("veg_bored");
  if (/(progress|status|how am i doing|kitna hua)/.test(text)) intents.add("progress");
  if (/(i had|i ate|khaya|kha liya|for lunch|for dinner|for breakfast)/.test(text)) intents.add("food_log");

  if (!intents.size) intents.add("general");
  return Array.from(intents);
}

export const RIA_SCENARIOS = [
  {
    intent: "one_meal_left",
    user: "i have one meal left, how do i get 50g protein?",
    guidance:
      "be realistic. explain if 50g in one meal is possible but may require a larger meal or extra spend. suggest 2-3 practical combos, not extreme portions.",
  },
  {
    intent: "tasty",
    user: "i want something tasty but still decent protein",
    guidance:
      "suggest satisfying foods that feel fun, not bland diet foods. mention protein, rough cost, and why they are a better tradeoff.",
  },
  {
    intent: "hostel_canteen",
    user: "mess food is bad today, what should i do?",
    guidance:
      "work within hostel/canteen reality. recommend swaps, add-ons, and small hacks like curd, eggs, extra dal, banana, peanuts.",
  },
  {
    intent: "night_snack",
    user: "i am hungry at night and still short on protein",
    guidance:
      "keep advice light, practical, and sleep-friendly. suggest curd, milk, eggs, sprouts, banana + peanut butter when suitable.",
  },
  {
    intent: "gym",
    user: "what should i eat before gym?",
    guidance:
      "recommend easy pre-workout combinations with carbs + some protein. avoid heavy oily meals. for post-workout, prioritize protein.",
  },
  {
    intent: "low_budget",
    user: "i only have rs35 left today, what should i eat?",
    guidance:
      "optimize protein per rupee. if target cannot be met, say the best possible move under budget and mention the gap honestly.",
  },
  {
    intent: "veg_bored",
    user: "i am veg and bored of the same foods",
    guidance:
      "give variety, not only soya. rotate paneer, chole, rajma, sprouts, curd bowls, poha + peanuts, dal combos, sandwiches, wraps if present.",
  },
  {
    intent: "one_meal_left",
    user: "i only have dinner left and still need 35g protein",
    guidance:
      "focus on realistic dinner combos. if exact target is hard, give best practical range and explain the gap.",
  },
  {
    intent: "one_meal_left",
    user: "can i finish my whole protein target in one meal?",
    guidance:
      "explain that it depends on the remaining target, budget, and appetite. avoid extreme advice and give practical upper bounds.",
  },
  {
    intent: "tasty",
    user: "i want something tasty, not boring health food",
    guidance:
      "recommend foods that feel enjoyable: wraps, paneer dishes, omelette sandwiches, biryani-style options, bowls, spicy meals, but still explain protein tradeoff.",
  },
  {
    intent: "tasty",
    user: "what's the tastiest thing i can eat without ruining the day?",
    guidance:
      "give 3 options from indulgent to balanced. show which one is smartest if they still care about protein and budget.",
  },
  {
    intent: "hostel_canteen",
    user: "hostel mess has only rice and sabzi today",
    guidance:
      "help them salvage the meal with realistic add-ons like curd, milk, eggs, peanuts, banana, extra dal if available.",
  },
  {
    intent: "hostel_canteen",
    user: "canteen food is oily, what is the least bad option?",
    guidance:
      "pick the best compromise, not a perfect meal. prioritize protein and satiety.",
  },
  {
    intent: "night_snack",
    user: "it is 11pm and i am still hungry",
    guidance:
      "suggest light, practical foods that do not feel too heavy at night.",
  },
  {
    intent: "night_snack",
    user: "i need protein before bed but don't want a full meal",
    guidance:
      "give small add-on options like curd, milk, eggs, sprouts, peanut butter toast depending on diet type.",
  },
  {
    intent: "gym",
    user: "i have gym in 30 minutes, what can i eat?",
    guidance:
      "keep it light and fast-digesting. prefer carbs plus a little protein. avoid heavy food.",
  },
  {
    intent: "gym",
    user: "i finished gym and i am broke",
    guidance:
      "give cheapest useful post-workout recovery options first.",
  },
  {
    intent: "low_budget",
    user: "i have rs20 left and still need protein",
    guidance:
      "be brutally practical. explain the best achievable move under Rs20 and whether target is still realistically possible.",
  },
  {
    intent: "low_budget",
    user: "what can i buy for rs30 that actually helps?",
    guidance:
      "optimize for protein per rupee but keep food realistic and available.",
  },
  {
    intent: "veg_bored",
    user: "i am tired of eggs and soya, what else?",
    guidance:
      "give alternatives and variety logic. include dal combinations, curd, sprouts, paneer, rajma, chole, peanuts, sandwiches.",
  },
  {
    intent: "veg_bored",
    user: "i am vegetarian and can’t keep eating the same thing",
    guidance:
      "suggest weekly rotation patterns, not just single foods.",
  },
  {
    intent: "general",
    user: "i skipped breakfast, what should i do now?",
    guidance:
      "help them recover without guilt. prioritize what the next best meal should look like.",
  },
  {
    intent: "general",
    user: "i overate at lunch, how do i balance the rest of the day?",
    guidance:
      "do not punish. suggest lighter but protein-conscious later meals.",
  },
  {
    intent: "general",
    user: "i want fat loss but i am always hungry",
    guidance:
      "suggest high-protein, high-satiety foods and meal structure. avoid generic weight-loss advice.",
  },
  {
    intent: "general",
    user: "i want to gain muscle but hostel food is weak",
    guidance:
      "work around hostel reality using add-ons and smart cheap protein boosters.",
  },
  {
    intent: "general",
    user: "i don’t want to cook anything",
    guidance:
      "prioritize ready-to-eat or easy-buy foods. give the lazy but smart route.",
  },
  {
    intent: "general",
    user: "i can cook but only for 10 minutes",
    guidance:
      "recommend fast meals with minimal effort and realistic ingredients.",
  },
  {
    intent: "general",
    user: "i am craving junk food",
    guidance:
      "do not shame them. offer smarter swaps and least-damaging options.",
  },
  {
    intent: "general",
    user: "is it okay if i miss my protein target today?",
    guidance:
      "be reassuring but honest. tell them one day is fine and focus on the next practical step.",
  },
  {
    intent: "progress",
    user: "am i on track for today or not?",
    guidance:
      "answer directly first, then explain the next best action.",
  },
  {
    intent: "progress",
    user: "can i still hit my target tonight?",
    guidance:
      "use remaining protein and budget. if yes, show how. if no, give best possible outcome.",
  },
  {
    intent: "general",
    user: "what can i eat during exams to stay full and focused?",
    guidance:
      "suggest foods that are practical, not messy, and support energy plus satiety.",
  },
  {
    intent: "general",
    user: "i want something fast before class",
    guidance:
      "recommend fast grab-and-go items with some protein if possible.",
  },
  {
    intent: "general",
    user: "i ate outside already, what should the next meal be?",
    guidance:
      "balance the day instead of restarting it. use what they already likely ate.",
  },
  {
    intent: "general",
    user: "i don’t feel like eating much but i need protein",
    guidance:
      "prioritize compact, easy-to-eat foods with decent protein density.",
  },
  {
    intent: "general",
    user: "what is the smartest snack i can add today?",
    guidance:
      "answer based on remaining protein, budget, and ease of finding the snack.",
  },
  {
    intent: "general",
    user: "what should be my go-to emergency protein foods?",
    guidance:
      "give a shortlist the student can remember and actually keep around.",
  },
  {
    intent: "general",
    user: "i want cheap, filling, and high protein. pick two or three?",
    guidance:
      "explain tradeoffs clearly. tell them which two they can get easily, and what gets sacrificed.",
  },
  {
    intent: "general",
    user: "i don't mind spending a little extra if it helps me hit target",
    guidance:
      "show the practical upgrade path when they can spend a little more.",
  },
  {
    intent: "general",
    user: "what is the easiest way to get 20g protein right now?",
    guidance:
      "give 3 fast options and rank them by ease.",
  },
  {
    intent: "general",
    user: "what is the cheapest way to get 20g protein right now?",
    guidance:
      "give 3 cheapest practical ways, not theoretical extremes.",
  },
  {
    intent: "general",
    user: "what should i eat if i am sick of hostel food?",
    guidance:
      "be empathetic and give low-effort escape options that still fit the budget as much as possible.",
  },
  {
    intent: "general",
    user: "what should i order if i want protein and comfort food?",
    guidance:
      "balance comfort with protein. choose realistic dishes students would actually enjoy.",
  },
  {
    intent: "general",
    user: "i only have bananas and bread in my room",
    guidance:
      "work from constraints. suggest what to do now and what one extra item would improve it the most.",
  }
];

export function getScenarioGuidance(intents: RiaIntent[]) {
  return RIA_SCENARIOS.filter((s) => intents.includes(s.intent as RiaIntent));
}
