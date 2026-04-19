'use client';

import dynamic from "next/dynamic";

const HomePage = dynamic(() => import("@/legacy_pages/landing_page"), {
  ssr: false,
});

export default function Page() {
  return <HomePage />;
}