"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Trophy,
    Clock,
    Target,
    TrendingUp,
    BarChart3,
    ArrowLeft,
    CheckCircle,
    XCircle,
    MinusCircle,
    Award,
    Brain,
    Timer,
    BookOpen,
    Star,
    Shield,
    UserIcon,
    Calendar,
    AlertCircle,
    Lock,
    FileText,
    PieChartIcon,
    RotateCcw,
    Download,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import {
    PieChart as RechartsPieChart,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    RadialBarChart,
    RadialBar,
    Pie,
} from "recharts"

interface TestConfig {
    paperName: string
    totalTime: number
    correctMarks: number
    wrongMarks: number
    status: string
    subjectWise: {
        physics: number
        chemistry: number
        mathematics: number
    }
}

interface TestData {
    testConfig: TestConfig
    scoreReleased: boolean
    solutionsReleased: boolean
    questions: Array<{
        _id: string
        questionType: "mcq" | "integer"
        selectedSubject: string
        subjectName: string
        difficulty: string
        correctAnswer: string
        questionDescription: string
        options?: {
            A?: string
            B?: string
            C?: string
            D?: string
        }
        solution?: string
    }>
}

interface TestSubmission {
    user_id: string
    test_id: string
    test_name: string
    submitted_at: any
    score: number
    correct_answers: number
    incorrect_answers: number
    unanswered_questions: number
    time_spent: number
    percentage: number
    total_questions: number
    mcq_answers: Record<number, number>
    integer_answers: Record<number, string>
    question_status: Record<
        number,
        "not-visited" | "not-answered" | "answered" | "marked-review" | "answered-marked-review"
    >
    answered_questions: number
}

const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
    }
    return `${minutes}m ${secs}s`
}

const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
        return {
            level: "Outstanding",
            color: "text-emerald-600",
            bgColor: "bg-gradient-to-br from-emerald-50 to-green-50",
            borderColor: "border-emerald-300",
            icon: Trophy,
        }
    if (percentage >= 80)
        return {
            level: "Excellent",
            color: "text-blue-600",
            bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50",
            borderColor: "border-blue-300",
            icon: Award,
        }
    if (percentage >= 70)
        return {
            level: "Very Good",
            color: "text-purple-600",
            bgColor: "bg-gradient-to-br from-purple-50 to-violet-50",
            borderColor: "border-purple-300",
            icon: Star,
        }
    if (percentage >= 60)
        return {
            level: "Good",
            color: "text-amber-600",
            bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
            borderColor: "border-amber-300",
            icon: Target,
        }
    return {
        level: "Needs Improvement",
        color: "text-red-600",
        bgColor: "bg-gradient-to-br from-red-50 to-rose-50",
        borderColor: "border-red-300",
        icon: TrendingUp,
    }
}

// Custom Animated Progress Circle
const AnimatedProgressCircle = ({
                                    percentage,
                                    size = 160,
                                    strokeWidth = 12,
                                }: {
    percentage: number;
    size?: number;
    strokeWidth?: number
}) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-200"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                    style={{
                        stroke:
                            percentage >= 80 ? "#10b981" : percentage >= 60 ? "#3b82f6" : percentage >= 40 ? "#f59e0b" : "#ef4444",
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-slate-900">{percentage}%</span>
                <span className="text-xs text-slate-600 mt-1">Score</span>
            </div>
        </div>
    )
}

// Enhanced watermark pattern
const renderWatermarks = (paperName: string) => {
    const watermarks = []
    for (let i = 0; i < 15; i++) {
        const top = Math.floor(Math.random() * 100)
        const left = Math.floor(Math.random() * 100)
        const rotation = Math.floor(Math.random() * 30) - 15
        const size = Math.floor(Math.random() * 4) + 8
        const opacity = Math.random() * 0.015 + 0.005

        watermarks.push(
            <div
                key={i}
                className="fixed pointer-events-none select-none"
                style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    transform: `rotate(${rotation}deg)`,
                    fontSize: `${size}px`,
                    fontWeight: "600",
                    color: "rgba(71, 85, 105, 0.02)",
                    opacity: opacity,
                    whiteSpace: "nowrap",
                    fontFamily: "ui-serif, Georgia, serif",
                    zIndex: -1,
                }}
            >
                {paperName || "RESULT ANALYSIS"}
            </div>,
        )
    }
    return watermarks
}

