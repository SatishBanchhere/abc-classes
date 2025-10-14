"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Save, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface HomePageData {
  siteName: string
  siteTagline: string
  logoUrl: string
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroImage: string
  heroButtonText: string
  heroSecondaryButtonText: string
  successRate: string
  studentsCount: string
  iitSelections: string
  galleryImages: string[]
  youtubeVideos: string[]
  features: Array<{
    title: string
    description: string
    icon: string
  }>
  testimonials: Array<{
    name: string
    college: string
    rating: number
    review: string
    avatar: string
  }>
  footerDescription: string
  quickLinks: string[]
  programs: string[]
  contactPhone: string
  contactEmail: string
  contactAddress: string
  socialLinks: {
    twitter: string
    facebook: string
    instagram: string
  }
  copyrightText: string
}

interface ContactPageData {
  pageTitle: string
  pageDescription: string
  officeTitle: string
  officeAddress: string
  contactTitle: string
  contactNumbers: string[]
  contactEmails: string[]
  mapEmbedUrl: string
  workingHours: string
  additionalInfo: string
}

interface JeePageData {
  pageTitle: string
  pageSubtitle: string
  pageDescription: string
  physicsTitle: string
  physicsDescription: string
  physicsFeatures: string[]
  chemistryTitle: string
  chemistryDescription: string
  chemistryFeatures: string[]
  additionalInfo: string
  ctaText: string
}

interface NeetPageData {
  pageTitle: string
  pageSubtitle: string
  pageDescription: string
  physicsTitle: string
  physicsDescription: string
  physicsFeatures: string[]
  chemistryTitle: string
  chemistryDescription: string
  chemistryFeatures: string[]
  additionalInfo: string
  ctaText: string
}

interface ResultsPageData {
  pageTitle: string
  pageDescription: string
  currentYearTitle: string
  currentYearDescription: string
  achievementImages: string[]
  toppers: Array<{
    name: string
    achievement: string
    image: string
    rank: string
  }>
  previousYears: Array<{
    year: string
    description: string
    toppers: Array<{
      name: string
      achievement: string
    }>
  }>
  testimonialImages: string[]
}

const defaultHomePageData: HomePageData = {
  siteName: "",
  siteTagline: "",
  logoUrl: "",
  heroTitle: "",
  heroSubtitle: "",
  heroDescription: "",
  heroImage: "",
  heroButtonText: "",
  heroSecondaryButtonText: "",
  successRate: "",
  studentsCount: "",
  iitSelections: "",
  galleryImages: [],
  youtubeVideos: [],
  features: [],
  testimonials: [],
  footerDescription: "",
  quickLinks: [],
  programs: [],
  contactPhone: "",
  contactEmail: "",
  contactAddress: "",
  socialLinks: {
    twitter: "",
    facebook: "",
    instagram: "",
  },
  copyrightText: "",
}

const defaultContactPageData: ContactPageData = {
  pageTitle: "",
  pageDescription: "",
  officeTitle: "",
  officeAddress: "",
  contactTitle: "",
  contactNumbers: [],
  contactEmails: [],
  mapEmbedUrl: "",
  workingHours: "",
  additionalInfo: "",
}

const defaultJeePageData: JeePageData = {
  pageTitle: "",
  pageSubtitle: "",
  pageDescription: "",
  physicsTitle: "",
  physicsDescription: "",
  physicsFeatures: [],
  chemistryTitle: "",
  chemistryDescription: "",
  chemistryFeatures: [],
  additionalInfo: "",
  ctaText: "",
}

const defaultNeetPageData: NeetPageData = {
  pageTitle: "",
  pageSubtitle: "",
  pageDescription: "",
  physicsTitle: "",
  physicsDescription: "",
  physicsFeatures: [],
  chemistryTitle: "",
  chemistryDescription: "",
  chemistryFeatures: [],
  additionalInfo: "",
  ctaText: "",
}

const defaultResultsPageData: ResultsPageData = {
  pageTitle: "",
  pageDescription: "",
  currentYearTitle: "",
  currentYearDescription: "",
  achievementImages: [],
  toppers: [],
  previousYears: [],
  testimonialImages: [],
}

