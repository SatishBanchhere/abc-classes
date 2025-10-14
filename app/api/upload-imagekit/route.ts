import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { base64, fileName } = await req.json()

        if (!base64 || !fileName) {
            return NextResponse.json({ error: 'Missing base64 or fileName' }, { status: 400 })
        }

        const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
            method: 'POST',
            headers: {
                Authorization: `Basic ${Buffer.from(process.env.IMAGEKIT_PRIVATE_API_KEY + ':').toString('base64')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file: base64,
                fileName,
                publicKey: process.env.IMAGEKIT_PUBLIC_KEY, // ✅ REQUIRED!
                folder: '/your-app-folder', // optional
                useUniqueFileName: true,
            }),
        })

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text()
            return NextResponse.json({ error: 'ImageKit Upload Failed', details: errorText }, { status: 500 })
        }

        const data = await uploadResponse.json()
        return NextResponse.json({ url: data.url })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Server Error' }, { status: 500 })
    }
}
