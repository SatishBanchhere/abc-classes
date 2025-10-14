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
        const { examType, subjectSelections, difficultyPercentages } = await request.json();

        console.log("📩 Incoming API call to /api/difficulty-select");
        console.log("📝 Request body:", { examType, subjectSelections, difficultyPercentages });

        if (!examType || !subjectSelections || !difficultyPercentages) {
            console.warn("⚠️ Missing required parameters:", { examType, subjectSelections, difficultyPercentages });
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        if (
            difficultyPercentages.easy + difficultyPercentages.medium + difficultyPercentages.hard !== 100
        ) {
            console.warn("⚠️ Difficulty percentages do not add up to 100:", difficultyPercentages);
            return NextResponse.json({ error: "Difficulty percentages must sum to 100" }, { status: 400 });
        }

        // ✅ Normalize examType
        const normalizedExamType =
            EXAM_DB_KEYS[examType.trim().toUpperCase()] || examType.trim().toUpperCase();

        console.log("🔑 Normalized examType:", normalizedExamType);

        console.log("🔗 Connecting to database...");
        const conn = await connectDB(normalizedExamType);
        const { Question } = getModels(conn);
        console.log("✅ Database connected & models ready");

        // Helper function
        async function fetchQuestions({ Question, examType, subjectId, difficulty, questionType, limit }: any) {
            const query: any = { examType, subjectId };
            if (difficulty) query.difficulty = difficulty[0].toUpperCase() + difficulty.slice(1);
            if (questionType) query.questionType = questionType;

            console.log("🔍 Running aggregate query:", { match: query, sampleSize: limit });

            const pipeline = [{ $match: query }, { $sample: { size: limit } }];
            const results = await Question.aggregate(pipeline);

            console.log(`📊 Found ${results.length} questions for subject=${subjectId}, type=${questionType}, difficulty=${difficulty}`);

            return results;
        }

        let allSelectedQuestions: any[] = [];

        console.log("📚 Iterating over subjectSelections...");
        for (const [subject, counts] of Object.entries(subjectSelections)) {
            const subjectId = subject;
            const mcqTotal = (counts as any).mcq ?? 0;
            const intTotal = (counts as any).integer ?? 0;

            console.log(`➡️ Subject: ${subjectId}`);
            console.log(`   Requested: MCQ=${mcqTotal}, Integer=${intTotal}`);

            // --- MCQ ---
            const easyMcqCount = Math.floor((difficultyPercentages.easy / 100) * mcqTotal);
            const mediumMcqCount = Math.floor((difficultyPercentages.medium / 100) * mcqTotal);
            const hardMcqCount = mcqTotal - easyMcqCount - mediumMcqCount;

            console.log(`   🎯 MCQ Split -> Easy=${easyMcqCount}, Medium=${mediumMcqCount}, Hard=${hardMcqCount}`);

            if (mcqTotal > 0) {
                const [easyMcq, mediumMcq, hardMcq] = await Promise.all([
                    easyMcqCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "easy", questionType: "mcq", limit: easyMcqCount }) : [],
                    mediumMcqCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "medium", questionType: "mcq", limit: mediumMcqCount }) : [],
                    hardMcqCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "hard", questionType: "mcq", limit: hardMcqCount }) : [],
                ]);
                allSelectedQuestions = allSelectedQuestions.concat(easyMcq, mediumMcq, hardMcq);
            }

            // --- Integer ---
            const easyIntCount = Math.floor((difficultyPercentages.easy / 100) * intTotal);
            const mediumIntCount = Math.floor((difficultyPercentages.medium / 100) * intTotal);
            const hardIntCount = intTotal - easyIntCount - mediumIntCount;

            console.log(`   🔢 Integer Split -> Easy=${easyIntCount}, Medium=${mediumIntCount}, Hard=${hardIntCount}`);

            if (intTotal > 0) {
                const [easyInt, mediumInt, hardInt] = await Promise.all([
                    easyIntCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "easy", questionType: "integer", limit: easyIntCount }) : [],
                    mediumIntCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "medium", questionType: "integer", limit: mediumIntCount }) : [],
                    hardIntCount > 0 ? fetchQuestions({ Question, examType: normalizedExamType, subjectId, difficulty: "hard", questionType: "integer", limit: hardIntCount }) : [],
                ]);
                allSelectedQuestions = allSelectedQuestions.concat(easyInt, mediumInt, hardInt);
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
        console.error("❌ Difficulty API Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: (error as any).message },
            { status: 500 }
        );
    }
}
