"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
    Trophy,
    Bell,
    Search,
    Users,
    FileText,
    Plus,
    BarChart,
    Calendar,
    Upload,
    Eye,
    Edit,
    Sparkles,
    TrendingUp,
    Target,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { teacherDataType } from "@/app/types/teachers"
import axios, { type AxiosResponse } from "axios"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {getAuth, signOut} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust this path based on your setup

const initialTeacherData: teacherDataType = {
    name: "",
    email: "",
    password: "",
    phone_number: "",
    exam_type: "",
}

export default function TeacherDashboard() {
    const [searchQuery, setSearchQuery] = useState("")
    const [teachersData, setTeachersDAta] = useState<teacherDataType>(initialTeacherData)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const router = useRouter()

    // Create watermark pattern
    const renderWatermarks = () => {
        const watermarks = []
        for (let i = 0; i < 30; i++) {
            const top = Math.floor(Math.random() * 100)
            const left = Math.floor(Math.random() * 100)
            const rotation = Math.floor(Math.random() * 60) - 30
            const size = Math.floor(Math.random() * 12) + 6
            const opacity = Math.random() * 0.04 + 0.02

            watermarks.push(
                <div
                    key={i}
                    className="fixed pointer-events-none select-none z-0"
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: `rotate(${rotation}deg)`,
                        fontSize: `${size}px`,
                        fontWeight: "bold",
                        color: "rgba(26, 115, 232, 0.03)",
                        opacity: opacity,
                        whiteSpace: "nowrap",
                    }}
                >
                    KK MISHRA TEACHER
                </div>,
            )
        }
        return watermarks
    }

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) throw new Error("User not logged in");

                const docRef = doc(db, "teachers", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const teacherData = { ...docSnap.data(), userId: user.uid };
                    console.log("Teacher Data From Page:", teacherData);
                    setTeachersDAta(teacherData); // Make sure your setter is named correctly
                } else {
                    console.log("No such teacher document!");
                    return null;
                }
            } catch (error) {
                console.error("Failed to fetch teacher data:", error);
                return null;
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeacherData()
    }, [])

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

    // Hardcoded data for demo
    const testStats = {
        totalTests: 15,
        activeTests: 8,
        totalStudents: 245,
        averageScore: 72,
    }

    const recentTests = [
        {
            id: 1,
            name: "JEE Main Physics Mock Test #5",
            subject: "Physics",
            students: 89,
            avgScore: 68,
            date: "2024-01-15",
            status: "Active",
        },
        {
            id: 2,
            name: "Chemistry Organic Compounds Test",
            subject: "Chemistry",
            students: 76,
            avgScore: 74,
            date: "2024-01-12",
            status: "Completed",
        },
        {
            id: 3,
            name: "Mathematics Calculus Test",
            subject: "Mathematics",
            students: 82,
            avgScore: 79,
            date: "2024-01-10",
            status: "Completed",
        },
    ]

    const topStudents = [
        { name: "Rishabh Tiwari", score: 92, tests: 12, rank: 1 },
        { name: "Ananya Sharma", score: 89, tests: 11, rank: 2 },
        { name: "Rahul Verma", score: 87, tests: 13, rank: 3 },
        { name: "Priya Singh", score: 85, tests: 10, rank: 4 },
        { name: "Arjun Kumar", score: 83, tests: 12, rank: 5 },
    ]

    return (
        <div className="flex min-h-screen w-full flex-col relative bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
            {/* Watermark pattern */}
            {renderWatermarks()}

            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 md:px-6 shadow-lg">
                <Link href="/teacher" className="flex items-center gap-2 font-semibold hover:scale-105 transition-transform">
                    <div className="p-1 rounded-full bg-white/20">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <span className="text-lg bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
            KK Mishra Classes - Teacher Portal
          </span>
                </Link>

                <div className="relative ml-4 hidden md:flex w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
                    <Input
                        type="search"
                        placeholder="Search tests, students..."
                        className="pl-8 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link
                        href="/teacher"
                        className="text-sm font-medium text-white/90 border-b-2 border-white pb-1 hover:text-white transition-colors"
                    >
                        Dashboard
                    </Link>
                    <Link href="/teacher/tests" className="text-sm font-medium text-white hover:text-white/90 transition-colors">
                        Tests
                    </Link>
                    <Link
                        href="/teacher/students"
                        className="text-sm font-medium text-white hover:text-white/90 transition-colors"
                    >
                        Students
                    </Link>
                    <Link
                        href="/teacher/analytics"
                        className="text-sm font-medium text-white hover:text-white/90 transition-colors"
                    >
                        Analytics
                    </Link>
                </nav>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Bell className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="flex items-center gap-2 border-l border-white/20 pl-2 cursor-pointer hover:bg-white/10 rounded-lg p-2 transition-colors">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder-user.jpg" alt={teachersData?.name.split(" ")[0] || "User"} />
                                    <AvatarFallback className="bg-white/20 text-white">
                                        {teachersData?.name ? getInitials(teachersData.name) : "TC"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium">{teachersData?.name || "Teacher"}</p>
                                    <p className="text-xs text-white/70">Physics Faculty</p>
                                </div>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                            <DropdownMenuItem>
                                <Link href="/teacher/profile" className="w-full">
                                    Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 relative z-10">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white shadow-2xl border-0">
                    <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] opacity-10 bg-cover bg-center"></div>
                    <div className="relative z-10 max-w-3xl">
                        <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-0">
                            <Sparkles className="mr-1 h-3 w-3" />
                            Teacher Portal
                        </Badge>
                        <h1 className="mb-2 text-3xl font-bold md:text-4xl bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                            Welcome back, {teachersData.name || "Teacher"}!
                        </h1>
                        <p className="mb-6 text-lg text-white/90">
                            Manage your tests, track student progress, and create engaging assessments.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/teachers/upload-test">
                                <Button className="bg-white text-green-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create New Test
                                </Button>
                            </Link>
                            <Link href="/teachers/analytics">
                                <Button variant="outline" className="bg-white text-green-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <BarChart className="mr-2 h-4 w-4" />
                                    View Analytics
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <div className="p-2 rounded-full bg-blue-100">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                {testStats.totalStudents}
                            </div>
                            <p className="text-xs text-muted-foreground">Enrolled students</p>
                            <div className="mt-2 flex items-center text-xs text-green-600">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                <span className="font-medium">↑ 12 new</span>
                                <span className="ml-1 text-muted-foreground">this month</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
                            <div className="p-2 rounded-full bg-green-100">
                                <FileText className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                {testStats.activeTests}
                            </div>
                            <p className="text-xs text-muted-foreground">Out of {testStats.totalTests} total tests</p>
                            <Progress
                                value={(testStats.activeTests / testStats.totalTests) * 100}
                                className="mt-2 h-2"
                                indicatorColor="bg-gradient-to-r from-green-500 to-emerald-500"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <div className="p-2 rounded-full bg-yellow-100">
                                <BarChart className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                                {testStats.averageScore}%
                            </div>
                            <p className="text-xs text-muted-foreground">Across all tests</p>
                            <Progress
                                value={testStats.averageScore}
                                className="mt-2 h-2"
                                indicatorColor="bg-gradient-to-r from-yellow-500 to-orange-500"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Test Completion</CardTitle>
                            <div className="p-2 rounded-full bg-purple-100">
                                <Calendar className="h-4 w-4 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                89%
                            </div>
                            <p className="text-xs text-muted-foreground">Average completion rate</p>
                            <Progress value={89} className="mt-2 h-2" indicatorColor="bg-gradient-to-r from-purple-500 to-pink-500" />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Sparkles className="h-5 w-5 text-blue-600" />
                            </div>
                            Quick Actions
                        </CardTitle>
                        <CardDescription>Common tasks and shortcuts</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Link href="/teacher/upload-test">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex flex-col gap-2 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="p-2 rounded-full bg-blue-100">
                                        <Upload className="h-6 w-6 text-blue-600" />
                                    </div>
                                    Upload New Test
                                </Button>
                            </Link>
                            <Link href="/teacher/students">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex flex-col gap-2 border-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="p-2 rounded-full bg-green-100">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    View Students
                                </Button>
                            </Link>
                            <Link href="/teacher/analytics">
                                <Button
                                    variant="outline"
                                    className="w-full h-20 flex flex-col gap-2 border-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="p-2 rounded-full bg-purple-100">
                                        <BarChart className="h-6 w-6 text-purple-600" />
                                    </div>
                                    View Analytics
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="recent-tests" className="w-full">
                    <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
                        <TabsTrigger value="recent-tests" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Recent Tests
                        </TabsTrigger>
                        <TabsTrigger value="top-students" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Top Students
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="recent-tests" className="space-y-4 pt-4">
                        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-green-100">
                                        <FileText className="h-5 w-5 text-green-600" />
                                    </div>
                                    Recent Tests
                                </CardTitle>
                                <CardDescription>Your latest test activities and statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentTests.map((test) => (
                                        <div
                                            key={test.id}
                                            className="bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[#1a73e8] to-[#4285f4]">
                                                        <FileText className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{test.name}</h4>
                                                            <Badge
                                                                variant={test.status === "Active" ? "default" : "outline"}
                                                                className={
                                                                    test.status === "Active"
                                                                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                                                        : ""
                                                                }
                                                            >
                                                                {test.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {test.subject} • Created on {new Date(test.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Students</p>
                                                        <p className="font-bold">{test.students}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Avg. Score</p>
                                                        <p className="font-bold">{test.avgScore}%</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="border-2 hover:bg-blue-50">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="border-2 hover:bg-green-50">
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link href="/teacher/tests">
                                        <Button variant="outline" className="w-full border-2 hover:bg-slate-50">
                                            <FileText className="mr-2 h-4 w-4" />
                                            View All Tests
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="top-students" className="pt-4">
                        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-yellow-100">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                    </div>
                                    Top Performing Students
                                </CardTitle>
                                <CardDescription>Students with the highest average scores</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {topStudents.map((student, index) => (
                                        <div
                                            key={index}
                                            className="bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-300"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                                            student.rank === 1
                                                                ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                                                                : student.rank === 2
                                                                    ? "bg-gradient-to-r from-gray-300 to-gray-400"
                                                                    : student.rank === 3
                                                                        ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                                                                        : "bg-gradient-to-r from-blue-500 to-cyan-500"
                                                        }`}
                                                    >
                                                        <span className="font-bold text-white">#{student.rank}</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{student.name}</h4>
                                                        <p className="text-sm text-muted-foreground">JEE 2024 Batch</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Avg. Score</p>
                                                        <p className="font-bold">{student.score}%</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm text-muted-foreground">Tests Taken</p>
                                                        <p className="font-bold">{student.tests}</p>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="border-2 hover:bg-blue-50">
                                                        <Eye className="mr-1 h-3 w-3" />
                                                        View Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link href="/teacher/students">
                                        <Button variant="outline" className="w-full border-2 hover:bg-slate-50">
                                            <Users className="mr-2 h-4 w-4" />
                                            View All Students
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-indigo-100">
                                            <Target className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        Subject Performance
                                    </CardTitle>
                                    <CardDescription>Average scores by subject</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <h4 className="font-medium">Physics</h4>
                                                <span className="text-sm font-bold">74%</span>
                                            </div>
                                            <Progress
                                                value={74}
                                                className="h-2"
                                                indicatorColor="bg-gradient-to-r from-blue-500 to-cyan-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <h4 className="font-medium">Chemistry</h4>
                                                <span className="text-sm font-bold">68%</span>
                                            </div>
                                            <Progress
                                                value={68}
                                                className="h-2"
                                                indicatorColor="bg-gradient-to-r from-green-500 to-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="mb-1 flex items-center justify-between">
                                                <h4 className="font-medium">Mathematics</h4>
                                                <span className="text-sm font-bold">79%</span>
                                            </div>
                                            <Progress
                                                value={79}
                                                className="h-2"
                                                indicatorColor="bg-gradient-to-r from-purple-500 to-pink-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <div className="p-2 rounded-full bg-orange-100">
                                            <TrendingUp className="h-5 w-5 text-orange-600" />
                                        </div>
                                        Test Completion Trends
                                    </CardTitle>
                                    <CardDescription>Completion rates over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px] w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4 flex items-center justify-center">
                                        <div className="text-center text-muted-foreground">
                                            <div className="p-4 rounded-full bg-orange-100 mx-auto mb-4 w-fit">
                                                <BarChart className="h-8 w-8 text-orange-600" />
                                            </div>
                                            <p className="font-medium">Completion trends chart</p>
                                            <p className="text-sm mt-1">Showing completion rates over time</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
