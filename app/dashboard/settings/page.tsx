'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Save, User, Car, Shield, Activity, 
  MessageSquare, Sun, Moon, Heart, ChevronDown, RefreshCw, Zap, Loader2,
  Eye, EyeOff, AlertTriangle, Bell, BellOff,
} from 'lucide-react';
import { getRegistrationPreferences, saveRegistrationPreferences, UserPreferencesInput, getUserProfile, updateUserProfile } from '@/lib/appwrite';
import { parseBrowserAuthToken } from '@/lib/auth-token';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { ToastContainer, useToast } from '@/components/ui/Toast';

type AuthIdentity = {
  user_id?: string;
  appwrite_id?: string;
  email?: string;
};

// --- Palettes ---

const L = {
  bg: "#F0F4FF",
  cardBg: "#FFFFFF",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#030304",
  muted: "#6B7280",
  border: "#DBEAFE",
  glow: "rgba(21,93,252,0.15)",
  shadow: "0 4px 20px -2px rgba(21, 93, 252, 0.06)",
  iconBg: "#EFF6FF"
};

const D = {
  bg: "#030304",
  cardBg: "#0F111A",
  primary: "#155dfc",
  primaryText: "#FFFFFF",
  text: "#FFFFFF",
  muted: "#8B949E",
  border: "rgba(21, 93, 252, 0.2)",
  glow: "rgba(21, 93, 252, 0.25)",
  shadow: "0 4px 24px -4px rgba(0, 0, 0, 0.5)",
  iconBg: "rgba(21,93,252,0.08)"
};

const TABS = [
  { id: 'preferences', label: 'Vehicle Preferences', icon: Car },
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'activity', label: 'Activity Log', icon: Activity },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const P = isDarkMode ? D : L;
  const toast = useToast();

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

  const identity = React.useMemo<AuthIdentity>(() => {
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
        toast.success('Photo uploaded', 'Your profile picture has been updated.');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed', 'Could not upload profile picture.');
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
      toast.success('Preferences saved', 'Your vehicle preferences have been updated.');
    } catch (e) {
      console.error('Failed to save preferences:', e);
      toast.error('Save failed', 'Could not save preferences. Please try again.');
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
      toast.success('Details saved', 'Your personal details have been updated.');
    } catch (e) {
      console.error(e);
      toast.error('Save failed', 'Could not save personal details.');
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
      
      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Settings Header & Sub Nav ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
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
                    transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
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

      {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Main Content Area ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ VEHICLE PREFERENCES TAB ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
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


          {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PERSONAL DETAILS TAB (from previous step) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
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

          {/* â”€â”€â”€â”€â”€â”€ SECURITY TAB â”€â”€â”€â”€â”€â”€ */}
          {activeTab === 'security' && (
            <SecurityTab
              P={P}
              isDarkMode={isDarkMode}
              identity={identity}
              inputBaseClasses={inputBaseClasses}
              labelClasses={labelClasses}
              inputStyle={inputStyle}
              onToast={(type, title, msg) =>
                type === 'success' ? toast.success(title, msg) : toast.error(title, msg)
              }
            />
          )}

          {/* â”€â”€â”€â”€â”€â”€ ACTIVITY LOG TAB â”€â”€â”€â”€â”€â”€ */}
          {activeTab === 'activity' && (
            <ActivityLogTab P={P} isDarkMode={isDarkMode} />
          )}

        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.remove} />

    </motion.div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ACTIVITY LOG TAB
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
function ActivityLogTab({ P, isDarkMode }: { P: Record<string, string>; isDarkMode: boolean }) {
  const [entries, setEntries] = useState<Array<{ time: string; type: string; detail: string }>>([]);

  useEffect(() => {
    const items: Array<{ time: string; type: string; detail: string }> = [];
    const ud = localStorage.getItem('user_data');
    const session = localStorage.getItem('auth_session');

    if (ud) {
      try {
        const u = JSON.parse(ud);
        if (u.last_login) {
          items.push({ time: u.last_login, type: 'login', detail: `Signed in as ${u.username || u.email}` });
        }
        if (u.last_password_change) {
          items.push({ time: u.last_password_change, type: 'password', detail: 'Password changed successfully' });
        }
        if (u.created_at) {
          items.push({ time: u.created_at, type: 'account', detail: 'Account created' });
        }
      } catch {}
    }
    if (session) {
      try {
        const s = JSON.parse(session);
        if (s.timestamp && !items.find(i => i.type === 'login')) {
          items.push({ time: s.timestamp, type: 'login', detail: 'Signed in to AutoFyx' });
        }
      } catch {}
    }
    // Sort newest first
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setEntries(items);
  }, []);

  const typeConfig = {
    login:    { label: 'Sign In',          color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',   border: 'rgba(96,165,250,0.2)',   dot: '#3b82f6' },
    password: { label: 'Password Change',  color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', dot: '#8b5cf6' },
    account:  { label: 'Account Created',  color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.2)',  dot: '#10b981' },
  } as const;

  const fmt = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Unknown';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    const rel = diff < 60 ? 'Just now'
      : diff < 3600   ? `${Math.floor(diff/60)}m ago`
      : diff < 86400  ? `${Math.floor(diff/3600)}h ago`
      : diff < 604800 ? `${Math.floor(diff/86400)}d ago`
      : d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
    const abs = d.toLocaleString(undefined, { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    return `${rel} Â· ${abs}`;
  };

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="rounded-[32px] p-8 xl:p-10 transition-colors duration-500"
      style={{ background: P.cardBg, border: `1px solid ${P.border}`, boxShadow: P.shadow }}
    >
      <div className="mb-8">
        <h2 className="text-xl font-extrabold tracking-tight" style={{ color: P.text }}>Activity Log</h2>
        <p className="text-sm font-medium mt-1.5" style={{ color: P.muted }}>
          A record of recent account activity and security events.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: P.iconBg }}>
            <Activity className="w-7 h-7" style={{ color: P.muted }} />
          </div>
          <p className="text-sm font-medium" style={{ color: P.muted }}>No activity recorded yet.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] top-4 bottom-4 w-[2px] rounded-full" style={{ background: isDarkMode ? 'rgba(255,255,255,0.05)' : '#e5e7eb' }} />

          <div className="space-y-4">
            {entries.map((entry, i) => {
              const cfg = typeConfig[entry.type as keyof typeof typeConfig] || typeConfig.login;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="flex items-start gap-4"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-3 shrink-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.dot }} />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 rounded-2xl px-5 py-4 border transition-all" style={{ background: isDarkMode ? 'rgba(255,255,255,0.02)' : '#FAFAFA', borderColor: P.border }}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: P.muted }}>{fmt(entry.time)}</span>
                    </div>
                    <p className="text-[13px] font-semibold mt-2" style={{ color: P.text }}>{entry.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
