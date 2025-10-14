"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Upload, Save, Eye, Loader2, Image as ImageIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getHomePageData, HomePageData, updateHomePageData } from "@/lib/data-fetcher"
import Image from 'next/image'

export default function AdminHeroSection({homeData} : {homeData:HomePageData}) {
                const data = homeData;
    const [formData, setFormData] = useState({
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroDescription: data.heroDescription,
        heroImage: data.heroImage,
        heroButtonText: data.heroButtonText,
        heroSecondaryButtonText: data.heroSecondaryButtonText,
        siteTagline: data.siteTagline
    })
    // const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             setFormData()
    //         } catch (error) {
    //             console.error('Error fetching data:', error)
    //             setMessage('Error loading data')
    //         } finally {
    //             setLoading(false)
    //         }
    //     }
    //     fetchData()
    // }, [])

    const uploadToImgBB = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('image', file)

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        })

        const data = await response.json()
        if (data.success) {
            return data.data.url
        } else {
            throw new Error('Failed to upload image')
        }
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const imageUrl = await uploadToImgBB(file)
            setFormData(prev => ({ ...prev, heroImage: imageUrl }))
            setMessage('Image uploaded successfully!')
        } catch (error) {
            console.error('Error uploading image:', error)
            setMessage('Error uploading image')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await updateHomePageData(formData)
            setMessage('Hero section updated successfully!')
        } catch (error) {
            console.error('Error updating data:', error)
            setMessage('Error updating hero section')
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    // if (loading) {
    //     return (
    //         <div className="p-6">
    //             <div className="animate-pulse">
    //                 <div className="h-8 bg-gray-200 rounded mb-6"></div>
    //                 <div className="space-y-4">
    //                     {[...Array(6)].map((_, i) => (
    //                         <div key={i} className="h-20 bg-gray-200 rounded"></div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hero Section</h1>
                    <p className="text-gray-600 mt-1">Manage your homepage hero section content</p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Live Preview
                </Badge>
            </div>

            {message && (
                <Alert className={message.includes('Error') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Content</CardTitle>
                        <CardDescription>
                            Update your homepage hero section content and settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="siteTagline">Site Tagline</Label>
                                <Input
                                    id="siteTagline"
                                    value={formData.siteTagline}
                                    onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                                    placeholder="Excellence in Education"
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroTitle">Hero Title</Label>
                                <Input
                                    id="heroTitle"
                                    value={formData.heroTitle}
                                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                                    placeholder="Master JEE with Excellence & Innovation"
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                                <Input
                                    id="heroSubtitle"
                                    value={formData.heroSubtitle}
                                    onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                                    placeholder="India's Leading JEE Coaching Institute"
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroDescription">Hero Description</Label>
                                <Textarea
                                    id="heroDescription"
                                    value={formData.heroDescription}
                                    onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                                    placeholder="Join thousands of successful students..."
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroButtonText">Primary Button Text</Label>
                                <Input
                                    id="heroButtonText"
                                    value={formData.heroButtonText}
                                    onChange={(e) => handleInputChange('heroButtonText', e.target.value)}
                                    placeholder="Start Your Journey"
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroSecondaryButtonText">Secondary Button Text</Label>
                                <Input
                                    id="heroSecondaryButtonText"
                                    value={formData.heroSecondaryButtonText}
                                    onChange={(e) => handleInputChange('heroSecondaryButtonText', e.target.value)}
                                    placeholder="Watch Demo"
                                />
                            </div>

                            <div>
                                <Label htmlFor="heroImage">Hero Image</Label>
                                <div className="space-y-2">
                                    <Input
                                        id="heroImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    {uploading && (
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading image...
                                        </div>
                                    )}
                                    {formData.heroImage && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-600 mb-2">Current image:</p>
                                            <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                                <Image
                                                    src={formData.heroImage}
                                                    alt="Hero image"
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={saving}>
                                {saving ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Preview
                        </CardTitle>
                        <CardDescription>
                            See how your hero section will look on the website
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 rounded-lg">
                            {/* Badge */}
                            <div className="flex justify-center">
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
                                    {formData.siteTagline || 'Site Tagline'}
                                </Badge>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                                {formData.heroTitle || 'Hero Title'}
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg text-center text-gray-600 font-medium">
                                {formData.heroSubtitle || 'Hero Subtitle'}
                            </p>

                            {/* Description */}
                            <p className="text-center text-gray-600 text-sm leading-relaxed">
                                {formData.heroDescription || 'Hero Description'}
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {formData.heroButtonText || 'Primary Button'}
                                </Button>
                                <Button variant="outline" size="sm">
                                    {formData.heroSecondaryButtonText || 'Secondary Button'}
                                </Button>
                            </div>

                            {/* Image Preview */}
                            {formData.heroImage && (
                                <div className="mt-4">
                                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={formData.heroImage}
                                            alt="Hero preview"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}