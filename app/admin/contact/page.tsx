"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Plus, Save, Loader2, Phone, Mail, MapPin, Clock } from "lucide-react"
import { getContactPageData, updateContactPageData, type ContactPageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function ContactPage() {
  const [contactData, setContactData] = useState<ContactPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await getContactPageData()
      // Ensure workingHours is always an array with at least one entry
      if (!Array.isArray(data.workingHours) || data.workingHours.length === 0) {
        data.workingHours = [{ day: "", hours: "" }]
      }
      setContactData(data)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load contact page data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBasicInfoChange = (field: string, value: string) => {
    if (!contactData) return
    setContactData({ ...contactData, [field]: value })
  }

  const handleContactNumberChange = (index: number, value: string) => {
    if (!contactData) return
    const updatedNumbers = [...contactData.contactNumbers]
    updatedNumbers[index] = value
    setContactData({ ...contactData, contactNumbers: updatedNumbers })
  }

  const addContactNumber = () => {
    if (!contactData) return
    setContactData({ ...contactData, contactNumbers: [...contactData.contactNumbers, ""] })
  }

  const removeContactNumber = (index: number) => {
    if (!contactData) return
    const updatedNumbers = contactData.contactNumbers.filter((_, i) => i !== index)
    setContactData({ ...contactData, contactNumbers: updatedNumbers })
  }

  const handleContactEmailChange = (index: number, value: string) => {
    if (!contactData) return
    const updatedEmails = [...contactData.contactEmails]
    updatedEmails[index] = value
    setContactData({ ...contactData, contactEmails: updatedEmails })
  }

  const addContactEmail = () => {
    if (!contactData) return
    setContactData({ ...contactData, contactEmails: [...contactData.contactEmails, ""] })
  }

  const removeContactEmail = (index: number) => {
    if (!contactData) return
    const updatedEmails = contactData.contactEmails.filter((_, i) => i !== index)
    setContactData({ ...contactData, contactEmails: updatedEmails })
  }

  const handleWorkingHoursChange = (index: number, field: string, value: string) => {
    if (!contactData || !contactData.workingHours) return
    const updatedHours = [...contactData.workingHours]
    updatedHours[index] = { ...updatedHours[index], [field]: value }
    setContactData({ ...contactData, workingHours: updatedHours })
  }

  const addWorkingHours = () => {
    if (!contactData) return
    const newHours = { day: "", hours: "" }
    setContactData({
      ...contactData,
      workingHours: [...(Array.isArray(contactData.workingHours) ? contactData.workingHours : []), newHours]
    })
  }

  const removeWorkingHours = (index: number) => {
    if (!contactData || !Array.isArray(contactData.workingHours)) return
    if (contactData.workingHours.length <= 1) {
      toast({
        title: "Warning",
        description: "You must have at least one working hours entry",
        variant: "default",
      })
      return
    }
    const updatedHours = contactData.workingHours.filter((_, i) => i !== index)
    setContactData({ ...contactData, workingHours: updatedHours })
  }

  const handleSave = async () => {
    if (!contactData) return

    setSaving(true)
    try {
      await updateContactPageData(contactData)
      toast({
        title: "Success",
        description: "Contact page updated successfully",
      })
    } catch (error) {
      console.error("Error saving contact data:", error)
      toast({
        title: "Error",
        description: "Failed to save contact page",
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

  if (!contactData) {
    return <div>Error loading data</div>
  }

  return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Contact Page Management</h1>
            <p className="text-muted-foreground">Manage contact information and office details</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="hours">Working Hours</TabsTrigger>
            <TabsTrigger value="map">Map & Location</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
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
                        value={contactData.pageTitle}
                        onChange={(e) => handleBasicInfoChange("pageTitle", e.target.value)}
                        placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroImage">Hero Image URL</Label>
                    <Input
                        id="heroImage"
                        value={contactData.heroImage}
                        onChange={(e) => handleBasicInfoChange("heroImage", e.target.value)}
                        placeholder="/images/contact/hero.jpg"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="pageDescription">Page Description</Label>
                  <Textarea
                      id="pageDescription"
                      value={contactData.pageDescription}
                      onChange={(e) => handleBasicInfoChange("pageDescription", e.target.value)}
                      placeholder="K.K.MISHRA CLASSES is providing Coaching for the preparation..."
                      rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="officeTitle">Office Title</Label>
                    <Input
                        id="officeTitle"
                        value={contactData.officeTitle}
                        onChange={(e) => handleBasicInfoChange("officeTitle", e.target.value)}
                        placeholder="Office Address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="officeImage">Office Image URL</Label>
                    <Input
                        id="officeImage"
                        value={contactData.officeImage}
                        onChange={(e) => handleBasicInfoChange("officeImage", e.target.value)}
                        placeholder="/images/contact/office.jpg"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea
                      id="officeAddress"
                      value={contactData.officeAddress}
                      onChange={(e) => handleBasicInfoChange("officeAddress", e.target.value)}
                      placeholder="94, Bajaj Nagar, Near CIIMS Hospital, Nagpur - Nagpur 440010"
                      rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                      id="additionalInfo"
                      value={contactData.additionalInfo}
                      onChange={(e) => handleBasicInfoChange("additionalInfo", e.target.value)}
                      placeholder="Any Questions or Query? Feel Free To Get In Touch..."
                      rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Form Settings</CardTitle>
                <CardDescription>Configure the contact form section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formTitle">Form Title</Label>
                  <Input
                      id="formTitle"
                      value={contactData.formTitle}
                      onChange={(e) => handleBasicInfoChange("formTitle", e.target.value)}
                      placeholder="Get In Touch"
                  />
                </div>
                <div>
                  <Label htmlFor="formDescription">Form Description</Label>
                  <Textarea
                      id="formDescription"
                      value={contactData.formDescription}
                      onChange={(e) => handleBasicInfoChange("formDescription", e.target.value)}
                      placeholder="Send us a message and we'll get back to you as soon as possible."
                      rows={2}
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
                      value={contactData.seoTitle}
                      onChange={(e) => handleBasicInfoChange("seoTitle", e.target.value)}
                      placeholder="Contact ABC Classes - Best JEE NEET Coaching"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                      id="seoDescription"
                      value={contactData.seoDescription}
                      onChange={(e) => handleBasicInfoChange("seoDescription", e.target.value)}
                      placeholder="Contact ABC Classes for JEE and NEET coaching inquiries..."
                      rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  Contact Numbers
                </CardTitle>
                <CardDescription>Manage phone numbers for contact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Contact Title</Label>
                    <Input
                        value={contactData.contactTitle}
                        onChange={(e) => handleBasicInfoChange("contactTitle", e.target.value)}
                        placeholder="Contact Details"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>Phone Numbers</Label>
                      <Button onClick={addContactNumber} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Number
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {contactData.contactNumbers.map((number, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                                value={number}
                                onChange={(e) => handleContactNumberChange(index, e.target.value)}
                                placeholder="9736213312"
                                className="flex-1"
                            />
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeContactNumber(index)}
                                disabled={contactData.contactNumbers.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Email Addresses
                </CardTitle>
                <CardDescription>Manage email addresses for contact</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label>Email Addresses</Label>
                    <Button onClick={addContactEmail} variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Email
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {contactData.contactEmails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                              value={email}
                              onChange={(e) => handleContactEmailChange(index, e.target.value)}
                              placeholder="kkmishraclasses@gmail.com"
                              className="flex-1"
                          />
                          <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeContactEmail(index)}
                              disabled={contactData.contactEmails.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-500" />
                      Working Hours
                    </CardTitle>
                    <CardDescription>Manage office working hours</CardDescription>
                  </div>
                  <Button onClick={addWorkingHours} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Hours
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/*{contactData.workingHours?.map((hours, index) => (*/}
                  {Array.isArray(contactData.workingHours) && contactData.workingHours.map((hours, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-4">
                            <Label className="text-sm font-medium">Working Hours {index + 1}</Label>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeWorkingHours(index)}
                                disabled={contactData.workingHours?.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Day(s)</Label>
                              <Input
                                  value={hours.day}
                                  onChange={(e) => handleWorkingHoursChange(index, "day", e.target.value)}
                                  placeholder="Monday - Friday"
                              />
                            </div>
                            <div>
                              <Label>Hours</Label>
                              <Input
                                  value={hours.hours}
                                  onChange={(e) => handleWorkingHoursChange(index, "hours", e.target.value)}
                                  placeholder="9:00 AM - 6:00 PM"
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

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-500" />
                  Map & Location
                </CardTitle>
                <CardDescription>Configure map embed and location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="mapTitle">Map Title</Label>
                  <Input
                      id="mapTitle"
                      value={contactData.mapTitle}
                      onChange={(e) => handleBasicInfoChange("mapTitle", e.target.value)}
                      placeholder="Find Us Here"
                  />
                </div>
                <div>
                  <Label htmlFor="mapEmbedUrl">Map Embed URL</Label>
                  <Textarea
                      id="mapEmbedUrl"
                      value={contactData.mapEmbedUrl}
                      onChange={(e) => handleBasicInfoChange("mapEmbedUrl", e.target.value)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      rows={4}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Get the embed URL from Google Maps by clicking "Share" → "Embed a map"
                  </p>
                </div>
                {contactData.mapEmbedUrl && (
                    <div>
                      <Label>Map Preview</Label>
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                            src={contactData.mapEmbedUrl}
                            title={contactData.mapTitle}
                            className="w-full h-full border-0"
                            allowFullScreen
                            loading="lazy"
                        />
                      </div>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}