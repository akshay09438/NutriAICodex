export type TargetSexLabel = "Male" | "Female" | "Prefer not to say";
export type TargetLifestyleLabel =
  | "Mostly sitting"
  | "Light movement"
  | "Gym / Active"
  | "Very active";
export type TargetGoalLabel = "Lose weight" | "Stay fit" | "Gain muscle";
export type TargetDietLabel = "Vegetarian" | "Eggetarian" | "Non-Vegetarian";
export type StepRange = "0_3k" | "3_6k" | "6_10k" | "10k_plus";
export type TrainingType = "none" | "cardio" | "strength" | "both";
export type StrengthDays = "0_1" | "2_3" | "4_6";
export type GoalPace = "easy" | "steady" | "aggressive";

export type TargetsPlanInputs = {
  age: number;
  sex: TargetSexLabel;
  height_cm: number;
  weight_kg: number;
  lifestyle: TargetLifestyleLabel;
  goal: TargetGoalLabel;
  diet_type: TargetDietLabel;
  steps_range?: StepRange;
  training_type?: TrainingType;
  strength_days?: StrengthDays;
  goal_pace?: GoalPace;
};

export type TargetsSummary = {
  activity_factor: number;
  tdee: number;
  calories_target: number;
  calories_goal_mode: string;
  protein_min_g: number;
  protein_optimal_g: number;
  protein_per_meal_g: number;
};

export type TargetsPlanV1 = {
  version: "targets_v1";
  inputs_snapshot: TargetsPlanInputs;
  base: TargetsSummary;
  improved: TargetsSummary;
  improved_used: boolean;
  explanations: string[];
};

export function compute_bmr_mifflin(
  age: number,
  sex: TargetSexLabel,
  height_cm: number,
  weight_kg: number,
) {
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  if (sex === "Male") return base + 5;
  return base - 161;
}

export function base_activity_factor_from_lifestyle(lifestyle_label: TargetLifestyleLabel) {
  switch (lifestyle_label) {
    case "Mostly sitting":
      return 1.2;
    case "Light movement":
      return 1.35;
    case "Gym / Active":
      return 1.55;
    case "Very active":
      return 1.75;
  }
}

export function improved_activity_factor(
  lifestyle_label: TargetLifestyleLabel,
  steps_range?: StepRange,
  training_type?: TrainingType,
  strength_days?: StrengthDays,
) {
  let factor = base_activity_factor_from_lifestyle(lifestyle_label);

  if (steps_range) {
    switch (steps_range) {
      case "0_3k":
        factor -= 0.05;
        break;
      case "3_6k":
        break;
      case "6_10k":
        factor += 0.05;
        break;
      case "10k_plus":
        factor += 0.1;
        break;
    }
  }

  if (training_type) {
    switch (training_type) {
      case "none":
        break;
      case "cardio":
        factor += 0.03;
        break;
      case "strength":
        factor += 0.05;
        break;
      case "both":
        factor += 0.07;
        break;
    }
  }

  if (strength_days === "4_6") {
    factor += 0.03;
  }

  return Number(Math.min(1.9, Math.max(1.2, factor)).toFixed(2));
}

export function compute_calories_target(
  tdee: number,
  goal_label: TargetGoalLabel,
  sex_label: TargetSexLabel,
  goal_pace?: GoalPace,
  strength_days?: StrengthDays,
) {
  let rawTarget = tdee;
  let calories_goal_mode = "maintenance";

  if (goal_label === "Lose weight") {
    const pace = goal_pace || "steady";
    const deficit =
      pace === "easy" ? 0.1 : pace === "aggressive" ? 0.2 : 0.15;
    rawTarget = tdee * (1 - deficit);
    calories_goal_mode =
      pace === "easy" ? "deficit_10" : pace === "aggressive" ? "deficit_20" : "deficit_15";
  }

  if (goal_label === "Gain muscle") {
    const surplus =
      strength_days === "0_1"
        ? 0.05
        : strength_days === "2_3"
          ? 0.1
          : strength_days === "4_6"
            ? 0.12
            : 0.08;
    rawTarget = tdee * (1 + surplus);
    calories_goal_mode =
      surplus === 0.05
        ? "surplus_5"
        : surplus === 0.1
          ? "surplus_10"
          : surplus === 0.12
            ? "surplus_12"
            : "surplus_8";
  }

  const floor = sex_label === "Male" ? 1500 : sex_label === "Female" ? 1200 : 1350;
  return {
    calories_target: roundToNearest10(Math.max(floor, rawTarget)),
    calories_goal_mode,
  };
}

