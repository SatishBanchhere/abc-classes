"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Loader2, TrendingUp, Users, Award, Type, Heart, School, GraduationCap } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function StatsPage() {
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
        description: "Failed to load statistics data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatChange = (field: string, value: string) => {
    if (!homeData) return
    setHomeData({ ...homeData, [field]: value })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({
        successRate: homeData.successRate,
        studentsCount: homeData.studentsCount,
        neetSelections: homeData.neetSelections,
        mhtcetSelections: homeData.mhtcetSelections,
        iitSelections: homeData.iitSelections,
        iiserniserSelections: homeData.iiserniserSelections,
        successRateText: homeData.successRateText,
        studentsCountText: homeData.studentsCountText,
        neetSelectionsText: homeData.neetSelectionsText,
        mhtcetSelectionsText: homeData.mhtcetSelectionsText,
        iitSelectionsText: homeData.iitSelectionsText,
        iiserniserSelectionsText: homeData.iiserniserSelectionsText,
      })
      toast({
        title: "Success",
        description: "Statistics updated successfully",
      })
    } catch (error) {
      console.error("Error saving statistics:", error)
      toast({
        title: "Error",
        description: "Failed to save statistics",
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
            <h1 className="text-3xl font-bold">Statistics Management</h1>
            <p className="text-muted-foreground">Update your institute's key performance metrics</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Success Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Success Rate
              </CardTitle>
              <CardDescription>Overall success rate of your students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="successRate">Success Rate Value</Label>
                  <Input
                      id="successRate"
                      value={homeData.successRate}
                      onChange={(e) => handleStatChange("successRate", e.target.value)}
                      placeholder="95%"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Include the % symbol (e.g., 95%)</p>
                </div>
                <div>
                  <Label htmlFor="successRateText">Success Rate Label</Label>
                  <Input
                      id="successRateText"
                      value={homeData.successRateText}
                      onChange={(e) => handleStatChange("successRateText", e.target.value)}
                      placeholder="Success Rate"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">{homeData.successRate}</div>
                  <div className="text-gray-600 font-medium">{homeData.successRateText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Count */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Students Count
              </CardTitle>
              <CardDescription>Total number of students taught</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentsCount">Students Count Value</Label>
                  <Input
                      id="studentsCount"
                      value={homeData.studentsCount}
                      onChange={(e) => handleStatChange("studentsCount", e.target.value)}
                      placeholder="10,000+"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Use + for approximate numbers (e.g., 10,000+)</p>
                </div>
                <div>
                  <Label htmlFor="studentsCountText">Students Count Label</Label>
                  <Input
                      id="studentsCountText"
                      value={homeData.studentsCountText}
                      onChange={(e) => handleStatChange("studentsCountText", e.target.value)}
                      placeholder="Students Taught"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{homeData.studentsCount}</div>
                  <div className="text-gray-600 font-medium">{homeData.studentsCountText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEET Selections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                NEET Selections
              </CardTitle>
              <CardDescription>Number of students selected in NEET/Medical colleges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="neetSelections">NEET Selections Value</Label>
                  <Input
                      id="neetSelections"
                      value={homeData.neetSelections}
                      onChange={(e) => handleStatChange("neetSelections", e.target.value)}
                      placeholder="2,000+"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Total NEET selections achieved</p>
                </div>
                <div>
                  <Label htmlFor="neetSelectionsText">NEET Selections Label</Label>
                  <Input
                      id="neetSelectionsText"
                      value={homeData.neetSelectionsText}
                      onChange={(e) => handleStatChange("neetSelectionsText", e.target.value)}
                      placeholder="NEET Selections"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600 mb-2">{homeData.neetSelections}</div>
                  <div className="text-gray-600 font-medium">{homeData.neetSelectionsText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MHTCET Selections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-orange-600" />
                MHTCET Selections
              </CardTitle>
              <CardDescription>Number of students selected in MHTCET</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mhtcetSelections">MHTCET Selections Value</Label>
                  <Input
                      id="mhtcetSelections"
                      value={homeData.mhtcetSelections}
                      onChange={(e) => handleStatChange("mhtcetSelections", e.target.value)}
                      placeholder="1,500+"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Total MHTCET selections achieved</p>
                </div>
                <div>
                  <Label htmlFor="mhtcetSelectionsText">MHTCET Selections Label</Label>
                  <Input
                      id="mhtcetSelectionsText"
                      value={homeData.mhtcetSelectionsText}
                      onChange={(e) => handleStatChange("mhtcetSelectionsText", e.target.value)}
                      placeholder="MHTCET Selections"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{homeData.mhtcetSelections}</div>
                  <div className="text-gray-600 font-medium">{homeData.mhtcetSelectionsText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IIT Selections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                IIT Selections
              </CardTitle>
              <CardDescription>Number of students selected in IIT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iitSelections">IIT Selections Value</Label>
                  <Input
                      id="iitSelections"
                      value={homeData.iitSelections}
                      onChange={(e) => handleStatChange("iitSelections", e.target.value)}
                      placeholder="500+"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Total IIT selections achieved</p>
                </div>
                <div>
                  <Label htmlFor="iitSelectionsText">IIT Selections Label</Label>
                  <Input
                      id="iitSelectionsText"
                      value={homeData.iitSelectionsText}
                      onChange={(e) => handleStatChange("iitSelectionsText", e.target.value)}
                      placeholder="IIT Selections"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{homeData.iitSelections}</div>
                  <div className="text-gray-600 font-medium">{homeData.iitSelectionsText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* IISER/NISER Selections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                IISER/NISER Selections
              </CardTitle>
              <CardDescription>Number of students selected in IISER/NISER</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="iiserniserSelections">IISER/NISER Selections Value</Label>
                  <Input
                      id="iiserniserSelections"
                      value={homeData.iiserniserSelections}
                      onChange={(e) => handleStatChange("iiserniserSelections", e.target.value)}
                      placeholder="300+"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Total IISER/NISER selections achieved</p>
                </div>
                <div>
                  <Label htmlFor="iiserniserSelectionsText">IISER/NISER Selections Label</Label>
                  <Input
                      id="iiserniserSelectionsText"
                      value={homeData.iiserniserSelectionsText}
                      onChange={(e) => handleStatChange("iiserniserSelectionsText", e.target.value)}
                      placeholder="IISER/NISER Selections"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Custom label for this statistic</p>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">{homeData.iiserniserSelections}</div>
                  <div className="text-gray-600 font-medium">{homeData.iiserniserSelectionsText}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Labels Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5 text-gray-600" />
                Quick Label Editor
              </CardTitle>
              <CardDescription>Quickly edit all statistic labels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="successRateTextQuick">Success Rate Label</Label>
                  <Input
                      id="successRateTextQuick"
                      value={homeData.successRateText}
                      onChange={(e) => handleStatChange("successRateText", e.target.value)}
                      placeholder="Success Rate"
                  />
                </div>
                <div>
                  <Label htmlFor="studentsCountTextQuick">Students Count Label</Label>
                  <Input
                      id="studentsCountTextQuick"
                      value={homeData.studentsCountText}
                      onChange={(e) => handleStatChange("studentsCountText", e.target.value)}
                      placeholder="Students Taught"
                  />
                </div>
                <div>
                  <Label htmlFor="neetSelectionsTextQuick">NEET Selections Label</Label>
                  <Input
                      id="neetSelectionsTextQuick"
                      value={homeData.neetSelectionsText}
                      onChange={(e) => handleStatChange("neetSelectionsText", e.target.value)}
                      placeholder="NEET Selections"
                  />
                </div>
                <div>
                  <Label htmlFor="mhtcetSelectionsTextQuick">MHTCET Selections Label</Label>
                  <Input
                      id="mhtcetSelectionsTextQuick"
                      value={homeData.mhtcetSelectionsText}
                      onChange={(e) => handleStatChange("mhtcetSelectionsText", e.target.value)}
                      placeholder="MHTCET Selections"
                  />
                </div>
                <div>
                  <Label htmlFor="iitSelectionsTextQuick">IIT Selections Label</Label>
                  <Input
                      id="iitSelectionsTextQuick"
                      value={homeData.iitSelectionsText}
                      onChange={(e) => handleStatChange("iitSelectionsText", e.target.value)}
                      placeholder="IIT Selections"
                  />
                </div>
                <div>
                  <Label htmlFor="iiserniserSelectionsTextQuick">IISER/NISER Selections Label</Label>
                  <Input
                      id="iiserniserSelectionsTextQuick"
                      value={homeData.iiserniserSelectionsText}
                      onChange={(e) => handleStatChange("iiserniserSelectionsText", e.target.value)}
                      placeholder="IISER/NISER Selections"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Statistics Preview</CardTitle>
            <CardDescription>This is how your statistics will appear on the homepage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">{homeData.successRate}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.successRateText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{homeData.studentsCount}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.studentsCountText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-red-600 mb-2">{homeData.neetSelections}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.neetSelectionsText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">{homeData.mhtcetSelections}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.mhtcetSelectionsText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">{homeData.iitSelections}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.iitSelectionsText}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">{homeData.iiserniserSelections}</div>
                <div className="text-gray-600 font-medium text-sm">{homeData.iiserniserSelectionsText}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
