'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const navItems = [
    { label: "Home", href: "/admin/dashboard" },
    { label: "Stories", href: "/admin/dashboard/addstory" },
    { label: "Team Register", href: "/admin/dashboard/team" },
    { label: "Scheduled List", href: "/admin/dashboard/scheduled-list" },
    { label: "Documents", href: "/admin/dashboard/documents" },
    { label: "Attendance", href: "/admin/dashboard/attendance" },
];

type DashboardLayoutProps = {
    children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        router.push("/admin/login");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-white shadow-md">
                <div className="p-4 text-xl font-bold border-b">My Dashboard</div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`block rounded px-3 py-2 text-sm font-medium ${
                                pathname === item.href
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t">
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger className="md:hidden absolute top-4 left-4 z-50">
                    <Menu className="w-6 h-6" />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-white">
                    <div className="p-4 text-xl font-bold border-b">My Dashboard</div>
                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block rounded px-3 py-2 text-sm font-medium ${
                                    pathname === item.href
                                        ? "bg-gray-900 text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4 border-t">
                        <Button variant="destructive" className="w-full" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
    );
}
    

