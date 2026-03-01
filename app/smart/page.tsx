"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/react";
import BottomNav from "@/components/BottomNav";
import { getMasterFoods, getTopProteinFoods, isServingFood } from "@/lib/indianFoodDB";
import { getProfile } from "@/lib/storage";

export default function SmartPage() {
  const profile = getProfile();
  const [mode, setMode] = useState<"veg" | "all">(profile?.diet_type === "nonveg" ? "all" : "veg");

  const foods = useMemo(
    () => getTopProteinFoods(999, mode === "veg" ? "veg" : profile?.diet_type || "nonveg").slice(0, 20),
    [mode, profile?.diet_type],
  );

  const totalFoods = getMasterFoods().length;

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-6 text-black">
      <div className="mx-auto max-w-[420px] space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-[-0.5px]">Best Protein for Your Money</h1>
          <p className="text-sm text-[#525252]">ranked from the new indian food dataset with {totalFoods}+ foods and better price context</p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${mode === "veg" ? "border-black bg-black text-white" : "border-[#D4D4D8] bg-white text-black"}`}
            onClick={() => setMode("veg")}
          >
            Veg only
          </button>
          <button
            type="button"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${mode === "all" ? "border-black bg-black text-white" : "border-[#D4D4D8] bg-white text-black"}`}
            onClick={() => setMode("all")}
          >
            All foods
          </button>
        </div>

        <div className="space-y-2">
          {foods.map((food, idx) => (
            <Link key={food.name} href={`/log-meal?food=${encodeURIComponent(food.name)}`}>
              <Card className={`rounded-xl border ${idx === 0 ? "border-black" : "border-[#D4D4D8]"} bg-white shadow-none`}>
                <CardBody className="flex-row items-center justify-between gap-3 p-4">
                  <p className="w-8 text-2xl font-extrabold text-[#A3A3A3]">{idx + 1}</p>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{food.name}</p>
                    <p className="text-xs text-[#525252]">
                      {food.protein}g protein / {isServingFood(food) ? "base serving" : "100g"} - Rs{food.basePrice} {isServingFood(food) ? "per serving" : "per 100g"}
                    </p>
                    {idx === 0 ? <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black">best value</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{food.proteinPerRupee}g / Rs10</p>
                    <p className="text-[10px] text-[#525252]">per Rs10</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav active="smart" />
    </main>
  );
}
