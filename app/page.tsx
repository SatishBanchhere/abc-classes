// "use client"
import Image from "next/image"
import Link from "next/link"
import {
    Trophy,
    BookOpen,
    Users,
    Award,
    Star,
    ChevronRight,
    Play,
    CheckCircle,
    Sparkles,
    Target,
    TrendingUp,
    Loader2,
    ArrowRight,
    Zap,
    Clock,
    Phone,
    Mail,
    MapPin,
    Heart,
    School,
    GraduationCap,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {getHomePageData, HomePageData} from "@/lib/data-fetcher"
import React, {useState, useEffect} from 'react';

export default async function HomePage() {

    const homeData = await getHomePageData();

    const getYouTubeEmbedUrl = (url: string) => {
        console.log(url)
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/;
        const match = url?.match(regex);
        return match ? `https://www.youtube.com/embed/${match[1]}` : url;
    }

    if (!homeData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
                <div className="text-center px-4">
                    <div className="text-red-500 mb-4 text-3xl">⚠️</div>
                    <p className="text-gray-600 text-base">Unable to load content. Please try again later.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
            <Header siteName={homeData.siteName} siteTagline={homeData.siteTagline} logoUrl={homeData.logoUrl}/>

            {/* Hero Section - Mobile Optimized */}
            <section className="relative min-h-screen sm:min-h-[90vh] flex items-center justify-center overflow-hidden px-3 sm:px-4">
                {/* Animated Background Elements - Adjusted for Mobile */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-10 -left-10 sm:top-20 sm:-left-20 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 -right-10 sm:bottom-20 sm:-right-20 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-[600px] sm:h-[600px] bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
                </div>

                <div className="relative z-10 container mx-auto text-center">
                    <div className="max-w-5xl mx-auto">
                        {/* Badge - Mobile Optimized */}
                        <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium">
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2"/>
                            {homeData.siteTagline}
                        </Badge>

                        {/* Main Heading - Mobile Optimized */}
                        <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight px-2">
                            {homeData.heroTitle}
                        </h1>

                        {/* Subtitle - Mobile Optimized */}
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-3 sm:mb-4 font-medium px-2">
                            {homeData.heroSubtitle}
                        </p>

                        {/* Description - Mobile Optimized */}
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                            {homeData.heroDescription}
                        </p>

                        {/* CTA Buttons - Mobile Optimized */}
                        <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
                            <Link
                                href="/auth/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group text-sm sm:text-base"
                            >
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse" />
                                {homeData.heroButtonText}
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                href="/test-series"
                                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-gray-300 hover:border-blue-500 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 hover:shadow-lg active:scale-95 group text-sm sm:text-base"
                            >
                                <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:scale-110 transition-transform" />
                                {homeData.heroSecondaryButtonText}
                            </Link>
                        </div>

                        {/* Statistics - Mobile Optimized with All 6 Stats */}
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
                    </div>
                </div>
            </section>

            {/* Advertisement Section - Mobile Optimized */}
            {homeData.advertisement.enabled && (
                <section className="py-12 sm:py-16 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-90"
                        style={{background: homeData.advertisement.backgroundColor}}
                    ></div>
                    <div className="relative z-10 container mx-auto px-4">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2
                                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
                                style={{color: homeData.advertisement.textColor}}
                            >
                                {homeData.advertisement.title}
                            </h2>
                            <p
                                className="text-lg sm:text-xl mb-2"
                                style={{color: homeData.advertisement.textColor}}
                            >
                                {homeData.advertisement.subtitle}
                            </p>
                            <p
                                className="text-base sm:text-lg mb-6 sm:mb-8 opacity-90 px-2"
                                style={{color: homeData.advertisement.textColor}}
                            >
                                {homeData.advertisement.description}
                            </p>
                            <Link href={homeData.advertisement.buttonLink} className="block px-4">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-white text-purple-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    {homeData.advertisement.buttonText}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section - Mobile Optimized */}
            <section className="py-16 sm:py-20 bg-white/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent px-2">
                            Why Choose ABC Classes?
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                            Experience excellence in education with our comprehensive approach to JEE, NEET & MHTCET preparation
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {homeData.features.map((feature, index) => {
                            const IconComponent = feature.icon === 'BookOpen' ? BookOpen :
                                feature.icon === 'Users' ? Users : Award;

                            return (
                                <Card key={index}
                                      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95 border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader className="text-center pb-2 sm:pb-4">
                                        <div
                                            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                                            style={{backgroundColor: `${feature.color}20`}}
                                        >
                                            <IconComponent className="w-6 h-6 sm:w-8 sm:h-8" style={{color: feature.color}}/>
                                        </div>
                                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* YouTube Videos Section - Mobile Optimized */}
            {homeData.youtubeVideos.length > 0 && (
                <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent px-2">
                                Watch Our Success Stories
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                                Discover how our students achieved their dreams and hear their inspiring journeys
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {homeData.youtubeVideos.map((video, index) => (
                                <Card key={index}
                                      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95 overflow-hidden">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.url)}
                                            title={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            allowFullScreen
                                            loading="lazy"
                                        />
                                    </div>
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">{video.title}</CardTitle>
                                        {video.description && (
                                            <CardDescription className="text-gray-600 text-sm sm:text-base leading-relaxed">{video.description}</CardDescription>
                                        )}
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery Section - Mobile Optimized */}
            {homeData.galleryImages.length > 0 && (
                <section className="py-16 sm:py-20 bg-white/50">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent px-2">
                                Our Learning Environment
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                                Take a glimpse into our state-of-the-art facilities and vibrant learning atmosphere
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {homeData.galleryImages.map((image, index) => (
                                <Card key={index}
                                      className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95 overflow-hidden">
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        {image.url &&
                                            <a href={image.url} target="_blank" rel="noopener noreferrer">
                                                <Image
                                                    src={image.url}
                                                    alt={image.alt || ""}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                />
                                            </a>
                                        }
                                    </div>
                                    {image.caption && (
                                        <CardHeader className="p-4 sm:p-6">
                                            <CardDescription className="text-gray-600 text-center text-sm sm:text-base">{image.caption}</CardDescription>
                                        </CardHeader>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials Section - Mobile Optimized */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent px-2">
                            What Our Students Say
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
                            Read inspiring testimonials from our successful students who achieved their dreams
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {homeData.testimonials.map((testimonial, index) => (
                            <Card key={index}
                                  className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 active:scale-95 border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="p-4 sm:p-6">
                                    <div className="flex items-center mb-3 sm:mb-4">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3 sm:mr-4 text-sm sm:text-base">
                                            {testimonial.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h3>
                                            <p className="text-xs sm:text-sm text-gray-600">{testimonial.college}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-3 sm:mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current"/>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">"{testimonial.review}"</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section - Mobile Optimized */}
            <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-base sm:text-lg opacity-90 max-w-2xl mx-auto px-2">
                            Join thousands of successful students and take the first step towards your dream career
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
                        {/* Phone */}
                        <div className="text-center p-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400"/>
                            </div>
                            <h3 className="font-semibold mb-2 text-base sm:text-lg">Call Us</h3>
                            <p className="opacity-90 text-sm sm:text-base break-words">{homeData.contactPhone}</p>
                        </div>

                        {/* Email */}
                        <div className="text-center p-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400"/>
                            </div>
                            <h3 className="font-semibold mb-2 text-base sm:text-lg">Email Us</h3>
                            <p className="opacity-90 text-sm sm:text-base break-words">{homeData.contactEmail}</p>
                        </div>

                        {/* Address */}
                        <div className="text-center p-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-400"/>
                            </div>
                            <h3 className="font-semibold mb-2 text-base sm:text-lg">Visit Us</h3>
                            <p className="opacity-90 text-sm sm:text-base">{homeData.contactAddress}</p>
                        </div>
                    </div>

                    <div className="text-center mt-8 sm:mt-12 px-4">
                        <Link href="/contact">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 group text-sm sm:text-base"
                            >
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse"/>
                                Get Started Today
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform"/>
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>


            <Footer
                siteName={homeData.siteName}
                footerDescription={homeData.footerDescription}
                //@ts-ignore
                programs={homeData.programs}
                contactPhone={homeData.contactPhone}
                contactEmail={homeData.contactEmail}
                contactAddress={homeData.contactAddress}
                copyrightText={homeData.copyrightText}
            />
        </div>
    )
}
