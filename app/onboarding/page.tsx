"use client";

import { useMemo, useState } from "react";
import { Button, Card, CardBody, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import {
  calculateTargets,
  type GoalType,
  type LifestyleType,
  type SexType,
} from "@/lib/calculations";
import { saveProfile, type DietType } from "@/lib/storage";
import { formatInt } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [dailyBudget, setDailyBudget] = useState("");
  const [budgetMealsCount, setBudgetMealsCount] = useState<2 | 3>(2);
  const [preActivitySnack, setPreActivitySnack] = useState<"yes" | "no">("yes");

  const [age, setAge] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [biologicalSex, setBiologicalSex] = useState<SexType | "">("");
  const [lifestyle, setLifestyle] = useState<LifestyleType | "">("");
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [dietType, setDietType] = useState<DietType | "">("");

  const [editGoals, setEditGoals] = useState(false);
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [formError, setFormError] = useState("");

  const derivedHeightCm = useMemo(() => {
    const inches = parseHeightToInches(heightInches);
    if (!inches) return 0;
    return Math.round(inches * 2.54);
  }, [heightInches]);

  const suggestedMealBudget = useMemo(() => {
    const d = Number(dailyBudget);
    if (!d) return 0;
    return Math.max(1, Math.round(d / budgetMealsCount));
  }, [dailyBudget, budgetMealsCount]);

  const calculated = useMemo(() => {
    const ageNum = Number(age);
    const weightNum = Number(weightKg);
    if (!ageNum || !weightNum || !derivedHeightCm || !biologicalSex || !lifestyle) return null;
    return calculateTargets({
      age: ageNum,
      heightCm: derivedHeightCm,
      weightKg: weightNum,
      biologicalSex,
      lifestyle,
      goal,
    });
  }, [age, weightKg, derivedHeightCm, biologicalSex, lifestyle, goal]);

  const canStep1 = Number(dailyBudget) > 0;
  const canStep2 =
    Number(age) > 0 &&
    Number(weightKg) > 0 &&
    parseHeightToInches(heightInches) > 0 &&
    !!biologicalSex &&
    !!lifestyle &&
    !!dietType;

  const complete = () => {
    if (!calculated || !biologicalSex || !lifestyle || !dietType) return;
    const finalCalories = Number(manualCalories) || calculated.dailyCalorieGoal;
    const finalProtein = Number(manualProtein) || calculated.dailyProteinGoal;
    saveProfile({
      age: Number(age),
      height_cm: derivedHeightCm,
      weight_kg: Number(weightKg),
      biological_sex: biologicalSex,
      lifestyle,
      goal,
      diet_type: dietType,
      daily_budget: Number(dailyBudget),
      meal_budget: Number(suggestedMealBudget || 0),
      budget_meals_count: budgetMealsCount,
      has_pre_activity_snack: preActivitySnack === "yes",
      pre_activity_snack_budget: 0,
      daily_calorie_goal: finalCalories,
      daily_protein_goal: finalProtein,
      setup_complete: true,
      created_at: new Date().toISOString(),
    });
    router.push("/home");
  };

  return (
    <main className="min-h-screen bg-white px-5 py-8 text-black">
      <div className="mx-auto max-w-[420px]">
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`h-1.5 w-10 rounded-full ${dot <= step ? "bg-black" : "bg-[#D4D4D8]"}`}
            />
          ))}
        </div>

        {step === 1 ? (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5px] text-black">step 1 of 3</p>
            <h1 className="text-[28px] font-extrabold tracking-[-0.5px]">Set your food budget</h1>
            <p className="text-[15px] leading-6 text-black">
              Tell us how you spend on food so protein targets match your real routine.
            </p>

            <LabeledInput
              label="daily budget"
              prefix="Rs"
              placeholder="500"
              value={dailyBudget}
              onValueChange={setDailyBudget}
            />

            <PillGroup
              label="this budget is mainly for"
              value={String(budgetMealsCount)}
              onChange={(v) => setBudgetMealsCount(Number(v) as 2 | 3)}
              options={[
                { key: "2", label: "Lunch + Dinner (2 meals)" },
                { key: "3", label: "All 3 meals" },
              ]}
            />

            <PillGroup
              label="are you open to adding snacks to optimize protein?"
              value={preActivitySnack}
              onChange={(v) => setPreActivitySnack(v as "yes" | "no")}
              options={[
                { key: "yes", label: "Yes, open to it" },
                { key: "no", label: "No, meals only" },
              ]}
            />

            <p className="text-xs text-black">
              We&apos;ll auto-calculate your per-meal budget as Rs{formatInt(suggestedMealBudget)} based on your split.
            </p>

            <Button
              className="mt-6 h-[52px] w-full rounded-xl border border-black bg-white text-[15px] font-semibold text-black"
              onPress={() => {
                if (!canStep1) {
                  setFormError("add your daily budget to continue.");
                  return;
                }
                setFormError("");
                setStep(2);
              }}
            >
              Continue
            </Button>
            {formError ? <p className="text-sm text-[#FF4444]">{formError}</p> : null}
          </section>
        ) : null}

        {step === 2 ? (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5px] text-black">step 2 of 3</p>
            <h1 className="text-[28px] font-extrabold tracking-[-0.5px]">Tell us about yourself</h1>
            <p className="text-[15px] leading-6 text-black">
              We calculate your exact protein needs based on body and lifestyle.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="age" suffix="yrs" placeholder="20" value={age} onValueChange={setAge} />
              <LabeledInput
                label="weight"
                suffix="kg"
                placeholder="65"
                value={weightKg}
                onValueChange={setWeightKg}
              />
            </div>
            <LabeledInput
              label="height (5'10 or total inches)"
              placeholder="5'10 or 70"
              value={heightInches}
              onValueChange={setHeightInches}
              type="text"
            />
            <p className="text-[11px] text-black">That is about {derivedHeightCm || 0} cm.</p>

            <PillGroup
              label="biological sex"
              value={biologicalSex}
              onChange={(v) => setBiologicalSex(v as SexType)}
              options={[
                { key: "male", label: "Male" },
                { key: "female", label: "Female" },
                { key: "other", label: "Prefer not to say" },
              ]}
            />

            <p className="text-xs uppercase tracking-[0.5px] text-black">your lifestyle</p>
            <p className="text-xs text-black">This affects how much protein you need.</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "sedentary", label: "Mostly sitting", hint: "Desk work, rarely exercise" },
                { key: "light", label: "Light movement", hint: "Walk around, occasional workout" },
                { key: "active", label: "Gym / Active", hint: "Gym 3-5x per week" },
                { key: "very_active", label: "Very active", hint: "Intense daily training" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setLifestyle(item.key as LifestyleType)}
                  className={`rounded-xl border p-3 text-left ${
                    lifestyle === item.key
                      ? "border-black bg-black text-white"
                      : "border-[#D4D4D8] bg-white text-black"
                  }`}
                >
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className={`mt-1 text-[11px] ${lifestyle === item.key ? "text-zinc-200" : "text-black"}`}>
                    {item.hint}
                  </p>
                </button>
              ))}
            </div>

            <PillGroup
              label="your goal"
              value={goal}
              onChange={(v) => setGoal(v as GoalType)}
              options={[
                { key: "lose", label: "Lose weight" },
                { key: "maintain", label: "Stay fit" },
                { key: "gain", label: "Gain muscle" },
              ]}
            />

            <PillGroup
              label="diet type"
              value={dietType}
              onChange={(v) => setDietType(v as DietType)}
              options={[
                { key: "veg", label: "Vegetarian" },
                { key: "egg", label: "Eggetarian" },
                { key: "nonveg", label: "Non-Vegetarian" },
              ]}
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                className="h-[52px] rounded-xl border border-[#D4D4D8] bg-transparent text-black"
                onPress={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="h-[52px] rounded-xl border border-black bg-white text-black"
                onPress={() => {
                  if (!canStep2) {
                    setFormError("fill age, weight, height, sex, lifestyle, and diet type to continue.");
                    return;
                  }
                  setFormError("");
                  setStep(3);
                }}
              >
                Continue
              </Button>
            </div>
            {formError ? <p className="text-sm text-[#FF4444]">{formError}</p> : null}
          </section>
        ) : null}

        {step === 3 && calculated ? (
          <section className="space-y-4">
            <p className="text-xs uppercase tracking-[0.5px] text-black">step 3 of 3</p>
            <h1 className="text-[28px] font-extrabold tracking-[-0.5px]">Your daily targets</h1>
            <p className="text-[15px] leading-6 text-black">
              Personalised for your routine and Indian dietary guidance.
            </p>

            <SummaryCard
              icon="🔥"
              label="daily calories"
              value={manualCalories || formatInt(calculated.dailyCalorieGoal)}
              suffix="kcal / day"
            />
            <SummaryCard
              icon="💪"
              label="daily protein"
              value={manualProtein || formatInt(calculated.dailyProteinGoal)}
              suffix="grams / day"
              footnote={`Based on ICMR 2020 - ${lifestyle?.replace("_", " ")} lifestyle`}
            />
            <SummaryCard
              icon="Rs"
              label="daily budget"
              value={formatInt(Number(dailyBudget))}
              suffix={`per day - Rs${suggestedMealBudget} per meal`}
            />

            <button className="text-xs text-black underline" onClick={() => setEditGoals((v) => !v)}>
              {editGoals ? "Hide manual adjust" : "Adjust manually"}
            </button>
            {editGoals ? (
              <div className="grid grid-cols-2 gap-3">
                <LabeledInput
                  label="calorie goal"
                  placeholder="2140"
                  value={manualCalories}
                  onValueChange={setManualCalories}
                />
                <LabeledInput
                  label="protein goal"
                  placeholder="91"
                  value={manualProtein}
                  onValueChange={setManualProtein}
                />
              </div>
            ) : null}

            <Button
              className="h-[52px] w-full rounded-xl border border-black bg-white text-[15px] font-semibold text-black"
              onPress={complete}
            >
              Start tracking
            </Button>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function LabeledInput({
  label,
  prefix,
  suffix,
  placeholder,
  value,
  onValueChange,
  type = "number",
}: {
  label: string;
  prefix?: string;
  suffix?: string;
  placeholder: string;
  value: string;
  onValueChange: (v: string) => void;
  type?: "number" | "text";
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.5px] text-black">{label}</p>
      <Input
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        type={type}
        inputMode={type === "number" ? "decimal" : "text"}
        startContent={prefix ? <span className="text-black">{prefix}</span> : undefined}
        endContent={suffix ? <span className="text-black text-xs">{suffix}</span> : undefined}
        classNames={{
          inputWrapper:
            "h-[52px] rounded-xl border border-[#D4D4D8] bg-white shadow-none data-[hover=true]:bg-white group-data-[focus=true]:border-black",
          input: "text-black",
        }}
      />
    </div>
  );
}

function parseHeightToInches(raw: string) {
  const text = raw
    .trim()
    .toLowerCase()
    .replace(/[’′`]/g, "'")
    .replace(/[″“”]/g, '"');
  if (!text) return 0;

  const feetInches = text.match(/^(\d+)\s*(?:'|ft|feet)\s*(\d{1,2})?\s*(?:"|in|inches)?$/);
  if (feetInches) {
    const ft = Number(feetInches[1]);
    const inch = Number(feetInches[2] || 0);
    if (inch <= 11) return ft * 12 + inch;
  }

  const separated = text.match(/^(\d+)\D+(\d{1,2})$/);
  if (separated) {
    const ft = Number(separated[1]);
    const inch = Number(separated[2]);
    if (ft >= 3 && ft <= 8 && inch <= 11) return ft * 12 + inch;
  }

  const spaced = text.match(/^(\d+)\s+(\d{1,2})$/);
  if (spaced) {
    const ft = Number(spaced[1]);
    const inch = Number(spaced[2]);
    if (inch <= 11) return ft * 12 + inch;
  }

  if (/^\d+$/.test(text)) {
    const n = Number(text);
    if (n >= 36 && n <= 96) return n;

    if (text.length === 3) {
      const ft = Number(text[0]);
      const inch = Number(text.slice(1));
      if (ft >= 3 && ft <= 8 && inch <= 11) return ft * 12 + inch;
    }
  }

  return 0;
}

function PillGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ key: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.5px] text-black">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.key}
            className={`rounded-full border px-4 py-2 text-sm ${
              value === opt.key
                ? "border-black bg-black font-semibold text-white"
                : "border-[#D4D4D8] bg-white text-black"
            }`}
            onClick={() => onChange(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  suffix,
  footnote,
}: {
  icon: string;
  label: string;
  value: string;
  suffix: string;
  footnote?: string;
}) {
  return (
    <Card className="rounded-2xl border border-[#D4D4D8] bg-white shadow-none">
      <CardBody className="gap-1 p-5">
        <p className="text-xs uppercase tracking-[0.5px] text-black">
          {icon} {label}
        </p>
        <p className="text-5xl font-extrabold tabular-nums text-black">{value}</p>
        <p className="text-sm text-black">{suffix}</p>
        {footnote ? <p className="text-[11px] text-black">{footnote}</p> : null}
      </CardBody>
    </Card>
  );
}
