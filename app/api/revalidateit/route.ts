// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
    try {
        const path = req.nextUrl.searchParams.get("path");
        if (!path) {
            return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
        }

        // Revalidate the given path
        revalidatePath(path);

        return NextResponse.json({ revalidated: true, path });
    } catch (err: any) {
        return NextResponse.json({ revalidated: false, error: err.message }, { status: 500 });
    }
}
