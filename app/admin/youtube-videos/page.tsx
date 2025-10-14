"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Save, Loader2, Play } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function YouTubeVideosPage() {
  const [homeData, setHomeData] = useState<HomePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await getHomePageData()
      setHomeData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load YouTube videos data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVideoChange = (index: number, field: string, value: string) => {
    if (!homeData) return

    const updatedVideos = [...homeData.youtubeVideos]
    updatedVideos[index] = { ...updatedVideos[index], [field]: value }

    setHomeData({ ...homeData, youtubeVideos: updatedVideos })
  }

  const addVideo = () => {
    if (!homeData) return

    const newVideo = {
      url: "",
      title: "",
      description: "",
    }

    setHomeData({ ...homeData, youtubeVideos: [...homeData.youtubeVideos, newVideo] })
  }

  const removeVideo = (index: number) => {
    if (!homeData) return

    const updatedVideos = homeData.youtubeVideos.filter((_, i) => i !== index)
    setHomeData({ ...homeData, youtubeVideos: updatedVideos })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({ youtubeVideos: homeData.youtubeVideos })
      toast({
        title: "Success",
        description: "YouTube videos updated successfully",
      })
    } catch (error) {
      console.error("Error saving videos:", error)
      toast({
        title: "Error",
        description: "Failed to save YouTube videos",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!homeData) {
    return <div>Error loading data</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">YouTube Videos Management</h1>
          <p className="text-muted-foreground">Manage YouTube videos displayed on your homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {homeData.youtubeVideos.map((video, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Video {index + 1}
                </CardTitle>
                <Button variant="destructive" size="sm" onClick={() => removeVideo(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`url-${index}`}>YouTube URL</Label>
                <Input
                  id={`url-${index}`}
                  value={video.url}
                  onChange={(e) => handleVideoChange(index, "url", e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Supports YouTube watch URLs, shorts URLs, and youtu.be links
                </p>
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
                <Label htmlFor={`description-${index}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${index}`}
                  value={video.description || ""}
                  onChange={(e) => handleVideoChange(index, "description", e.target.value)}
                  placeholder="Brief description of the video"
                  rows={2}
                />
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
