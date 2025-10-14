"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Loader2, Settings, Palette, Globe, LinkIcon } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { toast } from "@/hooks/use-toast"

export default function SiteSettingsPage() {
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
        description: "Failed to load site settings data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBasicChange = (field: string, value: string) => {
    if (!homeData) return
    setHomeData({ ...homeData, [field]: value })
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    if (!homeData) return
    setHomeData({
      ...homeData,
      socialLinks: {
        ...homeData.socialLinks,
        [platform]: value,
      },
    })
  }

  const handleQuickLinkChange = (index: number, field: string, value: string) => {
    if (!homeData) return
    const updatedLinks = [...homeData.quickLinks]
    updatedLinks[index] = { ...updatedLinks[index], [field]: value }
    setHomeData({ ...homeData, quickLinks: updatedLinks })
  }

  const handleProgramChange = (index: number, field: string, value: string) => {
    if (!homeData) return
    const updatedPrograms = [...homeData.programs]
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value }
    setHomeData({ ...homeData, programs: updatedPrograms })
  }

  const handleSave = async () => {
    if (!homeData) return

    setSaving(true)
    try {
      await updateHomePageData({
        siteName: homeData.siteName,
        siteTagline: homeData.siteTagline,
        logoUrl: homeData.logoUrl,
        footerDescription: homeData.footerDescription,
        quickLinks: homeData.quickLinks,
        programs: homeData.programs,
        contactPhone: homeData.contactPhone,
        contactEmail: homeData.contactEmail,
        contactAddress: homeData.contactAddress,
        socialLinks: homeData.socialLinks,
        seoTitle: homeData.seoTitle,
        seoDescription: homeData.seoDescription,
        seoKeywords: homeData.seoKeywords,
        primaryColor: homeData.primaryColor,
        secondaryColor: homeData.secondaryColor,
        accentColor: homeData.accentColor,
        copyrightText: homeData.copyrightText,
      })
      toast({
        title: "Success",
        description: "Site settings updated successfully",
      })
    } catch (error) {
      console.error("Error saving site settings:", error)
      toast({
        title: "Error",
        description: "Failed to save site settings",
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
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">Manage global site configuration and branding</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic site information and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={homeData.siteName}
                    onChange={(e) => handleBasicChange("siteName", e.target.value)}
                    placeholder="KK Mishra Classes"
                  />
                </div>
                <div>
                  <Label htmlFor="siteTagline">Site Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={homeData.siteTagline}
                    onChange={(e) => handleBasicChange("siteTagline", e.target.value)}
                    placeholder="Excellence in Education"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  value={homeData.logoUrl}
                  onChange={(e) => handleBasicChange("logoUrl", e.target.value)}
                  placeholder="/images/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="footerDescription">Footer Description</Label>
                <Textarea
                  id="footerDescription"
                  value={homeData.footerDescription}
                  onChange={(e) => handleBasicChange("footerDescription", e.target.value)}
                  placeholder="Leading JEE coaching institute with 15+ years of excellence..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="copyrightText">Copyright Text</Label>
                <Input
                  id="copyrightText"
                  value={homeData.copyrightText}
                  onChange={(e) => handleBasicChange("copyrightText", e.target.value)}
                  placeholder="© 2025 KK Mishra Classes. All rights reserved."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Footer navigation links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {homeData.quickLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Link Title</Label>
                    <Input
                      value={link.title}
                      onChange={(e) => handleQuickLinkChange(index, "title", e.target.value)}
                      placeholder="About Us"
                    />
                  </div>
                  <div>
                    <Label>Link URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => handleQuickLinkChange(index, "url", e.target.value)}
                      placeholder="/about"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Programs</CardTitle>
              <CardDescription>Footer program links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {homeData.programs.map((program, index) => (
                <div key={index} className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Program Title</Label>
                      <Input
                        value={program.title}
                        onChange={(e) => handleProgramChange(index, "title", e.target.value)}
                        placeholder="JEE Main"
                      />
                    </div>
                    <div>
                      <Label>Program URL</Label>
                      <Input
                        value={program.url}
                        onChange={(e) => handleProgramChange(index, "url", e.target.value)}
                        placeholder="/jee"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Program Description</Label>
                    <Input
                      value={program.description}
                      onChange={(e) => handleProgramChange(index, "description", e.target.value)}
                      placeholder="Comprehensive JEE Main preparation"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>Customize your site's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={homeData.primaryColor}
                      onChange={(e) => handleBasicChange("primaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={homeData.primaryColor}
                      onChange={(e) => handleBasicChange("primaryColor", e.target.value)}
                      placeholder="#1a73e8"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={homeData.secondaryColor}
                      onChange={(e) => handleBasicChange("secondaryColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={homeData.secondaryColor}
                      onChange={(e) => handleBasicChange("secondaryColor", e.target.value)}
                      placeholder="#4285f4"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={homeData.accentColor}
                      onChange={(e) => handleBasicChange("accentColor", e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={homeData.accentColor}
                      onChange={(e) => handleBasicChange("accentColor", e.target.value)}
                      placeholder="#34a853"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Label>Color Preview</Label>
                <div className="flex gap-4 mt-2">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md"
                      style={{ backgroundColor: homeData.primaryColor }}
                    />
                    <span className="text-sm mt-1">Primary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg shadow-md"
                      style={{ backgroundColor: homeData.secondaryColor }}
                    />
                    <span className="text-sm mt-1">Secondary</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-lg shadow-md" style={{ backgroundColor: homeData.accentColor }} />
                    <span className="text-sm mt-1">Accent</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary contact details displayed across the site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={homeData.contactPhone}
                  onChange={(e) => handleBasicChange("contactPhone", e.target.value)}
                  placeholder="+91 97362 13312"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  value={homeData.contactEmail}
                  onChange={(e) => handleBasicChange("contactEmail", e.target.value)}
                  placeholder="support@kkmishraclasses.com"
                />
              </div>
              <div>
                <Label htmlFor="contactAddress">Address</Label>
                <Textarea
                  id="contactAddress"
                  value={homeData.contactAddress}
                  onChange={(e) => handleBasicChange("contactAddress", e.target.value)}
                  placeholder="Nagpur, Maharashtra, India"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Social media profiles and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={homeData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange("twitter", e.target.value)}
                    placeholder="https://twitter.com/kkmishraclasses"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={homeData.socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange("facebook", e.target.value)}
                    placeholder="https://facebook.com/kkmishraclasses"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={homeData.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange("instagram", e.target.value)}
                    placeholder="https://instagram.com/kkmishraclasses"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={homeData.socialLinks.youtube}
                    onChange={(e) => handleSocialLinkChange("youtube", e.target.value)}
                    placeholder="https://youtube.com/@kkmishraclasses"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={homeData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/company/kkmishraclasses"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>Search engine optimization configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seoTitle">Default SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={homeData.seoTitle}
                  onChange={(e) => handleBasicChange("seoTitle", e.target.value)}
                  placeholder="KK Mishra Classes - Best JEE & NEET Coaching Institute"
                />
                <p className="text-sm text-muted-foreground mt-1">Recommended length: 50-60 characters</p>
              </div>
              <div>
                <Label htmlFor="seoDescription">Default SEO Description</Label>
                <Textarea
                  id="seoDescription"
                  value={homeData.seoDescription}
                  onChange={(e) => handleBasicChange("seoDescription", e.target.value)}
                  placeholder="Leading JEE and NEET coaching institute with expert faculty, comprehensive study material, and proven results."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">Recommended length: 150-160 characters</p>
              </div>
              <div>
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
                <Textarea
                  id="seoKeywords"
                  value={homeData.seoKeywords}
                  onChange={(e) => handleBasicChange("seoKeywords", e.target.value)}
                  placeholder="JEE coaching, NEET coaching, IIT preparation, medical entrance"
                  rows={2}
                />
                <p className="text-sm text-muted-foreground mt-1">Separate keywords with commas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
