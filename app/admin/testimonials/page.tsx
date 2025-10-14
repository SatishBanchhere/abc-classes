"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Save, Loader2, Star } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function TestimonialsPage() {
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
        description: "Failed to load testimonials data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestimonialChange = (index: number, field: string, value: string | number) => {
    if (!homeData) return

    const updatedTestimonials = [...homeData.testimonials]
    updatedTestimonials[index] = { ...updatedTestimonials[index], [field]: value }

    setHomeData({ ...homeData, testimonials: updatedTestimonials })
  }

  const addTestimonial = () => {
    if (!homeData) return

    const newTestimonial = {
      name: "",
      college: "",
      rating: 5,
      review: "",
      avatar: "",
    }

    setHomeData({ ...homeData, testimonials: [...homeData.testimonials, newTestimonial] })
  }

  const removeTestimonial = (index: number) => {
    if (!homeData) return

    const updatedTestimonials = homeData.testimonials.filter((_, i) => i !== index)
    setHomeData({ ...homeData, testimonials: updatedTestimonials })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({ testimonials: homeData.testimonials })
      toast({
        title: "Success",
        description: "Testimonials updated successfully",
      })
    } catch (error) {
      console.error("Error saving testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to save testimonials",
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
          <h1 className="text-3xl font-bold">Testimonials Management</h1>
          <p className="text-muted-foreground">Manage student testimonials and reviews</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="space-y-6">
        {homeData.testimonials.map((testimonial, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Testimonial {index + 1}</CardTitle>
                <Button variant="destructive" size="sm" onClick={() => removeTestimonial(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`name-${index}`}>Student Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={testimonial.name}
                    onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                    placeholder="Student name"
                  />
                </div>
                <div>
                  <Label htmlFor={`college-${index}`}>College/Achievement</Label>
                  <Input
                    id={`college-${index}`}
                    value={testimonial.college}
                    onChange={(e) => handleTestimonialChange(index, "college", e.target.value)}
                    placeholder="IIT Delhi, CSE"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor={`rating-${index}`}>Rating</Label>
                <Select
                  value={testimonial.rating.toString()}
                  onValueChange={(value) => handleTestimonialChange(index, "rating", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-2">
                            {rating} Star{rating > 1 ? "s" : ""}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`review-${index}`}>Review</Label>
                <Textarea
                  id={`review-${index}`}
                  value={testimonial.review}
                  onChange={(e) => handleTestimonialChange(index, "review", e.target.value)}
                  placeholder="Student's testimonial..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor={`avatar-${index}`}>Avatar URL (Optional)</Label>
                <Input
                  id={`avatar-${index}`}
                  value={testimonial.avatar}
                  onChange={(e) => handleTestimonialChange(index, "avatar", e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="pt-6">
            <Button onClick={addTestimonial} variant="outline" className="w-full bg-transparent">
              <Plus className="h-4 w-4 mr-2" />
              Add New Testimonial
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
