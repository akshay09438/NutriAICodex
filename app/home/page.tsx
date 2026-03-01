"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import RiaSheet from "@/components/ria/RiaSheet";
import { getCatchUpSuggestions } from "@/lib/indianFoodDB";
import { getProfile, getTodayLog, getWeeklyData, resetTodayLog, type NutriProfile } from "@/lib/storage";
import { getWeeklyInsight } from "@/lib/weeklyReport";
import { clamp, formatInt, getGreeting, getTodayReadable, isAfter2PM } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<NutriProfile | null>(null);
  const [openChat, setOpenChat] = useState(false);
  const [toast, setToast] = useState("");
  const [expandWeek, setExpandWeek] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const p = getProfile();
    if (!p?.setup_complete) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const log = useMemo(() => getTodayLog(), [refreshKey]);
  const weekly = useMemo(() => getWeeklyData(), [refreshKey]);
  const insight = useMemo(() => getWeeklyInsight(), [refreshKey]);

  if (!profile) {
    return <main className="min-h-screen bg-white p-5 text-black">loading...</main>;
  }

  const caloriesLeft = profile.daily_calorie_goal - log.totals.calories;
  const proteinLeft = profile.daily_protein_goal - log.totals.protein_g;
  const budgetLeft = profile.daily_budget - log.totals.cost;

  const calorieProgress = clamp(log.totals.calories / Math.max(1, profile.daily_calorie_goal), 0, 1.2);
  const showCatchUp = isAfter2PM() && log.totals.protein_g < profile.daily_protein_goal * 0.4;
  const catchUps = getCatchUpSuggestions(
    Math.max(0, budgetLeft),
    profile.diet_type,
    log.meals.map((m) => m.name),
  );

  const handleReset = () => {
    resetTodayLog();
    setRefreshKey((v) => v + 1);
    setToast("dashboard reset. today is fresh again.");
  };

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-6 text-black">
      <div className="mx-auto max-w-[420px] space-y-4">
        <header className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-semibold tracking-[-0.3px]">{getGreeting()}</h1>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-full border border-black px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-black hover:text-white"
              >
                reset
              </button>
            </div>
            <p className="text-[13px] text-[#525252]">{getTodayReadable()}</p>
          </div>
          <Avatar name="U" className="h-10 w-10 border border-[#D4D4D8] bg-white text-black" />
        </header>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold">Calories Today</p>
              <p className="text-[13px] text-[#525252]">{Math.max(0, Math.round(caloriesLeft))} kcal left</p>
            </div>
            <Ring
              value={log.totals.calories}
              goal={profile.daily_calorie_goal}
              over={log.totals.calories > profile.daily_calorie_goal}
            />
            <div className="mt-4 h-1.5 rounded-full bg-[#E5E7EB]">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, calorieProgress * 100)}%`, background: log.totals.calories > profile.daily_calorie_goal ? "#FF4444" : "#111111" }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-[#525252]">
              <span>0</span>
              <span>{profile.daily_calorie_goal} kcal goal</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat
                title="protein"
                primary={`${Math.round(log.totals.protein_g)}g`}
                secondary={`${Math.max(0, Math.round(proteinLeft))}g left`}
              />
              <MiniStat
                title="budget"
                primary={`Rs${Math.round(log.totals.cost)}`}
                secondary={`Rs${Math.max(0, Math.round(budgetLeft))} left`}
                warn={budgetLeft < 0}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 divide-x divide-[#E5E7EB]">
              <Macro value={`${Math.round(log.totals.protein_g)}g`} label="protein" />
              <Macro value={`${Math.round(log.totals.carbs_g)}g`} label="carbs" />
              <Macro value={`${Math.round(log.totals.fat_g)}g`} label="fat" />
            </div>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Speak to Ria</p>
              <p className="text-xs text-[#525252]"><span className="text-[#44FF88]">?</span> ria is online</p>
            </div>
            <p className="text-sm text-[#525252]">ask what to eat next, tell her what you ate, or get a practical protein plan.</p>
            <Button
              className="h-[60px] rounded-xl border-2 border-black bg-black text-base font-bold uppercase tracking-[0.08em] text-white"
              onPress={() => setOpenChat(true)}
            >
              Start chatting
            </Button>
          </CardBody>
        </Card>

        {showCatchUp ? (
          <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
            <CardBody className="space-y-3 border-l-[3px] border-[#F59E0B] p-5">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold">Behind on protein</p>
                <span className="text-[10px] uppercase text-[#F59E0B]">catch up</span>
              </div>
              <p className="text-[14px] text-[#525252]">
                you&apos;ve had {Math.round(log.totals.protein_g)}g protein. you need {Math.max(0, Math.round(proteinLeft))}g more before day end.
              </p>
              <div className="flex flex-wrap gap-2">
                {catchUps.map((f) => (
                  <button key={f.name} className="rounded-lg border border-[#D4D4D8] bg-white px-3 py-2 text-xs text-black" onClick={() => router.push(`/log-meal?food=${encodeURIComponent(f.name)}`)}>
                    {f.name} - {Math.round(f.protein)}g protein
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>
        ) : null}

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-base font-semibold">Scan your meal</p>
              <span className="text-[10px] uppercase text-[#525252]">ai coming soon</span>
            </div>
            <p className="text-sm text-[#525252]">take a photo to estimate calories and protein. coming soon.</p>
            <Button className="h-[52px] rounded-xl border border-[#D4D4D8] bg-transparent text-black opacity-50" onPress={() => setToast("AI scanning is coming soon")}>Coming soon</Button>
          </CardBody>
        </Card>

        <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
          <CardBody className="p-5">
            <button type="button" className="flex w-full items-center justify-between" onClick={() => setExpandWeek((v) => !v)}>
              <p className="text-base font-semibold">This Week</p>
              <p className="text-[#525252]">{expandWeek ? "up" : "down"}</p>
            </button>
            <p className="mt-2 text-sm text-[#525252]">
              you&apos;ve hit your protein goal {weekly.goal_hit_count} days this week
            </p>
            {expandWeek ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-end justify-between gap-2">
                  {weekly.days.map((d) => {
                    const pct = clamp(d.protein_consumed / Math.max(1, profile.daily_protein_goal), 0, 1);
                    return (
                      <div key={d.date} className="flex flex-col items-center gap-1">
                        <div className="w-5 rounded-t bg-[#D4D4D8]" style={{ height: `${Math.max(8, Math.round(pct * 48))}px`, backgroundColor: d.hit_protein_goal ? "#111111" : "#D4D4D8" }} />
                        <p className="text-[10px] text-[#525252]">{d.dayLabel[0]}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="rounded-full border border-[#D4D4D8] px-3 py-1">Avg {weekly.avg_protein}g / day</span>
                  <span className="rounded-full border border-[#D4D4D8] px-3 py-1">Hit {weekly.goal_hit_count}/7</span>
                  <span className="rounded-full border border-[#D4D4D8] px-3 py-1">Rs{Math.round(weekly.total_budget_spent)} spent</span>
                </div>
                <p className="text-sm italic text-[#525252]">{insight}</p>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <button
        type="button"
        onClick={() => setOpenChat(true)}
        className="fixed bottom-28 right-5 z-40 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-white shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5"
        aria-label="Open Ria chat"
      >
        <img src="/ria-doctor.svg" alt="Ria" className="h-full w-full object-cover" />
      </button>

      <BottomNav active="home" onToast={setToast} />

      {toast ? (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-[#D4D4D8] bg-white px-4 py-2 text-xs text-black">
          {toast}
        </div>
      ) : null}

      <RiaSheet
        isOpen={openChat}
        onOpenChange={setOpenChat}
        onMealAdded={() => setRefreshKey((v) => v + 1)}
      />
    </main>
  );
}

function MiniStat({
  title,
  primary,
  secondary,
  warn = false,
}: {
  title: string;
  primary: string;
  secondary: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#737373]">{title}</p>
      <p className={`mt-1 text-lg font-semibold ${warn ? "text-[#FF4444]" : "text-black"}`}>{primary}</p>
      <p className="text-xs text-[#525252]">{secondary}</p>
    </div>
  );
}

function Ring({ value, goal, over }: { value: number; goal: number; over: boolean }) {
  const size = 160;
  const radius = 70;
  const c = 2 * Math.PI * radius;
  const pct = clamp(value / Math.max(1, goal), 0, 1);
  return (
    <div className="grid place-items-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth="12" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={over ? "#FF4444" : "#111111"}
          strokeWidth="12"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
      </svg>
      <div className="-mt-[104px] text-center">
        <p className="text-3xl font-extrabold tabular-nums">{formatInt(value)}</p>
        <p className="text-[11px] uppercase tracking-[0.5px] text-[#525252]">consumed</p>
      </div>
    </div>
  );
}

function Macro({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-2 text-center">
      <p className="font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-[#525252]">{label}</p>
    </div>
  );
}
