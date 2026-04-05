"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Car } from "lucide-react";
import axios from "axios";
import { createBrowserAuthToken } from "@/lib/auth-token";
import { getDashboardRouteByUserType } from "@/lib/auth-token";

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

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/users/login", {
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log("Login successful:", response.data);
            const user = response.data?.user;
            const token = response.data.access_token || response.data.token || createBrowserAuthToken({
                user_id: user?.user_id,
                appwrite_id: user?.appwrite_id,
                email: user?.email,
                user_type: user?.user_type,
                session_id: response.data?.session_id,
            });

            localStorage.setItem("token", token);
            localStorage.setItem("access_token", token);

            const userType = user?.user_type || null;
            const dashboardRoute = getDashboardRouteByUserType(userType);
            // Redirect to dashboard
            window.location.href = dashboardRoute;

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Login error:", error.response?.data);
                alert(error.response?.data?.detail || error.response?.data?.message || "Login failed");
            } else {
                console.error("Login error:", error);
                alert("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ...existing code...

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 px-4 py-12">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="space-y-3 text-center pb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Car className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-base">
                        Sign in to your <span className="font-semibold text-primary">AutoFyx</span> account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pr-10"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-6">
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">
                                New to AutoFyx?
                            </span>
                        </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            href="/register"
                            className="font-semibold text-primary underline-offset-4 hover:underline transition-colors"
                        >
                            Create one now
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
