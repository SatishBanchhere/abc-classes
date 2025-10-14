import { type NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"


const ADMIN_UID = process.env.ADMIN_UID

export async function POST(request: NextRequest) {
  try {
    const { collection, data, idToken } = await request.json()

    if (!collection || !data || !idToken) {
      return NextResponse.json(
        { error: "Missing collection or data" },
        { status: 400 }
      )
    }

    if (idToken !== ADMIN_UID) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid admin token" },
        { status: 403 }
      )
    }

    // Validate the collection name
    const validCollections = ["homepage", "contact", "jee", "neet", "results"]
    if (!validCollections.includes(collection)) {
      return NextResponse.json(
        { error: "Invalid collection name" },
        { status: 400 }
      )
    }

    // Save to Firestore
    await adminDb.collection("websiteContent").doc(collection).set(data, { merge: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save error:", error)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}