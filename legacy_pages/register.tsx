"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Car, Sparkles, Zap } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");

   const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8000/users/register", {
        username: fullName,
        email: email,
        password: password,
        user_type: role.toLowerCase()
      }, {
        timeout: 15000
      });
      console.log("Registration successful:", response.data);
      // Store token if provided
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      //Redirect to login or dashboard
      window.location.href = "/login";
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Registration error:", error.response?.data);
        alert(error.response?.data?.detail || error.response?.data?.message || "Registration failed");
      } else {
        console.error("Registration error:", error);
        alert("An unexpected error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f15_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      {/* Gradient Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Animated Road Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-30 animate-road-line" />
        <div className="absolute top-0 left-1/2 w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent opacity-30 animate-road-line animation-delay-1000" />
        <div className="absolute top-0 left-3/4 w-1 h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-30 animate-road-line animation-delay-2000" />
      </div>

      {/* Floating Cars Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 opacity-10 animate-car-float">
          <Car className="w-16 h-16 text-cyan-400" />
        </div>
        <div className="absolute top-2/3 -right-20 opacity-10 animate-car-float-reverse animation-delay-3000">
          <Car className="w-20 h-20 text-purple-400" />
        </div>
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-2 h-2 text-cyan-400" />
          </div>
        ))}
      </div>

      {/* Main Card with Glass Effect */}
      <Card className="relative z-10 w-full max-w-md shadow-2xl border border-slate-800/50 bg-slate-900/70 backdrop-blur-xl animate-fade-in-up">
        {/* Glow Effect on Card */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg opacity-20 blur-sm" />
        <div className="relative bg-slate-900/90 rounded-lg">
          <CardHeader className="space-y-4 text-center pb-8 pt-8">
            {/* Animated Icon */}
            <div className="mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 shadow-lg animate-float">
                <Car className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                  Create an Account
                </span>
              </CardTitle>
              <CardDescription className="text-base text-slate-400">
                Welcome to <span className="font-semibold text-cyan-400">AutoFyx</span> - Your AI-Powered Vehicle Assistant
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2 group">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-300">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 transition-all duration-300 group-hover:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="email" className="text-sm font-medium text-slate-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 transition-all duration-300 group-hover:border-slate-600"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500 focus-visible:ring-cyan-500 focus-visible:border-cyan-500 pr-10 transition-all duration-300 group-hover:border-slate-600"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 group">
                <Label htmlFor="role" className="text-sm font-medium text-slate-300">
                  User Role
                </Label>
                <Select
                  value={role}
                  onValueChange={setRole}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="role"
                    className="border-slate-700 bg-slate-800/50 text-white focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 group-hover:border-slate-600"
                  >
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="User" className="text-white hover:bg-slate-700">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">User</span>
                        <span className="text-xs text-slate-400">Standard access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Admin" className="text-white hover:bg-slate-700">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Admin</span>
                        <span className="text-xs text-slate-400">Full system access</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Researcher" className="text-white hover:bg-slate-700">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Researcher</span>
                        <span className="text-xs text-slate-400">Analytics & insights</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-11 mt-6 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-6 pb-8">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">
                  Already registered?
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </div>
      </Card>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes road-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes car-float {
          0% { transform: translateX(-100%) rotate(-10deg); }
          100% { transform: translateX(calc(100vw + 100px)) rotate(10deg); }
        }
        @keyframes car-float-reverse {
          0% { transform: translateX(calc(100vw + 100px)) rotate(10deg) scaleX(-1); }
          100% { transform: translateX(-100%) rotate(-10deg) scaleX(-1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animate-road-line { animation: road-line 3s linear infinite; }
        .animate-car-float { animation: car-float 15s linear infinite; }
        .animate-car-float-reverse { animation: car-float-reverse 20s linear infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}