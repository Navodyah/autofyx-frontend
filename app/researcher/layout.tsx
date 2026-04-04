'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export default function ResearcherLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {children}
      </div>
    </AuthProvider>
  );
}
