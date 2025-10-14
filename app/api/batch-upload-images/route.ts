import { NextRequest } from 'next/server';

// GET handler - Image Proxy
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new Response('Missing image URL', { status: 400 });
    }

    try {
        // Fetch image directly from external URL
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new Response('Failed to fetch image', { status: response.status });
        }

        const blob = await response.blob();
        return new Response(blob, {
            headers: {
                'Content-Type': blob.type,
            },
        });
    } catch (error) {
        return new Response('Failed to proxy image', { status: 500 });
    }
}

// POST handler - Batch Upload Images
export async function POST(request: NextRequest) {
    try {
        const { imageUrls } = await request.json()

        if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return Response.json({ success: false, error: 'No image URLs provided' }, { status: 400 })
        }

        console.log(`📥 Received batch upload request for ${imageUrls.length} images`)

        const results = await Promise.allSettled(
            imageUrls.map(async (imageUrl: string, index: number) => {
                try {
                    // ✅ Fetch image directly from external URL (no internal API call)
                    const response = await fetch(imageUrl);
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

                    const blob = await response.blob();
                    const file = new File([blob], `upload_${index}.jpg`, { type: blob.type });

                    // Upload to ImageKit
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("fileName", `upload_${index}.jpg`)

                    const auth = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`)
                    const imagekitResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                        method: "POST",
                        headers: { "Authorization": `Basic ${auth}` },
                        body: formData
                    })

                    if (!imagekitResponse.ok) {
                        throw new Error(`ImageKit upload failed: ${imagekitResponse.status}`)
                    }

                    const data = await imagekitResponse.json()
                    console.log(`✅ Image ${index + 1} uploaded successfully`)

                    return { success: true, url: data.url, index }
                } catch (error: any) {
                    console.error(`❌ Failed to upload image ${index + 1}:`, error)
                    return { success: false, error: error.message, index }
                }
            })
        )

        // Process results
        const processedResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value
            } else {
                return { success: false, error: result.reason?.message || 'Unknown error', index }
            }
        })

        const successCount = processedResults.filter(r => r.success).length
        const failureCount = processedResults.length - successCount

        console.log(`📊 Batch upload complete: ${successCount} success, ${failureCount} failed`)

        return Response.json({
            success: true,
            results: processedResults,
            summary: {
                total: imageUrls.length,
                successful: successCount,
                failed: failureCount
            }
        })

    } catch (error: any) {
        console.error('🔥 Batch upload API error:', error)
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