export default function AdminPanel() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [activeTab, setActiveTab] = useState("homepage")

  // State for all page data
  const [homePageData, setHomePageData] = useState<HomePageData>(defaultHomePageData)
  const [contactPageData, setContactPageData] = useState<ContactPageData>(defaultContactPageData)
  const [jeePageData, setJeePageData] = useState<JeePageData>(defaultJeePageData)
  const [neetPageData, setNeetPageData] = useState<NeetPageData>(defaultNeetPageData)
  const [resultsPageData, setResultsPageData] = useState<ResultsPageData>(defaultResultsPageData)

 const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [youtubeInput, setYoutubeInput] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Verify if user is admin
        try {
          const idToken = await user.uid;
          const response = await fetch("/api/admin/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${idToken}`,
            },
          })

          if (response.ok) {
            setUser(user)
          } else {
            await signOut(auth)
            toast({
              title: "Access Denied",
              description: "You don't have admin privileges",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Verification error:", error)
          await signOut(auth)
        }
      }
      setCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [toast])


   const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.uid;
      console.log(idToken);
      // Verify admin status
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      })

      if (response.ok) {
        setUser(userCredential.user)
      } else {
        await signOut(auth)
        throw new Error("You don't have admin privileges")
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      toast({
        title: "Logged out successfully",
      })
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Image upload function
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("image", file)

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success) {
        return data.data.url
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Image upload error:", error)
      throw error
    }
  }

  // Save data to Firebase
  const saveToFirebase = async (collection: string, data: any) => {
    if (collection === "homepage") {
      data = {
        ...data,
        youtubeVideos: data.youtubeVideos.filter((url: string) => url.trim() !== ""),
      };
    }

    setLoading(true)
    try {
      const idToken = await user?.uid;
      const response = await fetch("/api/admin/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collection, data, idToken }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `${collection} data saved successfully!`,
        })
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load data from Firebase
  const loadFromFirebase = async () => {
    setInitialLoad(true)
    try {
      const response = await fetch("/api/admin/load")
      const data = await response.json()
      
      if (data.homepage) setHomePageData(data.homepage)
      if (data.contact) setContactPageData(data.contact)
      if (data.jee) setJeePageData(data.jee)
      if (data.neet) setNeetPageData(data.neet)
      if (data.results) setResultsPageData(data.results)
    } catch (error) {
      console.error("Load error:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setInitialLoad(false)
    }
  }

  useEffect(() => {
    loadFromFirebase()
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const url = await uploadImage(file)
      callback(url)
      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  )

  
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }


  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="container mx-auto p-6">
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Loading Admin Panel</h2>
              <p className="text-slate-500">Fetching your data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">ABC Classes - Admin Panel</h1>
          <p className="text-slate-600">Manage all website content from this central dashboard</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-slate-200/60">
            <TabsTrigger value="homepage" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Homepage
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="jee" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              JEE
            </TabsTrigger>
            <TabsTrigger value="neet" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              NEET
            </TabsTrigger>
            <TabsTrigger value="results" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Results
            </TabsTrigger>
          </TabsList>

          {/* Homepage Tab */}
          <TabsContent value="homepage" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Homepage Content Management
                </CardTitle>
                <CardDescription>
                  Manage all homepage content including hero section, features, testimonials, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Header Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Header & Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={homePageData.siteName}
                        onChange={(e) => setHomePageData({ ...homePageData, siteName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="siteTagline">Site Tagline</Label>
                      <Input
                        id="siteTagline"
                        value={homePageData.siteTagline}
                        onChange={(e) => setHomePageData({ ...homePageData, siteTagline: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logoUpload">Logo Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="logoUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (url) => setHomePageData({ ...homePageData, logoUrl: url }))
                        }
                      />
                      {homePageData.logoUrl && (
                        <Image
                          src={homePageData.logoUrl}
                          alt="Logo"
                          width={50}
                          height={50}
                          className="rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Hero Section</h3>
                  <div>
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={homePageData.heroTitle}
                      onChange={(e) => setHomePageData({ ...homePageData, heroTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Input
                      id="heroSubtitle"
                      value={homePageData.heroSubtitle}
                      onChange={(e) => setHomePageData({ ...homePageData, heroSubtitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroDescription">Hero Description</Label>
                    <Textarea
                      id="heroDescription"
                      value={homePageData.heroDescription}
                      onChange={(e) => setHomePageData({ ...homePageData, heroDescription: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="heroImageUpload">Hero Image</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="heroImageUpload"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageUpload(e, (url) => setHomePageData({ ...homePageData, heroImage: url }))
                        }
                      />
                      {homePageData.heroImage && (
                        <Image
                          src={homePageData.heroImage}
                          alt="Hero"
                          width={100}
                          height={60}
                          className="rounded"
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroButtonText">Primary Button Text</Label>
                      <Input
                        id="heroButtonText"
                        value={homePageData.heroButtonText}
                        onChange={(e) => setHomePageData({ ...homePageData, heroButtonText: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroSecondaryButtonText">Secondary Button Text</Label>
                      <Input
                        id="heroSecondaryButtonText"
                        value={homePageData.heroSecondaryButtonText}
                        onChange={(e) => setHomePageData({ ...homePageData, heroSecondaryButtonText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="successRate">Success Rate</Label>
                      <Input
                        id="successRate"
                        value={homePageData.successRate}
                        onChange={(e) => setHomePageData({ ...homePageData, successRate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentsCount">Students Count</Label>
                      <Input
                        id="studentsCount"
                        value={homePageData.studentsCount}
                        onChange={(e) => setHomePageData({ ...homePageData, studentsCount: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="iitSelections">IIT Selections</Label>
                      <Input
                        id="iitSelections"
                        value={homePageData.iitSelections}
                        onChange={(e) => setHomePageData({ ...homePageData, iitSelections: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Gallery Images</h3>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        files.forEach((file) => {
                          uploadImage(file).then((url) => {
                            setHomePageData((prev) => ({
                              ...prev,
                              galleryImages: [...prev.galleryImages, url],
                            }))
                          })
                        })
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {homePageData.galleryImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Gallery ${index}`}
                          width={150}
                          height={100}
                          className="rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            setHomePageData((prev) => ({
                              ...prev,
                              galleryImages: prev.galleryImages.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* YouTube Videos Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">YouTube Videos</h3>
                  <div className="flex gap-2">
                    <Input
                        placeholder="YouTube URL"
                        value={youtubeInput} // Add this state
                        onChange={(e) => setYoutubeInput(e.target.value)} // Add this handler
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (youtubeInput.trim()) {
                              setHomePageData((prev) => ({
                                ...prev,
                                youtubeVideos: [...prev.youtubeVideos, youtubeInput],
                              }));
                              setYoutubeInput(""); // Clear the input
                            }
                          }
                        }}
                    />
                    <Button
                        onClick={() => {
                          if (youtubeInput.trim()) {
                            setHomePageData((prev) => ({
                              ...prev,
                              youtubeVideos: [...prev.youtubeVideos, youtubeInput],
                            }));
                            setYoutubeInput(""); // Clear the input
                          }
                        }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {homePageData.youtubeVideos.map((video, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={video} readOnly />
                          <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setHomePageData((prev) => ({
                                  ...prev,
                                  youtubeVideos: prev.youtubeVideos.filter((_, i) => i !== index),
                                }));
                              }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => saveToFirebase("homepage", homePageData)} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Homepage Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle>Contact Page Management</CardTitle>
                <CardDescription>Manage contact information and office details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactPageTitle">Page Title</Label>
                    <Input
                      id="contactPageTitle"
                      value={contactPageData.pageTitle}
                      onChange={(e) => setContactPageData({ ...contactPageData, pageTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPageDescription">Page Description</Label>
                    <Textarea
                      id="contactPageDescription"
                      value={contactPageData.pageDescription}
                      onChange={(e) => setContactPageData({ ...contactPageData, pageDescription: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="officeAddress">Office Address</Label>
                  <Textarea
                    id="officeAddress"
                    value={contactPageData.officeAddress}
                    onChange={(e) => setContactPageData({ ...contactPageData, officeAddress: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Numbers</Label>
                    {contactPageData.contactNumbers.map((number, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={number}
                          onChange={(e) => {
                            const newNumbers = [...contactPageData.contactNumbers]
                            newNumbers[index] = e.target.value
                            setContactPageData({ ...contactPageData, contactNumbers: newNumbers })
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setContactPageData({
                              ...contactPageData,
                              contactNumbers: contactPageData.contactNumbers.filter((_, i) => i !== index),
                            })
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => {
                        setContactPageData({
                          ...contactPageData,
                          contactNumbers: [...contactPageData.contactNumbers, ""],
                        })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Number
                    </Button>
                  </div>

                  <div>
                    <Label>Contact Emails</Label>
                    {contactPageData.contactEmails.map((email, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...contactPageData.contactEmails]
                            newEmails[index] = e.target.value
                            setContactPageData({ ...contactPageData, contactEmails: newEmails })
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setContactPageData({
                              ...contactPageData,
                              contactEmails: contactPageData.contactEmails.filter((_, i) => i !== index),
                            })
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      onClick={() => {
                        setContactPageData({
                          ...contactPageData,
                          contactEmails: [...contactPageData.contactEmails, ""],
                        })
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Email
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => saveToFirebase("contact", contactPageData)}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Contact Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* JEE Tab */}
          <TabsContent value="jee" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle>JEE Page Management</CardTitle>
                <CardDescription>Manage JEE coaching information and course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="jeePageTitle">Page Title</Label>
                    <Input
                      id="jeePageTitle"
                      value={jeePageData.pageTitle}
                      onChange={(e) => setJeePageData({ ...jeePageData, pageTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="jeePageSubtitle">Page Subtitle</Label>
                    <Input
                      id="jeePageSubtitle"
                      value={jeePageData.pageSubtitle}
                      onChange={(e) => setJeePageData({ ...jeePageData, pageSubtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="jeePageDescription">Page Description</Label>
                  <Textarea
                    id="jeePageDescription"
                    value={jeePageData.pageDescription}
                    onChange={(e) => setJeePageData({ ...jeePageData, pageDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Physics Section</h4>
                    <div>
                      <Label htmlFor="physicsTitle">Physics Title</Label>
                      <Input
                        id="physicsTitle"
                        value={jeePageData.physicsTitle}
                        onChange={(e) => setJeePageData({ ...jeePageData, physicsTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="physicsDescription">Physics Description</Label>
                      <Textarea
                        id="physicsDescription"
                        value={jeePageData.physicsDescription}
                        onChange={(e) => setJeePageData({ ...jeePageData, physicsDescription: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Chemistry Section</h4>
                    <div>
                      <Label htmlFor="chemistryTitle">Chemistry Title</Label>
                      <Input
                        id="chemistryTitle"
                        value={jeePageData.chemistryTitle}
                        onChange={(e) => setJeePageData({ ...jeePageData, chemistryTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chemistryDescription">Chemistry Description</Label>
                      <Textarea
                        id="chemistryDescription"
                        value={jeePageData.chemistryDescription}
                        onChange={(e) => setJeePageData({ ...jeePageData, chemistryDescription: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => saveToFirebase("jee", jeePageData)} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save JEE Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NEET Tab */}
          <TabsContent value="neet" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle>NEET Page Management</CardTitle>
                <CardDescription>Manage NEET coaching information and course details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="neetPageTitle">Page Title</Label>
                    <Input
                      id="neetPageTitle"
                      value={neetPageData.pageTitle}
                      onChange={(e) => setNeetPageData({ ...neetPageData, pageTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="neetPageSubtitle">Page Subtitle</Label>
                    <Input
                      id="neetPageSubtitle"
                      value={neetPageData.pageSubtitle}
                      onChange={(e) => setNeetPageData({ ...neetPageData, pageSubtitle: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="neetPageDescription">Page Description</Label>
                  <Textarea
                    id="neetPageDescription"
                    value={neetPageData.pageDescription}
                    onChange={(e) => setNeetPageData({ ...neetPageData, pageDescription: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Physics Section</h4>
                    <div>
                      <Label htmlFor="neetPhysicsTitle">Physics Title</Label>
                      <Input
                        id="neetPhysicsTitle"
                        value={neetPageData.physicsTitle}
                        onChange={(e) => setNeetPageData({ ...neetPageData, physicsTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neetPhysicsDescription">Physics Description</Label>
                      <Textarea
                        id="neetPhysicsDescription"
                        value={neetPageData.physicsDescription}
                        onChange={(e) => setNeetPageData({ ...neetPageData, physicsDescription: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Chemistry Section</h4>
                    <div>
                      <Label htmlFor="neetChemistryTitle">Chemistry Title</Label>
                      <Input
                        id="neetChemistryTitle"
                        value={neetPageData.chemistryTitle}
                        onChange={(e) => setNeetPageData({ ...neetPageData, chemistryTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neetChemistryDescription">Chemistry Description</Label>
                      <Textarea
                        id="neetChemistryDescription"
                        value={neetPageData.chemistryDescription}
                        onChange={(e) => setNeetPageData({ ...neetPageData, chemistryDescription: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={() => saveToFirebase("neet", neetPageData)} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save NEET Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60">
              <CardHeader>
                <CardTitle>Results Page Management</CardTitle>
                <CardDescription>Manage student achievements and success stories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="resultsPageTitle">Page Title</Label>
                    <Input
                      id="resultsPageTitle"
                      value={resultsPageData.pageTitle}
                      onChange={(e) => setResultsPageData({ ...resultsPageData, pageTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="resultsPageDescription">Page Description</Label>
                    <Textarea
                      id="resultsPageDescription"
                      value={resultsPageData.pageDescription}
                      onChange={(e) => setResultsPageData({ ...resultsPageData, pageDescription: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="achievementImagesUpload">Achievement Images</Label>
                  <Input
                    id="achievementImagesUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      files.forEach((file) => {
                        uploadImage(file).then((url) => {
                          setResultsPageData((prev) => ({
                            ...prev,
                            achievementImages: [...prev.achievementImages, url],
                          }))
                        })
                      })
                    }}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {resultsPageData.achievementImages.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image}
                          alt={`Achievement ${index}`}
                          width={150}
                          height={200}
                          className="rounded"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-1 right-1"
                          onClick={() => {
                            setResultsPageData((prev) => ({
                              ...prev,
                              achievementImages: prev.achievementImages.filter((_, i) => i !== index),
                            }))
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => saveToFirebase("results", resultsPageData)}
                  disabled={loading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Saving..." : "Save Results Data"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}