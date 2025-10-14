"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    BookOpen,
    Trophy,
    TrendingUp,
    Eye,
    Star,
    Image,
    Play,
    Megaphone,
    Activity,
    Calendar,
    BarChart3
} from "lucide-react"
import Link from 'next/link'
import { HomePageData } from '@/lib/data-fetcher'

export default function AdminDashboard({homeData} : {homeData:HomePageData}) {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTestimonials: 0,
        totalFeatures: 0,
        totalGalleryImages: 0,
        totalYouTubeVideos: 0,
        advertisementEnabled: false,
        successRate: "0%",
        iitSelections: "0",
        loading: true
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStats({
                    totalStudents: parseInt(homeData.studentsCount.replace(/[^\d]/g, '')) || 0,
                    totalTestimonials: homeData.testimonials.length,
                    totalFeatures: homeData.features.length,
                    totalGalleryImages: homeData.galleryImages.length,
                    totalYouTubeVideos: homeData.youtubeVideos.length,
                    advertisementEnabled: homeData.advertisement.enabled,
                    successRate: homeData.successRate,
                    iitSelections: homeData.iitSelections,
                    loading: false
                })
            } catch (error) {
                console.error('Error fetching stats:', error)
                setStats(prev => ({ ...prev, loading: false }))
            }
        }

        fetchStats()
    }, [])

    const quickActions = [
        { icon: Image, label: 'Add Gallery Image', href: '/admin/gallery', color: 'bg-blue-500' },
        { icon: Star, label: 'Add Testimonial', href: '/admin/testimonials', color: 'bg-yellow-500' },
        { icon: Play, label: 'Add YouTube Video', href: '/admin/youtube-videos', color: 'bg-red-500' },
        { icon: Megaphone, label: 'Update Advertisement', href: '/admin/advertisement', color: 'bg-purple-500' },
        { icon: BookOpen, label: 'Edit JEE Page', href: '/admin/jee', color: 'bg-green-500' },
        { icon: Users, label: 'Update Results', href: '/admin/results', color: 'bg-indigo-500' },
    ]

    const statCards = [
        { title: 'Total Students', value: stats.totalStudents.toLocaleString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: 'Success Rate', value: stats.successRate, icon: Trophy, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: 'IIT Selections', value: stats.iitSelections, icon: BookOpen, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { title: 'Testimonials', value: stats.totalTestimonials, icon: Star, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { title: 'Gallery Images', value: stats.totalGalleryImages, icon: Image, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { title: 'YouTube Videos', value: stats.totalYouTubeVideos, icon: Play, color: 'text-red-600', bgColor: 'bg-red-50' },
    ]

    if (stats.loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your website.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto px-4">
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 mb-1">{homeData.successRate}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.successRateText}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1">{homeData.studentsCount}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.studentsCountText}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 mb-1">{homeData.neetSelections}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.neetSelectionsText}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 mb-1">{homeData.mhtcetSelections}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.mhtcetSelectionsText}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 mb-1">{homeData.iitSelections}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.iitSelectionsText}</div>
                </div>
                <div className="text-center">
                    <div className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-600 mb-1">{homeData.iiserniserSelections}</div>
                    <div className="text-gray-600 font-medium text-xs sm:text-sm">{homeData.iiserniserSelectionsText}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Quick Actions
                    </CardTitle>
                    <CardDescription>
                        Manage your website content with these quick shortcuts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action, index) => (
                            <Link key={index} href={action.href}>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className={`p-2 rounded-full ${action.color} text-white mr-3`}>
                                        <action.icon className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">{action.label}</div>
                                        <div className="text-sm text-gray-500">Click to manage</div>
                                    </div>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Latest updates and changes to your website
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Eye className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium">Homepage viewed</p>
                                <p className="text-sm text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Star className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium">New testimonial added</p>
                                <p className="text-sm text-gray-500">1 day ago</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                <Megaphone className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium">Advertisement updated</p>
                                <p className="text-sm text-gray-500">3 days ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}