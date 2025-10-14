"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Loader2, Home, Eye, Settings } from "lucide-react"
import { getHomePageData, updateHomePageData, type HomePageData } from "@/lib/data-fetcher"
import { useToast } from "@/components/ui/use-toast"

export default function HomepageAdmin({homeData} : {homeData:HomePageData}) {
    const [data, setData] = useState<HomePageData | null>(homeData)
    // const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const homeData = await getHomePageData()
    //             setData(homeData)
    //         } catch (error) {
    //             console.error('Error fetching homepage data:', error)
    //             toast({
    //                 title: "Error",
    //                 description: "Failed to load homepage data",
    //                 variant: "destructive"
    //             })
    //         } finally {
    //             setLoading(false)
    //         }
    //     }
    //     fetchData()
    // }, [toast])

    const handleSave = async () => {
        if (!data) return

        setSaving(true)
        try {
            await updateHomePageData(data)
            toast({
                title: "Success",
                description: "Homepage updated successfully"
            })
        } catch (error) {
            console.error('Error saving homepage data:', error)
            toast({
                title: "Error",
                description: "Failed to save homepage data",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (field: keyof HomePageData, value: string | number) => {
        if (!data) return
        setData({ ...data, [field]: value })
    }

    // if (loading) {
    //     return (
    //         <div className="p-6 flex items-center justify-center min-h-screen">
    //             <Loader2 className="w-8 h-8 animate-spin" />
    //         </div>
    //     )
    // }

    if (!data) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Failed to load data</h2>
                    <p className="text-gray-600 mt-2">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Home className="w-8 h-8 mr-2" />
                        Homepage Settings
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your homepage content and settings</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Live
                    </Badge>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </div>

            {/* Site Basic Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Site Basic Information
                    </CardTitle>
                    <CardDescription>
                        Configure your site's basic information and branding
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="siteName">Site Name</Label>
                            <Input
                                id="siteName"
                                value={data.siteName}
                                onChange={(e) => handleInputChange('siteName', e.target.value)}
                                placeholder="Enter site name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="siteTagline">Site Tagline</Label>
                            <Input
                                id="siteTagline"
                                value={data.siteTagline}
                                onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                                placeholder="Enter site tagline"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                            id="logoUrl"
                            value={data.logoUrl}
                            onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                            placeholder="Enter logo URL"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Statistics</CardTitle>
                    <CardDescription>
                        Update your key performance statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="successRate">Success Rate</Label>
                            <Input
                                id="successRate"
                                value={data.successRate}
                                onChange={(e) => handleInputChange('successRate', e.target.value)}
                                placeholder="e.g., 95%"
                            />
                        </div>
                        <div>
                            <Label htmlFor="studentsCount">Students Count</Label>
                            <Input
                                id="studentsCount"
                                value={data.studentsCount}
                                onChange={(e) => handleInputChange('studentsCount', e.target.value)}
                                placeholder="e.g., 10,000+"
                            />
                        </div>
                        <div>
                            <Label htmlFor="iitSelections">IIT Selections</Label>
                            <Input
                                id="iitSelections"
                                value={data.iitSelections}
                                onChange={(e) => handleInputChange('iitSelections', e.target.value)}
                                placeholder="e.g., 500+"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                        Update your contact details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="contactPhone">Phone Number</Label>
                            <Input
                                id="contactPhone"
                                value={data.contactPhone}
                                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                                placeholder="Enter phone number"
                            />
                        </div>
                        <div>
                            <Label htmlFor="contactEmail">Email Address</Label>
                            <Input
                                id="contactEmail"
                                value={data.contactEmail}
                                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="contactAddress">Address</Label>
                        <Textarea
                            id="contactAddress"
                            value={data.contactAddress}
                            onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                            placeholder="Enter address"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <Card>
                <CardHeader>
                    <CardTitle>Footer</CardTitle>
                    <CardDescription>
                        Configure footer content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="footerDescription">Footer Description</Label>
                        <Textarea
                            id="footerDescription"
                            value={data.footerDescription}
                            onChange={(e) => handleInputChange('footerDescription', e.target.value)}
                            placeholder="Enter footer description"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="copyrightText">Copyright Text</Label>
                        <Input
                            id="copyrightText"
                            value={data.copyrightText}
                            onChange={(e) => handleInputChange('copyrightText', e.target.value)}
                            placeholder="Enter copyright text"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>
                        Optimize your homepage for search engines
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="seoTitle">SEO Title</Label>
                        <Input
                            id="seoTitle"
                            value={data.seoTitle}
                            onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                            placeholder="Enter SEO title"
                        />
                    </div>
                    <div>
                        <Label htmlFor="seoDescription">SEO Description</Label>
                        <Textarea
                            id="seoDescription"
                            value={data.seoDescription}
                            onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                            placeholder="Enter SEO description"
                            rows={3}
                        />
                    </div>
                    <div>
                        <Label htmlFor="seoKeywords">SEO Keywords</Label>
                        <Input
                            id="seoKeywords"
                            value={data.seoKeywords}
                            onChange={(e) => handleInputChange('seoKeywords', e.target.value)}
                            placeholder="Enter SEO keywords (comma separated)"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Color Scheme */}
            <Card>
                <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>
                        Customize your site's color palette
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="primaryColor">Primary Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={data.primaryColor}
                                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    value={data.primaryColor}
                                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                    placeholder="#1a73e8"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="secondaryColor">Secondary Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="secondaryColor"
                                    type="color"
                                    value={data.secondaryColor}
                                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    value={data.secondaryColor}
                                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                    placeholder="#4285f4"
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="accentColor">Accent Color</Label>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="accentColor"
                                    type="color"
                                    value={data.accentColor}
                                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    value={data.accentColor}
                                    onChange={(e) => handleInputChange('accentColor', e.target.value)}
                                    placeholder="#34a853"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    Save All Changes
                </Button>
            </div>
        </div>
    )
}