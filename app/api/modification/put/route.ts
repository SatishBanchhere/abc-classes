// app/api/lock-questions/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { getModels } from "@/lib/models";

export async function POST(request: NextRequest) {
    try {
        const { examType } = await request.json();

        // Connect to DB
        const dbConn = await connectDB(examType);
        const { Question } = getModels(dbConn);

        // Update all docs → set locked: true
        const result = await Question.updateMany(
            {},
            { $set: { locked: true } }
        );

        return NextResponse.json({
            success: true,
            message: "All questions updated successfully",
            matched: result.matchedCount ?? 0,
            modified: result.modifiedCount ?? 0,
            acknowledged: result.acknowledged ?? false,
        });
    } catch (err: any) {
        console.error("Error updating questions:", err);
        return NextResponse.json(
            { error: "Failed to update questions", details: err.message },
            { status: 500 }
        );
    }
}
