"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import {
  calculateMealNutrition,
  getCostDescriptor,
  getBasePrice,
  isServingFood,
  searchFood,
  type IndianFood,
} from "@/lib/indianFoodDB";
import { addMealToLog, type MealSize } from "@/lib/storage";
import { formatInt } from "@/lib/utils";

const quick = ["eggs", "paneer", "soya chunks", "chicken", "dal rice", "roti", "khichdi", "banana"];

export default function LogMealPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IndianFood | null>(null);
  const [size, setSize] = useState<MealSize>("medium");
  const [cost, setCost] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const food = url.searchParams.get("food");
    if (food) {
      setQuery(food);
      setSelected(searchFood(food));
    }
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) return;
    setSelected(searchFood(query));
  }, [query]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const nutrition = useMemo(() => (selected ? calculateMealNutrition(selected, size) : null), [selected, size]);

  const save = () => {
    if (!selected || !nutrition) return;
    addMealToLog({
      id: crypto.randomUUID(),
      name: selected.name,
      calories: nutrition.calories,
      protein_g: nutrition.protein_g,
      carbs_g: nutrition.carbs_g,
      fat_g: nutrition.fat_g,
      cost: Number(cost || nutrition.estimated_cost || 0),
      size,
      logged_at: new Date().toISOString(),
      source: "manual",
    });
    setToast(`Added! ${nutrition.calories} kcal and ${nutrition.protein_g}g protein logged`);
    setTimeout(() => router.push("/home"), 800);
  };

  return (
    <main className="min-h-screen bg-white px-5 pb-28 pt-6 text-black">
      <div className="mx-auto max-w-[420px] space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/home" className="text-sm font-medium text-black">back</Link>
          <h1 className="text-xl font-bold">What did you eat?</h1>
          <div className="w-10" />
        </div>
        <p className="text-center text-[13px] text-[#525252]">type a food name or pick below</p>

        <Input
          value={query}
          onValueChange={setQuery}
          placeholder="Try 'dal rice', 'eggs', 'taco bell', 'subway paneer'..."
          autoFocus
          classNames={{
            inputWrapper:
              "h-[52px] rounded-xl border border-[#D4D4D8] bg-white shadow-none data-[hover=true]:bg-white",
            input: "text-black",
          }}
        />

        <p className="text-xs uppercase tracking-[0.5px] text-[#525252]">most common</p>
        <div className="flex flex-wrap gap-2">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              className="rounded-lg border border-[#D4D4D8] bg-white px-3 py-2 text-sm text-black"
              onClick={() => {
                setQuery(q);
                setSelected(searchFood(q));
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {selected && nutrition ? (
          <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
            <CardBody className="space-y-4 p-5">
              <div>
                <p className="text-lg font-semibold">{selected.name}</p>
                <p className="text-xs text-[#525252]">
                  {isServingFood(selected) ? `Per ${getCostDescriptor(selected)}` : `Per ${getCostDescriptor(selected)} base`}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <N value={selected.cal} label="kcal" />
                <N value={selected.protein} label="protein" />
                <N value={selected.carbs} label="carbs" />
                <N value={selected.fat} label="fat" />
              </div>

              <p className="text-sm text-[#525252]">
                {((selected.protein / Math.max(1, getBasePrice(selected))) * 10).toFixed(1)}g protein per Rs10
              </p>

              <p className="text-xs uppercase tracking-[0.5px] text-[#525252]">how much did you have?</p>
              <div className="grid grid-cols-2 gap-2">
                {(["small", "medium", "large", "xlarge"] as MealSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                      size === s ? "border-black bg-black text-white" : "border-[#D4D4D8] bg-white text-black"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">~{nutrition.calories} kcal</p>
                <p className="text-base text-[#525252]">~{nutrition.protein_g}g protein</p>
                <p className="mt-1 text-sm text-[#525252]">~Rs{nutrition.estimated_cost}</p>
              </div>

              <LabeledCost value={cost} onChange={setCost} />

              <Button className="h-[52px] rounded-xl bg-black text-white" onPress={save}>
                Yes, I ate this
              </Button>
            </CardBody>
          </Card>
        ) : (
          <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
            <CardBody className="p-5 text-sm text-[#525252]">
              {query.trim().length >= 2
                ? "We don't have this food yet - try searching for something similar or tell Ria what you ate instead."
                : "start typing a food to see nutrition."}
            </CardBody>
          </Card>
        )}
      </div>
      <BottomNav active="ate" />
      {toast ? (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#D4D4D8] bg-white px-4 py-2 text-xs text-black">
          {toast}
        </div>
      ) : null}
    </main>
  );
}

function N({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-semibold tabular-nums">{formatInt(value)}</p>
      <p className="text-xs text-[#525252]">{label}</p>
    </div>
  );
}

function LabeledCost({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mx-auto w-1/2 space-y-1">
      <p className="text-xs uppercase tracking-[0.5px] text-[#525252]">what did you pay? (optional)</p>
      <Input
        value={value}
        onValueChange={onChange}
        placeholder="0"
        type="number"
        startContent={<span className="text-[#525252]">Rs</span>}
        classNames={{
          inputWrapper: "h-[52px] rounded-xl border border-[#D4D4D8] bg-white shadow-none",
          input: "text-black",
        }}
      />
    </div>
  );
}
