"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2, Megaphone } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

const gradientOptions = [
  { value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", label: "Blue Purple" },
  { value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", label: "Pink Red" },
  { value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", label: "Blue Cyan" },
  { value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", label: "Green Cyan" },
  { value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", label: "Pink Yellow" },
  { value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", label: "Mint Pink" },
]

const positionOptions = [
  { value: "after-hero", label: "After Hero Section" },
  { value: "after-features", label: "After Features Section" },
  { value: "after-testimonials", label: "After Testimonials Section" },
]

export default function AdvertisementPage() {
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
        description: "Failed to load advertisement data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdvertisementChange = (field: string, value: string | boolean) => {
    if (!homeData) return

    setHomeData({
      ...homeData,
      advertisement: {
        ...homeData.advertisement,
        [field]: value,
      },
    })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({ advertisement: homeData.advertisement })
      toast({
        title: "Success",
        description: "Advertisement updated successfully",
      })
    } catch (error) {
      console.error("Error saving advertisement:", error)
      toast({
        title: "Error",
        description: "Failed to save advertisement",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-3xl font-bold">Advertisement Management</h1>
          <p className="text-muted-foreground">Manage the promotional banner on your homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Advertisement Settings
            </CardTitle>
            <CardDescription>Configure your promotional banner that appears on the homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={homeData.advertisement.enabled}
                onCheckedChange={(checked) => handleAdvertisementChange("enabled", checked)}
              />
              <Label htmlFor="enabled">Enable Advertisement Banner</Label>
            </div>

            {homeData.advertisement.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={homeData.advertisement.title}
                      onChange={(e) => handleAdvertisementChange("title", e.target.value)}
                      placeholder="🎯 Special Admission Open!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={homeData.advertisement.subtitle}
                      onChange={(e) => handleAdvertisementChange("subtitle", e.target.value)}
                      placeholder="Limited Seats Available"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={homeData.advertisement.description}
                    onChange={(e) => handleAdvertisementChange("description", e.target.value)}
                    placeholder="Get 20% off on all JEE & NEET courses..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={homeData.advertisement.buttonText}
                      onChange={(e) => handleAdvertisementChange("buttonText", e.target.value)}
                      placeholder="Apply Now"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                      id="buttonLink"
                      value={homeData.advertisement.buttonLink}
                      onChange={(e) => handleAdvertisementChange("buttonLink", e.target.value)}
                      placeholder="/contact"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Style</Label>
                  <Select
                    value={homeData.advertisement.backgroundColor}
                    onValueChange={(value) => handleAdvertisementChange("backgroundColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ background: option.value }} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <Input
                    id="textColor"
                    type="color"
                    value={homeData.advertisement.textColor}
                    onChange={(e) => handleAdvertisementChange("textColor", e.target.value)}
                    className="w-20 h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="position">Position on Page</Label>
                  <Select
                    value={homeData.advertisement.position}
                    onValueChange={(value) => handleAdvertisementChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image">Image URL (Optional)</Label>
                  <Input
                    id="image"
                    value={homeData.advertisement.image}
                    onChange={(e) => handleAdvertisementChange("image", e.target.value)}
                    placeholder="https://example.com/banner-image.jpg"
                  />
                </div>

                {/* Preview */}
                <div>
                  <Label>Preview</Label>
                  <div
                    className="p-8 rounded-lg text-center"
                    style={{
                      background: homeData.advertisement.backgroundColor,
                      color: homeData.advertisement.textColor,
                    }}
                  >
                    <h3 className="text-2xl font-bold mb-2">{homeData.advertisement.title}</h3>
                    <p className="text-lg mb-1">{homeData.advertisement.subtitle}</p>
                    <p className="mb-4 opacity-90">{homeData.advertisement.description}</p>
                    <Button className="bg-white text-purple-600 hover:bg-gray-50" disabled>
                      {homeData.advertisement.buttonText}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
