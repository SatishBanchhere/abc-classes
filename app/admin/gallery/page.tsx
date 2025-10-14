"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Image as ImageIcon, Upload, Eye, Save, X } from "lucide-react"
import { getHomePageData, updateHomePageData } from "@/lib/data-fetcher"
import { toast } from "sonner"

interface GalleryImage {
    url: string
    alt: string
    caption?: string
}

export default function GalleryAdmin() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [newImage, setNewImage] = useState<GalleryImage>({
        url: '',
        alt: '',
        caption: ''
    })

    useEffect(() => {
        fetchGalleryData()
    }, [])

    const fetchGalleryData = async () => {
        try {
            const homeData = await getHomePageData()
            setImages(homeData.galleryImages)
        } catch (error) {
            console.error('Error fetching gallery data:', error)
            toast.error('Failed to load gallery images')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveChanges = async () => {
        setSaving(true)
        try {
            await updateHomePageData({ galleryImages: images })
            toast.success('Gallery updated successfully!')
        } catch (error) {
            console.error('Error saving gallery:', error)
            toast.error('Failed to save gallery changes')
        } finally {
            setSaving(false)
        }
    }

    const handleAddImage = () => {
        if (!newImage.url || !newImage.alt) {
            toast.error('Please provide both URL and alt text')
            return
        }

        setImages([...images, { ...newImage }])
        setNewImage({ url: '', alt: '', caption: '' })
        setShowAddDialog(false)
        toast.success('Image added successfully!')
    }

    const handleEditImage = (index: number, updatedImage: GalleryImage) => {
        const updatedImages = [...images]
        updatedImages[index] = updatedImage
        setImages(updatedImages)
        setEditingIndex(null)
        toast.success('Image updated successfully!')
    }

    const handleDeleteImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index)
        setImages(updatedImages)
        toast.success('Image deleted successfully!')
    }

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('image', file)

            // Upload to ImgBB
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                setNewImage(prev => ({
                    ...prev,
                    url: data.data.url
                }))
                toast.success('Image uploaded successfully!')
            } else {
                throw new Error(data.error?.message || 'Failed to upload image')
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Failed to upload image')
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
                    <p className="text-gray-600 mt-1">Manage your website's gallery images</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Badge variant="secondary">
                        {images.length} {images.length === 1 ? 'Image' : 'Images'}
                    </Badge>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Image
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Image</DialogTitle>
                                <DialogDescription>
                                    Add a new image to your gallery
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="image-upload">Upload Image</Label>
                                    <div className="mt-2">
                                        <Input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="mb-2"
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <p className="text-sm text-gray-500">Uploading image...</p>
                                        )}
                                        <p className="text-sm text-gray-500">Or enter image URL below</p>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="image-url">Image URL</Label>
                                    <Input
                                        id="image-url"
                                        value={newImage.url}
                                        onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image-alt">Alt Text *</Label>
                                    <Input
                                        id="image-alt"
                                        value={newImage.alt}
                                        onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
                                        placeholder="Describe the image"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="image-caption">Caption (Optional)</Label>
                                    <Textarea
                                        id="image-caption"
                                        value={newImage.caption}
                                        onChange={(e) => setNewImage({ ...newImage, caption: e.target.value })}
                                        placeholder="Add a caption for this image"
                                        rows={3}
                                    />
                                </div>
                                {newImage.url && (
                                    <div className="mt-4">
                                        <Label>Preview</Label>
                                        <img
                                            src={newImage.url}
                                            alt={newImage.alt || 'Image preview'}
                                            className="mt-2 w-full h-40 object-cover rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-2 mt-6">
                                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddImage} disabled={!newImage.url || !newImage.alt}>
                                    Add Image
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={handleSaveChanges} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Gallery Grid */}
            {images.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No images yet</h3>
                        <p className="text-gray-600 text-center mb-4">
                            Start building your gallery by adding your first image
                        </p>
                        <Button onClick={() => setShowAddDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Image
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((image, index) => (
                        <Card key={index} className="overflow-hidden">
                            <div className="aspect-video relative">
                                <img
                                    src={image.url}
                                    alt={image.alt}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 flex space-x-1">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => window.open(image.url, '_blank')}
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setEditingIndex(index)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Image</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to delete this image? This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteImage(index)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                {editingIndex === index ? (
                                    <EditImageForm
                                        image={image}
                                        onSave={(updatedImage) => handleEditImage(index, updatedImage)}
                                        onCancel={() => setEditingIndex(null)}
                                    />
                                ) : (
                                    <div>
                                        <p className="font-medium text-sm mb-1">{image.alt}</p>
                                        {image.caption && (
                                            <p className="text-sm text-gray-600">{image.caption}</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

function EditImageForm({
                           image,
                           onSave,
                           onCancel
                       }: {
    image: GalleryImage
    onSave: (image: GalleryImage) => void
    onCancel: () => void
}) {
    const [editedImage, setEditedImage] = useState(image)

    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor="edit-alt">Alt Text</Label>
                <Input
                    id="edit-al t"
                    value={editedImage.alt}
                    onChange={(e) => setEditedImage({ ...editedImage, alt: e.target.value })}
                    className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="edit-caption">Caption</Label>
                <Textarea
                    id="edit-caption"
                    value={editedImage.caption || ''}
                    onChange={(e) => setEditedImage({ ...editedImage, caption: e.target.value })}
                    className="mt-1"
                    rows={2}
                />
            </div>
            <div className="flex justify-end space-x-2">
                <Button size="sm" variant="outline" onClick={onCancel}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </Button>
                <Button size="sm" onClick={() => onSave(editedImage)}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                </Button>
            </div>
        </div>
    )
}