export function compute_protein_targets(
  weight_kg: number,
  goal_label: TargetGoalLabel,
  diet_type_label: TargetDietLabel,
  training_type?: TrainingType,
  strength_days?: StrengthDays,
) {
  let minMultiplier = 1;
  let optimalMultiplier = 1.1;
  let adjustment_applied = false;

  if (goal_label === "Lose weight") {
    minMultiplier = 1.2;
    optimalMultiplier =
      strength_days === "2_3" || strength_days === "4_6" ? 1.6 : 1.4;
    adjustment_applied = strength_days === "2_3" || strength_days === "4_6";
  }

  if (goal_label === "Stay fit") {
    minMultiplier = 1;
    optimalMultiplier = training_type && training_type !== "none" ? 1.2 : 1.1;
    adjustment_applied = Boolean(training_type && training_type !== "none");
  }

  if (goal_label === "Gain muscle") {
    minMultiplier = 1.4;
    optimalMultiplier =
      strength_days === "2_3" || strength_days === "4_6" ? 1.8 : 1.6;
    adjustment_applied = strength_days === "2_3" || strength_days === "4_6";
  }

  const dietMultiplier =
    diet_type_label === "Vegetarian"
      ? 1.1
      : diet_type_label === "Eggetarian"
        ? 1.05
        : 1;

  const protein_min_g = Math.min(150, Math.round(minMultiplier * weight_kg * dietMultiplier));
  const protein_optimal_g = Math.min(
    180,
    Math.round(optimalMultiplier * weight_kg * dietMultiplier),
  );

  return {
    protein_min_g,
    protein_optimal_g,
    protein_per_meal_g: Math.round(protein_optimal_g / 3),
    adjustment_applied,
  };
}

export function compute_targets_plan_v1(inputs: TargetsPlanInputs): TargetsPlanV1 {
  const bmr = compute_bmr_mifflin(inputs.age, inputs.sex, inputs.height_cm, inputs.weight_kg);
  const base_activity_factor = base_activity_factor_from_lifestyle(inputs.lifestyle);
  const improved_used = Boolean(
    inputs.steps_range || inputs.training_type || inputs.strength_days || inputs.goal_pace,
  );

  const improved_factor = improved_used
    ? improved_activity_factor(
        inputs.lifestyle,
        inputs.steps_range,
        inputs.training_type,
        inputs.strength_days,
      )
    : base_activity_factor;

  const base = buildSummary(
    bmr,
    base_activity_factor,
    inputs.goal,
    inputs.sex,
    inputs.weight_kg,
    inputs.diet_type,
    inputs.goal_pace,
    inputs.training_type,
    inputs.strength_days,
  );
  const improved = improved_used
    ? buildSummary(
        bmr,
        improved_factor,
        inputs.goal,
        inputs.sex,
        inputs.weight_kg,
        inputs.diet_type,
        inputs.goal_pace,
        inputs.training_type,
        inputs.strength_days,
      )
    : base;

  return {
    version: "targets_v1",
    inputs_snapshot: { ...inputs },
    base,
    improved,
    improved_used,
    explanations: buildExplanations(inputs, improved_used, base, improved),
  };
}

function buildSummary(
  bmr: number,
  activity_factor: number,
  goal: TargetGoalLabel,
  sex: TargetSexLabel,
  weight_kg: number,
  diet_type: TargetDietLabel,
  goal_pace?: GoalPace,
  training_type?: TrainingType,
  strength_days?: StrengthDays,
): TargetsSummary {
  const tdee = Math.round(bmr * activity_factor);
  const calories = compute_calories_target(tdee, goal, sex, goal_pace, strength_days);
  const protein = compute_protein_targets(
    weight_kg,
    goal,
    diet_type,
    training_type,
    strength_days,
  );

  return {
    activity_factor,
    tdee,
    calories_target: calories.calories_target,
    calories_goal_mode: calories.calories_goal_mode,
    protein_min_g: protein.protein_min_g,
    protein_optimal_g: protein.protein_optimal_g,
    protein_per_meal_g: protein.protein_per_meal_g,
  };
}

function buildExplanations(
  inputs: TargetsPlanInputs,
  improved_used: boolean,
  base: TargetsSummary,
  improved: TargetsSummary,
) {
  const lines = [
    `Base estimate uses your lifestyle: ${inputs.lifestyle}.`,
    `Protein is adjusted for your goal: ${inputs.goal} and diet: ${inputs.diet_type}.`,
  ];

  if (improved_used) {
    lines.push(
      `Better calculation used extra activity details and changed your activity factor from ${base.activity_factor.toFixed(2)} to ${improved.activity_factor.toFixed(2)}.`,
    );
  } else {
    lines.push("Add activity details for a more accurate estimate.");
  }

  return lines;
}

function roundToNearest10(value: number) {
  return Math.round(value / 10) * 10;
}
