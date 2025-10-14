"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Save, Loader2, BookOpen, Heart } from "lucide-react"
import { getNeetPageData, updateNeetPageData, type NeetPageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function NeetPage() {
  const [neetData, setNeetData] = useState<NeetPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await getNeetPageData()
      setNeetData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load NEET page data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    if (!neetData) return
    setNeetData({ ...neetData, [field]: value })
  }

  const handleSubjectChange = (subject: string, field: string, value: string) => {
    if (!neetData) return
    setNeetData({ ...neetData, [`${subject}${field}`]: value })
  }

  const handleFeatureChange = (subject: string, index: number, field: string, value: string) => {
    if (!neetData) return
    const featuresKey = `${subject}Features` as keyof NeetPageData
    const features = [...(neetData[featuresKey] as any[])]
    features[index] = { ...features[index], [field]: value }
    setNeetData({ ...neetData, [featuresKey]: features })
  }

  const addFeature = (subject: string) => {
    if (!neetData) return
    const featuresKey = `${subject}Features` as keyof NeetPageData
    const features = [...(neetData[featuresKey] as any[])]
    features.push({ title: "", description: "", icon: "book" })
    setNeetData({ ...neetData, [featuresKey]: features })
  }

  const removeFeature = (subject: string, index: number) => {
    if (!neetData) return
    const featuresKey = `${subject}Features` as keyof NeetPageData
    const features = (neetData[featuresKey] as any[]).filter((_, i) => i !== index)
    setNeetData({ ...neetData, [featuresKey]: features })
  }

  const handleCourseChange = (index: number, field: string, value: string | string[]) => {
    if (!neetData) return
    const updatedCourses = [...neetData.courseDetails]
    updatedCourses[index] = { ...updatedCourses[index], [field]: value }
    setNeetData({ ...neetData, courseDetails: updatedCourses })
  }

  const addCourse = () => {
    if (!neetData) return
    const newCourse = {
      title: "",
      duration: "",
      description: "",
      features: [],
      price: "",
    }
    setNeetData({ ...neetData, courseDetails: [...neetData.courseDetails, newCourse] })
  }

  const removeCourse = (index: number) => {
    if (!neetData) return
    const updatedCourses = neetData.courseDetails.filter((_, i) => i !== index)
    setNeetData({ ...neetData, courseDetails: updatedCourses })
  }

  const handleSave = async () => {
    if (!neetData) return

    setSaving(true)
    try {
      await updateNeetPageData(neetData)
      toast({
        title: "Success",
        description: "NEET page updated successfully",
      })
    } catch (error) {
      console.error("Error saving NEET data:", error)
      toast({
        title: "Error",
        description: "Failed to save NEET page",
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

  if (!neetData) {
    return <div>Error loading data</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">NEET Page Management</h1>
          <p className="text-muted-foreground">Manage NEET course content and curriculum details</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="physics">Physics</TabsTrigger>
          <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
          <TabsTrigger value="biology">Biology</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
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
                    value={neetData.pageTitle}
                    onChange={(e) => handleBasicInfoChange("pageTitle", e.target.value)}
                    placeholder="NEET"
                  />
                </div>
                <div>
                  <Label htmlFor="pageSubtitle">Page Subtitle</Label>
                  <Input
                    id="pageSubtitle"
                    value={neetData.pageSubtitle}
                    onChange={(e) => handleBasicInfoChange("pageSubtitle", e.target.value)}
                    placeholder="Learn Physics, Chemistry & Biology From Experts"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pageDescription">Page Description</Label>
                <Textarea
                  id="pageDescription"
                  value={neetData.pageDescription}
                  onChange={(e) => handleBasicInfoChange("pageDescription", e.target.value)}
                  placeholder="We provide coaching for NEET aspirants in Physics, Chemistry, and Biology..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="heroImage">Hero Image URL</Label>
                <Input
                  id="heroImage"
                  value={neetData.heroImage}
                  onChange={(e) => handleBasicInfoChange("heroImage", e.target.value)}
                  placeholder="/images/neet/hero.jpg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="additionalInfo">Additional Info</Label>
                  <Textarea
                    id="additionalInfo"
                    value={neetData.additionalInfo}
                    onChange={(e) => handleBasicInfoChange("additionalInfo", e.target.value)}
                    placeholder="The excellent study material is provided to students..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Textarea
                    id="ctaText"
                    value={neetData.ctaText}
                    onChange={(e) => handleBasicInfoChange("ctaText", e.target.value)}
                    placeholder="WE ALSO PROVIDE INDIVIDUAL CLASSES..."
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                <Input
                  id="ctaButtonText"
                  value={neetData.ctaButtonText}
                  onChange={(e) => handleBasicInfoChange("ctaButtonText", e.target.value)}
                  placeholder="Join Now"
                />
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
                  value={neetData.seoTitle}
                  onChange={(e) => handleBasicInfoChange("seoTitle", e.target.value)}
                  placeholder="Best NEET Coaching in Nagpur | Physics Chemistry Biology Classes"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={neetData.seoDescription}
                  onChange={(e) => handleBasicInfoChange("seoDescription", e.target.value)}
                  placeholder="Crack NEET with expert guidance in Physics, Chemistry & Biology..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {["physics", "chemistry", "biology"].map((subject) => (
          <TabsContent key={subject} value={subject} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  <BookOpen className="h-5 w-5" />
                  {subject} Section
                </CardTitle>
                <CardDescription>Manage {subject} course content and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`${subject}Title`}>Title</Label>
                  <Input
                    id={`${subject}Title`}
                    value={neetData[`${subject}Title` as keyof NeetPageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Title", e.target.value)}
                    placeholder={`${subject.charAt(0).toUpperCase() + subject.slice(1)}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`${subject}Description`}>Description</Label>
                  <Textarea
                    id={`${subject}Description`}
                    value={neetData[`${subject}Description` as keyof NeetPageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Description", e.target.value)}
                    placeholder={`We prepare students to crack NEET ${subject}...`}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor={`${subject}Image`}>Image URL</Label>
                  <Input
                    id={`${subject}Image`}
                    value={neetData[`${subject}Image` as keyof NeetPageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Image", e.target.value)}
                    placeholder={`/images/neet/${subject}.jpg`}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Features</Label>
                    <Button onClick={() => addFeature(subject)} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {(neetData[`${subject}Features` as keyof NeetPageData] as any[]).map((feature, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary">Feature {index + 1}</Badge>
                            <Button variant="destructive" size="sm" onClick={() => removeFeature(subject, index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Title</Label>
                              <Input
                                value={feature.title}
                                onChange={(e) => handleFeatureChange(subject, index, "title", e.target.value)}
                                placeholder="Feature title"
                              />
                            </div>
                            <div>
                              <Label>Icon</Label>
                              <Input
                                value={feature.icon}
                                onChange={(e) => handleFeatureChange(subject, index, "icon", e.target.value)}
                                placeholder="book"
                              />
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Description</Label>
                            <Textarea
                              value={feature.description}
                              onChange={(e) => handleFeatureChange(subject, index, "description", e.target.value)}
                              placeholder="Feature description"
                              rows={2}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Course Details</CardTitle>
                  <CardDescription>Manage NEET course offerings and pricing</CardDescription>
                </div>
                <Button onClick={addCourse} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {neetData.courseDetails.map((course, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Course {index + 1}</CardTitle>
                        <Button variant="destructive" size="sm" onClick={() => removeCourse(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Course Title</Label>
                          <Input
                            value={course.title}
                            onChange={(e) => handleCourseChange(index, "title", e.target.value)}
                            placeholder="1-Year NEET Course"
                          />
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <Input
                            value={course.duration}
                            onChange={(e) => handleCourseChange(index, "duration", e.target.value)}
                            placeholder="12 Months"
                          />
                        </div>
                        <div>
                          <Label>Price</Label>
                          <Input
                            value={course.price}
                            onChange={(e) => handleCourseChange(index, "price", e.target.value)}
                            placeholder="₹55,000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={course.description}
                          onChange={(e) => handleCourseChange(index, "description", e.target.value)}
                          placeholder="Ideal for students currently in 12th or drop year..."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Features (one per line)</Label>
                        <Textarea
                          value={course.features.join("\n")}
                          onChange={(e) => handleCourseChange(index, "features", e.target.value.split("\n"))}
                          placeholder="Complete syllabus coverage&#10;NCERT-focused materials&#10;Daily Practice Sheets"
                          rows={4}
                        />
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