export default function TestResultPage() {
    const params = useParams()
    const router = useRouter()
    const testId = params.testId as string
    const [user, setUser] = useState<User | null>(null)
    const [testResult, setTestResult] = useState<TestSubmission | null>(null)
    const [testData, setTestData] = useState<TestData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const fetchTestData = async () => {
            if (!user?.uid || !testId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                // Fetch test configuration and questions
                const testRef = doc(db, "tests", testId)
                const testDoc = await getDoc(testRef)

                if (!testDoc.exists()) {
                    setError("Test not found")
                    return
                }

                const testInfo = testDoc.data() as TestData
                setTestData(testInfo)

                // Fetch user's test submission
                const userTestRef = doc(db, "students", user.uid, "testHistory", testId)
                const submissionDoc = await getDoc(userTestRef)

                if (submissionDoc.exists()) {
                    const submissionData = submissionDoc.data() as TestSubmission
                    setTestResult(submissionData)
                } else {
                    setError("Test submission not found. Please ensure you have completed this test.")
                }
            } catch (err) {
                console.error("Error fetching test data:", err)
                setError("Failed to load test results. Please try again later.")
            } finally {
                setLoading(false)
            }
        }

        fetchTestData()
    }, [user?.uid, testId])

    // Calculate subject-wise performance
    const getSubjectWisePerformance = () => {
        if (!testResult || !testData) return {}

        const subjectPerformance: Record<
            string,
            { correct: number; total: number; attempted: number; percentage: number }
        > = {
            Physics: { correct: 0, total: 0, attempted: 0, percentage: 0 },
            Chemistry: { correct: 0, total: 0, attempted: 0, percentage: 0 },
            Mathematics: { correct: 0, total: 0, attempted: 0, percentage: 0 },
        }

        testData.questions.forEach((question, index) => {
            const subject = question.subjectName
            if (subjectPerformance[subject]) {
                subjectPerformance[subject].total++

                // Check if question was answered
                const hasAnswer = testResult.mcq_answers[index] !== undefined || testResult.integer_answers[index] !== undefined

                if (hasAnswer) {
                    subjectPerformance[subject].attempted++

                    // Check if answer was correct
                    let isCorrect = false
                    if (question.questionType === "mcq" && testResult.mcq_answers[index]) {
                        const selectedOption = String.fromCharCode(64 + testResult.mcq_answers[index])
                        isCorrect = selectedOption === question.correctAnswer
                    } else if (question.questionType === "integer" && testResult.integer_answers[index]) {
                        isCorrect = testResult.integer_answers[index].toString() === question.correctAnswer
                    }

                    if (isCorrect) {
                        subjectPerformance[subject].correct++
                    }
                }
            }
        })

        // Calculate percentages
        Object.keys(subjectPerformance).forEach((subject) => {
            const data = subjectPerformance[subject]
            data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
        })

        return subjectPerformance
    }

    const prepareChartData = () => {
        if (!testResult) return { pieData: [], barData: [], subjectData: [] }

        const pieData = [
            { name: "Attempted", value: testResult.answered_questions, fill: "#3b82f6" },
            { name: "Correct", value: testResult.correct_answers, fill: "#10b981" },
            { name: "Incorrect", value: testResult.incorrect_answers, fill: "#ef4444" },
            { name: "Unanswered", value: testResult.unanswered_questions, fill: "#6b7280" },
        ]

        const subjectPerformance = getSubjectWisePerformance()
        const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
            subject,
            correct: data.correct,
            total: data.total,
            percentage: data.percentage,
            fill: subject === "Physics" ? "#3b82f6" : subject === "Chemistry" ? "#10b981" : "#f59e0b",
        }))

        const barData = [
            { name: "Attempted", value: testResult.answered_questions, fill: "#3b82f6" },
            { name: "Correct", value: testResult.correct_answers, fill: "#10b981" },
            { name: "Incorrect", value: testResult.incorrect_answers, fill: "#ef4444" },
            { name: "Unanswered", value: testResult.unanswered_questions, fill: "#6b7280" },
        ]

        return { pieData, barData, subjectData }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative p-2 sm:p-0">
                <div className="text-center relative z-10 bg-white/90 backdrop-blur-xl p-6 sm:p-12 rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full mx-2">
                    <div className="relative mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-white animate-pulse" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-slate-800">Loading Test Results</h1>
                    <p className="text-slate-600 mb-4 sm:mb-6 text-sm sm:text-base">Analyzing your performance and generating detailed insights...</p>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center relative p-3 sm:p-6">
                <div className="bg-white/95 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-slate-800">Authentication Required</h1>
                        <p className="text-slate-600 text-sm sm:text-base">Please log in to view your test results and detailed analysis</p>
                    </div>

                    <Button
                        onClick={() => router.push("/auth/login")}
                        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold py-3"
                    >
                        <UserIcon className="mr-2 h-5 w-5" />
                        Go to Login
                    </Button>
                </div>
            </div>
        )
    }

    if (error || !testResult || !testData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center relative p-3 sm:p-6">
                <div className="bg-white/95 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-slate-800">Unable to Load Results</h1>
                        <p className="text-slate-600 text-sm sm:text-base">{error || "Test results not found"}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => window.location.reload()}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 hover:bg-slate-50 font-semibold bg-transparent"
                            onClick={() => router.push("/test-series")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const performance = getPerformanceLevel(testResult.percentage)
    const accuracy =
        testResult.answered_questions > 0
            ? Math.round((testResult.correct_answers / testResult.answered_questions) * 100)
            : 0
    const attemptRate = Math.round((testResult.answered_questions / testResult.total_questions) * 100)
    const subjectWisePerformance = getSubjectWisePerformance()
    const { pieData, barData, subjectData } = prepareChartData()

    // Check if scores and solutions are released
    const scoreReleased = testData.scoreReleased
    const solutionsReleased = testData.solutionsReleased

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
            {renderWatermarks(testData.testConfig.paperName)}

            <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-8 max-w-7xl relative" style={{ zIndex: 10 }}>
                {/* Enhanced Header */}
                <div className="mb-6 sm:mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/test-series")}
                        className="mb-4 sm:mb-6 hover:bg-white/60 font-semibold backdrop-blur-sm relative z-20 text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <Card className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl overflow-hidden relative z-20">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <CardHeader className="text-center pb-6 sm:pb-8 relative z-10 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 gap-4">
                                <div className="p-4 sm:p-6 bg-white/20 rounded-3xl backdrop-blur-sm shadow-2xl">
                                    <Trophy className="w-8 h-8 sm:w-12 sm:h-12" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                                        Test Analysis Report
                                    </h1>
                                    <p className="text-blue-100 text-lg sm:text-xl font-medium">{testData.testConfig.paperName}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-8 text-sm">
                                <div className="flex items-center bg-white/15 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                    <div className="text-left">
                                        <div className="text-white/80 text-xs">Submitted</div>
                                        <div className="font-semibold text-xs sm:text-sm">
                                            {testResult.submitted_at?.toDate?.()?.toLocaleDateString() || "N/A"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center bg-white/15 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                                    <Timer className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                    <div className="text-left">
                                        <div className="text-white/80 text-xs">Duration</div>
                                        <div className="font-semibold text-xs sm:text-sm">{formatTime(testResult.time_spent)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center bg-white/15 px-4 sm:px-6 py-2 sm:py-3 rounded-xl backdrop-blur-sm border border-white/20">
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                    <div className="text-left">
                                        <div className="text-white/80 text-xs">Questions</div>
                                        <div className="font-semibold text-xs sm:text-sm">{testResult.total_questions}</div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* Score Release Status */}
                {!scoreReleased ? (
                    <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-xl relative z-20">
                        <CardHeader className="text-center py-8 sm:py-16 p-4 sm:p-6">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg">
                                <Lock className="h-8 w-8 sm:h-12 sm:w-12 text-amber-600" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-3 sm:mb-4">Results Under Evaluation</h1>
                            <p className="text-amber-700 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                                Your test has been submitted successfully and is currently being evaluated by our expert team. Detailed
                                results and performance analysis will be available shortly.
                            </p>
                            <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto">
                                <div className="flex items-center justify-center mb-2 sm:mb-3">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" />
                                    <span className="text-amber-800 font-semibold text-sm sm:text-base">Estimated Release Time</span>
                                </div>
                                <p className="text-amber-700 text-xs sm:text-sm">
                                    Results will be published within 24-48 hours of test completion
                                </p>
                            </div>
                        </CardHeader>
                    </Card>
                ) : (
                    <>
                        {/* Enhanced Main Results Display */}
                        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-8 mb-8 sm:mb-12 relative z-20">
                            {/* Overall Performance Circle */}
                            <Card className={`xl:col-span-2 ${performance.bgColor} ${performance.borderColor} border-2 shadow-xl`}>
                                <CardHeader className="text-center pb-2 sm:pb-4 p-3 sm:p-6">
                                    <CardTitle className="text-lg sm:text-xl flex items-center justify-center text-slate-800">
                                        <performance.icon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                        Overall Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-center p-3 sm:p-6">
                                    <div className="mb-6 sm:mb-8">
                                        <AnimatedProgressCircle
                                            percentage={testResult.percentage}
                                            size={window.innerWidth < 640 ? 120 : 160}
                                            strokeWidth={window.innerWidth < 640 ? 8 : 12}
                                        />
                                    </div>

                                    <div className={`px-4 sm:px-6 py-2 sm:py-3 rounded-2xl mb-4 sm:mb-6 ${performance.bgColor} border ${performance.borderColor}`}>
                                        <Badge
                                            variant="secondary"
                                            className={`${performance.color} bg-transparent border-0 text-base sm:text-lg font-bold`}
                                        >
                                            <performance.icon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                            {performance.level}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 sm:space-y-2">
                                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                                            {testResult.score} / {testResult.total_questions * testData.testConfig.correctMarks}
                                        </div>
                                        <p className="text-slate-600 font-medium text-sm sm:text-base">Total Marks Obtained</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Performance Charts */}
                            <Card className="xl:col-span-3 shadow-xl">
                                <CardHeader className="p-3 sm:p-6">
                                    <CardTitle className="flex items-center text-lg sm:text-xl text-slate-800">
                                        <PieChartIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                        Performance Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 sm:p-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                                        {/* Pie Chart */}
                                        <div className="text-center">
                                            <h3 className="font-semibold mb-3 sm:mb-4 text-slate-700 text-sm sm:text-base">Answer Distribution</h3>
                                            <div className="h-48 sm:h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RechartsPieChart>
                                                        <Pie
                                                            data={pieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, value }) => `${name}: ${value}`}
                                                            outerRadius={window.innerWidth < 640 ? 60 : 80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {pieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </RechartsPieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Bar Chart */}
                                        <div className="text-center">
                                            <h3 className="font-semibold mb-3 sm:mb-4 text-slate-700 text-sm sm:text-base">Performance Metrics</h3>
                                            <div className="h-48 sm:h-64">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis />
                                                        <Tooltip />
                                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                            {barData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12 relative z-20">
                            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg">
                                <CardContent className="text-center p-3 sm:p-6">
                                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-600 mx-auto mb-2 sm:mb-4" />
                                    <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-1 sm:mb-2">{testResult.correct_answers}</div>
                                    <div className="text-xs sm:text-sm text-slate-600 font-semibold">Correct Answers</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 shadow-lg">
                                <CardContent className="text-center p-3 sm:p-6">
                                    <XCircle className="w-8 h-8 sm:w-12 sm:h-12 text-red-600 mx-auto mb-2 sm:mb-4" />
                                    <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1 sm:mb-2">{testResult.incorrect_answers}</div>
                                    <div className="text-xs sm:text-sm text-slate-600 font-semibold">Incorrect Answers</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-200 shadow-lg">
                                <CardContent className="text-center p-3 sm:p-6">
                                    <MinusCircle className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-2 sm:mb-4" />
                                    <div className="text-2xl sm:text-3xl font-bold text-slate-600 mb-1 sm:mb-2">{testResult.unanswered_questions}</div>
                                    <div className="text-xs sm:text-sm text-slate-600 font-semibold">Unanswered</div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg">
                                <CardContent className="text-center p-3 sm:p-6">
                                    <Target className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-2 sm:mb-4" />
                                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">{accuracy}%</div>
                                    <div className="text-xs sm:text-sm text-slate-600 font-semibold">Accuracy Rate</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enhanced Detailed Analysis */}
                        <div className="relative z-30">
                            <Tabs defaultValue="overview" className="space-y-6 sm:space-y-8">
                                <div className="flex justify-center">
                                    <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-white shadow-xl rounded-2xl p-1 sm:p-2 border-2 border-slate-200 relative z-40">
                                        <TabsTrigger value="overview" className="font-semibold text-xs sm:text-sm relative z-50">
                                            Overview
                                        </TabsTrigger>
                                        <TabsTrigger value="subjects" className="font-semibold text-xs sm:text-sm relative z-50">
                                            Subjects
                                        </TabsTrigger>
                                        <TabsTrigger value="performance" className="font-semibold text-xs sm:text-sm relative z-50">
                                            Performance
                                        </TabsTrigger>
                                        <TabsTrigger value="solutions" className="font-semibold text-xs sm:text-sm relative z-50">
                                            Solutions
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="overview" className="space-y-6 sm:space-y-8 relative z-20">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                        {/* Subject Performance Chart */}
                                        <Card className="shadow-xl">
                                            <CardHeader className="p-3 sm:p-6">
                                                <CardTitle className="flex items-center text-base sm:text-lg">
                                                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                    Subject-wise Performance
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 sm:p-6">
                                                <div className="h-60 sm:h-80">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={subjectData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                            <CartesianGrid strokeDasharray="3 3" />
                                                            <XAxis dataKey="subject" />
                                                            <YAxis />
                                                            <Tooltip />
                                                            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                                                                {subjectData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Key Performance Metrics */}
                                        <Card className="shadow-xl">
                                            <CardHeader className="p-3 sm:p-6">
                                                <CardTitle className="flex items-center text-base sm:text-lg">
                                                    <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                    Key Performance Metrics
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 sm:p-6">
                                                <div className="space-y-4 sm:space-y-6">
                                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Accuracy Rate</span>
                                                            <span className="text-xl sm:text-2xl font-bold text-blue-600">{accuracy}%</span>
                                                        </div>
                                                        <Progress value={accuracy} className="h-2" />
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Attempt Rate</span>
                                                            <span className="text-xl sm:text-2xl font-bold text-purple-600">{attemptRate}%</span>
                                                        </div>
                                                        <Progress value={attemptRate} className="h-2" />
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Avg. Time/Question</span>
                                                            <span className="text-xl sm:text-2xl font-bold text-orange-600">
                                                                {Math.round(testResult.time_spent / testResult.total_questions)}s
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Efficiency Score</span>
                                                            <span className="text-xl sm:text-2xl font-bold text-emerald-600">
                                                                {Math.round((accuracy * attemptRate) / 100)}%
                                                            </span>
                                                        </div>
                                                        <Progress value={Math.round((accuracy * attemptRate) / 100)} className="h-2" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="subjects" className="space-y-6 sm:space-y-8 relative z-20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                                        {Object.entries(subjectWisePerformance).map(([subject, data]) => {
                                            const subjectAccuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0
                                            const radialData = [
                                                {
                                                    name: subject,
                                                    value: data.percentage,
                                                    fill: subject === "Physics" ? "#3b82f6" : subject === "Chemistry" ? "#10b981" : "#f59e0b",
                                                },
                                            ]

                                            return (
                                                <Card key={subject} className="shadow-xl">
                                                    <CardHeader className="pb-2 sm:pb-4 p-3 sm:p-6">
                                                        <CardTitle className="text-base sm:text-lg flex items-center">
                                                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                            {subject}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-3 sm:p-6">
                                                        <div className="text-center mb-4 sm:mb-6">
                                                            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 sm:mb-4">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <RadialBarChart
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        innerRadius="60%"
                                                                        outerRadius="90%"
                                                                        data={radialData}
                                                                        startAngle={90}
                                                                        endAngle={-270}
                                                                    >
                                                                        <RadialBar dataKey="value" cornerRadius={10} />
                                                                    </RadialBarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                            <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">{data.percentage}%</div>
                                                            <p className="text-xs sm:text-sm text-slate-600">Overall Performance</p>
                                                        </div>

                                                        <div className="space-y-3 sm:space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs sm:text-sm font-medium">Total Questions:</span>
                                                                <span className="font-bold text-slate-800">{data.total}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs sm:text-sm font-medium">Attempted:</span>
                                                                <span className="font-bold text-blue-600">{data.attempted}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs sm:text-sm font-medium">Correct:</span>
                                                                <span className="font-bold text-emerald-600">{data.correct}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-xs sm:text-sm font-medium">Accuracy:</span>
                                                                <span className="font-bold text-indigo-600">{subjectAccuracy}%</span>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </TabsContent>

                                <TabsContent value="performance" className="space-y-6 sm:space-y-8 relative z-20">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                        <Card className="shadow-xl">
                                            <CardHeader className="p-3 sm:p-6">
                                                <CardTitle className="flex items-center text-emerald-600 text-base sm:text-lg">
                                                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                    Strengths & Achievements
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 sm:p-6">
                                                <div className="space-y-3 sm:space-y-4">
                                                    {accuracy > 80 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-emerald-800 text-sm sm:text-base">Excellent Accuracy</div>
                                                                <div className="text-xs sm:text-sm text-emerald-700">
                                                                    Maintained {accuracy}% accuracy throughout the test - Outstanding performance!
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {attemptRate > 90 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-blue-800 text-sm sm:text-base">High Completion Rate</div>
                                                                <div className="text-xs sm:text-sm text-blue-700">
                                                                    Attempted {attemptRate}% of all questions - Great time management!
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {testResult.time_spent / testResult.total_questions < 90 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-200">
                                                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-purple-800 text-sm sm:text-base">Efficient Problem Solving</div>
                                                                <div className="text-xs sm:text-sm text-purple-700">
                                                                    Average {Math.round(testResult.time_spent / testResult.total_questions)}s per question -
                                                                    Excellent pace!
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {testResult.percentage > 75 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                                                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-yellow-800 text-sm sm:text-base">Strong Overall Performance</div>
                                                                <div className="text-xs sm:text-sm text-yellow-700">
                                                                    Scored {testResult.percentage}% overall - Keep up the great work!
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="shadow-xl">
                                            <CardHeader className="p-3 sm:p-6">
                                                <CardTitle className="flex items-center text-amber-600 text-base sm:text-lg">
                                                    <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                    Growth Opportunities
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 sm:p-6">
                                                <div className="space-y-3 sm:space-y-4">
                                                    {testResult.unanswered_questions > testResult.total_questions * 0.1 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                            <MinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-amber-800 text-sm sm:text-base">Time Management Focus</div>
                                                                <div className="text-xs sm:text-sm text-amber-700">
                                                                    {testResult.unanswered_questions} questions left unanswered. Practice time allocation
                                                                    strategies.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {accuracy < 70 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-red-50 rounded-xl border border-red-200">
                                                            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-red-800 text-sm sm:text-base">Concept Strengthening Needed</div>
                                                                <div className="text-xs sm:text-sm text-red-700">
                                                                    Focus on understanding fundamental concepts for better accuracy.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {testResult.time_spent / testResult.total_questions > 150 && (
                                                        <div className="flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-200">
                                                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 mt-1 flex-shrink-0" />
                                                            <div>
                                                                <div className="font-semibold text-orange-800 text-sm sm:text-base">Speed Enhancement</div>
                                                                <div className="text-xs sm:text-sm text-orange-700">
                                                                    Practice solving questions faster while maintaining accuracy.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="solutions" className="space-y-6 relative z-20">
                                    {solutionsReleased ? (
                                        <div className="space-y-4 sm:space-y-6">
                                            <Card className="shadow-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                                                <CardHeader className="p-3 sm:p-6">
                                                    <CardTitle className="flex items-center text-emerald-800 text-base sm:text-lg">
                                                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                                        Detailed Solutions & Explanations
                                                    </CardTitle>
                                                    <p className="text-emerald-700 text-xs sm:text-sm">
                                                        Review detailed solutions for all questions to understand concepts and improve your
                                                        problem-solving approach.
                                                    </p>
                                                </CardHeader>
                                            </Card>

                                            <div className="space-y-4 sm:space-y-6">
                                                {testData.questions.map((question, index) => {
                                                    const userAnswer =
                                                        question.questionType === "mcq"
                                                            ? testResult.mcq_answers[index]
                                                                ? String.fromCharCode(64 + testResult.mcq_answers[index])
                                                                : "Not Answered"
                                                            : testResult.integer_answers[index] || "Not Answered"

                                                    const isCorrect =
                                                        question.questionType === "mcq"
                                                            ? userAnswer === question.correctAnswer
                                                            : userAnswer === question.correctAnswer

                                                    const isExpanded = expandedQuestion === index

                                                    return (
                                                        <Card
                                                            key={question._id}
                                                            className={`shadow-lg border-2 ${
                                                                isCorrect
                                                                    ? "border-emerald-200 bg-emerald-50/30"
                                                                    : userAnswer === "Not Answered"
                                                                        ? "border-slate-200 bg-slate-50/30"
                                                                        : "border-red-200 bg-red-50/30"
                                                            }`}
                                                        >
                                                            <CardHeader className="pb-2 sm:pb-4 p-3 sm:p-6">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                                        <Badge
                                                                            variant={
                                                                                isCorrect
                                                                                    ? "default"
                                                                                    : userAnswer === "Not Answered"
                                                                                        ? "secondary"
                                                                                        : "destructive"
                                                                            }
                                                                            className="px-2 sm:px-3 py-1 text-xs sm:text-sm"
                                                                        >
                                                                            Question {index + 1}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="font-medium text-xs sm:text-sm">
                                                                            {question.questionType.toUpperCase()}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="font-medium text-xs sm:text-sm">
                                                                            {question.subjectName}
                                                                        </Badge>
                                                                        <Badge variant="outline" className="font-medium text-xs sm:text-sm">
                                                                            {question.difficulty}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        {isCorrect ? (
                                                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                                                                        ) : userAnswer === "Not Answered" ? (
                                                                            <MinusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
                                                                        ) : (
                                                                            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                                                                        )}
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                                                                            className="p-1 sm:p-2 relative z-50"
                                                                        >
                                                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </CardHeader>

                                                            <CardContent className="pt-0 p-3 sm:p-6">
                                                                {/* Question */}
                                                                <div className="bg-white rounded-xl p-3 sm:p-6 mb-3 sm:mb-4 border border-slate-200 shadow-sm">
                                                                    <h4 className="font-semibold text-slate-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                                                                        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                                                        Question:
                                                                    </h4>
                                                                    <div
                                                                        className="text-slate-700 leading-relaxed text-sm sm:text-base"
                                                                        dangerouslySetInnerHTML={{ __html: question.questionDescription }}
                                                                    />
                                                                </div>

                                                                {/* Options for MCQ */}
                                                                {question.questionType === 'mcq' && question.options && (
                                                                    <div className="bg-white rounded-xl p-3 sm:p-6 mb-3 sm:mb-4 border border-slate-200 shadow-sm">
                                                                        <h4 className="font-semibold text-slate-800 mb-3 sm:mb-4 text-sm sm:text-base">Options:</h4>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                                            {/* Options A, B, C, D */}
                                                                            {['A', 'B', 'C', 'D'].map((optionKey) => {
                                                                                const optionContent = question.options?.[optionKey as keyof typeof question.options]
                                                                                if (!optionContent) return null

                                                                                return (
                                                                                    <div key={optionKey} className={`p-2 sm:p-4 rounded-lg border-2 transition-colors ${
                                                                                        question.correctAnswer === optionKey ? 'border-emerald-300 bg-emerald-50' :
                                                                                            userAnswer === optionKey && question.correctAnswer !== optionKey ? 'border-red-300 bg-red-50' :
                                                                                                'border-slate-200 bg-slate-50'
                                                                                    }`}>
                                                                                        <div className="flex items-start space-x-2 sm:space-x-3">
                                                                                            <span className={`font-bold px-2 py-1 rounded text-xs sm:text-sm ${
                                                                                                question.correctAnswer === optionKey ? 'bg-emerald-100 text-emerald-700' :
                                                                                                    userAnswer === optionKey && question.correctAnswer !== optionKey ? 'bg-red-100 text-red-700' :
                                                                                                        'bg-slate-100 text-slate-700'
                                                                                            }`}>
                                                                                                {optionKey}
                                                                                            </span>
                                                                                            <div
                                                                                                className="flex-1 text-xs sm:text-sm"
                                                                                                dangerouslySetInnerHTML={{ __html: optionContent }}
                                                                                            />
                                                                                            {question.correctAnswer === optionKey && (
                                                                                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />
                                                                                            )}
                                                                                            {userAnswer === optionKey && question.correctAnswer !== optionKey && (
                                                                                                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Answer Summary */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
                                                                        <div className="text-xs sm:text-sm text-slate-600 mb-1">Your Answer</div>
                                                                        <div
                                                                            className={`font-semibold text-sm sm:text-base ${
                                                                                userAnswer === "Not Answered"
                                                                                    ? "text-slate-500"
                                                                                    : isCorrect
                                                                                        ? "text-emerald-600"
                                                                                        : "text-red-600"
                                                                            }`}
                                                                        >
                                                                            {userAnswer}
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
                                                                        <div className="text-xs sm:text-sm text-slate-600 mb-1">Correct Answer</div>
                                                                        <div className="font-semibold text-emerald-600 text-sm sm:text-base">{question.correctAnswer}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm">
                                                                        <div className="text-xs sm:text-sm text-slate-600 mb-1">Result</div>
                                                                        <div
                                                                            className={`font-semibold flex items-center text-sm sm:text-base ${
                                                                                isCorrect
                                                                                    ? "text-emerald-600"
                                                                                    : userAnswer === "Not Answered"
                                                                                        ? "text-slate-500"
                                                                                        : "text-red-600"
                                                                            }`}
                                                                        >
                                                                            {isCorrect ? (
                                                                                <>
                                                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                                    Correct
                                                                                </>
                                                                            ) : userAnswer === "Not Answered" ? (
                                                                                <>
                                                                                    <MinusCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                                    Not Attempted
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                                                                    Incorrect
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Solution */}
                                                                {isExpanded && question.solution && (
                                                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border-2 border-blue-200">
                                                                        <h4 className="font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                                                                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                                            Detailed Solution & Explanation:
                                                                        </h4>
                                                                        <div
                                                                            className="text-slate-700 leading-relaxed solution-content text-sm sm:text-base"
                                                                            dangerouslySetInnerHTML={{ __html: question.solution }}
                                                                        />
                                                                    </div>
                                                                )}

                                                                {isExpanded && !question.solution && (
                                                                    <div className="bg-amber-50 rounded-xl p-4 sm:p-6 border-2 border-amber-200">
                                                                        <div className="flex items-center text-amber-700">
                                                                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                                                            <span className="font-medium text-sm sm:text-base">
                                                                                Solution for this question will be available soon.
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <Card className="shadow-xl border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                                            <CardHeader className="text-center py-8 sm:py-16 p-4 sm:p-6">
                                                <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mb-6 sm:mb-8 shadow-lg">
                                                    <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-amber-600" />
                                                </div>
                                                <h1 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-3 sm:mb-4">Solutions Coming Soon!</h1>
                                                <p className="text-amber-700 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                                                    Our expert team is preparing detailed solutions and explanations for all questions. These will
                                                    help you understand the concepts better and improve your problem-solving skills.
                                                </p>
                                                <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-4 sm:p-6 max-w-lg mx-auto">
                                                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                                                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mr-2" />
                                                        <span className="text-amber-800 font-semibold text-sm sm:text-base">Expected Release</span>
                                                    </div>
                                                    <p className="text-amber-700 text-xs sm:text-sm">
                                                        Solutions will be available within 48-72 hours of result publication
                                                    </p>
                                                </div>
                                            </CardHeader>
                                        </Card>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </>
                )}

                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-6 mt-8 sm:mt-16 relative z-20">
                    <Button
                        onClick={() => router.push("/test-series")}
                        size="lg"
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-900 text-white shadow-xl font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                .solution-content img {
                    max-width: 100%;
                    height: auto;
                    margin: 1rem 0;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                .solution-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1rem 0;
                }
                .solution-content th,
                .solution-content td {
                    border: 1px solid #e2e8f0;
                    padding: 0.5rem;
                    text-align: left;
                }
                .solution-content th {
                    background-color: #f8fafc;
                    font-weight: 600;
                }
            `}</style>
        </div>
    )
}
