import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const PLAN_COOKIE = "nutriai_daily_targets_plan";

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
