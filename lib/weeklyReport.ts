import { getProfile, getWeeklyData } from "@/lib/storage";

export function getWeeklyInsight() {
  const profile = getProfile();
  const weekly = getWeeklyData();
  const goal = profile?.daily_protein_goal || 0;

  if (weekly.goal_hit_count >= 5) {
    return `${weekly.goal_hit_count} days hitting your protein goal this week. that is a strong habit.`;
  }
  if (goal > 0 && weekly.avg_protein >= goal * 0.8) {
    return `you averaged ${weekly.avg_protein}g protein, close to your ${goal}g goal. one extra protein snack daily can close the gap.`;
  }
  if (goal > 0 && weekly.avg_protein < goal * 0.5) {
    return `protein was low this week (${weekly.avg_protein}g avg vs ${goal}g goal). try adding soya chunks or eggs to lunch every day.`;
  }
  if (weekly.total_budget_spent > weekly.total_budget_limit) {
    const over = Math.round(weekly.total_budget_spent - weekly.total_budget_limit);
    return `you went Rs${over} over budget this week. next week, swap one canteen meal with dal rice and curd.`;
  }
  return "decent week overall. keep protein as the anchor in each meal and the rest gets easier.";
}
