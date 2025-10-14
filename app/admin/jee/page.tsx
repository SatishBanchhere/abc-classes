"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Save, Loader2, BookOpen } from "lucide-react"
import { getJeePageData, updateJeePageData, type JeePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function JeePage() {
  const [jeeData, setJeeData] = useState<JeePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await getJeePageData()
      setJeeData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load JEE page data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    if (!jeeData) return
    setJeeData({ ...jeeData, [field]: value })
  }

  const handleSubjectChange = (subject: string, field: string, value: string) => {
    if (!jeeData) return
    setJeeData({ ...jeeData, [`${subject}${field}`]: value })
  }

  const handleFeatureChange = (subject: string, index: number, field: string, value: string) => {
    if (!jeeData) return
    const featuresKey = `${subject}Features` as keyof JeePageData
    const features = [...(jeeData[featuresKey] as any[])]
    features[index] = { ...features[index], [field]: value }
    setJeeData({ ...jeeData, [featuresKey]: features })
  }

  const addFeature = (subject: string) => {
    if (!jeeData) return
    const featuresKey = `${subject}Features` as keyof JeePageData
    const features = [...(jeeData[featuresKey] as any[])]
    features.push({ title: "", description: "", icon: "book" })
    setJeeData({ ...jeeData, [featuresKey]: features })
  }

  const removeFeature = (subject: string, index: number) => {
    if (!jeeData) return
    const featuresKey = `${subject}Features` as keyof JeePageData
    const features = (jeeData[featuresKey] as any[]).filter((_, i) => i !== index)
    setJeeData({ ...jeeData, [featuresKey]: features })
  }

  const handleCourseChange = (index: number, field: string, value: string | string[]) => {
    if (!jeeData) return
    const updatedCourses = [...jeeData.courseDetails]
    updatedCourses[index] = { ...updatedCourses[index], [field]: value }
    setJeeData({ ...jeeData, courseDetails: updatedCourses })
  }

  const addCourse = () => {
    if (!jeeData) return
    const newCourse = {
      title: "",
      duration: "",
      description: "",
      features: [],
      price: "",
    }
    setJeeData({ ...jeeData, courseDetails: [...jeeData.courseDetails, newCourse] })
  }

  const removeCourse = (index: number) => {
    if (!jeeData) return
    const updatedCourses = jeeData.courseDetails.filter((_, i) => i !== index)
    setJeeData({ ...jeeData, courseDetails: updatedCourses })
  }

  const handleSave = async () => {
    if (!jeeData) return

    setSaving(true)
    try {
      await updateJeePageData(jeeData)
      toast({
        title: "Success",
        description: "JEE page updated successfully",
      })
    } catch (error) {
      console.error("Error saving JEE data:", error)
      toast({
        title: "Error",
        description: "Failed to save JEE page",
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

  if (!jeeData) {
    return <div>Error loading data</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">JEE Page Management</h1>
          <p className="text-muted-foreground">Manage JEE course content and curriculum details</p>
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
          <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>General page information and hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    value={jeeData.pageTitle}
                    onChange={(e) => handleBasicInfoChange("pageTitle", e.target.value)}
                    placeholder="JEE"
                  />
                </div>
                <div>
                  <Label htmlFor="pageSubtitle">Page Subtitle</Label>
                  <Input
                    id="pageSubtitle"
                    value={jeeData.pageSubtitle}
                    onChange={(e) => handleBasicInfoChange("pageSubtitle", e.target.value)}
                    placeholder="Learn Physics, Chemistry & Math From Experts"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pageDescription">Page Description</Label>
                <Textarea
                  id="pageDescription"
                  value={jeeData.pageDescription}
                  onChange={(e) => handleBasicInfoChange("pageDescription", e.target.value)}
                  placeholder="We provide coaching for Physics, Chemistry, and Mathematics..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="heroImage">Hero Image URL</Label>
                <Input
                  id="heroImage"
                  value={jeeData.heroImage}
                  onChange={(e) => handleBasicInfoChange("heroImage", e.target.value)}
                  placeholder="/images/jee/hero.jpg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="additionalInfo">Additional Info</Label>
                  <Textarea
                    id="additionalInfo"
                    value={jeeData.additionalInfo}
                    onChange={(e) => handleBasicInfoChange("additionalInfo", e.target.value)}
                    placeholder="We provide excellent study materials..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="ctaText">CTA Text</Label>
                  <Textarea
                    id="ctaText"
                    value={jeeData.ctaText}
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
                  value={jeeData.ctaButtonText}
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
                  value={jeeData.seoTitle}
                  onChange={(e) => handleBasicInfoChange("seoTitle", e.target.value)}
                  placeholder="Best JEE Coaching in Nagpur | Physics Chemistry Math Classes"
                />
              </div>
              <div>
                <Label htmlFor="seoDescription">SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={jeeData.seoDescription}
                  onChange={(e) => handleBasicInfoChange("seoDescription", e.target.value)}
                  placeholder="Get the best JEE preparation in Nagpur..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {["physics", "chemistry", "mathematics"].map((subject) => (
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
                    value={jeeData[`${subject}Title` as keyof JeePageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Title", e.target.value)}
                    placeholder={`${subject.charAt(0).toUpperCase() + subject.slice(1)}`}
                  />
                </div>
                <div>
                  <Label htmlFor={`${subject}Description`}>Description</Label>
                  <Textarea
                    id={`${subject}Description`}
                    value={jeeData[`${subject}Description` as keyof JeePageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Description", e.target.value)}
                    placeholder={`We prepare students to crack IIT-JEE ${subject}...`}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor={`${subject}Image`}>Image URL</Label>
                  <Input
                    id={`${subject}Image`}
                    value={jeeData[`${subject}Image` as keyof JeePageData] as string}
                    onChange={(e) => handleSubjectChange(subject, "Image", e.target.value)}
                    placeholder={`/images/jee/${subject}.jpg`}
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
                    {(jeeData[`${subject}Features` as keyof JeePageData] as any[]).map((feature, index) => (
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
                  <CardDescription>Manage JEE course offerings and pricing</CardDescription>
                </div>
                <Button onClick={addCourse} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {jeeData.courseDetails.map((course, index) => (
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
                            placeholder="1-Year JEE Course"
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
                            placeholder="₹60,000"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={course.description}
                          onChange={(e) => handleCourseChange(index, "description", e.target.value)}
                          placeholder="For students in 12th or repeating, full syllabus coverage."
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label>Features (one per line)</Label>
                        <Textarea
                          value={course.features.join("\n")}
                          onChange={(e) => handleCourseChange(index, "features", e.target.value.split("\n"))}
                          placeholder="Complete Physics, Chemistry & Math&#10;Regular Tests & Assignments&#10;Doubt Sessions"
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
