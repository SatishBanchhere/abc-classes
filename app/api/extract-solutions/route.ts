import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Solution {
    question_no: number;
    solution: string;
    answer: string;
}

export async function POST(req: Request) {
    console.log("Received request for solution extraction.");

    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing Gemini API key");
        return NextResponse.json(
            { error: "Missing Gemini API key" },
            { status: 500 }
        );
    }

    try {
        const body = await req.json();
        const { solutionsHTML } = body;

        console.log("Request body parsed:", body);

        if (!solutionsHTML) {
            console.warn("Missing 'solutionsHTML' in request body.");
            return NextResponse.json(
                { error: "htmlContent is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        const prompt = `
        STRICTLY EXTRACT AND FORMAT EXISTING SOLUTIONS FROM THIS HTML CONTENT.
        DO NOT GENERATE NEW CONTENT OR SOLUTIONS.

        Required JSON format:
        {
            "solutions": [{
                "question_no": number,
                "solution": string,
                "answer": string
            }]
        }

        Rules:
        1. Only extract solutions that actually exist in the content
        2. Preserve all original:
        - Step-by-step explanations
        - Formulas and calculations
        - Final answers
        - <img> tags (with ImageKit URLs) and any associated CSS exactly as they are
        3. Include question numbers if available
        4. Never invent/make up solutions or answers
        5. Do not modify or strip any inline styles, classes, or attributes

        HTML Content:
        ${solutionsHTML}
        `;


        console.log("Sending prompt to Gemini API...");

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("Raw response from Gemini API:", text);

        // Extract JSON from response
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}") + 1;

        if (jsonStart === -1 || jsonEnd === -1) {
            console.error("JSON not found in response.");
            throw new Error("Could not parse JSON from model response.");
        }

        const jsonString = text.slice(jsonStart, jsonEnd);
        console.log("Extracted JSON string:", jsonString);

        const data = JSON.parse(jsonString);
        console.log("Parsed JSON object:", data);

        return NextResponse.json({
            success: true,
            solutions: data.solutions || []
        });

    } catch (error: any) {
        console.error("Error during solution extraction:", error.message);
        return NextResponse.json(
            {
                error: "Solution extraction failed",
                details: error.message
            },
            { status: 500 }
        );
    }
}
