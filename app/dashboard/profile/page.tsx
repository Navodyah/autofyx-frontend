"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera, CarFront, CarTaxiFront, CarFront as SuvIcon, Fuel, Heart, RotateCcw, Save, Settings2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabKey = "vehicle-preferences" | "personal-details" | "security" | "activity-log" | "messages";
type VehicleType = "SUV" | "Hatchback" | "Sedan" | "Electric Vehicle";

type PreferenceDraft = {
  vehicleTypes: VehicleType[];
  budgetMin: number;
  budgetMax: number;
  yearOfManufacture: string;
  condition: "New" | "Used";
  preferredColors: string;
};

const STORAGE_KEY = "autofyx_profile_preferences";
const MIN_BUDGET = 500000;
const MAX_BUDGET = 25000000;
const BUDGET_STEP = 50000;

const defaultDraft: PreferenceDraft = {
  vehicleTypes: ["SUV", "Sedan"],
  budgetMin: 2500000,
  budgetMax: 8500000,
  yearOfManufacture: "2024",
  condition: "Used",
  preferredColors: "Black, White, Pearl Silver",
};

const vehicleCards: Array<{
  value: VehicleType;
  title: string;
  description: string;
  icon: typeof CarFront;
}> = [
  {
    value: "SUV",
    title: "SUV",
    description: "Practical, spacious, confident",
    icon: CarTaxiFront,
  },
  {
    value: "Hatchback",
    title: "Hatchback",
    description: "Compact and efficient",
    icon: CarFront,
  },
  {
    value: "Sedan",
    title: "Sedan",
    description: "Balanced, refined, and comfortable",
    icon: SuvIcon,
  },
  {
    value: "Electric Vehicle",
    title: "Electric Vehicle",
    description: "Quiet, modern, and low running cost",
    icon: Zap,
  },
];

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "vehicle-preferences", label: "Vehicle Preferences" },
  { key: "personal-details", label: "Personal Details" },
  { key: "security", label: "Security" },
  { key: "activity-log", label: "Activity Log" },
  { key: "messages", label: "Messages" },
];

function formatLkr(value: number): string {
  return new Intl.NumberFormat("en-LK", { maximumFractionDigits: 0 }).format(value);
}

function clampBudget(value: number) {
  return Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, value));
}

