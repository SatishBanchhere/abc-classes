import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
    revalidatePath("/"); // Revalidate the homepage
    revalidatePath("/contact"); // Revalidate the contact
    revalidatePath("/jee"); // Revalidate the jee
    revalidatePath("/neet"); // Revalidate the neet
    revalidatePath("/results"); // Revalidate the results
    revalidatePath("/media"); // Revalidate the media
    revalidatePath("/admin"); // Revalidate the admin
    return NextResponse.json({ revalidated: true, now: Date.now() });
}