"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

const iconOptions = [
  { value: "BookOpen", label: "Book Open" },
  { value: "Users", label: "Users" },
  { value: "Award", label: "Award" },
  { value: "Target", label: "Target" },
  { value: "Zap", label: "Zap" },
  { value: "Star", label: "Star" },
]

const colorOptions = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Yellow" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
]

export default function FeaturesPage() {
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
        description: "Failed to load features data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFeatureChange = (index: number, field: string, value: string) => {
    if (!homeData) return

    const updatedFeatures = [...homeData.features]
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value }

    setHomeData({ ...homeData, features: updatedFeatures })
  }

  const addFeature = () => {
    if (!homeData) return

    const newFeature = {
      title: "",
      description: "",
      icon: "BookOpen",
      color: "#3b82f6",
    }

    setHomeData({ ...homeData, features: [...homeData.features, newFeature] })
  }

  const removeFeature = (index: number) => {
    if (!homeData) return

    const updatedFeatures = homeData.features.filter((_, i) => i !== index)
    setHomeData({ ...homeData, features: updatedFeatures })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({ features: homeData.features })
      toast({
        title: "Success",
        description: "Features updated successfully",
      })
    } catch (error) {
      console.error("Error saving features:", error)
      toast({
        title: "Error",
        description: "Failed to save features",
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
          <h1 className="text-3xl font-bold">Features Management</h1>
          <p className="text-muted-foreground">Manage the features section of your homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {homeData.features.map((feature, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Feature {index + 1}</CardTitle>
                <Button variant="destructive" size="sm" onClick={() => removeFeature(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={feature.title}
                    onChange={(e) => handleFeatureChange(index, "title", e.target.value)}
                    placeholder="Feature title"
                  />
                </div>
                <div>
                  <Label htmlFor={`icon-${index}`}>Icon</Label>
                  <Select value={feature.icon} onValueChange={(value) => handleFeatureChange(index, "icon", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={feature.description}
                  onChange={(e) => handleFeatureChange(index, "description", e.target.value)}
                  placeholder="Feature description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor={`color-${index}`}>Color</Label>
                <Select value={feature.color} onValueChange={(value) => handleFeatureChange(index, "color", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: option.value }} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <Button onClick={addFeature} variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add New Feature
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
