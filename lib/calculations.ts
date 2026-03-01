export type GoalType = "lose" | "maintain" | "gain";
export type SexType = "male" | "female" | "other";
export type LifestyleType = "sedentary" | "light" | "active" | "very_active";

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  biologicalSex: SexType,
  lifestyle: LifestyleType,
) {
  const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  const bmr =
    biologicalSex === "male"
      ? maleBmr
      : biologicalSex === "female"
        ? femaleBmr
        : (maleBmr + femaleBmr) / 2;

  const multipliers: Record<LifestyleType, number> = {
    sedentary: 1.2,
    light: 1.375,
    active: 1.55,
    very_active: 1.725,
  };

  return bmr * multipliers[lifestyle];
}

export function calculateCalorieGoal(
  weightKg: number,
  heightCm: number,
  age: number,
  biologicalSex: SexType,
  lifestyle: LifestyleType,
  goal: GoalType,
) {
  const tdee = calculateTDEE(weightKg, heightCm, age, biologicalSex, lifestyle);
  const adjusted = goal === "lose" ? tdee - 300 : goal === "gain" ? tdee + 300 : tdee;
  return Math.max(1200, Math.round(adjusted));
}

export function calculateProteinGoal(
  weightKg: number,
  lifestyle: LifestyleType,
  goal: GoalType,
) {
  const baseRates: Record<LifestyleType, number> = {
    sedentary: 0.83,
    light: 1.0,
    active: 1.4,
    very_active: 1.8,
  };

  const goalModifiers: Record<GoalType, number> = {
    lose: 1.1,
    maintain: 1.0,
    gain: 1.2,
  };

  return Math.max(1, Math.round(weightKg * baseRates[lifestyle] * goalModifiers[goal]));
}

export function calculateTargets(input: {
  age: number;
  heightCm: number;
  weightKg: number;
  biologicalSex: SexType;
  lifestyle: LifestyleType;
  goal: GoalType;
}) {
  return {
    dailyCalorieGoal: calculateCalorieGoal(
      input.weightKg,
      input.heightCm,
      input.age,
      input.biologicalSex,
      input.lifestyle,
      input.goal,
    ),
    dailyProteinGoal: calculateProteinGoal(input.weightKg, input.lifestyle, input.goal),
  };
}
