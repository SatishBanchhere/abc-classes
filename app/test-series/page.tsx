"use client"

import { useEffect, useState, useMemo } from "react"
import { BookOpen, Target, Users, ChevronRight, Timer, Award, Brain, TrendingUp, BarChart3, Zap, Clock, FileText, CheckCircle, Play, Star, Calendar, Trophy, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getHomePageData } from "@/lib/data-fetcher"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore"
import type { TestConfig } from "@/types/TestConfig"

type Test = {
  id: string
  examType: string
  correctMarks: number
  wrongMarks: number
  status: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
  started?: boolean
  subjectWise?: Record<string, number>
  totalTime: number
  testConfig: TestConfig
}

interface HomePageData {
  siteName: string
  siteTagline: string
  logoUrl: string
  footerDescription: string
  quickLinks: any[]
  programs: any[]
  contactPhone: string
  contactEmail: string
  contactAddress: string
  copyrightText: string
}

export default function TestSeriesPage() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null)

        // Fetch home page data
        const homePageData = await getHomePageData()
        setHomeData(homePageData)

        // Fetch tests from Firestore
        const testsSnapshot = await getDocs(collection(db, "tests"))
        const testsData = testsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Test, 'id'>),
        }))

        console.log("Firebase tests data:", testsData)
        setTests(testsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load tests. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function to calculate total questions from subjectWise
  const getTotalQuestions = (test: Test) => {
    const subjectWise = test.testConfig?.subjectWise || test.subjectWise
    if (!subjectWise) return 0
    return Object.values(subjectWise).reduce((total, count) => total + count, 0)
  }

  // Helper function to calculate total marks
  const getTotalMarks = (test: Test) => {
    const totalQuestions = getTotalQuestions(test)
    return totalQuestions * (test.testConfig?.correctMarks || test.correctMarks || 4)
  }

  // Get all active tests
  const getActiveTests = (examType: string) => {
    return tests.filter(test => {
      if (!test.testConfig?.examType && !test.examType) return false

      const testExamType = (test.testConfig?.examType || test.examType || "").toLowerCase()
      const targetType = examType.toLowerCase()
      const isTypeMatch = examType === "all" || testExamType.includes(targetType) || testExamType === targetType

      // Show test if it's started OR if status is active
      const isActive = test.started === true ||
          test.status === "active" ||
          test.testConfig?.status === "active"

      return isTypeMatch && isActive
    })
  }

  // Convert minutes to readable format
  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  // Memoize test categories
  const testCategories = useMemo(() => [
    {
      id: "all",
      title: "All Tests",
      description: "All available tests across all categories",
      icon: Trophy,
      color: "from-slate-600 to-slate-700",
      gradientBg: "from-slate-50 to-slate-100",
      tests: getActiveTests("all"),
    },
    {
      id: "jee-main",
      title: "JEE Main",
      description: "Engineering entrance exam preparation",
      icon: Target,
      color: "from-blue-500 to-blue-600",
      gradientBg: "from-blue-50 to-blue-100",
      tests: getActiveTests("jeemain"),
    },
    {
      id: "jee-advanced",
      title: "JEE Advanced",
      description: "Advanced engineering entrance preparation",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      gradientBg: "from-purple-50 to-purple-100",
      tests: getActiveTests("jeeadvanced"),
    },
    {
      id: "neet",
      title: "NEET",
      description: "Medical entrance exam preparation",
      icon: BookOpen,
      color: "from-green-500 to-green-600",
      gradientBg: "from-green-50 to-green-100",
      tests: getActiveTests("neet"),
    },
  ], [tests])

  const currentCategory = testCategories.find(cat => cat.id === selectedCategory) || testCategories[0]
  const totalActiveTests = tests.filter(test =>
      test.started === true || test.status === "active" || test.testConfig?.status === "active"
  ).length

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <BookOpen className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Loading Test Series...</h3>
              <p className="text-blue-200 text-sm">Fetching your practice tests</p>
            </div>
          </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-6 bg-white/10 backdrop-blur-xl p-8 rounded-2xl border border-white/20">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Error Loading Tests</h2>
              <p className="text-red-200">{error}</p>
            </div>
            <Button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
            >
              Try Again
            </Button>
          </div>
        </div>
    )
  }

  if (!homeData) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-blue-600 rounded-xl flex items-center justify-center animate-pulse">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Loading...</h2>
          </div>
        </div>
    )
  }

  return (
      <>
        <div className="flex min-h-screen w-full flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
          <Header siteName={homeData.siteName} siteTagline={homeData.siteTagline} logoUrl={homeData.logoUrl} />

          {/* Enhanced Hero Section */}
          <section className="relative py-20 px-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_70%)]"></div>
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(99,102,241,0.1),transparent_70%)]"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(139,92,246,0.1),transparent_70%)]"></div>

              {/* Floating Elements */}
              <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-40 right-32 w-6 h-6 bg-indigo-400 rounded-full opacity-30 animate-bounce"></div>
              <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full opacity-25 animate-ping"></div>
            </div>

            <div className="container mx-auto text-center relative z-10">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Test Series
                  </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-3xl mx-auto">
                    Master your exam preparation with our comprehensive test series designed for
                    <span className="text-blue-300 font-semibold"> JEE & NEET </span>
                    success
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center space-x-3">
                      <BookOpen className="w-8 h-8 text-blue-400" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{totalActiveTests}</p>
                        <p className="text-blue-200 text-sm">Active Tests</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center space-x-3">
                      <Timer className="w-8 h-8 text-indigo-400" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">24/7</p>
                        <p className="text-blue-200 text-sm">Available</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-center space-x-3">
                      <Award className="w-8 h-8 text-purple-400" />
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">100%</p>
                        <p className="text-blue-200 text-sm">Free Access</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
                  {testCategories.map((category) => (
                      <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                              selectedCategory === category.id
                                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                                  : "bg-white/10 text-blue-200 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                          }`}
                      >
                        <category.icon className="w-5 h-5" />
                        <span>{category.title}</span>
                        <Badge className="bg-white/20 text-white border-0 text-xs">
                          {category.tests.length}
                        </Badge>
                      </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Enhanced Test Cards Section */}
          <section className="py-16 px-6 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10">
            <div className="container mx-auto">
              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`h-16 w-16 bg-gradient-to-br ${currentCategory.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <currentCategory.icon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-slate-900">{currentCategory.title}</h2>
                    <p className="text-slate-600 text-lg">{currentCategory.description}</p>
                  </div>
                  <Badge className={`ml-auto bg-gradient-to-r ${currentCategory.color} text-white border-0 px-4 py-2 text-base`}>
                    {currentCategory.tests.length} Tests Available
                  </Badge>
                </div>
              </div>

              {currentCategory.tests.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {currentCategory.tests.map((test) => {
                      const totalQuestions = getTotalQuestions(test)
                      const totalMarks = getTotalMarks(test)
                      const paperName = test.testConfig?.paperName || test.testConfig?.branchName || `Test ${test.id.slice(0, 8)}`
                      const examType = test.testConfig?.examType || test.examType || currentCategory.title
                      const isActive = test.started === true || test.status === "active" || test.testConfig?.status === "active"
                      const subjectWise = test.testConfig?.subjectWise || test.subjectWise

                      return (
                          <Card
                              key={test.id}
                              className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br ${currentCategory.gradientBg} backdrop-blur-sm relative overflow-hidden group`}
                          >
                            {/* Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                              <currentCategory.icon className="w-full h-full text-slate-400" />
                            </div>

                            <CardHeader className="pb-4 relative z-10">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <Badge className={`bg-gradient-to-r ${currentCategory.color} text-white border-0 shadow-lg`}>
                                    {examType.toUpperCase()}
                                  </Badge>
                                  <Badge
                                      className={`${isActive
                                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                                          : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                                      } border-0 shadow-lg`}
                                  >
                                    {isActive ? (
                                        <div className="flex items-center space-x-1">
                                          <CheckCircle className="w-3 h-3" />
                                          <span>Active</span>
                                        </div>
                                    ) : (
                                        "Inactive"
                                    )}
                                  </Badge>
                                </div>
                              </div>
                              <CardTitle className="text-2xl font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {paperName}
                              </CardTitle>
                              <CardDescription className="text-slate-600 line-clamp-2 text-base">
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4" />
                                  <span>{test.testConfig?.paperType || "Practice Test"}</span>
                                </div>
                                {test.testConfig?.paperDate && (
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{test.testConfig.paperDate}</span>
                                    </div>
                                )}
                              </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6 relative z-10">
                              {/* Test Stats */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                  <div className="flex items-center space-x-2">
                                    <Timer className="h-5 w-5 text-blue-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Duration</p>
                                      <p className="font-bold text-slate-900">{formatTime(test.testConfig?.totalTime || test.totalTime)}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                  <div className="flex items-center space-x-2">
                                    <BookOpen className="h-5 w-5 text-indigo-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Questions</p>
                                      <p className="font-bold text-slate-900">{totalQuestions}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                  <div className="flex items-center space-x-2">
                                    <Award className="h-5 w-5 text-purple-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Total Marks</p>
                                      <p className="font-bold text-slate-900">{totalMarks}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                  <div className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    <div>
                                      <p className="text-sm text-slate-600">Marking</p>
                                      <p className="font-bold text-slate-900">
                                        <span className="text-green-600">
                                          +{test.testConfig?.correctMarks || test.correctMarks || 4}
                                        </span>,
                                        {test.testConfig.wrongMarks < 0 && (
                                            <span className="text-red-600">
                                         {test.testConfig.wrongMarks}
                                        </span>
                                        )}
                                      </p>

                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Subject Distribution */}
                              {subjectWise && Object.keys(subjectWise).length > 0 && (
                                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                                      <BarChart3 className="w-4 h-4 mr-2" />
                                      Subject Distribution
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {Object.entries(subjectWise).map(([subject, count]) => (
                                          <div key={subject} className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 capitalize">{subject}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {count}
                                            </Badge>
                                          </div>
                                      ))}
                                    </div>
                                  </div>
                              )}

                              {/* Action Button */}
                              <div className="pt-4">
                                {isActive ? (
                                    <Link href={`/test/${test.id}`}>
                                      <Button className={`w-full bg-gradient-to-r ${currentCategory.color} hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-12 text-base font-semibold`}>
                                        <Play className="mr-2 h-5 w-5" />
                                        Start Test
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                      </Button>
                                    </Link>
                                ) : (
                                    <Button disabled className="w-full h-12 text-base">
                                      Test Unavailable
                                    </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                      )
                    })}
                  </div>
              ) : (
                  <Card className={`border-2 border-dashed border-slate-200 bg-gradient-to-br ${currentCategory.gradientBg} backdrop-blur-sm`}>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <div className={`h-20 w-20 bg-gradient-to-br ${currentCategory.color} rounded-3xl flex items-center justify-center mb-6 opacity-60 shadow-xl`}>
                        <currentCategory.icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-700 mb-4">No Tests Available</h3>
                      <p className="text-slate-500 text-center max-w-md text-lg leading-relaxed">
                        Tests for {currentCategory.title} are being prepared.
                        <br />
                        <span className="text-blue-600 font-medium">Check back soon for exciting updates!</span>
                      </p>
                    </CardContent>
                  </Card>
              )}
            </div>
          </section>

          <Footer
              siteName={homeData.siteName}
              footerDescription={homeData.footerDescription}
              quickLinks={homeData.quickLinks}
              programs={homeData.programs}
              contactPhone={homeData.contactPhone}
              contactEmail={homeData.contactEmail}
              contactAddress={homeData.contactAddress}
              copyrightText={homeData.copyrightText}
          />
        </div>
      </>
  )
}
