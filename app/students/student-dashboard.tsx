"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Clock,
  FileText,
  Trophy,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  Target,
  Zap,
  Star,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import axios, { type AxiosResponse } from "axios"
import {collection, getDocs, query, orderBy, doc, getDoc} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { studentDataType } from "@/app/types/students"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {getAuth} from "firebase/auth";

interface TestData {
  id: string
  name: string
  status: string
  totalQuestions: number
  createdAt: string
  examType?: string
}

interface TestHistoryEntry {
  id: string
  test_id: string
  test_name: string
  submitted_at?: string
  score: number
  total_questions: number
  correct_answers: number
  incorrect_answers: number
  percentage: number
  time_spent: number
  physics_score?: { correct: number; total: number }
  chemistry_score?: { correct: number; total: number }
  maths_score?: { correct: number; total: number }
}

interface PerformanceData {
  physics: number
  chemistry: number
  maths: number
  overall: number
  rank: number
  percentile: number
  testsCompleted: number
  studyHours: number
  lastTestDate: string
  bestTest: { score: number; name: string }
  weakestSubject: string
}

export default function StudentDashboard({ studentData }: { studentData: studentDataType }) {
  const [tests, setTests] = useState<TestData[]>([])
  const [testHistory, setTestHistory] = useState<TestHistoryEntry[]>([])
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  console.log({ studentData })
  const fetchTestHistory = async (userId: string): Promise<TestHistoryEntry[]> => {
    try {
      const testHistoryRef = collection(db, "users", userId, "testHistory")
      const q = query(testHistoryRef, orderBy("submitted_at", "desc"))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          test_id: data.test_id,
          test_name: data.test_name,
          submitted_at: data.submitted_at?.toDate().toLocaleDateString(),
          score: data.score || 0,
          total_questions: data.total_questions || 0,
          correct_answers: data.correct_answers || 0,
          incorrect_answers: data.incorrect_answers || 0,
          percentage: data.percentage || 0,
          time_spent: data.time_spent || 0,
          physics_score: data.physics_score,
          chemistry_score: data.chemistry_score,
          maths_score: data.maths_score
        }
      })
    } catch (error) {
      console.error("Error fetching test history:", error)
      return []
    }
  }

  useEffect(() => {

    const fetchTests = async () => {
      const snapshot = await getDocs(collection(db, "tests"))
      const fetched: TestData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data().metadata,
        examType: doc.data().metadata.examType || "JEE Main"
      }))
      console.log("These are the fetched tests ", fetched)
      setTests(fetched)
    }

    const calculatePerformance = (history: TestHistoryEntry[]): PerformanceData => {
      if (history.length === 0) {
        return {
          physics: 0,
          chemistry: 0,
          maths: 0,
          overall: 0,
          rank: 0,
          percentile: 0,
          testsCompleted: 0,
          studyHours: 0,
          lastTestDate: "",
          bestTest: { score: 0, name: "" },
          weakestSubject: "physics"
        }
      }

      const subjectStats = {
        physics: { correct: 0, total: 0 },
        chemistry: { correct: 0, total: 0 },
        maths: { correct: 0, total: 0 }
      }

      history.forEach(test => {
        if (test.physics_score) {
          subjectStats.physics.correct += test.physics_score.correct
          subjectStats.physics.total += test.physics_score.total
        }
        if (test.chemistry_score) {
          subjectStats.chemistry.correct += test.chemistry_score.correct
          subjectStats.chemistry.total += test.chemistry_score.total
        }
        if (test.maths_score) {
          subjectStats.maths.correct += test.maths_score.correct
          subjectStats.maths.total += test.maths_score.total
        }
      })

      const physicsPercentage = subjectStats.physics.total > 0
          ? Math.round((subjectStats.physics.correct / subjectStats.physics.total) * 100)
          : 0
      const chemistryPercentage = subjectStats.chemistry.total > 0
          ? Math.round((subjectStats.chemistry.correct / subjectStats.chemistry.total) * 100)
          : 0
      const mathsPercentage = subjectStats.maths.total > 0
          ? Math.round((subjectStats.maths.correct / subjectStats.maths.total) * 100)
          : 0

      const weakestSubject = Object.entries({
        physics: physicsPercentage,
        chemistry: chemistryPercentage,
        maths: mathsPercentage
      }).reduce((weakest, [subject, percentage]) =>
              percentage < weakest.percentage ? { subject, percentage } : weakest,
          { subject: "", percentage: 100 }
      ).subject

      const totalTests = history.length
      const totalQuestions = history.reduce((sum, test) => sum + test.total_questions, 0)
      const totalCorrect = history.reduce((sum, test) => sum + test.correct_answers, 0)
      const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100)

      const bestTest = history.reduce((prev, current) =>
          (prev.percentage > current.percentage) ? prev : current
      )

      const rank = Math.max(1, Math.floor(Math.random() * 50))
      const percentile = Math.min(99.9, Math.max(70, 100 - (rank / 1.245)))

      return {
        physics: physicsPercentage,
        chemistry: chemistryPercentage,
        maths: mathsPercentage,
        overall: overallPercentage,
        rank,
        percentile,
        testsCompleted: totalTests,
        studyHours: Math.round(totalTests * 2.5),
        lastTestDate: history[0]?.submitted_at || "",
        bestTest: {
          score: bestTest.percentage,
          name: bestTest.test_name
        },
        weakestSubject
      }
    }

    const init = async () => {
      const userId = studentData.userId;
      if (!userId) {
        setIsLoading(false)
        return
      }

      const [_, history] = await Promise.all([
        fetchTests(),
        fetchTestHistory(userId)
      ])
      //
      // setTestHistory(history)
      // setPerformance(calculatePerformance(history))
      setIsLoading(false)
    }

    init()
  }, [])

  const renderWatermarks = () => {
    const watermarks = []
    for (let i = 0; i < 30; i++) {
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
            KK MISHRA CLASSES
          </div>
      )
    }
    return watermarks
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-r from-[#1a73e8] to-[#4285f4] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
    )
  }

  return (
      <main className="flex flex-1 flex-col gap-8 p-6 md:gap-12 md:p-12 relative z-10">
        {renderWatermarks()}

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a73e8] to-[#4285f4] p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fillRule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fillOpacity=\\'0.1\\'%3E%3Ccircle cx=\\'30\\' cy=\\'30\\' r=\\'2\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          <div className="relative z-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                {studentData.exam_type || "JEE Main"} 2024
              </Badge>
              <Badge className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-100 border-yellow-400/30">
                <Star className="h-3 w-3 mr-1" />
                Premium Student
              </Badge>
            </div>

            <h1 className="mb-4 text-4xl md:text-5xl font-bold leading-tight">
              Welcome back, {studentData?.name || "Student"}!
            </h1>

            <p className="mb-8 text-xl text-white/90 leading-relaxed">
              {performance?.lastTestDate
                  ? `Last test taken on ${performance.lastTestDate} • Keep up the momentum!`
                  : "Ready to start your JEE preparation journey? Take your first test today!"}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/students/take-test">
                <Button className="bg-white text-[#1a73e8] hover:bg-slate-100 shadow-lg font-medium px-8 py-3">
                  <Zap className="mr-2 h-5 w-5" />
                  Take a Mock Test
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="bg-white text-[#1a73e8] hover:bg-slate-100 shadow-lg font-medium px-8 py-3">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  View Performance
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Overall Rank</CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{performance?.rank || "--"}</div>
              <p className="text-xs text-slate-500 mb-3">Out of 1,245 students</p>
              {performance?.rank && (
                  <Badge className={`text-xs ${
                      performance.rank <= 10
                          ? "bg-green-100 text-green-800 border-green-200"
                          : performance.rank <= 50
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-orange-100 text-orange-800 border-orange-200"
                  }`}>
                    {performance.rank <= 10 ? "🏆 Top 10" :
                        performance.rank <= 50 ? "↑ Improving" : "↓ Needs work"}
                  </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Expected Percentile</CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{performance?.percentile.toFixed(1) || "--"}</div>
              <p className="text-xs text-slate-500 mb-3">
                {performance?.percentile
                    ? performance.percentile >= 95 ? "Excellent!" :
                        performance.percentile >= 85 ? "Good" : "Needs improvement"
                    : "No data"}
              </p>
              <Progress
                  value={performance?.percentile || 0}
                  className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Tests Completed</CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{performance?.testsCompleted || 0}</div>
              <p className="text-xs text-slate-500 mb-3">
                {performance?.testsCompleted
                    ? `${Math.round(performance.testsCompleted / 4)} per week`
                    : "Start practicing!"}
              </p>
              <Progress
                  value={Math.min(100, (performance?.testsCompleted || 0) * 5)}
                  className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Best Test Score</CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">{performance?.bestTest.score || "--"}%</div>
              <p className="text-xs text-slate-500 mb-3 truncate">
                {performance?.bestTest.name || "No tests taken"}
              </p>
              <Progress
                  value={performance?.bestTest.score || 0}
                  className="h-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Subject Performance */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {performance?.testsCompleted ? (
                  <div className="space-y-6">
                    {[
                      { subject: "Physics", value: performance.physics, color: "from-blue-500 to-indigo-600", icon: "⚛️" },
                      { subject: "Chemistry", value: performance.chemistry, color: "from-green-500 to-emerald-600", icon: "🧪" },
                      { subject: "Mathematics", value: performance.maths, color: "from-purple-500 to-violet-600", icon: "📐" },
                      { subject: "Overall", value: performance.overall, color: "from-[#1a73e8] to-[#4285f4]", icon: "🎯" }
                    ].map((item) => (
                        <div key={item.subject} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">{item.icon}</span>
                              <h4 className="font-semibold text-slate-900">{item.subject}</h4>
                            </div>
                            <span className="text-lg font-bold text-slate-900">{item.value}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={item.value} className="h-3" />
                            <div
                                className={`absolute top-0 left-0 h-3 bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                                style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-slate-500">
                            {item.value > 80 ? "🌟 Excellent" :
                                item.value > 60 ? "👍 Good" :
                                    item.value > 40 ? "📈 Average" : "📚 Needs improvement"}
                            {item.subject === "Overall" && performance.weakestSubject &&
                                ` • Focus on ${performance.weakestSubject}`}
                          </p>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 mb-4">No test data available</p>
                    <Link href="/students/take-test">
                      <Button className="bg-gradient-to-r from-[#1a73e8] to-[#4285f4] text-white">
                        Take your first test
                      </Button>
                    </Link>
                  </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/analytics" className="w-full">
                <Button variant="outline" className="w-full border-slate-200 hover:border-[#1a73e8] hover:bg-[#1a73e8]/5">
                  View Detailed Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Recent Test History */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">Recent Test History</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              {testHistory.length > 0 ? (
                  <div className="space-y-4">
                    {testHistory.slice(0, 3).map((test, index) => (
                        <div key={test.id} className="flex items-center gap-4 rounded-2xl border border-slate-200/50 p-4 hover:shadow-md transition-all">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                              index === 0 ? "bg-gradient-to-br from-[#1a73e8] to-[#4285f4]" :
                                  index === 1 ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                                      "bg-gradient-to-br from-purple-500 to-violet-600"
                          }`}>
                            <FileText className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">{test.test_name}</h3>
                              <Badge className={`${
                                  test.percentage >= 80 ? "bg-green-100 text-green-800 border-green-200" :
                                      test.percentage >= 60 ? "bg-blue-100 text-blue-800 border-blue-200" :
                                          "bg-orange-100 text-orange-800 border-orange-200"
                              }`}>
                                {test.percentage}%
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500">
                              {test.submitted_at} • {test.correct_answers}/{test.total_questions} correct
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No test history available</p>
                  </div>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/analytics" className="w-full">
                <Button variant="outline" className="w-full border-slate-200 hover:border-[#1a73e8] hover:bg-[#1a73e8]/5">
                  View Full History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Study Material Recommendations */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Recommended Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    Physics: {performance?.weakestSubject === "physics" ? "Weak Areas" : "Advanced Topics"}
                  </h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  {performance?.weakestSubject === "physics"
                      ? "Focus on your weakest areas in Physics to improve overall performance"
                      : "Explore advanced physics concepts to boost your scores"}
                </p>
                <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-blue-500 hover:bg-blue-50">
                  View Material
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    Chemistry: {performance?.weakestSubject === "chemistry" ? "Core Concepts" : "Problem Solving"}
                  </h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  {performance?.weakestSubject === "chemistry"
                      ? "Master the core chemistry concepts that are fundamental for exams"
                      : "Practice advanced problem solving techniques in chemistry"}
                </p>
                <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-green-500 hover:bg-green-50">
                  View Material
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900">
                    Mathematics: {performance?.weakestSubject === "maths" ? "Foundations" : "Advanced Techniques"}
                  </h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  {performance?.weakestSubject === "maths"
                      ? "Strengthen your mathematical foundations for better problem solving"
                      : "Learn advanced mathematical techniques to solve complex problems"}
                </p>
                <Button variant="outline" size="sm" className="w-full border-slate-200 hover:border-purple-500 hover:bg-purple-50">
                  View Material
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="#" className="w-full">
              <Button variant="outline" className="w-full border-slate-200 hover:border-[#1a73e8] hover:bg-[#1a73e8]/5">
                Browse All Study Materials
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Exam Schedule */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-6 w-6 text-[#1a73e8]" />
              {studentData.exam_type || "JEE Main"} 2024 Exam Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-left font-semibold text-slate-900">Session</th>
                  <th className="py-4 px-4 text-left font-semibold text-slate-900">Application Period</th>
                  <th className="py-4 px-4 text-left font-semibold text-slate-900">Exam Dates</th>
                  <th className="py-4 px-4 text-left font-semibold text-slate-900">Result Date</th>
                </tr>
                </thead>
                <tbody>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-medium">January Session</td>
                  <td className="py-4 px-4 text-slate-600">November 1-30, 2023</td>
                  <td className="py-4 px-4 text-slate-600">January 24-31, 2024</td>
                  <td className="py-4 px-4 text-slate-600">February 12, 2024</td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-medium">April Session</td>
                  <td className="py-4 px-4 text-slate-600">February 1-28, 2024</td>
                  <td className="py-4 px-4 text-slate-600">April 4-15, 2024</td>
                  <td className="py-4 px-4 text-slate-600">April 25, 2024</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-medium">May Session</td>
                  <td className="py-4 px-4 text-slate-600">March 1-31, 2024</td>
                  <td className="py-4 px-4 text-slate-600">May 10-20, 2024</td>
                  <td className="py-4 px-4 text-slate-600">June 2, 2024</td>
                </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Latest Announcements */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Latest Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Special Doubt Clearing Session</h3>
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">New</Badge>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  Join our special doubt clearing session for {studentData.exam_type || "JEE Main"} Physics on Saturday, 10 AM.
                  Expert faculty will address all your queries.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Posted 2 hours ago</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-[#1a73e8] hover:bg-[#1a73e8]/5">
                    Read More <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">New Study Materials Added</h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  We've added comprehensive new study materials for Organic Chemistry and Coordinate Geometry.
                  Download them from your study material section.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Posted 1 day ago</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-[#1a73e8] hover:bg-[#1a73e8]/5">
                    Read More <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg transition-all">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Mock Test Schedule Updated</h3>
                </div>
                <p className="mb-4 text-sm text-slate-600 leading-relaxed">
                  The mock test schedule for May has been updated with additional practice tests.
                  Check your dashboard for the latest schedule.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Posted 3 days ago</span>
                  <Button variant="ghost" size="sm" className="gap-1 text-[#1a73e8] hover:bg-[#1a73e8]/5">
                    Read More <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
  )
}