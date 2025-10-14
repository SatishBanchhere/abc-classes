import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return new Response('Missing image URL', { status: 400 });
    }

    try {
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