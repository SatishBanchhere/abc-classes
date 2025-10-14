import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import { getModels } from "@/lib/models";

// 🔑 Exam type normalization map
const EXAM_DB_KEYS: Record<string, string> = {
    "JEE": "JEE",
    "JEEMAIN": "JEE MAINS",
    "JEE MAIN": "JEE",
    "JEE MAINS": "JEE",
    "JEE ADVANCED": "JEE",
    "NEET": "NEET",
    "NEET UG": "NEET",
};

export async function POST(request: NextRequest) {
    try {
        const { examType, subjectSelections } = await request.json();

        console.log("📩 Incoming API call to /api/auto-select-questions");
        console.log("📝 Request body:", { examType, subjectSelections });

        if (!examType || !subjectSelections) {
            console.warn("⚠️ Missing required parameters:", { examType, subjectSelections });
            return NextResponse.json(
                { error: "Missing required parameters" },
                { status: 400 }
            );
        }

        // ✅ Normalize examType using map
        const normalizedExamType =
            EXAM_DB_KEYS[examType.trim().toUpperCase()] || examType.trim().toUpperCase();

        console.log("🔑 Normalized examType:", normalizedExamType);

        console.log("🔗 Connecting to database for examType:", normalizedExamType);
        const conn = await connectDB(normalizedExamType);
        const { Question } = getModels(conn);
        console.log("✅ Database connected & models initialized");

        // Helper for random fetch
        async function fetchQuestions({ Question, examType, subjectId, questionType, locked, limit }: any) {
            const query: any = { examType, subjectId };
            if (questionType) query.questionType = questionType;
            if (typeof locked === "boolean") query.locked = locked;  // 👈 add this

            console.log("🔍 Running aggregate query:", {
                match: query,
                sampleSize: limit,
            });

            const pipeline = [{ $match: query }, { $sample: { size: limit } }];
            const results = await Question.aggregate(pipeline);
            return results;
        }

        let allSelectedQuestions: any[] = [];

        console.log("📚 Iterating over subjectSelections...");
        for (const [subject, counts] of Object.entries(subjectSelections)) {
            const subjectId = subject; // keep as provided by user
            console.log(`➡️ Subject: ${subject} (normalized: ${subjectId})`);
            console.log("   Counts:", counts);

            // MCQ
            if ((counts as any).mcq > 0) {
                console.log(`   🎯 Fetching ${counts.mcq} MCQ questions...`);
                const mcq = await fetchQuestions({
                    Question,
                    examType: normalizedExamType,
                    subjectId,
                    questionType: "mcq",
                    locked: false,
                    limit: (counts as any).mcq,
                });
                allSelectedQuestions = allSelectedQuestions.concat(mcq);
            }

            // Integer
            if ((counts as any).integer > 0) {
                console.log(`   🔢 Fetching ${counts.integer} Integer questions...`);
                const integer = await fetchQuestions({
                    Question,
                    examType: normalizedExamType,
                    subjectId,
                    questionType: "integer",
                    locked: false,
                    limit: (counts as any).integer,
                });
                allSelectedQuestions = allSelectedQuestions.concat(integer);
            }
        }

        console.log("✅ Final selection complete");
        console.log("📦 Total questions selected:", allSelectedQuestions.length);

        return NextResponse.json({
            success: true,
            questions: allSelectedQuestions,
            total: allSelectedQuestions.length,
        });
    } catch (error) {
        console.error("❌ API Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: (error as any).message },
            { status: 500 }
        );
    }
}
