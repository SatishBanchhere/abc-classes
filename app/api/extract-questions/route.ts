import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

interface Question {
    question_no: number
    question_type: "mcq" | "integer"
    question_description: string
    option1: string | null
    option2: string | null
    option3: string | null
    option4: string | null
    correct_answer: string
    difficulty: "easy" | "medium" | "hard"
}

export async function POST(req: Request) {
    console.log("🚀 POST request initiated at:", new Date().toISOString())

    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ Missing Gemini API key")
        return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 })
    }
    console.log("✅ Gemini API key found")

    try {
        console.log("📝 Parsing request body...")
        const body = await req.json()
        console.log("📊 Request body keys:", Object.keys(body))

        const { questionsHTML, subtopics } = body
        console.log("📋 questionsHTML length:", questionsHTML?.length || 0)
        console.log("🏷️ subtopics count:", subtopics?.length || 0)
        console.log("🔍 questionsHTML preview:", questionsHTML?.substring(0, 200) + "...")

        if (!questionsHTML) {
            console.error("❌ questionsHTML is missing from request")
            return NextResponse.json({ error: "questionsHTML is required" }, { status: 400 })
        }

        console.log("🤖 Initializing Gemini model...")
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" })

        console.log("🔄 Processing subtopics...")
        const subtopicsString = subtopics
            .map((topic: { name: string }, index: number) => `${index + 1}. ${topic.name}`)
            .join('\n');

        console.log("📝 Generated subtopics string:")
        console.log(subtopicsString)

        console.log("🎯 Creating prompt for Gemini...")
        const prompt = `
        STRICTLY EXTRACT AND FORMAT EXISTING QUESTIONS FROM THIS HTML CONTENT.
        DO NOT GENERATE NEW CONTENT OR ANSWERS.
        
        Required JSON format:
        {
            "questions": [{
                "question_no": number,
                "question_type": "mcq" | "integer",
                "question_description": string (must be valid and complete HTML also don't mention question number),
                "option1": string | null (must be valid HTML also don't mention option number or null),
                "option2": string | null (must be valid HTML also don't mention option number or null),
                "option3": string | null (must be valid HTML also don't mention option number or null),
                "option4": string | null (must be valid HTML also don't mention option number or null),
                "correct_answer": string,
                "subtopic": string (subtopic should be chosen from the available subtopics listed below),
                "difficulty": "easy" | "medium" | "hard"
            }]
        }

        Available Subtopics (choose the most appropriate one for each question and choose the same string as it is from the string because it wil be used in code later):
        ${subtopicsString}

        Notes:
        - All HTML must be syntactically correct and properly closed.
        - Do **not** include numbering or labels inside HTML content (e.g., no "Q1.", "1)", "a)", "Option 1").
        - Use semantic HTML tags appropriately (\`<p>\` for text, \`<img>\` for images, etc.).
        - The \`correct_answer\` should match the option text exactly, not its number.
        - For subtopic assignment, analyze the question content and choose the most relevant subtopic from the provided list.

        Rules:
        1. Only extract questions that actually exist in the content
        2. For MCQs:
           - Preserve all original options exactly as they appear
           - Only mark correct_answer if explicitly shown in content
        3. For integer questions:
           - Set options to null
           - Include correct_answer only if provided
        4. Never invent/make up questions or answers
        5. For difficulty level, analyze the question complexity:
           - "easy": Basic concepts, straightforward calculations
           - "medium": Moderate complexity, requires some thinking
           - "hard": Complex problems, advanced concepts, multi-step solutions
        6. If difficulty cannot be determined, default to "medium"
        7. Each question MUST have a subtopic assigned from the provided list

        HTML Content:
        ${questionsHTML}
        `;

        console.log("📏 Prompt length:", prompt.length)
        console.log("🚀 Sending request to Gemini...")
        const startTime = Date.now()

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        const endTime = Date.now()
        console.log("⏱️ Gemini response time:", endTime - startTime, "ms")
        console.log("📝 Raw response length:", text.length)
        console.log("🔍 Raw response preview:", text.substring(0, 300) + "...")

        // Extract JSON from response
        console.log("🔍 Extracting JSON from response...")
        const jsonStart = text.indexOf("{")
        const jsonEnd = text.lastIndexOf("}") + 1

        console.log("📍 JSON boundaries - start:", jsonStart, "end:", jsonEnd)

        if (jsonStart === -1 || jsonEnd === 0) {
            console.error("❌ No valid JSON found in response")
            console.error("🔍 Full response text:", text)
            throw new Error("No valid JSON found in response")
        }

        const jsonString = text.slice(jsonStart, jsonEnd)
        console.log("📄 Extracted JSON string length:", jsonString.length)
        console.log("🔍 JSON string preview:", jsonString)

        console.log("🔄 Parsing JSON...")
        const data = JSON.parse(jsonString)
        console.log("✅ JSON parsed successfully")
        console.log("📊 Questions found:", data.questions?.length || 0)
        console.log("🔍 First question preview:", JSON.stringify(data.questions?.[0], null, 2))

        // Validate and ensure difficulty is set
        console.log("🔄 Processing and validating questions...")
        const questions = (data.questions || []).map((q: any, index: number) => {
            console.log(`📝 Processing question ${index + 1}:`, {
                question_no: q.question_no,
                type: q.question_type,
                difficulty: q.difficulty,
                subtopic: q.subtopic,
                has_description: !!q.question_description,
                description_length: q.question_description?.length || 0
            })

            return {
                ...q,
                difficulty: q.difficulty || "medium", // Default to medium if not set
            }
        })

        console.log("📊 Final processed questions count:", questions.length)
        console.log("📈 Questions by difficulty:", {
            easy: questions.filter((q: any) => q.difficulty === "easy").length,
            medium: questions.filter((q: any) => q.difficulty === "medium").length,
            hard: questions.filter((q: any) => q.difficulty === "hard").length
        })
        console.log("📋 Questions by type:", {
            mcq: questions.filter((q: any) => q.question_type === "mcq").length,
            integer: questions.filter((q: any) => q.question_type === "integer").length
        })

        console.log("✅ Returning successful response")
        return NextResponse.json({
            success: true,
            questions: questions,
        })

    } catch (error: any) {
        console.error("💥 Question extraction error occurred:")
        console.error("🔴 Error name:", error.name)
        console.error("🔴 Error message:", error.message)
        console.error("🔴 Error stack:", error.stack)

        if (error.message.includes("JSON")) {
            console.error("🔍 This appears to be a JSON parsing error")
        }

        return NextResponse.json(
            {
                error: "Question extraction failed",
                details: error.message,
            },
            { status: 500 },
        )
    }
}
