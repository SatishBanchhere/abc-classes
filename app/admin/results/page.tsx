"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, Loader2, Trophy, Star, TrendingUp } from "lucide-react"
import { getResultsPageData, updateResultsPageData, type ResultsPageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function ResultsPage() {
  const [resultsData, setResultsData] = useState<ResultsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await getResultsPageData()
      setResultsData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load results page data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    if (!resultsData) return
    setResultsData({ ...resultsData, [field]: value })
  }

  const handleTopperChange = (index: number, field: string, value: string) => {
    if (!resultsData) return
    const updatedToppers = [...resultsData.toppers]
    updatedToppers[index] = { ...updatedToppers[index], [field]: value }
    setResultsData({ ...resultsData, toppers: updatedToppers })
  }

  const addTopper = () => {
    if (!resultsData) return
    const newTopper = {
      name: "",
      achievement: "",
      image: "",
      rank: "",
      college: "",
      year: new Date().getFullYear().toString(),
      category: "jee" as "jee" | "neet" | "other",
    }
    setResultsData({ ...resultsData, toppers: [...resultsData.toppers, newTopper] })
  }

  const removeTopper = (index: number) => {
    if (!resultsData) return
    const updatedToppers = resultsData.toppers.filter((_, i) => i !== index)
    setResultsData({ ...resultsData, toppers: updatedToppers })
  }

  const handleAchievementImageChange = (index: number, field: string, value: string) => {
    if (!resultsData) return
    const updatedImages = [...resultsData.achievementImages]
    updatedImages[index] = { ...updatedImages[index], [field]: value }
    setResultsData({ ...resultsData, achievementImages: updatedImages })
  }

  const addAchievementImage = () => {
    if (!resultsData) return
    const newImage = { url: "", alt: "", caption: "" }
    setResultsData({ ...resultsData, achievementImages: [...resultsData.achievementImages, newImage] })
  }

  const removeAchievementImage = (index: number) => {
    if (!resultsData) return
    const updatedImages = resultsData.achievementImages.filter((_, i) => i !== index)
    setResultsData({ ...resultsData, achievementImages: updatedImages })
  }

  const handleStatsChange = (index: number, field: string, value: string | number) => {
    if (!resultsData) return
    const updatedStats = [...resultsData.yearlyStats]
    updatedStats[index] = { ...updatedStats[index], [field]: value }
    setResultsData({ ...resultsData, yearlyStats: updatedStats })
  }

  const addYearlyStats = () => {
    if (!resultsData) return
    const newStats = {
      year: new Date().getFullYear().toString(),
      jeeSelections: 0,
      neetSelections: 0,
      topRanks: 0,
    }
    setResultsData({ ...resultsData, yearlyStats: [...resultsData.yearlyStats, newStats] })
  }

  const removeYearlyStats = (index: number) => {
    if (!resultsData) return
    const updatedStats = resultsData.yearlyStats.filter((_, i) => i !== index)
    setResultsData({ ...resultsData, yearlyStats: updatedStats })
  }

  const handleSave = async () => {
    if (!resultsData) return

    setSaving(true)
    try {
      await updateResultsPageData(resultsData)
      toast({
        title: "Success",
        description: "Results page updated successfully",
      })
    } catch (error) {
      console.error("Error saving results data:", error)
      toast({
        title: "Error",
        description: "Failed to save results page",
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

  if (!resultsData) {
    return <div>Error loading data</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Results Page Management</h1>
          <p className="text-muted-foreground">Manage student achievements and success stories</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="toppers">Toppers</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Basic Information
              </CardTitle>
              <CardDescription>General page information and hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={resultsData.pageTitle}
                    onChange={(e) => handleBasicInfoChange("pageTitle", e.target.value)}
                    placeholder="Our Shining Stars"
                  />
                </div>
                <div>
                  <Label htmlFor="heroImage">Hero Image URL</Label>
                  <Input
                    id="heroImage"
                    value={resultsData.heroImage}
                    onChange={(e) => handleBasicInfoChange("heroImage", e.target.value)}
                    placeholder="/images/results/hero.jpg"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pageDescription">Page Description</Label>
                <Textarea
                  id="pageDescription"
                  value={resultsData.pageDescription}
                  onChange={(e) => handleBasicInfoChange("pageDescription", e.target.value)}
                  placeholder="Heartfelt Congratulations To Our Geniuses Of The Year..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentYearTitle">Current Year Title</Label>
                  <Input
                    id="currentYearTitle"
                    value={resultsData.currentYearTitle}
                    onChange={(e) => handleBasicInfoChange("currentYearTitle", e.target.value)}
                    placeholder="2024 Achievements"
                  />
                </div>
                <div>
                  <Label htmlFor="currentYearDescription">Current Year Description</Label>
                  <Textarea
                    id="currentYearDescription"
                    value={resultsData.currentYearDescription}
                    onChange={(e) => handleBasicInfoChange("currentYearDescription", e.target.value)}
                    placeholder="Congratulations to our outstanding students..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

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
                  value={resultsData.seoTitle}
                  onChange={(e) => handleBasicInfoChange("seoTitle", e.target.value)}
                  placeholder="Best JEE & NEET Results | Toppers From Nagpur"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={resultsData.seoDescription}
                  onChange={(e) => handleBasicInfoChange("seoDescription", e.target.value)}
                  placeholder="Meet our star performers from JEE, NEET & Olympiads..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="toppers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Manage student toppers and their achievements</CardDescription>
                </div>
                <Button onClick={addTopper} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topper
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resultsData.toppers.map((topper, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Topper {index + 1}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => removeTopper(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Student Name</Label>
                          <Input
                            value={topper.name}
                            onChange={(e) => handleTopperChange(index, "name", e.target.value)}
                            placeholder="Atharva Tade"
                          />
                        </div>
                        <div>
                          <Label>Achievement</Label>
                          <Input
                            value={topper.achievement}
                            onChange={(e) => handleTopperChange(index, "achievement", e.target.value)}
                            placeholder="JEE Advanced"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Rank</Label>
                          <Input
                            value={topper.rank}
                            onChange={(e) => handleTopperChange(index, "rank", e.target.value)}
                            placeholder="AIR 150"
                          />
                        </div>
                        <div>
                          <Label>College</Label>
                          <Input
                            value={topper.college}
                            onChange={(e) => handleTopperChange(index, "college", e.target.value)}
                            placeholder="IIT Bombay"
                          />
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input
                            value={topper.year}
                            onChange={(e) => handleTopperChange(index, "year", e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={topper.category}
                            onValueChange={(value) => handleTopperChange(index, "category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="jee">JEE</SelectItem>
                              <SelectItem value="neet">NEET</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Image URL</Label>
                          <Input
                            value={topper.image}
                            onChange={(e) => handleTopperChange(index, "image", e.target.value)}
                            placeholder="/images/results/student.jpg"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Achievement Images</CardTitle>
                  <CardDescription>Manage images showcasing student achievements</CardDescription>
                </div>
                <Button onClick={addAchievementImage} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resultsData.achievementImages.map((image, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Image {index + 1}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => removeAchievementImage(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={image.url}
                          onChange={(e) => handleAchievementImageChange(index, "url", e.target.value)}
                          placeholder="/images/results/achievement.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Alt Text</Label>
                          <Input
                            value={image.alt}
                            onChange={(e) => handleAchievementImageChange(index, "alt", e.target.value)}
                            placeholder="Student receiving award"
                          />
                        </div>
                        <div>
                          <Label>Caption</Label>
                          <Input
                            value={image.caption}
                            onChange={(e) => handleAchievementImageChange(index, "caption", e.target.value)}
                            placeholder="Student Name - Achievement Details"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Yearly Statistics
                  </CardTitle>
                  <CardDescription>Manage year-wise performance statistics</CardDescription>
                </div>
                <Button onClick={addYearlyStats} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Year
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {resultsData.yearlyStats.map((stats, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Year {stats.year}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => removeYearlyStats(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Year</Label>
                          <Input
                            value={stats.year}
                            onChange={(e) => handleStatsChange(index, "year", e.target.value)}
                            placeholder="2024"
                          />
                        </div>
                        <div>
                          <Label>JEE Selections</Label>
                          <Input
                            type="number"
                            value={stats.jeeSelections}
                            onChange={(e) => handleStatsChange(index, "jeeSelections", Number.parseInt(e.target.value))}
                            placeholder="47"
                          />
                        </div>
                        <div>
                          <Label>NEET Selections</Label>
                          <Input
                            type="number"
                            value={stats.neetSelections}
                            onChange={(e) =>
                              handleStatsChange(index, "neetSelections", Number.parseInt(e.target.value))
                            }
                            placeholder="61"
                          />
                        </div>
                        <div>
                          <Label>Top Ranks</Label>
                          <Input
                            type="number"
                            value={stats.topRanks}
                            onChange={(e) => handleStatsChange(index, "topRanks", Number.parseInt(e.target.value))}
                            placeholder="12"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
