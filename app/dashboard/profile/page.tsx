"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type ActiveSection = "basic" | "vehicle" | "personal" | "security";

type ProfileDTO = {
  username: string;
  email: string;
  user_type: string;
  profile?: {
    monthly_income?: number | null;
    purpose?: string | null;
    area?: string | null;
    fuel_pref?: string | null;
    transmission_pref?: string | null;
    max_comb_l_per_100?: number | null;
    vehicle_class_pref?: string | null;

    phone_number?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    notification_enabled?: boolean;
    email_updates?: boolean;
  };
};

type StatisticsDTO = {
  total_comparisons: number;
  total_favorites: number;
  profile_completeness: number;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function ProfilePage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [statistics, setStatistics] = useState<StatisticsDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<ActiveSection>("basic");

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const axiosConfig = useMemo(() => {
    const token = getToken();
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }, []);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAll() {
    setLoading(true);
    setErrorMessage("");
    try {
      await Promise.all([fetchProfileData(), fetchStatistics()]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfileData() {
    const token = getToken();
    if (!token) {
      setErrorMessage("No token found. Please login again.");
      return;
    }

    try {
      const res = await axios.get<ProfileDTO>(`${API_BASE}/user-profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || "Failed to load profile");
    }
  }

  async function fetchStatistics() {
    const token = getToken();
    if (!token) return;

    try {
      const res = await axios.get<StatisticsDTO>(`${API_BASE}/user-profile/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatistics(res.data);
    } catch {
      // optional: ignore stats error
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 md:p-10 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center text-4xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold">{profile?.username || "User"}</h1>
                <p className="text-white/90 text-sm">{profile?.email}</p>
                <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase">
                  {profile?.user_type || "user"}
                </span>
              </div>
            </div>

            {statistics && (
              <div className="flex gap-8 md:gap-10">
                <StatItem label="Comparisons" value={statistics.total_comparisons} />
                <StatItem label="Favorites" value={statistics.total_favorites} />
                <StatItem label="Profile Complete" value={`${statistics.profile_completeness}%`} />
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {(successMessage || errorMessage) && (
          <div className="space-y-3">
            {successMessage && (
              <Alert type="success" onClose={() => setSuccessMessage("")}>
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert type="error" onClose={() => setErrorMessage("")}>
                {errorMessage}
              </Alert>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b bg-white rounded-2xl px-3 py-2 shadow-sm">
          <TabButton active={activeSection === "basic"} onClick={() => setActiveSection("basic")}>
            Basic Information
          </TabButton>
          <TabButton active={activeSection === "vehicle"} onClick={() => setActiveSection("vehicle")}>
            Vehicle Preferences
          </TabButton>
          <TabButton active={activeSection === "personal"} onClick={() => setActiveSection("personal")}>
            Personal Details
          </TabButton>
          <TabButton active={activeSection === "security"} onClick={() => setActiveSection("security")}>
            Security
          </TabButton>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white shadow-sm border">
          {activeSection === "basic" && profile && (
            <BasicInfoSection
              apiBase={API_BASE}
              profile={profile}
              onUpdated={fetchProfileData}
              setSuccess={setSuccessMessage}
              setError={setErrorMessage}
            />
          )}

          {activeSection === "vehicle" && profile && (
            <VehiclePreferencesSection
              apiBase={API_BASE}
              profile={profile}
              onUpdated={fetchProfileData}
              setSuccess={setSuccessMessage}
              setError={setErrorMessage}
            />
          )}

          {activeSection === "personal" && profile && (
            <PersonalDetailsSection
              apiBase={API_BASE}
              profile={profile}
              onUpdated={fetchProfileData}
              setSuccess={setSuccessMessage}
              setError={setErrorMessage}
            />
          )}

          {activeSection === "security" && (
            <SecuritySection
              apiBase={API_BASE}
              setSuccess={setSuccessMessage}
              setError={setErrorMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------- UI Components ----------------- */

function StatItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-white/90">{label}</div>
    </div>
  );
}

function Alert({
  type,
  children,
  onClose,
}: {
  type: "success" | "error";
  children: React.ReactNode;
  onClose: () => void;
}) {
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${styles}`}>
      <div className="text-sm">{children}</div>
      <button onClick={onClose} className="text-xl leading-none opacity-70 hover:opacity-100">
        ×
      </button>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition",
        active ? "bg-indigo-600 text-white" : "text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ----------------- Sections ----------------- */

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 md:p-8">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function BasicInfoSection({
  apiBase,
  profile,
  onUpdated,
  setSuccess,
  setError,
}: {
  apiBase: string;
  profile: ProfileDTO;
  onUpdated: () => Promise<void>;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}) {
  const [username, setUsername] = useState(profile.username || "");
  const [email, setEmail] = useState(profile.email || "");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) throw new Error("No token found");
      await axios.put(
        `${apiBase}/user-profile/basic-info`,
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Basic information updated successfully!");
      await onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update information");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell title="Basic Information">
      <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
        <Field label="Username">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />
        </Field>

        <Field label="Email Address">
          <input
            type="email"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </SectionShell>
  );
}

function VehiclePreferencesSection({
  apiBase,
  profile,
  onUpdated,
  setSuccess,
  setError,
}: {
  apiBase: string;
  profile: ProfileDTO;
  onUpdated: () => Promise<void>;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}) {
  const p = profile.profile || {};

  const [monthlyIncome, setMonthlyIncome] = useState<number | "">(p.monthly_income ?? "");
  const [purpose, setPurpose] = useState(p.purpose || "daily_commute");
  const [area, setArea] = useState(p.area || "mixed");
  const [fuelPref, setFuelPref] = useState(p.fuel_pref || "");
  const [transPref, setTransPref] = useState(p.transmission_pref || "");
  const [maxComb, setMaxComb] = useState<number | "">(p.max_comb_l_per_100 ?? "");
  const [vehicleClassPref, setVehicleClassPref] = useState(p.vehicle_class_pref || "");

  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      await axios.put(
        `${apiBase}/user-profile/me`,
        {
          monthly_income: monthlyIncome === "" ? null : Number(monthlyIncome),
          purpose,
          area,
          fuel_pref: fuelPref || null,
          transmission_pref: transPref || null,
          max_comb_l_per_100: maxComb === "" ? null : Number(maxComb),
          vehicle_class_pref: vehicleClassPref || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Vehicle preferences updated successfully!");
      await onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell title="Vehicle Preferences">
      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Monthly Income (LKR)">
            <input
              type="number"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value ? Number(e.target.value) : "")}
              placeholder="150000"
            />
          </Field>

          <Field label="Primary Purpose">
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            >
              <option value="daily_commute">Daily Commute</option>
              <option value="family">Family</option>
              <option value="performance">Performance</option>
              <option value="luxury">Luxury</option>
            </select>
          </Field>

          <Field label="Driving Area">
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="city">City</option>
              <option value="highway">Highway</option>
              <option value="mixed">Mixed</option>
              <option value="off-road">Off-Road</option>
            </select>
          </Field>

          <Field label="Fuel Preference">
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={fuelPref}
              onChange={(e) => setFuelPref(e.target.value)}
              placeholder="Z - Premium Gasoline"
            />
          </Field>

          <Field label="Transmission Preference">
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={transPref}
              onChange={(e) => setTransPref(e.target.value)}
            >
              <option value="">No Preference</option>
              <option value="A=Automatic">Automatic</option>
              <option value="M=Manual">Manual</option>
            </select>
          </Field>

          <Field label="Max Fuel Consumption (L/100km)">
            <input
              type="number"
              step="0.1"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={maxComb}
              onChange={(e) => setMaxComb(e.target.value ? Number(e.target.value) : "")}
              placeholder="10.0"
            />
          </Field>
        </div>

        <Field label="Vehicle Class Preference">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={vehicleClassPref}
            onChange={(e) => setVehicleClassPref(e.target.value)}
            placeholder="COMPACT, SUV - SMALL..."
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </form>
    </SectionShell>
  );
}

function PersonalDetailsSection({
  apiBase,
  profile,
  onUpdated,
  setSuccess,
  setError,
}: {
  apiBase: string;
  profile: ProfileDTO;
  onUpdated: () => Promise<void>;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}) {
  const p = profile.profile || {};

  const [phone, setPhone] = useState(p.phone_number || "");
  const [address, setAddress] = useState(p.address || "");
  const [city, setCity] = useState(p.city || "");
  const [country, setCountry] = useState(p.country || "Sri Lanka");
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(p.notification_enabled ?? true);
  const [emailUpdates, setEmailUpdates] = useState<boolean>(p.email_updates ?? true);

  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      await axios.put(
        `${apiBase}/user-profile/me`,
        {
          phone_number: phone || null,
          address: address || null,
          city: city || null,
          country: country || null,
          notification_enabled: notificationEnabled,
          email_updates: emailUpdates,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Personal details updated successfully!");
      await onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to update details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell title="Personal Details">
      <form onSubmit={onSubmit} className="space-y-4 max-w-3xl">
        <Field label="Phone Number">
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94 77 123 4567"
          />
        </Field>

        <Field label="Address">
          <textarea
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address"
            rows={3}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="City">
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Colombo"
            />
          </Field>

          <Field label="Country">
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Sri Lanka"
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={notificationEnabled}
            onChange={(e) => setNotificationEnabled(e.target.checked)}
          />
          Enable notifications
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={emailUpdates}
            onChange={(e) => setEmailUpdates(e.target.checked)}
          />
          Receive email updates
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Details"}
        </button>
      </form>
    </SectionShell>
  );
}

function SecuritySection({
  apiBase,
  setSuccess,
  setError,
}: {
  apiBase: string;
  setSuccess: (v: string) => void;
  setError: (v: string) => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      await axios.post(
        `${apiBase}/user-profile/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to change password");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionShell title="Security Settings">
      <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
        <Field label="Current Password">
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="New Password">
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
        </Field>

        <Field label="Confirm New Password">
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Changing..." : "Change Password"}
        </button>
      </form>
    </SectionShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {children}
    </div>
  );
}
