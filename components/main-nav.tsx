"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Trophy, Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { studentDataType } from "@/app/types/students"
import axios from "axios"
import { Badge } from "@/components/ui/badge"
import {getAuth, signOut} from "firebase/auth";

export default function MainNav({ studentData }: { studentData: studentDataType }) {
    const router = useRouter()
    const pathname = usePathname()
    const isAdmin = studentData?.role === "admin"

    const handleLogout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
            router.push("/auth/login");
        } catch (error: any) {
            console.error("Logout failed:", error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    return (
        <header className="sticky top-0 z-50 flex h-20 items-center gap-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl px-6 md:px-8">
            <Link href={isAdmin ? "/admin" : "/students"} className="flex items-center gap-3 font-semibold">
                <div className="relative">
                    <Trophy className="h-8 w-8 text-[#1a73e8]" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
                </div>
                <div>
          <span className="text-xl bg-gradient-to-r from-[#1a73e8] to-[#4285f4] bg-clip-text text-transparent font-bold">
            ABC Classes
          </span>
                    <div className="text-xs text-slate-500 font-medium">Student Portal</div>
                </div>
            </Link>

            <div className="relative ml-6 hidden md:flex w-full max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="search"
                    placeholder="Search courses, tests, materials..."
                    className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-[#1a73e8] transition-all"
                />
            </div>

            <nav className="ml-auto flex gap-8">
                {isAdmin ? (
                    <>
                        <Link
                            href="/admin"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname === "/admin" ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1" : "text-slate-600"
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/admin/tests"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname.startsWith("/admin/tests")
                                    ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1"
                                    : "text-slate-600"
                            }`}
                        >
                            Tests
                        </Link>
                        <Link
                            href="/admin/students"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname.startsWith("/admin/students")
                                    ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1"
                                    : "text-slate-600"
                            }`}
                        >
                            Students
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/students"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname === "/" || pathname === "/students"
                                    ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1"
                                    : "text-slate-600"
                            }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/students/take-test"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] relative ${
                                pathname.startsWith("/students/take-test")
                                    ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1"
                                    : "text-slate-600"
                            }`}
                        >
                            Mock Tests
                            <Badge className="absolute -top-2 -right-6 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1.5 py-0.5">
                                New
                            </Badge>
                        </Link>
                        <Link
                            href="/analytics"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname.startsWith("/analytics") ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1" : "text-slate-600"
                            }`}
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/study-material"
                            className={`text-sm font-medium transition-colors hover:text-[#1a73e8] ${
                                pathname.startsWith("/study-material")
                                    ? "text-[#1a73e8] border-b-2 border-[#1a73e8] pb-1"
                                    : "text-slate-600"
                            }`}
                        >
                            Study Material
                        </Link>
                    </>
                )}
            </nav>

            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-slate-600 hover:text-[#1a73e8] hover:bg-[#1a73e8]/5"
                >
                    <Bell className="h-5 w-5" />
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-3 border-l border-slate-200 pl-4 cursor-pointer hover:bg-slate-50/50 rounded-lg p-2 transition-colors">
                            <Avatar className="h-10 w-10 ring-2 ring-[#1a73e8]/20">
                                <AvatarImage src="/placeholder-user.jpg" alt={studentData?.name.split(" ")[0] || "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-[#1a73e8] to-[#4285f4] text-white font-medium">
                                    {studentData?.name ? getInitials(studentData.name) : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900">{studentData?.name || "User"}</p>
                                <p className="text-xs text-slate-500">
                                    {studentData?.role === "admin" ? "Administrator" : studentData?.batch || "Student"}
                                </p>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem className="cursor-pointer">
                            <Link href="/profile" className="w-full">
                                Profile Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">Preferences</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
