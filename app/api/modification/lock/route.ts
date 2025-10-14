// app/api/modification/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { getModels } from "@/lib/models";

// 🔑 Exam type normalization map
const EXAM_DB_KEYS: Record<string, string> = {
    "JEE": "JEE",
    "JEEMAIN": "JEE",
    "JEE MAIN": "JEE",
    "JEE MAINS": "JEE",
    "JEE ADVANCED": "JEE",
    "NEET": "NEET",
    "NEET UG": "NEET",
};

// 🔧 Helper to normalize examType
function normalizeExamType(input: string): string {
    if (!input) return input;
    const key = input.trim().toUpperCase();
    return EXAM_DB_KEYS[key] || key;
}

export async function POST(request: NextRequest) {
    try {
        const { examType, questions } = await request.json();

        if (!examType || !questions || !Array.isArray(questions)) {
            return NextResponse.json(
                { error: "examType and questions[] are required" },
                { status: 400 }
            );
        }

        // ✅ Normalize examType
        const normalizedExamType = normalizeExamType(examType);

        // Connect to DB
        const dbConn = await connectDB(normalizedExamType);
        const { Question } = getModels(dbConn);

        // Extract IDs from questions array
        const ids = questions;

        // Update matching documents → set locked = false
        const result = await Question.updateMany(
            { _id: { $in: ids } },
            { $set: { locked: true } }
        );

        return NextResponse.json({
            success: true,
            examType: normalizedExamType,
            message: "Selected questions unlocked successfully",
            matched: result.matchedCount ?? 0,
            modified: result.modifiedCount ?? 0,
            acknowledged: result.acknowledged ?? false,
        });
    } catch (error: any) {
        console.error("❌ Unlock Questions API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
