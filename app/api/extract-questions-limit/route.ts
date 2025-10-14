import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Question {
    question_no: number;
    question_type: "mcq" | "integer";
    question_description: string;
    option1: string | null;
    option2: string | null;
    option3: string | null;
    option4: string | null;
    correct_answer: string;
}

interface PartialProcessingResult {
    questions: Question[];
    remaining_content?: string;
    last_processed_question?: number;
    continuation_point?: string;
}

export async function POST(req: Request) {
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "Missing Gemini API key" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { questionsHTML, continuationPoint } = body;

        if (!questionsHTML) {
            return NextResponse.json(
                { error: "questionsHTML is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        STRICTLY EXTRACT AND FORMAT EXISTING QUESTIONS FROM THIS HTML CONTENT.
        DO NOT GENERATE NEW CONTENT OR ANSWERS.

        ${continuationPoint ? `CONTINUE PROCESSING FROM: ${continuationPoint}` : ''}

        Required JSON format:
        {
            "questions": [{
                "question_no": number,
                "question_type": "mcq" | "integer",
                "question_description": string,
                "option1": string | null,
                "option2": string | null,
                "option3": string | null,
                "option4": string | null,
                "correct_answer": string
            }],
            "remaining_content": "string (if content was partially processed)",
            "continuation_point": "string (marker for where to continue)"
        }

        Rules:
        1. Process about 5-10 questions at a time
        2. If content is too long, return:
           - "remaining_content" with unprocessed portion
           - "continuation_point" with exact text marker where to continue
        3. For partial questions:
           - Either complete the current question or
           - Note where it was cut off in "continuation_point"
        4. For MCQs:
           - Preserve all original options exactly
           - Only mark correct_answer if explicitly shown
        5. For integer questions:
           - Set options to null
           - Include correct_answer only if provided

        HTML Content:
        ${continuationPoint ?
            `...CONTINUED FROM PREVIOUS REQUEST...\n` +
            questionsHTML.split(continuationPoint)[1] :
            questionsHTML}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        const data: PartialProcessingResult = JSON.parse(jsonString);

        return NextResponse.json({
            success: true,
            questions: data.questions || [],
            remainingContent: data.remaining_content,
            continuationPoint: data.continuation_point,
            hasMore: !!data.remaining_content
        });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Question extraction failed",
                details: error.message
            },
            { status: 500 }
        );
    }
}