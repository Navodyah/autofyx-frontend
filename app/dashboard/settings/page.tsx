'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Save, User, Car, Shield, Activity, 
  MessageSquare, Sun, Moon, Heart, ChevronDown, RefreshCw, Zap, Loader2
} from 'lucide-react';
import { getRegistrationPreferences, saveRegistrationPreferences, UserPreferencesInput, getUserProfile, updateUserProfile } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';

// --- Palettes ---

const L = {
  bg: "#F7F7F8",
  cardBg: "#FFFFFF",
  primary: "#0A0A0B",
  primaryText: "#FFFFFF",
  text: "#18181B",
  muted: "#71717A",
  border: "#E4E4E7",
  glow: "rgba(0,0,0,0.06)",
  shadow: "0 4px 20px -2px rgba(0, 0, 0, 0.03)",
  iconBg: "#F4F4F5"
};

const D = {
  bg: "#0B0F19",
  cardBg: "#161B22",
  primary: "#FFFFFF",
  primaryText: "#000000",
  text: "#FFFFFF",
  muted: "#8B949E",
  border: "rgba(255, 255, 255, 0.08)",
  glow: "rgba(255, 255, 255, 0.15)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  iconBg: "rgba(255,255,255,0.03)"
};

const TABS = [
  { id: 'preferences', label: 'Vehicle Preferences', icon: Car },
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'activity', label: 'Activity Log', icon: Activity },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const P = isDarkMode ? D : L;

  // Form State for Vehicle Preferences
  const [preferences, setPreferences] = useState<UserPreferencesInput>({
    monthly_salary_range: '100,001 - 200,000',
    daily_distance_km: 20,
    usage_purpose: 'Office',
    fuel_preference: 'Hybrid',
    priority: 'Fuel Efficiency',
    preferred_vehicle_types: ['SUV', 'Sedan'],
    budget_min: 2500000,
    budget_max: 8500000,
  });
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);

  const [profileImageUrl, setProfileImageUrl] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [personalDetails, setPersonalDetails] = useState({
    username: '',
    email: '',
    phone_number: '',
    city: '',
    occupation: '',
    driving_experience: 'Intermediate',
    family_size: '3-4 people'
  });
  const [isSavingPersonalDetails, setIsSavingPersonalDetails] = useState(false);

  const identity = React.useMemo(() => {
    if (typeof window === 'undefined') return {};
    const token = window.localStorage.getItem('access_token') || window.localStorage.getItem('token');
    if (!token) return {};
    const parsed = parseBrowserAuthToken(token);
    return {
      user_id: parsed?.user_id,
      appwrite_id: parsed?.appwrite_id,
      email: parsed?.email,
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchPrefs = async () => {
      if (!identity.user_id && !identity.appwrite_id && !identity.email) {
        setIsLoadingPreferences(false);
        return;
      }
      try {
        setIsLoadingPreferences(true);
        const prefs = await getRegistrationPreferences(identity);
        if (!cancelled && prefs) {
          setPreferences(prev => ({
            ...prev,
            ...prefs,
            budget_min: prefs.budget_min || prev.budget_min,
            budget_max: prefs.budget_max || prev.budget_max,
            preferred_vehicle_types: prefs.preferred_vehicle_types?.length ? prefs.preferred_vehicle_types : prev.preferred_vehicle_types,
          }));
        }
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
      
      try {
        const profile = await getUserProfile(identity.user_id as string);
        if (!cancelled && profile) {
          setPersonalDetails(prev => ({
            ...prev,
            username: profile.username || prev.username,
            email: profile.email || prev.email,
            phone_number: (profile as any).phone_number || prev.phone_number,
            city: (profile as any).city || prev.city,
            occupation: (profile as any).occupation || prev.occupation,
            driving_experience: (profile as any).driving_experience || prev.driving_experience,
            family_size: (profile as any).family_size || prev.family_size
          }));
          if ((profile as any).profile_image_url) setProfileImageUrl((profile as any).profile_image_url);
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      } finally {
        if (!cancelled) setIsLoadingPreferences(false);
      }
    };

    // try setting initial profile image
    const ud = localStorage.getItem('user_data');
    if (ud) {
      try {
        const u = JSON.parse(ud);
        if (u.profile_image_url) setProfileImageUrl(u.profile_image_url);
      } catch {}
    }

    fetchPrefs();
    return () => { cancelled = true; };
  }, [identity]);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || (!identity.user_id && !identity.appwrite_id)) return;
    
    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('file', file);
      // Fallback to appwrite_id if user_id is not set
      formData.append('user_id', identity.user_id || identity.appwrite_id || '');
      
      const res = await fetch('/api/upload-profile', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        setProfileImageUrl(data.imageUrl);
        const ud = localStorage.getItem('user_data');
        if (ud) {
          const u = JSON.parse(ud);
          u.profile_image_url = data.imageUrl;
          localStorage.setItem('user_data', JSON.stringify(u));
        }
        alert('Profile picture uploaded successfully!');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to upload profile picture.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsSavingPreferences(true);
      await saveRegistrationPreferences({
        ...identity,
        ...preferences,
      });
      alert('Your vehicle preferences have been successfully saved!');
    } catch (e) {
      console.error('Failed to save preferences:', e);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleSavePersonalDetails = async () => {
    if (!identity.user_id) return;
    try {
      setIsSavingPersonalDetails(true);
      await updateUserProfile(identity.user_id, personalDetails);
      const ud = localStorage.getItem('user_data');
      if (ud) {
        const u = JSON.parse(ud);
        localStorage.setItem('user_data', JSON.stringify({ ...u, ...personalDetails }));
      }
      alert('Personal details saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save personal details.');
    } finally {
      setIsSavingPersonalDetails(false);
    }
  };

  const toggleType = (type: string) => {
    setPreferences(prev => {
      const current = prev.preferred_vehicle_types || [];
      if (current.includes(type)) {
        return { ...prev, preferred_vehicle_types: current.filter(t => t !== type) };
      } else {
        return { ...prev, preferred_vehicle_types: [...current, type] };
      }
    });
  };

  // Base utility styles generated from palette
  const inputBaseClasses = `w-full rounded-2xl px-4 py-3.5 text-[14px] font-medium transition-all focus:outline-none focus:ring-1 focus:ring-offset-0`;
  const labelClasses = `block text-[12px] font-bold mb-2`;

  const inputStyle = {
    background: isDarkMode ? "rgba(255,255,255,0.03)" : "#FAFAFA",
    border: `1px solid ${P.border}`,
    color: P.text,
  };

  const activeCardStyle = {
    background: P.primary,
    borderColor: P.primary,
    color: P.primaryText,
  };

  const inactiveCardStyle = {
    background: P.cardBg,
    borderColor: P.border,
    color: P.text,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full pb-12 pt-4 px-4 xl:px-6 transition-colors duration-500 rounded-[32px] m-3 min-h-[calc(100vh-100px)]"
      style={{
        background: P.bg,
      }}
    >
      
      {/* ── Settings Header & Sub Nav ── */}
      <div className="max-w-6xl mx-auto mb-8 rounded-[24px] p-2 flex flex-wrap items-center justify-between gap-4 transition-all duration-500" style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}>
        
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2 flex-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-colors whitespace-nowrap z-10`}
                style={{ color: isActive ? P.primaryText : P.muted }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-settings-tab"
                    className="absolute inset-0 rounded-2xl z-0"
                    style={{ background: P.primary }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon className="w-4 h-4 text-inherit" /> {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 pr-2">
          {/* Theme Toggle Button */}
          <motion.button
            onClick={() => setIsDarkMode(!isDarkMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-500 shadow-sm"
            style={{ background: isDarkMode ? "rgba(255,255,255,0.05)" : "#FFFFFF", border: `1px solid ${P.border}`, color: P.text }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isDarkMode ? 'moon' : 'sun'}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* ────── VEHICLE PREFERENCES TAB ────── */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] p-6 xl:p-10 transition-colors duration-500"
              style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
            >
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Left Column: Preferred Types */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Heart className="w-5 h-5" style={{ color: isDarkMode ? "#E2E8F0" : "#18181B" }} />
                    <h2 className="text-xl font-extrabold tracking-tight" style={{ color: P.text }}>Preferred Vehicle Types</h2>
                  </div>
                  <p className="text-sm font-medium mb-8" style={{ color: P.muted }}>
                    Select one or more body styles that fit your lifestyle.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { type: 'SUV', desc: 'Practical, spacious, confident', icon: Car },
                      { type: 'Hatchback', desc: 'Compact and efficient', icon: Car },
                      { type: 'Sedan', desc: 'Balanced, refined, comfortable', icon: Car },
                      { type: 'Electric Vehicle', desc: 'Quiet, modern, low cost', icon: Zap },
                    ].map((vehicle) => {
                      const isSelected = (preferences.preferred_vehicle_types || []).includes(vehicle.type);
                      return (
                        <motion.div
                          key={vehicle.type}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleType(vehicle.type)}
                          className="relative p-5 rounded-[20px] cursor-pointer border-2 transition-colors duration-300 flex flex-col items-start gap-4"
                          style={isSelected ? activeCardStyle : inactiveCardStyle}
                        >
                          <div className="flex justify-between w-full items-start">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: isSelected ? (isDarkMode ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)") : P.iconBg }}>
                              <vehicle.icon className="w-5 h-5" style={{ color: isSelected ? P.primaryText : P.text }} />
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors`} style={{ borderColor: isSelected ? P.primaryText : P.border }}>
                              {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: P.primaryText }} />}
                            </div>
                          </div>
                          <div>
                            <h3 className="text-[15px] font-bold" style={{ color: isSelected ? P.primaryText : P.text }}>{vehicle.type}</h3>
                            <p className="text-[12px] font-medium leading-snug mt-1 opacity-80" style={{ color: isSelected ? P.primaryText : P.muted }}>{vehicle.desc}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column: Budgets & Filters */}
                <div className="space-y-8">
                  
                  {/* Budget Options */}
                  <div className="p-6 rounded-[24px] border transition-colors duration-500" style={{ borderColor: P.border, background: isDarkMode ? "rgba(255,255,255,0.02)" : "#FAFAFA" }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: P.iconBg }}>
                        <Activity className="w-4 h-4" style={{ color: P.text }} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold" style={{ color: P.text }}>Budget Range</h3>
                        <p className="text-[12px] font-medium mt-0.5" style={{ color: P.muted }}>Set your minimal and maximal price limits.</p>
                      </div>
                    </div>

                    {/* Faux Range Slider */}
                    <div className="relative w-full h-2 rounded-full mb-8" style={{ background: P.border }}>
                       <div className="absolute top-0 left-[20%] right-[30%] h-full rounded-full" style={{ background: P.primary }} />
                       <div className="absolute top-1/2 -translate-y-1/2 left-[20%] w-4 h-4 rounded-full shadow-sm border-2" style={{ background: P.primaryText, borderColor: P.primary }} />
                       <div className="absolute top-1/2 -translate-y-1/2 right-[30%] w-4 h-4 rounded-full shadow-sm border-2" style={{ background: P.primaryText, borderColor: P.primary }} />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className={labelClasses} style={{ color: P.muted }}>Minimum Price</label>
                        <input 
                          type="number" 
                          value={preferences.budget_min} 
                          onChange={(e) => setPreferences({ ...preferences, budget_min: Number(e.target.value) || 0 })}
                          className={inputBaseClasses} 
                          style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                        />
                      </div>
                      <div className="flex-1">
                        <label className={labelClasses} style={{ color: P.muted }}>Maximum Price</label>
                        <input 
                          type="number" 
                          value={preferences.budget_max} 
                          onChange={(e) => setPreferences({ ...preferences, budget_max: Number(e.target.value) || 0 })}
                          className={inputBaseClasses} 
                          style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Set Your Preferences (MongoDB Setup) */}
                  <div className="p-6 rounded-[24px] border transition-colors duration-500" style={{ borderColor: P.border, background: isDarkMode ? "rgba(255,255,255,0.02)" : "#FAFAFA" }}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: P.iconBg }}>
                        <Zap className="w-4 h-4" style={{ color: P.text }} />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-bold" style={{ color: P.text }}>Set Your Preferences</h3>
                        <p className="text-[12px] font-medium mt-0.5" style={{ color: P.muted }}>Complete this once before using your dashboard.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label className={labelClasses} style={{ color: P.muted }}>Monthly salary range</label>
                        <select 
                          value={preferences.monthly_salary_range}
                          onChange={(e) => setPreferences({ ...preferences, monthly_salary_range: e.target.value })}
                          className={`${inputBaseClasses} appearance-none`} 
                          style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                        >
                          <option value="0 - 100,000">0 - 100,000</option>
                          <option value="100,001 - 200,000">100,001 - 200,000</option>
                          <option value="200,001 - 350,000">200,001 - 350,000</option>
                          <option value="350,001 - 500,000">350,001 - 500,000</option>
                          <option value="500,001+">500,001+</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClasses} style={{ color: P.muted }}>Daily distance (km)</label>
                          <input 
                            type="number" 
                            value={preferences.daily_distance_km}
                            onChange={(e) => setPreferences({ ...preferences, daily_distance_km: Number(e.target.value) || 0 })}
                            className={inputBaseClasses} 
                            style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                          />
                        </div>
                        <div>
                          <label className={labelClasses} style={{ color: P.muted }}>Usage purpose</label>
                           <select 
                             value={preferences.usage_purpose}
                             onChange={(e) => setPreferences({ ...preferences, usage_purpose: e.target.value as UserPreferencesInput['usage_purpose'] })}
                             className={`${inputBaseClasses} appearance-none`} 
                             style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                           >
                            <option value="Office">Office</option>
                            <option value="Family">Family</option>
                            <option value="Travel">Travel</option>
                            <option value="Rent">Rent</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClasses} style={{ color: P.muted }}>Fuel preference</label>
                          <select 
                            value={preferences.fuel_preference}
                            onChange={(e) => setPreferences({ ...preferences, fuel_preference: e.target.value as UserPreferencesInput['fuel_preference'] })}
                            className={`${inputBaseClasses} appearance-none`} 
                            style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                          >
                            <option value="Hybrid">Hybrid</option>
                            <option value="Electric">Electric</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClasses} style={{ color: P.muted }}>Priority</label>
                           <select 
                             value={preferences.priority}
                             onChange={(e) => setPreferences({ ...preferences, priority: e.target.value as UserPreferencesInput['priority'] })}
                             className={`${inputBaseClasses} appearance-none`} 
                             style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                           >
                            <option value="Fuel Efficiency">Fuel Efficiency</option>
                            <option value="Resale Value">Resale Value</option>
                            <option value="Comfort">Comfort</option>
                            <option value="Performance">Performance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

               {/* Footer Actions */}
              <div className="mt-10 flex justify-end gap-3 pt-6 border-t transition-colors duration-500" style={{ borderColor: P.border }}>
                <button 
                  onClick={handleSavePreferences}
                  disabled={isSavingPreferences}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl text-[14px] font-bold shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: P.primary, color: P.primaryText, opacity: isSavingPreferences ? 0.7 : 1 }}
                >
                  {isSavingPreferences ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSavingPreferences ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </motion.div>
          )}


          {/* ────── PERSONAL DETAILS TAB (from previous step) ────── */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] p-8 xl:p-10 transition-colors duration-500"
              style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
            >
              
              <div className="mb-10">
                <h2 className="text-xl font-extrabold tracking-tight" style={{ color: P.text }}>Basic Information</h2>
                <p className="text-sm font-medium mt-1.5" style={{ color: P.muted }}>
                  This information will be displayed publicly on your directory profile.
                </p>
              </div>

              <div className="flex items-center gap-6 mb-12">
                <div className="relative group shrink-0">
                   <div className="w-20 h-20 rounded-full overflow-hidden border shadow-sm relative text-center flex items-center justify-center bg-gray-100" style={{ borderColor: P.border }}>
                    {isUploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    ) : (
                      <img 
                        src={profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Real file upload input wrapping the camera badge */}
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-md transition-transform group-hover:scale-110 cursor-pointer" style={{ background: P.primary, borderColor: P.cardBg }}>
                    <Camera className="w-4 h-4" style={{ color: P.primaryText }} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} disabled={isUploadingImage} />
                  </label>
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold" style={{ color: P.text }}>Profile Photo</h3>
                  <p className="text-[13px] font-medium mt-1" style={{ color: P.muted }}>Your professional headshot. Click the camera icon to upload.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                <div className="md:col-span-2">
                  <label className={labelClasses} style={{ color: P.muted }}>Display Name</label>
                  <input 
                    type="text" 
                    value={personalDetails.username} 
                    onChange={e => setPersonalDetails(p => ({ ...p, username: e.target.value }))}
                    className={inputBaseClasses} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                  />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>Email Address</label>
                  <input 
                    type="email" 
                    value={personalDetails.email} 
                    onChange={e => setPersonalDetails(p => ({ ...p, email: e.target.value }))}
                    className={inputBaseClasses} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                  />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={personalDetails.phone_number} 
                    onChange={e => setPersonalDetails(p => ({ ...p, phone_number: e.target.value }))}
                    className={inputBaseClasses} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                  />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>City / District</label>
                  <input 
                    type="text" 
                    value={personalDetails.city} 
                    onChange={e => setPersonalDetails(p => ({ ...p, city: e.target.value }))}
                    className={inputBaseClasses} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                  />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>Occupation</label>
                  <input 
                    type="text" 
                    value={personalDetails.occupation} 
                    onChange={e => setPersonalDetails(p => ({ ...p, occupation: e.target.value }))}
                    className={inputBaseClasses} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} 
                  />
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>Driving Experience</label>
                  <select 
                    value={personalDetails.driving_experience}
                    onChange={e => setPersonalDetails(p => ({ ...p, driving_experience: e.target.value }))}
                    className={`${inputBaseClasses} appearance-none`} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className={labelClasses} style={{ color: P.muted }}>Family Size / Regular Passengers</label>
                  <select 
                    value={personalDetails.family_size}
                    onChange={e => setPersonalDetails(p => ({ ...p, family_size: e.target.value }))}
                    className={`${inputBaseClasses} appearance-none`} 
                    style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}}
                  >
                    <option value="1-2 people">1-2 people</option>
                    <option value="3-4 people">3-4 people</option>
                    <option value="5+ people">5+ people</option>
                  </select>
                </div>
              </div>

              <div className="mt-12 flex justify-end pt-6 border-t transition-colors duration-500" style={{ borderColor: P.border }}>
                <button 
                  onClick={handleSavePersonalDetails}
                  disabled={isSavingPersonalDetails}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-[14px] font-bold shadow-lg transition-all hover:-translate-y-0.5" 
                  style={{ background: P.primary, color: P.primaryText, opacity: isSavingPersonalDetails ? 0.7 : 1 }}
                >
                  {isSavingPersonalDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSavingPersonalDetails ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </motion.div>
          )}

          {/* ────── SECURITY TAB ────── */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] p-8 xl:p-10 transition-colors duration-500 space-y-10"
              style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
            >
              
              {/* Header & Status Widgets */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6 border-b pb-8" style={{ borderColor: P.border }}>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight" style={{ color: P.text }}>Security & Access</h2>
                  <p className="text-sm font-medium mt-1.5" style={{ color: P.muted }}>
                    Manage your password, monitor logins, and safeguard your account.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                   <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm transition-colors duration-500" style={{ borderColor: P.border, background: isDarkMode ? "rgba(255,255,255,0.02)" : "#FAFAFA" }}>
                     <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Last Login</span>
                     <span className="text-[13px] font-extrabold mt-0.5" style={{ color: P.text }}>Today, 02:24 PM</span>
                   </div>
                   <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm transition-colors duration-500" style={{ borderColor: P.border, background: isDarkMode ? "rgba(255,255,255,0.02)" : "#FAFAFA" }}>
                     <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Last Password Change</span>
                     <span className="text-[13px] font-extrabold mt-0.5" style={{ color: P.text }}>2 Months Ago</span>
                   </div>
                   <div className="px-4 py-2.5 rounded-xl flex flex-col border shadow-sm transition-colors duration-500" style={{ background: isDarkMode ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.05)", borderColor: isDarkMode ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)" }}>
                     <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: isDarkMode ? "#34D399" : "#059669" }}>
                        Security Strength <Shield className="w-3 h-3" />
                     </span>
                     <span className="text-[13px] font-extrabold mt-0.5" style={{ color: isDarkMode ? "#10B981" : "#047857" }}>Strong</span>
                   </div>
                </div>
              </div>

              {/* Change Password */}
              <div>
                <h3 className="text-[16px] font-bold mb-5" style={{ color: P.text }}>Update Password</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                  <div className="md:col-span-2 md:w-1/2">
                    <label className={labelClasses} style={{ color: P.muted }}>Current Password</label>
                    <input type="password" placeholder="••••••••" className={inputBaseClasses} style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} />
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: P.muted }}>New Password</label>
                    <input type="password" placeholder="••••••••" className={inputBaseClasses} style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} />
                  </div>
                  <div>
                    <label className={labelClasses} style={{ color: P.muted }}>Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className={inputBaseClasses} style={{...inputStyle, borderColor: "transparent", outline: `1px solid ${P.border}`}} />
                  </div>
                </div>
                <button className="mt-6 flex items-center gap-2 px-8 py-3 rounded-2xl text-[13px] font-bold shadow-md transition-all hover:-translate-y-0.5" style={{ background: P.primary, color: P.primaryText }}>
                  Change Password
                </button>
              </div>

              {/* Login Alerts Toggle */}
              <div className="pt-8 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-500" style={{ borderColor: P.border }}>
                <div>
                  <h3 className="text-[16px] font-bold" style={{ color: P.text }}>Login Alerts</h3>
                  <p className="text-[13px] font-medium mt-1" style={{ color: P.muted }}>Receive an email when your account is logged into from a new device or location.</p>
                </div>
                <div 
                  className="w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors shadow-inner shrink-0"
                  style={{ background: P.primary }}
                >
                  <motion.div className="w-4 h-4 rounded-full shadow-sm translate-x-6" style={{ background: P.primaryText }} />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-8 border-t transition-colors duration-500" style={{ borderColor: P.border }}>
                <h3 className="text-[16px] font-bold text-red-500 mb-1 flex items-center gap-2">Delete Account</h3>
                <p className="text-[13px] font-medium mb-5" style={{ color: isDarkMode ? "rgba(239, 68, 68, 0.7)" : "#b91c1c" }}>
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[13px] font-bold text-red-500 transition-all hover:bg-red-500 hover:text-white" style={{ background: isDarkMode ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.05)", border: `1px solid ${isDarkMode ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.3)"}` }}>
                  Delete My Account
                </button>
              </div>

            </motion.div>
          )}

          {/* Placeholders for other tabs */}
          {(activeTab !== 'personal' && activeTab !== 'preferences' && activeTab !== 'security') && (
            <motion.div
              key="other-tabs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="rounded-[32px] border p-16 text-center transition-colors duration-500"
              style={{ background: P.cardBg, borderColor: P.border, boxShadow: P.shadow }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: P.iconBg }}>
                {activeTab === 'activity' && <Activity className="w-7 h-7" style={{ color: P.muted }} />}
              </div>
              <h3 className="text-xl font-bold capitalize mb-2" style={{ color: P.text }}>{activeTab.replace('-', ' ')} Settings</h3>
              <p className="text-sm" style={{ color: P.muted }}>This section is currently under development.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}