function getBudgetTrackStyle(minValue: number, maxValue: number) {
  const start = ((minValue - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  const end = ((maxValue - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;
  return {
    background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${start}%, #155dfc ${start}%, #1d4ed8 ${end}%, #e5e7eb ${end}%, #e5e7eb 100%)`,
  };
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("vehicle-preferences");
  const [draft, setDraft] = useState<PreferenceDraft>(defaultDraft);
  const [savedDraft, setSavedDraft] = useState<PreferenceDraft>(defaultDraft);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PreferenceDraft;
      setDraft((prev) => ({ ...prev, ...parsed }));
      setSavedDraft((prev) => ({ ...prev, ...parsed }));
    } catch {
      setDraft(defaultDraft);
      setSavedDraft(defaultDraft);
    }
  }, []);

  const selectedCount = draft.vehicleTypes.length;
  const budgetLabel = useMemo(
    () => `LKR ${formatLkr(draft.budgetMin)} - LKR ${formatLkr(draft.budgetMax)}`,
    [draft.budgetMin, draft.budgetMax]
  );

  function toggleVehicleType(type: VehicleType) {
    setDraft((current) => ({
      ...current,
      vehicleTypes: current.vehicleTypes.includes(type)
        ? current.vehicleTypes.filter((entry) => entry !== type)
        : [...current.vehicleTypes, type],
    }));
    setMessage(null);
  }

  function updateBudgetMin(value: number) {
    const nextMin = clampBudget(value);
    setDraft((current) => ({
      ...current,
      budgetMin: Math.min(nextMin, current.budgetMax - BUDGET_STEP),
    }));
    setMessage(null);
  }

  function updateBudgetMax(value: number) {
    const nextMax = clampBudget(value);
    setDraft((current) => ({
      ...current,
      budgetMax: Math.max(nextMax, current.budgetMin + BUDGET_STEP),
    }));
    setMessage(null);
  }

  function handleSave() {
    const next = {
      ...draft,
      budgetMin: Math.min(draft.budgetMin, draft.budgetMax - BUDGET_STEP),
      budgetMax: Math.max(draft.budgetMax, draft.budgetMin + BUDGET_STEP),
    };

    setDraft(next);
    setSavedDraft(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage("Vehicle preferences saved successfully.");
  }

  function handleReset() {
    setDraft(defaultDraft);
    setSavedDraft(defaultDraft);
    window.localStorage.removeItem(STORAGE_KEY);
    setMessage("Preferences reset to defaults.");
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#030304] via-[#030304] to-[#155dfc] p-[1px] shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(135deg,#030304_0%,#0a0f1e_56%,#155dfc_100%)] px-6 py-8 md:px-10 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,93,252,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_30%)]" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative h-28 w-28 shrink-0 rounded-full border-4 border-white bg-white/10 shadow-[0_0_0_6px_rgba(255,255,255,0.08)]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-violet-900 text-3xl font-semibold text-white">
                    UD
                  </div>
                  <button
                    type="button"
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white text-slate-950 shadow-lg"
                    aria-label="Edit profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.32em] text-violet-200/80">User Profile</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-5xl">Upeksha Dias</h1>
                    <span className="mt-3 inline-flex rounded-full border border-[#155dfc]/30 bg-[#155dfc]/15 px-3 py-1 text-xs font-semibold tracking-[0.24em] text-blue-100">
                      PREMIUM USER
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200/90 md:text-base">
                    Curate your vehicle preferences, review your account settings, and keep your marketplace profile in sync.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[31rem]">
                <StatPill label="Selected Types" value={`${selectedCount}`} />
                <StatPill label="Budget Range" value={budgetLabel} wide />
                <StatPill label="Condition" value={draft.condition} />
              </div>
            </div>
          </div>
        </section>

        <div className="relative mx-auto -mt-7 max-w-6xl rounded-full border border-slate-200 bg-white px-3 py-3 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-center gap-2 overflow-x-auto whitespace-nowrap">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={[
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-[#155dfc] text-white shadow-lg shadow-[#155dfc]/25"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <main className="mx-auto mt-6 max-w-6xl">
          <Card className="border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <CardHeader className="border-b border-slate-100 px-6 py-6 md:px-8">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {tabTitle(activeTab)}
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 md:text-base">
                  {tabDescription(activeTab)}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-6 py-6 md:px-8 md:py-8">
              {activeTab === "vehicle-preferences" && (
                <div className="space-y-8">
                  <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
                    <Card className="border-slate-200 bg-slate-50/70">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                          <Heart className="h-5 w-5 text-violet-600" />
                          Preferred Vehicle Types
                        </CardTitle>
                        <CardDescription>
                          Select one or more body styles that fit your lifestyle.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {vehicleCards.map((item) => {
                            const active = draft.vehicleTypes.includes(item.value);
                            const Icon = item.icon;

                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => toggleVehicleType(item.value)}
                                className={[
                                  "group rounded-2xl border p-4 text-left transition-all duration-200",
                                  active
                                    ? "border-[#155dfc] bg-white shadow-lg shadow-[#155dfc]/10"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                                ].join(" ")}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-2">
                                    <div className={[
                                      "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                                      active ? "bg-[#155dfc] text-white" : "bg-slate-100 text-slate-700 group-hover:bg-slate-200",
                                    ].join(" ")}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-950">{item.title}</p>
                                      <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                                    </div>
                                  </div>

                                  <div className={[
                                    "mt-1 h-5 w-5 rounded-full border-2 transition-all",
                                    active ? "border-[#155dfc] bg-[#155dfc]" : "border-slate-300 bg-white",
                                  ].join(" ")} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-6">
                      <Card className="border-slate-200 bg-white">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                            <Fuel className="h-5 w-5 text-slate-900" />
                            Budget Range
                          </CardTitle>
                          <CardDescription>
                            Set the minimum and maximum price for your next vehicle.
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                          <div className="space-y-4">
                            <div className="relative h-2 rounded-full bg-slate-200" style={getBudgetTrackStyle(draft.budgetMin, draft.budgetMax)}>
                              <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step={BUDGET_STEP}
                                value={draft.budgetMin}
                                onChange={(event) => updateBudgetMin(Number(event.target.value))}
                                className="pointer-events-auto absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
                              />
                              <input
                                type="range"
                                min={MIN_BUDGET}
                                max={MAX_BUDGET}
                                step={BUDGET_STEP}
                                value={draft.budgetMax}
                                onChange={(event) => updateBudgetMax(Number(event.target.value))}
                                className="pointer-events-auto absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent"
                              />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-slate-700">Minimum Price</Label>
                                <Input
                                  type="number"
                                  value={draft.budgetMin}
                                  onChange={(event) => updateBudgetMin(Number(event.target.value || MIN_BUDGET))}
                                  className="border-slate-300 bg-white text-slate-950"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-slate-700">Maximum Price</Label>
                                <Input
                                  type="number"
                                  value={draft.budgetMax}
                                  onChange={(event) => updateBudgetMax(Number(event.target.value || MAX_BUDGET))}
                                  className="border-slate-300 bg-white text-slate-950"
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-slate-200 bg-slate-50/70">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-lg text-slate-950">
                            <Settings2 className="h-5 w-5 text-slate-900" />
                            Other Fields
                          </CardTitle>
                          <CardDescription>
                            Fine-tune manufacturing year, condition, and preferred colors.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-slate-700">Year of Manufacture</Label>
                            <Select
                              value={draft.yearOfManufacture}
                              onValueChange={(value) => {
                                setDraft((current) => ({ ...current, yearOfManufacture: value }));
                                setMessage(null);
                              }}
                            >
                              <SelectTrigger className="border-slate-300 bg-white text-slate-950">
                                <SelectValue placeholder="Choose year" />
                              </SelectTrigger>
                              <SelectContent>
                                {yearOptions().map((year) => (
                                  <SelectItem key={year} value={year}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-700">Condition</Label>
                            <Select
                              value={draft.condition}
                              onValueChange={(value) => {
                                setDraft((current) => ({ ...current, condition: value as PreferenceDraft["condition"] }));
                                setMessage(null);
                              }}
                            >
                              <SelectTrigger className="border-slate-300 bg-white text-slate-950">
                                <SelectValue placeholder="Choose condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Used">Used</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="sm:col-span-2 space-y-2">
                            <Label className="text-slate-700">Preferred Colors</Label>
                            <Input
                              value={draft.preferredColors}
                              onChange={(event) => {
                                setDraft((current) => ({ ...current, preferredColors: event.target.value }));
                                setMessage(null);
                              }}
                              placeholder="Black, White, Silver"
                              className="border-slate-300 bg-white text-slate-950"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="gap-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSave}
                      className="gap-2 bg-[#155dfc] text-white shadow-lg shadow-[#155dfc]/25 hover:bg-[#1d4ed8]"
                    >
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>

                  {message && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {message}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "personal-details" && (
                <PlaceholderSection
                  icon={Sparkles}
                  title="Personal Details"
                  description="Profile contact details, address, and communication settings can be managed here next."
                />
              )}

              {activeTab === "security" && (
                <PlaceholderSection
                  icon={ShieldCheck}
                  title="Security"
                  description="Password, verification, and session controls belong here."
                />
              )}

              {activeTab === "activity-log" && (
                <PlaceholderSection
                  icon={RotateCcw}
                  title="Activity Log"
                  description="A timeline of searches, comparisons, and saved vehicles fits here."
                />
              )}

              {activeTab === "messages" && (
                <PlaceholderSection
                  icon={Heart}
                  title="Messages"
                  description="Buyer alerts, dealer messages, and marketplace notifications can surface here."
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

function StatPill({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={[
      "rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white backdrop-blur-sm",
      wide ? "sm:col-span-2" : "",
    ].join(" ")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-violet-100/80">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  );
}

function PlaceholderSection({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon className="h-6 w-6 text-slate-900" />
        </div>
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function tabTitle(tab: TabKey): string {
  switch (tab) {
    case "vehicle-preferences":
      return "Vehicle Preferences";
    case "personal-details":
      return "Personal Details";
    case "security":
      return "Security";
    case "activity-log":
      return "Activity Log";
    case "messages":
      return "Messages";
  }
}

function tabDescription(tab: TabKey): string {
  switch (tab) {
    case "vehicle-preferences":
      return "Shape your search experience with type, budget, and style preferences.";
    case "personal-details":
      return "Keep your contact and account details up to date.";
    case "security":
      return "Control password and account security settings.";
    case "activity-log":
      return "Review recent activity and saved actions.";
    case "messages":
      return "Track notifications and marketplace conversations.";
  }
}

function yearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 25 }, (_, index) => String(currentYear - index));
}
