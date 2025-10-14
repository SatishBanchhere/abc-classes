import {NextRequest} from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { base64Images } = await request.json()

        if (!Array.isArray(base64Images) || base64Images.length === 0) {
            return Response.json({ success: false, error: 'No base64 images provided' }, { status: 400 })
        }

        console.log(`📥 Received batch base64 upload request for ${base64Images.length} images`)

        const results = await Promise.allSettled(
            base64Images.map(async (base64DataUrl: string, index: number) => {
                try {
                    // Extract the base64 data and mime type
                    const matches = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/)
                    if (!matches) {
                        throw new Error('Invalid base64 data URL format')
                    }

                    const mimeType = matches[1]
                    const base64Data = matches[2]

                    // Convert base64 to buffer
                    const buffer = Buffer.from(base64Data, 'base64')

                    // Determine file extension from mime type
                    const extension = mimeType.split('/')[1] || 'jpg'
                    const fileName = `base64_upload_${index}.${extension}`

                    // Create blob and file for ImageKit
                    const blob = new Blob([buffer], { type: mimeType })
                    const file = new File([blob], fileName, { type: mimeType })

                    // Upload to ImageKit
                    const formData = new FormData()
                    formData.append("file", file)
                    formData.append("fileName", fileName)

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
                    console.log(`✅ Base64 image ${index + 1} uploaded successfully`)

                    return { success: true, url: data.url, index }
                } catch (error: any) {
                    console.error(`❌ Failed to upload base64 image ${index + 1}:`, error)
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

        console.log(`📊 Base64 batch upload complete: ${successCount} success, ${failureCount} failed`)

        return Response.json({
            success: true,
            results: processedResults,
            summary: {
                total: base64Images.length,
                successful: successCount,
                failed: failureCount
            }
        })

    } catch (error: any) {
        console.error('🔥 Base64 batch upload API error:', error)
        return Response.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
