// "use client"
import { Video, Trophy, Star, Play, Calendar, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getMediaPageData, getHomePageData } from "@/lib/data-fetcher"
import React from "react"

export default async function MediaPage() {
    const homeData = await getHomePageData()
    const mediaData = await getMediaPageData()

    const getYouTubeEmbedUrl = (url: string) => {
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/;
        const match = url?.match(regex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case "interview":
                return (
                    <Badge className="bg-blue-600 text-white mr-1">
                        <Video className="w-4 h-4 mr-1 inline" />
                        Interview
                    </Badge>
                );
            case "testimonial":
                return (
                    <Badge className="bg-yellow-500 text-white mr-1">
                        <Star className="w-4 h-4 mr-1 inline" />
                        Testimonial
                    </Badge>
                );
            case "achievement":
                return (
                    <Badge className="bg-green-600 text-white mr-1">
                        <Trophy className="w-4 h-4 mr-1 inline" />
                        Achievement
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-600 text-white mr-1">
                        <Play className="w-4 h-4 mr-1 inline" />
                        Other
                    </Badge>
                );
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col relative overflow-hidden">
            <Header
                siteName={homeData.siteName}
                siteTagline={homeData.siteTagline}
                logoUrl={homeData.logoUrl}
            />

            {/* Hero Section */}
            <section className="relative py-24 px-6 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
                <div className="container mx-auto text-center relative z-10">
                    {mediaData.heroImage && (
                        <img
                            src={mediaData.heroImage}
                            alt="Media page hero"
                            className="mx-auto mb-8 rounded-xl w-full max-w-3xl object-cover shadow"
                        />
                    )}
                    <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#1a73e8] to-[#4285f4] bg-clip-text text-transparent">
              {mediaData.pageTitle}
            </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 mb-2 max-w-3xl mx-auto leading-relaxed">
                        {mediaData.pageDescription}
                    </p>
                </div>
            </section>

            {/* Featured Videos */}
            {mediaData.mediaVideos.some(v => v.featured) && (
                <section className="py-12 px-6 bg-white relative z-10">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">Featured Videos</h2>
                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-12">
                            {mediaData.mediaVideos.filter(v => v.featured).map((video, index) => (
                                <Card key={video.url + index} className="relative">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-lg mb-2">
                                            {getCategoryLabel(video.category)}
                                            <span className="flex items-center text-yellow-600">
                        <Star className="w-4 h-4 fill-current mr-1" />Featured
                      </span>
                                        </CardTitle>
                                        <CardDescription className="mt-2 font-bold text-gray-900">{video.title}</CardDescription>
                                        <div className="text-gray-500 flex items-center text-sm mt-1">
                                            <Calendar className="w-4 h-4 mr-1" />{video.date || ""}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="aspect-video mb-4 rounded-xl overflow-hidden border">
                                            <iframe
                                                src={getYouTubeEmbedUrl(video.url)}
                                                title={video.title}
                                                className="w-full h-full"
                                                allowFullScreen
                                            />
                                        </div>
                                        {video.description && (
                                            <p className="text-gray-700">{video.description}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* All Videos */}
            <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50/30 relative z-10">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-slate-900 text-center">All Media Videos</h2>
                    {mediaData.mediaVideos.filter(v => !v.featured).length === 0 && (
                        <div className="text-slate-500 text-center py-12">No media videos added yet.</div>
                    )}
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-12">
                        {mediaData.mediaVideos.filter(v => !v.featured).map((video, index) => (
                            <Card key={video.url + index}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg mb-2">
                                        {getCategoryLabel(video.category)}
                                    </CardTitle>
                                    <CardDescription className="mt-2 font-bold text-gray-900">{video.title}</CardDescription>
                                    <div className="text-gray-500 flex items-center text-sm mt-1">
                                        <Calendar className="w-4 h-4 mr-1" />{video.date || ""}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="aspect-video mb-4 rounded-xl overflow-hidden border">
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.url)}
                                            title={video.title}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                    {video.description && (
                                        <p className="text-gray-700">{video.description}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <Footer
                siteName={homeData.siteName}
                footerDescription={homeData.footerDescription}
                // quickLinks={homeData.quickLinks}
                programs={homeData.programs}
                contactPhone={homeData.contactPhone}
                contactEmail={homeData.contactEmail}
                contactAddress={homeData.contactAddress}
                copyrightText={homeData.copyrightText}
            />
        </div>
    )
}
