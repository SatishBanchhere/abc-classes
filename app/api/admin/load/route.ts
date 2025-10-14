import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

export async function GET() {
  try {
    // Get all collections
    const homepageSnapshot = await adminDb.collection("websiteContent").doc("homepage").get()
    const contactSnapshot = await adminDb.collection("websiteContent").doc("contact").get()
    const jeeSnapshot = await adminDb.collection("websiteContent").doc("jee").get()
    const neetSnapshot = await adminDb.collection("websiteContent").doc("neet").get()
    const resultsSnapshot = await adminDb.collection("websiteContent").doc("results").get()

    const data = {
      homepage: homepageSnapshot.exists ? homepageSnapshot.data() : null,
      contact: contactSnapshot.exists ? contactSnapshot.data() : null,
      jee: jeeSnapshot.exists ? jeeSnapshot.data() : null,
      neet: neetSnapshot.exists ? neetSnapshot.data() : null,
      results: resultsSnapshot.exists ? resultsSnapshot.data() : null,
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Load error:", error)
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 })
  }
}