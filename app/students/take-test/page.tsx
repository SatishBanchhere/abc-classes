"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import axios, { type AxiosResponse } from "axios"
import MainNav from "@/components/main-nav"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { studentDataType } from "@/app/types/students"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Users, FileText, Play, Target, Zap } from "lucide-react"

const initialStudentData: studentDataType = {
    name: "",
    email: "",
    password: "",
    phone_number: "",
    phone_parent: "",
    exam_type: "",
    role: "",
    batch: "",
}

interface TestData {
    id: string
    name: string
    status: string
    totalQuestions: number
    createdAt: string
    examType?: string
}

export default function TakeTestPage() {
    const { userProfile } = useAuth()
    const router = useRouter()

    const [studentData, setStudentData] = useState<studentDataType>(initialStudentData)
    const [tests, setTests] = useState<TestData[]>([])
    const [selectedExam, setSelectedExam] = useState("JEE Main")
    const [isLoading, setIsLoading] = useState(true)

    const examOptions = ["JEE Main", "JEE Advanced", "NEET", "CUET"]

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response: AxiosResponse = await axios.get("/api/students/me")
                setStudentData({ ...response.data, role: "Student", batch: "Student" })
            } catch (error) {
                console.error("Failed to fetch student data:", error)
            }
        }

        const fetchTests = async () => {
            const snapshot = await getDocs(collection(db, "tests"))
            const fetched: TestData[] = []

            snapshot.forEach((doc) => {
                const metadata = doc.data().metadata
                if (metadata?.status === "draft") {
                    fetched.push({
                        id: doc.id,
                        name: metadata.name,
                        status: metadata.status,
                        totalQuestions: metadata.totalQuestions,
                        createdAt: metadata.createdAt,
                        examType: "JEE Main",
                    })
                }
            })

            setTests(fetched)
        }

        const init = async () => {
            await Promise.all([fetchStudentData(), fetchTests()])
            setIsLoading(false)
        }

        init()
    }, [])

    useEffect(() => {
        if (userProfile?.role === "admin") {
            router.push("/admin")
        }
    }, [userProfile, router])

    const handleStartTest = (testId: string) => {
        router.push(`/test?id=${testId}`)
    }

    const filteredTests = tests.filter((test) => test.examType === selectedExam)

    const renderWatermarks = () => {
        const watermarks = []
        for (let i = 0; i < 25; i++) {
            const top = Math.floor(Math.random() * 100)
            const left = Math.floor(Math.random() * 100)
            const rotation = Math.floor(Math.random() * 60) - 30
            const size = Math.floor(Math.random() * 12) + 6
            const opacity = Math.random() * 0.02 + 0.01

            watermarks.push(
                <div
                    key={i}
                    className="fixed pointer-events-none select-none z-0"
                    style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: `rotate(${rotation}deg)`,
                        fontSize: `${size}px`,
                        fontWeight: "600",
                        color: "rgba(26, 115, 232, 0.02)",
                        opacity: opacity,
                        whiteSpace: "nowrap",
                    }}
                >
                    ABC CLASSES
                </div>,
            )
        }
        return watermarks
    }

    const renderTests = () => {
        if (!filteredTests.length) {
            return (
                <div className="text-center py-16">
                    <div className="h-20 w-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No tests available</h3>
                    <p className="text-slate-500 mb-6">
                        No tests available for <strong>{selectedExam}</strong> at the moment.
                    </p>
                    <Button variant="outline" className="border-slate-200 hover:border-[#1a73e8] hover:bg-[#1a73e8]/5">
                        Check back later
                    </Button>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {filteredTests.map((test, index) => (
                    <Card
                        key={test.id}
                        className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-slate-50/50 group"
                    >
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                                        index % 3 === 0
                                            ? "bg-gradient-to-br from-[#1a73e8] to-[#4285f4]"
                                            : index % 3 === 1
                                                ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                                : "bg-gradient-to-br from-purple-500 to-violet-600"
                                    }`}
                                >
                                    <Target className="h-6 w-6 text-white" />
                                </div>
                                <Badge
                                    className={`${
                                        test.status === "active"
                                            ? "bg-green-100 text-green-800 border-green-200"
                                            : "bg-blue-100 text-blue-800 border-blue-200"
                                    }`}
                                >
                                    {test.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-slate-900 leading-tight">{test.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{test.totalQuestions} Questions</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>3 Hours</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Users className="h-4 w-4" />
                                <span>Mixed difficulty level</span>
                            </div>

                            <Button
                                className="w-full bg-gradient-to-r from-[#1a73e8] to-[#4285f4] hover:from-[#1557b0] hover:to-[#3367d6] shadow-lg shadow-[#1a73e8]/25 group-hover:shadow-xl group-hover:shadow-[#1a73e8]/30 transition-all font-medium"
                                onClick={() => handleStartTest(test.id)}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Start Test
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
                <MainNav studentData={studentData} />
                <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                        <div className="h-12 w-12 bg-gradient-to-r from-[#1a73e8] to-[#4285f4] rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-600 font-medium">Loading test data...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30 relative">
            {renderWatermarks()}

            <MainNav studentData={studentData} />

            <div className="flex-1 p-6 md:p-12 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 bg-gradient-to-br from-[#1a73e8] to-[#4285f4] rounded-2xl flex items-center justify-center">
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-slate-900">Mock Tests</h1>
                                <p className="text-slate-600">Practice with real exam-like environment</p>
                            </div>
                        </div>

                        {/* Exam Type Selector */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50 p-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Select Exam Type</h3>
                                    <p className="text-slate-600">Choose the exam you're preparing for</p>
                                </div>
                                <div className="md:w-64">
                                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                                        <SelectTrigger className="h-12 border-slate-200 focus:border-[#1a73e8]">
                                            <SelectValue placeholder="Select exam type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {examOptions.map((exam) => (
                                                <SelectItem key={exam} value={exam}>
                                                    {exam}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tests Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Available Tests</h2>
                                <p className="text-slate-600">
                                    {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""} available for {selectedExam}
                                </p>
                            </div>
                            <Badge className="bg-gradient-to-r from-[#1a73e8]/10 to-[#4285f4]/10 text-[#1a73e8] border-[#1a73e8]/20 px-4 py-2">
                                {selectedExam}
                            </Badge>
                        </div>

                        {renderTests()}
                    </div>
                </div>
            </div>
        </div>
    )
}
