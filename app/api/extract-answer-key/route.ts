import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface AnswerKeyItem {
    question_no: number;
    answer: string; // Could be option (A/B/C/D) or integer value
    question_type: "mcq" | "integer";
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
        const { htmlContent } = body;

        if (!htmlContent) {
            return NextResponse.json(
                { error: "htmlContent is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
    Extract ONLY the answer key information and topic/subject from the following HTML content.
    DO NOT generate any new content or answers.

    Required JSON format:
    {
      "topic": string,
      "answer_key": [{
        "question_no": number,
        "answer": string,
        "question_type": "mcq" | "integer"
      }]
    }

    Rules:
    1. Extract the main topic/subject of the test/exam from titles, headings, or context
    2. Extract question numbers exactly as they appear
    3. For MCQs:
       - Capture the correct option (A/B/C/D or 1/2/3/4)
       - Convert all options to uppercase (A/B/C/D)
    4. For integer answers:
       - Extract the exact numerical value
    5. Only include answers that are explicitly shown in the content
    6. Never invent/make up answers or topics
    7. If no clear topic is found, use "General" as the topic

    HTML Content:
    ${htmlContent}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        const data = JSON.parse(jsonString);

        return NextResponse.json({
            success: true,
            topic: data.topic || "General",
            answer_key: data.answer_key || []
        });

    } catch (error: any) {
        return NextResponse.json(
            {
                error: "Answer key extraction failed",
                details: error.message
            },
            { status: 500 }
        );
    }
}