"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trophy, Mail, Lock, AlertCircle, GraduationCap, Users, BookOpen, Target, Award, TrendingUp, Eye, EyeOff, ArrowRight, CheckCircle, Shield, Zap, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function LoginPage() {
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPassword, setStudentPassword] = useState("")
  const [teacherEmail, setTeacherEmail] = useState("")
  const [teacherPassword, setTeacherPassword] = useState("")
  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(
          auth,
          studentEmail,
          studentPassword
      )

      const studentDoc = await getDoc(doc(db, "students", userCredential.user.uid))

      if (!studentDoc.exists()) {
        await auth.signOut()
        throw new Error("No student account found with these credentials")
      }

      router.push("/")
    } catch (err: any) {
      setError(err.message || getFirebaseErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userCredential = await signInWithEmailAndPassword(
          auth,
          teacherEmail,
          teacherPassword
      )

      const teacherDoc = await getDoc(doc(db, "teachers", userCredential.user.uid))

      if (!teacherDoc.exists()) {
        await auth.signOut()
        throw new Error("No teacher account found with these credentials")
      }

      router.push("/teachers")
    } catch (err: any) {
      setError(err.message || getFirebaseErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address format."
      case "auth/user-disabled":
        return "This account has been disabled."
      case "auth/user-not-found":
        return "No account found with this email."
      case "auth/wrong-password":
        return "Incorrect password."
      case "auth/too-many-requests":
        return "Too many unsuccessful login attempts. Please try again later."
      default:
        return "Login failed. Please try again."
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_70%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_75%_25%,rgba(99,102,241,0.1),transparent_70%)]"></div>
          <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_75%,rgba(139,92,246,0.1),transparent_70%)]"></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-blue-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-32 w-6 h-6 bg-indigo-400 rounded-full opacity-30 animate-bounce"></div>
          <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-400 rounded-full opacity-25 animate-ping"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-blue-300 rounded-full opacity-20 animate-pulse"></div>
        </div>

        {/* Left Side - Enhanced Branding */}
        <div className="hidden lg:flex lg:w-3/5 flex-col justify-center px-16 relative z-10">
          <div className="max-w-2xl">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4 mb-12">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-pulse opacity-30"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">KK Mishra Classes</h1>
                <p className="text-blue-200 text-lg">Excellence in Education</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white leading-tight">
                  Your Journey to
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Success </span>
                  Starts Here
                </h2>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Join thousands of students and dedicated teachers in our comprehensive
                  learning platform designed for JEE & NEET preparation.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">5,247</p>
                      <p className="text-blue-200 text-sm">Active Students</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-indigo-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">47</p>
                      <p className="text-blue-200 text-sm">Expert Teachers</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Award className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">89%</p>
                      <p className="text-blue-200 text-sm">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features for Students */}
              {activeTab === "student" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6">Student Benefits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Interactive Tests</p>
                          <p className="text-blue-200 text-sm">Practice & improve</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Progress Tracking</p>
                          <p className="text-blue-200 text-sm">Monitor growth</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Personalized Learning</p>
                          <p className="text-blue-200 text-sm">Adaptive content</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Performance Analytics</p>
                          <p className="text-blue-200 text-sm">Detailed insights</p>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Features for Teachers */}
              {activeTab === "teacher" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6">Teacher Tools</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Class Management</p>
                          <p className="text-blue-200 text-sm">Organize students</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Advanced Analytics</p>
                          <p className="text-blue-200 text-sm">Track performance</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Content Creation</p>
                          <p className="text-blue-200 text-sm">Build custom tests</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Real-time Feedback</p>
                          <p className="text-blue-200 text-sm">Instant responses</p>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Live Stats */}
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold">Platform Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">All systems online</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-200 text-sm">Current Time</p>
                    <p className="text-white font-mono">{currentTime.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-12 relative z-10">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3 mb-8 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">KK Mishra Classes</h1>
                <p className="text-blue-200 text-sm">Excellence in Education</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="px-8 py-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                    <p className="mt-2 text-blue-200">
                      Choose your account type to continue
                    </p>
                  </div>

                  {error && (
                      <Alert className="bg-red-500/20 border-red-500/50 text-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                  )}

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
                      <TabsTrigger
                          value="student"
                          className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-200"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Student
                      </TabsTrigger>
                      <TabsTrigger
                          value="teacher"
                          className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-blue-200"
                      >
                        <Users className="h-4 w-4" />
                        Teacher
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="student" className="space-y-4 mt-6">
                      <form onSubmit={handleStudentLogin} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Student Email
                          </label>
                          <div className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your student email"
                                value={studentEmail}
                                onChange={(e) => setStudentEmail(e.target.value)}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {studentEmail && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showStudentPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={studentPassword}
                                onChange={(e) => setStudentPassword(e.target.value)}
                                required
                                className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowStudentPassword(!showStudentPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showStudentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12"
                            disabled={loading || !studentEmail || !studentPassword}
                        >
                          {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Signing in...
                              </div>
                          ) : (
                              <div className="flex items-center justify-center">
                                <span>Sign In as Student</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </div>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="teacher" className="space-y-4 mt-6">
                      <form onSubmit={handleTeacherLogin} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Teacher Email
                          </label>
                          <div className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your teacher email"
                                value={teacherEmail}
                                onChange={(e) => setTeacherEmail(e.target.value)}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {teacherEmail && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showTeacherPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={teacherPassword}
                                onChange={(e) => setTeacherPassword(e.target.value)}
                                required
                                className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showTeacherPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12"
                            disabled={loading || !teacherEmail || !teacherPassword}
                        >
                          {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Signing in...
                              </div>
                          ) : (
                              <div className="flex items-center justify-center">
                                <span>Sign In as Teacher</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </div>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Sign Up Link */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-blue-200">
                      Don't have an account?{" "}
                      <Link href="/auth/register" className="text-blue-300 hover:text-white font-medium underline underline-offset-4">
                        Sign up here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-xs text-blue-200">
                  <Shield className="w-3 h-3" />
                  <span>Your data is protected with end-to-end encryption</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-blue-300">
                Need help? Contact us at{" "}
                <a href="mailto:support@kkmishraclasses.com" className="text-blue-200 hover:text-white underline underline-offset-4">
                  support@kkmishraclasses.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
