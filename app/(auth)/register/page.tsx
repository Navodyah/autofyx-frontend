"use client";

import dynamic from "next/dynamic";

const RegisterPage = dynamic(() => import("@/legacy_pages/register"), {
  ssr: false,
});

function Register() {
  return <RegisterPage />;
}

export default Register;