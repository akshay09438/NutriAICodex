import test from "node:test";
import assert from "node:assert/strict";
import { compute_targets_plan_v1 } from "../services/targets_v1.js";

test("base only plan keeps improved equal to base", () => {
  const plan = compute_targets_plan_v1({
    age: 20,
    sex: "Male",
    height_cm: 175,
    weight_kg: 65,
    lifestyle: "Gym / Active",
    goal: "Stay fit",
    diet_type: "Non-Vegetarian",
  });

  assert.equal(plan.improved_used, false);
  assert.deepEqual(plan.improved, plan.base);
});

test("advanced inputs increase improved activity factor", () => {
  const plan = compute_targets_plan_v1({
    age: 20,
    sex: "Male",
    height_cm: 175,
    weight_kg: 65,
    lifestyle: "Gym / Active",
    goal: "Stay fit",
    diet_type: "Non-Vegetarian",
    steps_range: "6_10k",
    training_type: "both",
    strength_days: "2_3",
  });

  assert.equal(plan.improved_used, true);
  assert.ok(plan.improved.activity_factor > plan.base.activity_factor);
});

test("female aggressive cut respects floors and veg multiplier", () => {
  const plan = compute_targets_plan_v1({
    age: 29,
    sex: "Female",
    height_cm: 160,
    weight_kg: 52,
    lifestyle: "Mostly sitting",
    goal: "Lose weight",
    diet_type: "Vegetarian",
    steps_range: "0_3k",
    goal_pace: "aggressive",
  });

  assert.ok(plan.improved.calories_target >= 1200);
  assert.equal(plan.improved.calories_target % 10, 0);
  assert.ok(plan.improved.protein_optimal_g > Math.round(1.4 * 52));
});

test("protein caps are enforced", () => {
  const plan = compute_targets_plan_v1({
    age: 30,
    sex: "Male",
    height_cm: 190,
    weight_kg: 120,
    lifestyle: "Very active",
    goal: "Gain muscle",
    diet_type: "Vegetarian",
    training_type: "both",
    strength_days: "4_6",
  });

  assert.ok(plan.improved.protein_min_g <= 150);
  assert.ok(plan.improved.protein_optimal_g <= 180);
});
