"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trophy, Mail, Lock, User, Phone, AlertCircle, GraduationCap, Users, BookOpen, Target, Award, TrendingUp, Eye, EyeOff, ArrowRight, CheckCircle, Shield, Zap, BarChart3, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

export default function RegisterPage() {
  // Student form state
  const [studentData, setStudentData] = useState({
    name: "",
    phone_number: "",
    phone_parent: "",
    email: "",
    exam_type: "",
    password: "",
    confirmPassword: "",
    isVerified: false,
  })

  // Teacher form state
  const [teacherData, setTeacherData] = useState({
    name: "",
    phone_number: "",
    email: "",
    exam_type: "",
    password: "",
    confirmPassword: "",
  })

  const [showStudentPassword, setShowStudentPassword] = useState(false)
  const [showStudentConfirmPassword, setShowStudentConfirmPassword] = useState(false)
  const [showTeacherPassword, setShowTeacherPassword] = useState(false)
  const [showTeacherConfirmPassword, setShowTeacherConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("student")
  const router = useRouter()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (studentData.password !== studentData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          studentData.email,
          studentData.password
      )

      // Store additional user data in Firestore
      await setDoc(doc(db, "students", userCredential.user.uid), {
        name: studentData.name,
        phone_number: studentData.phone_number,
        phone_parent: studentData.phone_parent,
        email: studentData.email,
        exam_type: studentData.exam_type,
        createdAt: new Date(),
        role: "student"
      })

      fetch("/api/revalidateit?path=/admin/students")
          .then(res => res.json())
          .then(data => console.log(data))
          .catch(err => console.error(err));

      router.push("/auth/login")
    } catch (err: any) {
      console.error(err)
      setError(getFirebaseErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (teacherData.password !== teacherData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
          auth,
          teacherData.email,
          teacherData.password
      )

      // Store additional user data in Firestore
      await setDoc(doc(db, "teachers", userCredential.user.uid), {
        name: teacherData.name,
        phone_number: teacherData.phone_number,
        email: teacherData.email,
        exam_type: teacherData.exam_type,
        createdAt: new Date(),
        role: "teacher"
      })

      router.push("/teachers")
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  // Helper function to convert Firebase error codes to user-friendly messages
  const getFirebaseErrorMessage = (code: string): string => {
    switch (code) {
      case "auth/email-already-in-use":
        return "Email already in use. Please use a different email."
      case "auth/invalid-email":
        return "Invalid email address format."
      case "auth/weak-password":
        return "Password should be at least 6 characters."
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled."
      default:
        return "Registration failed. Please try again."
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
                <h1 className="text-3xl font-bold text-white">ABC Classes</h1>
                <p className="text-blue-200 text-lg">Excellence in Education</p>
              </div>
            </div>

            {/* Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white leading-tight">
                  Join Our
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Learning </span>
                  Community
                </h2>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Create your account and embark on a transformative educational journey
                  with expert guidance, personalized learning, and comprehensive exam preparation.
                </p>
              </div>

              {/* Registration Benefits */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">10K+</p>
                      <p className="text-blue-200 text-sm">Practice Questions</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Target className="w-8 h-8 text-indigo-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">200+</p>
                      <p className="text-blue-200 text-sm">Mock Tests</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center space-x-3">
                    <Award className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-2xl font-bold text-white">24/7</p>
                      <p className="text-blue-200 text-sm">Support</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features for Students */}
              {activeTab === "student" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6">Student Registration Benefits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Unlimited Access</p>
                          <p className="text-blue-200 text-sm">All study materials</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Progress Tracking</p>
                          <p className="text-blue-200 text-sm">Detailed analytics</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Personalized Plans</p>
                          <p className="text-blue-200 text-sm">Custom learning path</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Peer Learning</p>
                          <p className="text-blue-200 text-sm">Study groups</p>
                        </div>
                      </div>
                    </div>
                  </div>
              )}

              {/* Features for Teachers */}
              {activeTab === "teacher" && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white mb-6">Teacher Registration Benefits</h3>
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
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Content Creation</p>
                          <p className="text-blue-200 text-sm">Build custom tests</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Advanced Analytics</p>
                          <p className="text-blue-200 text-sm">Performance insights</p>
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
                    <p className="text-white font-semibold">Registration Status</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300 text-sm">Open for new registrations</span>
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

        {/* Right Side - Enhanced Registration Form */}
        <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-12 relative z-10 overflow-y-auto">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3 mb-8 lg:hidden">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ABC Classes</h1>
                <p className="text-blue-200 text-sm">Excellence in Education</p>
              </div>
            </div>

            {/* Registration Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
              <div className="px-8 py-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                      <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="mt-2 text-blue-200">
                      Choose your account type to get started
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
                      <form onSubmit={handleStudentRegister} className="space-y-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <Input
                                type="text"
                                placeholder="Enter your full name"
                                value={studentData.name}
                                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {studentData.name && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={studentData.phone_number}
                                onChange={(e) => setStudentData({ ...studentData, phone_number: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {studentData.phone_number && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Parent's Phone */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Parent's Phone Number
                          </label>
                          <div className="relative">
                            <Input
                                type="tel"
                                placeholder="Enter parent's phone number"
                                value={studentData.phone_parent}
                                onChange={(e) => setStudentData({ ...studentData, phone_parent: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {studentData.phone_parent && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={studentData.email}
                                onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {studentData.email && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Exam Type */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Exam Type
                          </label>
                          <Select
                              value={studentData.exam_type}
                              onValueChange={(value) => setStudentData({ ...studentData, exam_type: value })}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12">
                              <SelectValue placeholder="Select Exam Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="JEE Main" className="text-white hover:bg-slate-700">JEE Main</SelectItem>
                              <SelectItem value="JEE Advanced" className="text-white hover:bg-slate-700">JEE Advanced</SelectItem>
                              <SelectItem value="NEET" className="text-white hover:bg-slate-700">NEET</SelectItem>
                              <SelectItem value="BITSAT" className="text-white hover:bg-slate-700">BITSAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showStudentPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={studentData.password}
                                onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                                required
                                minLength={6}
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

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showStudentConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={studentData.confirmPassword}
                                onChange={(e) => setStudentData({ ...studentData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowStudentConfirmPassword(!showStudentConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showStudentConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12"
                            disabled={loading}
                        >
                          {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Creating Account...
                              </div>
                          ) : (
                              <div className="flex items-center justify-center">
                                <span>Create Student Account</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </div>
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="teacher" className="space-y-4 mt-6">
                      <form onSubmit={handleTeacherRegister} className="space-y-4">
                        {/* Full Name */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Full Name
                          </label>
                          <div className="relative">
                            <Input
                                type="text"
                                placeholder="Enter your full name"
                                value={teacherData.name}
                                onChange={(e) => setTeacherData({ ...teacherData, name: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {teacherData.name && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Input
                                type="tel"
                                placeholder="Enter your phone number"
                                value={teacherData.phone_number}
                                onChange={(e) => setTeacherData({ ...teacherData, phone_number: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {teacherData.phone_number && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Email Address
                          </label>
                          <div className="relative">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={teacherData.email}
                                onChange={(e) => setTeacherData({ ...teacherData, email: e.target.value })}
                                required
                                className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            {teacherData.email && (
                                <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        {/* Exam Type */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Specialization
                          </label>
                          <Select
                              value={teacherData.exam_type}
                              onValueChange={(value) => setTeacherData({ ...teacherData, exam_type: value })}
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12">
                              <SelectValue placeholder="Select Specialization" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="JEE Main" className="text-white hover:bg-slate-700">JEE Main</SelectItem>
                              <SelectItem value="JEE Advanced" className="text-white hover:bg-slate-700">JEE Advanced</SelectItem>
                              <SelectItem value="NEET" className="text-white hover:bg-slate-700">NEET</SelectItem>
                              <SelectItem value="BITSAT" className="text-white hover:bg-slate-700">BITSAT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Password */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showTeacherPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={teacherData.password}
                                onChange={(e) => setTeacherData({ ...teacherData, password: e.target.value })}
                                required
                                minLength={6}
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

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Input
                                type={showTeacherConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={teacherData.confirmPassword}
                                onChange={(e) => setTeacherData({ ...teacherData, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                                className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-indigo-400 focus:ring-indigo-400/50 rounded-lg h-12"
                            />
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <button
                                type="button"
                                onClick={() => setShowTeacherConfirmPassword(!showTeacherConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showTeacherConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12"
                            disabled={loading}
                        >
                          {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                Creating Account...
                              </div>
                          ) : (
                              <div className="flex items-center justify-center">
                                <span>Create Teacher Account</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </div>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  {/* Sign In Link */}
                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-blue-200">
                      Already have an account?{" "}
                      <Link href="/auth/login" className="text-blue-300 hover:text-white font-medium underline underline-offset-4">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-white/5 border-t border-white/10">
                <div className="flex items-center justify-center space-x-2 text-xs text-blue-200">
                  <Shield className="w-3 h-3" />
                  <span>Your information is protected with enterprise-grade security</span>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-blue-300">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-blue-200 hover:text-white underline underline-offset-4">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-200 hover:text-white underline underline-offset-4">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
  )
}
