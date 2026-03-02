import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  compute_targets_plan_v1,
  type GoalPace,
  type StepRange,
  type StrengthDays,
  type TargetDietLabel,
  type TargetGoalLabel,
  type TargetLifestyleLabel,
  type TargetSexLabel,
  type TargetsPlanInputs,
  type TrainingType,
} from "@/services/targets_v1";

const PLAN_COOKIE = "nutriai_daily_targets_plan";

type ComputeTargetsRequest = TargetsPlanInputs;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ComputeTargetsRequest>;
    const inputs = validateInputs(body);
    const plan = compute_targets_plan_v1(inputs);

    const response = NextResponse.json(plan);
    response.cookies.set(PLAN_COOKIE, JSON.stringify(plan), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid targets request." },
      { status: 400 },
    );
  }
}

function validateInputs(body: Partial<ComputeTargetsRequest>): TargetsPlanInputs {
  if (!body.age || !body.height_cm || !body.weight_kg) {
    throw new Error("Age, height, and weight are required.");
  }

  if (!body.sex || !body.lifestyle || !body.goal || !body.diet_type) {
    throw new Error("Sex, lifestyle, goal, and diet type are required.");
  }

  return {
    age: Number(body.age),
    sex: body.sex as TargetSexLabel,
    height_cm: Number(body.height_cm),
    weight_kg: Number(body.weight_kg),
    lifestyle: body.lifestyle as TargetLifestyleLabel,
    goal: body.goal as TargetGoalLabel,
    diet_type: body.diet_type as TargetDietLabel,
    steps_range: body.steps_range as StepRange | undefined,
    training_type: body.training_type as TrainingType | undefined,
    strength_days: body.strength_days as StrengthDays | undefined,
    goal_pace: body.goal_pace as GoalPace | undefined,
  };
}

export async function GET() {
  const cookieStore = await cookies();
  const saved = cookieStore.get(PLAN_COOKIE)?.value;
  if (!saved) {
    return NextResponse.json(null);
  }

  try {
    return NextResponse.json(JSON.parse(saved));
  } catch {
    return NextResponse.json(null);
  }
}
