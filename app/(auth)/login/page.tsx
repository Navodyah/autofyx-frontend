import { Suspense } from "react";
import LoginPage from "@/legacy_pages/login";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <LoginPage />
    </Suspense>
  );
}