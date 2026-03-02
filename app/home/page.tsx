"use client";

import { useEffect, useState } from "react";
import { Avatar, Button, Card, CardBody } from "@heroui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import RiaSheet from "@/components/ria/RiaSheet";
import { getCatchUpSuggestions } from "@/lib/indianFoodDB";
import { getProfile, getRemainingToday, getTodayLog, getWeeklyData, resetTodayLog, type NutriProfile } from "@/lib/storage";
import { getWeeklyInsight } from "@/lib/weeklyReport";
import { clamp, formatInt, getGreeting, getTodayReadable, isAfter2PM } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [profile] = useState<NutriProfile | null>(() => getProfile());
  const [openChat, setOpenChat] = useState(false);
  const [toast, setToast] = useState("");
  const [expandWeek, setExpandWeek] = useState(false);
  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!profile?.setup_complete) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  if (!profile) {
    return <main className="min-h-screen bg-white p-5 text-black">loading...</main>;
  }

  const log = getTodayLog();
  const remaining = getRemainingToday();
  const weekly = getWeeklyData();
  const insight = getWeeklyInsight();
  const budgetLeft = profile.daily_budget - log.totals.cost;
  const proteinLeft = profile.daily_protein_goal - log.totals.protein_g;
  const showCatchUp = isAfter2PM() && log.totals.protein_g < profile.daily_protein_goal * 0.4;
  const catchUps = getCatchUpSuggestions(
    Math.max(0, budgetLeft),
    profile.diet_type,
    log.meals.map((m) => m.name),
  );
  const dailyTargets = profile.daily_targets_plan?.improved || {
    calories_target: profile.daily_calorie_goal,
    protein_min_g: profile.daily_protein_goal,
    protein_optimal_g: profile.daily_protein_goal,
    protein_per_meal_g: Math.round(profile.daily_protein_goal / 3),
  };
  const proteinMinimum = Math.round(profile.daily_protein_goal * 0.83);
  const proteinOptimal = profile.daily_protein_goal;
  const proteinConsumed = remaining.protein_consumed;

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
          <CardBody className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold">Daily Targets</p>
                <p className="text-[13px] text-[#525252]">good day: hit minimum. best results: aim for optimal.</p>
              </div>
              {profile.daily_targets_plan?.improved_used ? (
                <span className="rounded-full border border-black px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black">
                  better calculation
                </span>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#737373]">calories</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">{formatInt(dailyTargets.calories_target)} kcal/day</p>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#737373]">protein</p>
                <p className="text-[11px] text-[#525252]">{formatInt(dailyTargets.protein_per_meal_g)}g per meal</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <MiniStat title="minimum" primary={`${formatInt(proteinMinimum)}g`} secondary="hit this on a good day" />
                <MiniStat title="optimal" primary={`${formatInt(proteinOptimal)}g`} secondary="best results target" />
              </div>
              <div className="mt-5">
                <ProteinTracker
                  consumed={proteinConsumed}
                  minimum={proteinMinimum}
                  optimal={proteinOptimal}
                />
              </div>
            </div>

            {!profile.daily_targets_plan?.improved_used ? (
              <p className="text-xs text-[#525252]">add activity details for better estimate (optional)</p>
            ) : null}
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
        <Image src="/ria-doctor.svg" alt="Ria" width={64} height={64} className="h-full w-full object-cover" />
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
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#737373]">{title}</p>
      <p className={`mt-1 text-lg font-semibold ${warn ? "text-[#FF4444]" : "text-black"}`}>{primary}</p>
      <p className="text-xs text-[#525252]">{secondary}</p>
    </div>
  );
}

