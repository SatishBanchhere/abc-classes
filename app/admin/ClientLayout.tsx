// app/admin/layout.tsx
"use client"

import { useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Loader2, Lock, Eye, EyeOff, Mail, KeyRound, Settings, Shield, BarChart3, Users, FileText, Award, TrendingUp, Zap, BookOpen, Target, CheckCircle, ArrowRight } from "lucide-react"
import AdminLayout from "@/components/admin/AdminLayout"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HomePageData } from "@/lib/data-fetcher"

export default function AdminRootLayout({homeData, children} : {homeData:HomePageData, children: ReactNode}) {
    const { toast } = useToast()
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const [loading, setLoading] = useState(false)
    const [loginAttempts, setLoginAttempts] = useState(0)
    const [isBlocked, setIsBlocked] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const idToken = await user.uid
                    const response = await fetch("/api/admin/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${idToken}`,
                        },
                    })

                    if (response.ok) {
                        setUser(user)
                    } else {
                        await signOut(auth)
                        toast({
                            title: "Access Denied",
                            description: "You don't have admin privileges",
                            variant: "destructive",
                        })
                    }
                } catch (error) {
                    console.error("Verification error:", error)
                    await signOut(auth)
                }
            }
            setCheckingAuth(false)
        })

        return () => unsubscribe()
    }, [toast])

    useEffect(() => {
        if (loginAttempts >= 5) {
            setIsBlocked(true)
            const timer = setTimeout(() => {
                setIsBlocked(false)
                setLoginAttempts(0)
            }, 300000)
            return () => clearTimeout(timer)
        }
    }, [loginAttempts])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isBlocked) {
            toast({
                title: "Too Many Attempts",
                description: "Please wait 5 minutes before trying again",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const idToken = await userCredential.user.uid
            const response = await fetch("/api/admin/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
            })

            if (response.ok) {
                setUser(userCredential.user)
                setLoginAttempts(0)
                toast({
                    title: "Welcome back!",
                    description: "Successfully logged into admin portal",
                })
            } else {
                await signOut(auth)
                throw new Error("You don't have admin privileges")
            }
        } catch (error) {
            setLoginAttempts(prev => prev + 1)
            toast({
                title: "Login Failed",
                description: error instanceof Error ? error.message : "An unknown error occurred",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await signOut(auth)
            setUser(null)
            toast({
                title: "Logged out successfully",
            })
        } catch (error:any) {
            toast({
                title: "Logout Failed",
                description: error.message,
                variant: "destructive",
            })
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Settings className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-ping opacity-20"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800">Authenticating...</h3>
                        <p className="text-gray-600 text-sm">Verifying your credentials</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
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
                                    <Settings className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl animate-pulse opacity-30"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                                <p className="text-blue-200 text-lg">KK Mishra Classes</p>
                            </div>
                        </div>

                        {/* Hero Content */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-bold text-white leading-tight">
                                    Powerful
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400"> Admin </span>
                                    Dashboard
                                </h2>
                                <p className="text-xl text-blue-100 leading-relaxed">
                                    Complete control over your educational platform. Manage tests, track student progress,
                                    and analyze performance with advanced analytics.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto px-4">
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mb-1">{homeData.successRate}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.successRateText}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1">{homeData.studentsCount}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.studentsCountText}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1">{homeData.neetSelections}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.neetSelectionsText}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-1">{homeData.mhtcetSelections}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.mhtcetSelectionsText}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1">{homeData.iitSelections}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.iitSelectionsText}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 mb-1">{homeData.iiserniserSelections}</div>
                                    <div className="text-white font-medium text-xs sm:text-sm">{homeData.iiserniserSelectionsText}</div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-semibold text-white mb-6">Platform Features</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Advanced Analytics</p>
                                            <p className="text-blue-200 text-sm">Real-time insights</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Test Management</p>
                                            <p className="text-blue-200 text-sm">Create & monitor</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                            <Target className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Performance Tracking</p>
                                            <p className="text-blue-200 text-sm">Student progress</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                                            <Award className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">Result Analysis</p>
                                            <p className="text-blue-200 text-sm">Detailed reports</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Stats */}
                            <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-semibold">System Status</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-green-300 text-sm">All systems operational</span>
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
                                <Settings className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                                <p className="text-blue-200 text-sm">KK Mishra Classes</p>
                            </div>
                        </div>

                        {/* Login Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                            <div className="px-8 py-8">
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                                            <Lock className="w-8 h-8 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                                        <p className="mt-2 text-blue-200">
                                            Sign in to access your dashboard
                                        </p>
                                    </div>

                                    {/* Security Warnings */}
                                    {loginAttempts > 2 && !isBlocked && (
                                        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 backdrop-blur-sm">
                                            <div className="flex items-center">
                                                <Shield className="w-4 h-4 text-yellow-300 mr-2" />
                                                <p className="text-sm text-yellow-200">
                                                    Warning: {5 - loginAttempts} attempts remaining
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {isBlocked && (
                                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 backdrop-blur-sm">
                                            <div className="flex items-center">
                                                <Lock className="w-4 h-4 text-red-300 mr-2" />
                                                <p className="text-sm text-red-200">
                                                    Account temporarily locked. Try again in 5 minutes.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleLogin} className="space-y-6">
                                        {/* Email Field */}
                                        <div>
                                            <Label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="Enter your email"
                                                    required
                                                    disabled={isBlocked}
                                                    className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                                                />
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                {email && (
                                                    <CheckCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div>
                                            <Label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                                                Password
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Enter your password"
                                                    required
                                                    disabled={isBlocked}
                                                    className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/50 rounded-lg h-12"
                                                />
                                                <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isBlocked}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Remember me & Forgot password */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <input
                                                    id="remember-me"
                                                    name="remember-me"
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-white/30 rounded bg-white/10"
                                                />
                                                <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-200">
                                                    Remember me
                                                </label>
                                            </div>
                                            <div className="text-sm">
                                                <button
                                                    type="button"
                                                    className="font-medium text-blue-300 hover:text-blue-200 transition-colors"
                                                    disabled={isBlocked}
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 h-12"
                                            disabled={loading || isBlocked || !email || !password}
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center">
                                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                    Authenticating...
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <span>Sign In</span>
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </div>
                                            )}
                                        </Button>
                                    </form>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-8 py-4 bg-white/5 border-t border-white/10">
                                <div className="flex items-center justify-center space-x-2 text-xs text-blue-200">
                                    <Shield className="w-3 h-3" />
                                    <span>Protected by enterprise-grade security</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-blue-300">
                                Need help? Contact support at{" "}
                                <a href="mailto:support@kkmishraclasses.com" className="text-blue-200 hover:text-white underline">
                                    support@kkmishraclasses.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AdminLayout title="Admin Panel" onLogout={handleLogout}>
            {children}
        </AdminLayout>
    )
}
