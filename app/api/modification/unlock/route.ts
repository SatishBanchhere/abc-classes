import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { getModels } from "@/lib/models";

// 🔑 Exam type normalization map
const EXAM_DB_KEYS: Record<string, string> = {
    "JEE": "JEE",
    "JEEMAINS": "JEE MAINS",
    "JEE MAIN": "JEE MAINS",
    "JEE MAINS": "JEE MAINS",
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
        const { examType, subjectId, topicName, lock, action } = await request.json();

        if (!examType || !subjectId || !topicName) {
            return NextResponse.json(
                { error: "examType, subjectId and topicName are required" },
                { status: 400 }
            );
        }

        // ✅ normalize examType
        const normalizedExamType = normalizeExamType(examType);

        // connect to DB
        const dbConn = await connectDB(normalizedExamType);
        const { Question } = getModels(dbConn);

        // count locked/unlocked
        if (action === "count") {
            const lockedCount = await Question.countDocuments({
                examType: normalizedExamType,
                subjectId,
                topicName,
                locked: true,
            });

            const totalCount = await Question.countDocuments({
                examType: normalizedExamType,
                subjectId,
                topicName,
            });

            return NextResponse.json({
                success: true,
                lockedCount,
                totalCount,
                unlockedCount: totalCount - lockedCount,
            });
        }

        // update lock status
        if (action === "update") {
            const result = await Question.updateMany(
                {
                    examType: normalizedExamType,
                    subjectId,
                    topicName,
                },
                { $set: { locked: lock || false } }
            );

            return NextResponse.json({
                success: true,
                message: "All questions updated successfully",
                matched: result.matchedCount ?? 0,
                modified: result.modifiedCount ?? 0,
                acknowledged: result.acknowledged ?? false,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action. Use "count" or "update"' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("Lock API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