function ProteinTracker({
  consumed,
  minimum,
  optimal,
}: {
  consumed: number;
  minimum: number;
  optimal: number;
}) {
  const optimalColor = "#8FBFA1";
  const maxValue = optimal + 10;
  const consumedClamped = clamp(consumed, 0, maxValue);
  const fillColor =
    consumed >= optimal ? optimalColor : consumed >= minimum ? "#FFFFFF" : "#888888";
  const consumedPct = (consumedClamped / Math.max(1, maxValue)) * 100;
  const minimumPct = (minimum / Math.max(1, maxValue)) * 100;
  const optimalPct = (optimal / Math.max(1, maxValue)) * 100;
  const minimumToOptimalPct = ((optimal - minimum) / Math.max(1, maxValue)) * 100;
  const remainingAfterOptimalPct = Math.max(0, 100 - optimalPct);

  let statusText = "Start eating - log your first meal to track protein";
  let statusColor = "#555555";

  if (consumed > 0 && consumed < minimum) {
    statusText = `${formatInt(consumed)}g consumed  ${formatInt(minimum - consumed)}g to hit minimum`;
    statusColor = "#888888";
  } else if (consumed >= minimum && consumed < optimal) {
    statusText = `Minimum hit  ${formatInt(optimal - consumed)}g more for best results`;
    statusColor = "#FFFFFF";
  } else if (consumed >= optimal) {
    statusText = "Optimal protein hit today!";
    statusColor = optimalColor;
  }

  return (
    <div>
      <div className="relative h-[58px] w-full overflow-visible">
        <div className="absolute left-0 top-[34px] h-[10px] w-full -translate-y-1/2 overflow-hidden rounded-[99px] bg-[#1A1A1A]">
          <div className="h-full bg-[#2A2A2A]" style={{ width: `${minimumPct}%` }} />
          <div
            className="absolute top-0 h-full bg-[#3A3A3A]"
            style={{ left: `${minimumPct}%`, width: `${minimumToOptimalPct}%` }}
          />
          <div
            className="absolute right-0 top-0 h-full bg-[#1A1A1A]"
            style={{ width: `${remainingAfterOptimalPct}%` }}
          />
          <div
            className="absolute left-0 top-0 h-full rounded-[99px]"
            style={{
              width: `${consumedPct}%`,
              background: fillColor,
              transition: "width 500ms ease, background-color 500ms ease",
            }}
          />
        </div>

        <div
          className="absolute top-1/2 z-10 w-[2px] -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{ left: `${minimumPct}%`, top: "34px", height: "22px" }}
        />
        <div
          className="absolute top-1/2 z-10 w-[2px] -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${optimalPct}%`, top: "34px", height: "22px", backgroundColor: optimalColor }}
        />

        <div
          className="absolute z-20"
          style={{ left: `${consumedPct}%`, top: "34px", transition: "left 500ms ease" }}
        >
          <div
            className="absolute left-1/2 top-[-34px] whitespace-nowrap rounded-[4px] bg-[#222222] px-[6px] py-[2px] text-[11px] font-bold text-white"
            style={{ transform: "translateX(-50%)" }}
          >
            {formatInt(consumed)}g
          </div>
          <div
            className="absolute left-1/2 top-1/2 h-[14px] w-[14px] rounded-full border-2"
            style={{
              transform: "translate(-50%, -50%)",
              borderColor: "#0A0A0A",
              background: fillColor,
              transition: "background-color 500ms ease",
            }}
          />
        </div>
      </div>

      <div className="relative mt-[10px] h-4 text-[11px] text-[#555555]">
        <span className="absolute left-0 top-0">0g</span>
        <span className="absolute top-0 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em] text-[#888888]" style={{ left: `${minimumPct}%` }}>
          MIN
        </span>
        <span className="absolute top-0 -translate-x-1/2 text-[10px] uppercase tracking-[0.12em]" style={{ left: `${optimalPct}%`, color: optimalColor }}>
          OPT
        </span>
        
      </div>

      <p className="mt-2 text-[13px] leading-[1.4]" style={{ color: statusColor }}>
        {statusText}
      </p>
    </div>
  );
}
