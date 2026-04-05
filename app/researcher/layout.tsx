'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';
import UserPreferenceOnboardingModal from '@/components/user-preference-onboarding-modal';

export default function ResearcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <UserPreferenceOnboardingModal />
        {children}
      </div>
    </AuthProvider>
  );
}
