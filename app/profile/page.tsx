"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getProfile, getTodayLog, getWeeklyData, resetTodayLog, type NutriProfile } from "@/lib/storage";
import { formatInt, getTodayReadable } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<NutriProfile | null>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todayProtein, setTodayProtein] = useState(0);
  const [todayBudget, setTodayBudget] = useState(0);
  const [goalHitCount, setGoalHitCount] = useState(0);
  const [avgProtein, setAvgProtein] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const savedProfile = getProfile();
    if (!savedProfile?.setup_complete) {
      router.replace("/onboarding");
      return;
    }

    const today = getTodayLog();
    const weekly = getWeeklyData();

    setProfile(savedProfile);
    setTodayCalories(today.totals.calories);
    setTodayProtein(today.totals.protein_g);
    setTodayBudget(today.totals.cost);
    setGoalHitCount(weekly.goal_hit_count);
    setAvgProtein(weekly.avg_protein);
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const refreshStats = () => {
    const today = getTodayLog();
    const weekly = getWeeklyData();
    setTodayCalories(today.totals.calories);
    setTodayProtein(today.totals.protein_g);
    setTodayBudget(today.totals.cost);
    setGoalHitCount(weekly.goal_hit_count);
    setAvgProtein(weekly.avg_protein);
  };

  const handleResetToday = () => {
    resetTodayLog();
    refreshStats();
    setToast("today got cleared");
  };

  if (!profile) {
    return <main className="min-h-screen bg-white p-5 text-black">loading...</main>;
  }

  const caloriePct = Math.min(100, Math.round((todayCalories / Math.max(1, profile.daily_calorie_goal)) * 100));
  const proteinPct = Math.min(100, Math.round((todayProtein / Math.max(1, profile.daily_protein_goal)) * 100));
  const budgetPct = Math.min(100, Math.round((todayBudget / Math.max(1, profile.daily_budget)) * 100));

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-6 text-black">
      <div className="mx-auto max-w-[420px] space-y-4">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-[#525252]">profile</p>
          <h1 className="text-[28px] font-extrabold tracking-[-0.6px]">your nutriai setup</h1>
          <p className="text-sm text-[#525252]">goals, budget, and today&apos;s progress in one place.</p>
        </header>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold">{profile.goal} goal</p>
                <p className="text-sm text-[#525252]">{profile.diet_type} diet • {profile.lifestyle.replace("_", " ")}</p>
              </div>
              <Button
                className="h-10 rounded-full border border-[#D4D4D8] bg-white px-4 text-xs font-semibold uppercase tracking-[0.12em] text-black"
                onPress={() => router.push("/onboarding")}
              >
                redo setup
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Fact label="daily calories" value={`${formatInt(profile.daily_calorie_goal)} kcal`} />
              <Fact label="daily protein" value={`${formatInt(profile.daily_protein_goal)} g`} />
              <Fact label="daily budget" value={`Rs${formatInt(profile.daily_budget)}`} />
              <Fact label="per meal" value={`Rs${formatInt(profile.meal_budget)}`} />
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold">today</p>
                <p className="text-xs text-[#525252]">{getTodayReadable()}</p>
              </div>
              <Button
                className="h-10 rounded-full border border-black bg-black px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                onPress={handleResetToday}
              >
                reset day
              </Button>
            </div>

            <ProgressRow label="calories" value={`${formatInt(todayCalories)} / ${formatInt(profile.daily_calorie_goal)} kcal`} pct={caloriePct} />
            <ProgressRow label="protein" value={`${formatInt(todayProtein)} / ${formatInt(profile.daily_protein_goal)} g`} pct={proteinPct} />
            <ProgressRow label="budget" value={`Rs${formatInt(todayBudget)} / Rs${formatInt(profile.daily_budget)}`} pct={budgetPct} />
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="space-y-3 p-5">
            <p className="text-base font-semibold">this week</p>
            <div className="grid grid-cols-2 gap-3">
              <Fact label="protein goal hit" value={`${goalHitCount} / 7 days`} />
              <Fact label="avg protein" value={`${formatInt(avgProtein)} g`} />
            </div>
          </CardBody>
        </Card>
      </div>

      <BottomNav active="profile" />

      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#D4D4D8] bg-white px-4 py-2 text-xs text-black">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#737373]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-black">{value}</p>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-[#525252]">{value}</p>
      </div>
      <div className="h-2 rounded-full bg-[#E5E7EB]">
        <div className="h-2 rounded-full bg-black transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
