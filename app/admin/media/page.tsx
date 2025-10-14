"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, Plus, Save, Eye, Loader2, Video, Star, Trophy, Calendar, Upload, AlertCircle } from "lucide-react"
import { getMediaPageData, updateMediaPageData, type MediaPageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"
import Image from 'next/image'

export default function MediaPage() {
    const [mediaData, setMediaData] = useState<MediaPageData | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const data = await getMediaPageData()
            setMediaData(data)
        } catch (error) {
            console.error("Error fetching data:", error)
            setMessage('Error loading media data')
        } finally {
            setLoading(false)
        }
    }

    // Image upload function using ImgBB
    const uploadToImgBB = async (file: File): Promise<string> => {
        const formData = new FormData()
        formData.append('image', file)

        const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY
        if (!apiKey) {
            throw new Error('IMGBB API key not configured')
        }

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
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

    // Handle hero image upload
    const handleHeroImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const imageUrl = await uploadToImgBB(file)
            setMediaData(prev => prev ? { ...prev, heroImage: imageUrl } : null)
            setMessage('Hero image uploaded successfully!')
        } catch (error) {
            console.error('Error uploading image:', error)
            setMessage('Error uploading hero image')
        } finally {
            setUploading(false)
        }
    }

    const handlePageInfoChange = (field: string, value: string) => {
        if (!mediaData) return
        setMediaData({ ...mediaData, [field]: value })
    }

    const handleVideoChange = (index: number, field: string, value: string | boolean) => {
        if (!mediaData) return

        const updatedVideos = [...mediaData.mediaVideos]
        updatedVideos[index] = { ...updatedVideos[index], [field]: value }

        setMediaData({ ...mediaData, mediaVideos: updatedVideos })
    }

    const addVideo = () => {
        if (!mediaData) return

        const newVideo = {
            url: "",
            title: "",
            description: "",
            category: "other" as const,
            date: new Date().toISOString().split('T')[0],
            featured: false,
        }

        setMediaData({ ...mediaData, mediaVideos: [...mediaData.mediaVideos, newVideo] })
    }

    const removeVideo = (index: number) => {
        if (!mediaData) return

        const updatedVideos = mediaData.mediaVideos.filter((_, i) => i !== index)
        setMediaData({ ...mediaData, mediaVideos: updatedVideos })
    }

    const handleSave = async () => {
        if (!mediaData) return

        setSaving(true)
        try {
            await updateMediaPageData(mediaData)
            setMessage('Media page updated successfully!')
            toast({
                title: "Success",
                description: "Media page updated successfully",
            })
        } catch (error) {
            console.error("Error saving media data:", error)
            setMessage('Error updating media page')
            toast({
                title: "Error",
                description: "Failed to save media data",
                variant: "destructive",
            })
        } finally {
            setSaving(false)
        }
    }

    const getYouTubeEmbedUrl = (url: string) => {
        const regex = /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^?&/]+)/
        const match = url?.match(regex)
        return match ? `https://www.youtube.com/embed/${match[1]}` : url
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'interview': return <Video className="h-4 w-4" />
            case 'testimonial': return <Star className="h-4 w-4" />
            case 'achievement': return <Trophy className="h-4 w-4" />
            default: return <Video className="h-4 w-4" />
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'interview': return 'text-blue-600 bg-blue-50'
            case 'testimonial': return 'text-yellow-600 bg-yellow-50'
            case 'achievement': return 'text-green-600 bg-green-50'
            default: return 'text-gray-600 bg-gray-50'
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (!mediaData) {
        return <div className="p-6">Error loading data</div>
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Media & Interviews Management</h1>
                    <p className="text-muted-foreground">Manage your media content, interviews, and video testimonials</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            {message && (
                <Alert className={message.includes('Error') ? 'border-red-200 bg-red-50 mb-6' : 'border-green-200 bg-green-50 mb-6'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Page Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Page Information
                        </CardTitle>
                        <CardDescription>Basic information about your media page</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="pageTitle">Page Title</Label>
                            <Input
                                id="pageTitle"
                                value={mediaData.pageTitle}
                                onChange={(e) => handlePageInfoChange("pageTitle", e.target.value)}
                                placeholder="Media & Interviews"
                            />
                        </div>
                        <div>
                            <Label htmlFor="pageDescription">Page Description</Label>
                            <Textarea
                                id="pageDescription"
                                value={mediaData.pageDescription}
                                onChange={(e) => handlePageInfoChange("pageDescription", e.target.value)}
                                placeholder="Page description for SEO and display"
                                rows={3}
                            />
                        </div>
                        <div>
                            <Label htmlFor="heroImage">Hero Image</Label>
                            <div className="space-y-2">
                                <Input
                                    id="heroImage"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleHeroImageUpload}
                                    disabled={uploading}
                                />
                                {uploading && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading image...
                                    </div>
                                )}
                                {mediaData.heroImage && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-2">Current hero image:</p>
                                        <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                            <Image
                                                src={mediaData.heroImage}
                                                alt="Hero image"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>SEO Settings</CardTitle>
                        <CardDescription>Search engine optimization settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="seoTitle">SEO Title</Label>
                            <Input
                                id="seoTitle"
                                value={mediaData.seoTitle}
                                onChange={(e) => handlePageInfoChange("seoTitle", e.target.value)}
                                placeholder="Media & Interviews - KK Mishra Classes"
                            />
                        </div>
                        <div>
                            <Label htmlFor="seoDescription">SEO Description</Label>
                            <Textarea
                                id="seoDescription"
                                value={mediaData.seoDescription}
                                onChange={(e) => handlePageInfoChange("seoDescription", e.target.value)}
                                placeholder="Meta description for search engines"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label htmlFor="seoKeywords">SEO Keywords</Label>
                            <Input
                                id="seoKeywords"
                                value={mediaData.seoKeywords}
                                onChange={(e) => handlePageInfoChange("seoKeywords", e.target.value)}
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Media Videos */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Media Videos</h2>

                {/* Featured Videos Count */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium">Total Videos: {mediaData.mediaVideos.length}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Featured: {mediaData.mediaVideos.filter(v => v.featured).length}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {['interview', 'testimonial', 'achievement', 'other'].map(category => (
                                    <div key={category} className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}>
                                        {mediaData.mediaVideos.filter(v => v.category === category).length} {category}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {mediaData.mediaVideos.map((video, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className={`p-2 rounded-full ${getCategoryColor(video.category)}`}>
                                        {getCategoryIcon(video.category)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Video {index + 1}</CardTitle>
                                        {video.featured && (
                                            <div className="flex items-center gap-1 text-sm text-yellow-600 mt-1">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => removeVideo(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor={`url-${index}`}>YouTube URL</Label>
                                    <Input
                                        id={`url-${index}`}
                                        value={video.url}
                                        onChange={(e) => handleVideoChange(index, "url", e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`category-${index}`}>Category</Label>
                                    <Select
                                        value={video.category}
                                        onValueChange={(value) => handleVideoChange(index, "category", value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="interview">Interview</SelectItem>
                                            <SelectItem value="testimonial">Testimonial</SelectItem>
                                            <SelectItem value="achievement">Achievement</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor={`title-${index}`}>Video Title</Label>
                                <Input
                                    id={`title-${index}`}
                                    value={video.title}
                                    onChange={(e) => handleVideoChange(index, "title", e.target.value)}
                                    placeholder="Video title"
                                />
                            </div>

                            <div>
                                <Label htmlFor={`description-${index}`}>Description</Label>
                                <Textarea
                                    id={`description-${index}`}
                                    value={video.description || ""}
                                    onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                                    placeholder="Brief description of the video"
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor={`date-${index}`}>Date</Label>
                                    <Input
                                        id={`date-${index}`}
                                        type="date"
                                        value={video.date || ""}
                                        onChange={(e) => handleVideoChange(index, "date", e.target.value)}
                                        className="w-40"
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id={`featured-${index}`}
                                        checked={video.featured || false}
                                        onCheckedChange={(checked) => handleVideoChange(index, "featured", checked)}
                                    />
                                    <Label htmlFor={`featured-${index}`}>Featured Video</Label>
                                </div>
                            </div>

                            {video.url && (
                                <div>
                                    <Label>Preview</Label>
                                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                        <iframe
                                            src={getYouTubeEmbedUrl(video.url)}
                                            title={video.title}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardContent className="pt-6">
                        <Button onClick={addVideo} variant="outline" className="w-full bg-transparent">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Video
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
