// app/api/questions/route.ts
import {NextResponse} from 'next/server'
import connectDB from '@/lib/db/connection'
import {getModels} from '@/lib/models'

// 🔑 Exam type normalization map
const EXAM_DB_KEYS: Record<string, string> = {
    "JEE": "JEE",
    "JEEMAIN": "JEE MAINS",
    "JEE MAIN": "JEE",
    "JEE MAINS": "JEE",
    "JEE ADVANCED": "JEE",
    "NEET": "NEET",
    "NEET UG": "NEET",
}

// 🔧 Helper to normalize examType
function normalizeExamType(input: string): string {
    if (!input) return input
    const key = input.trim().toUpperCase()
    return EXAM_DB_KEYS[key] || key
}

export async function POST(req: Request) {
    try {
        console.log('📩 Incoming request to /api/questions')

        const body = await req.json()
        console.log('📝 Request body:', body)

        let {examType, subject, limit, chapter, difficulty, questionType} = body

        if (!examType || !subject) {
            console.warn('⚠️ Missing required parameters:', {examType, subject})
            return NextResponse.json(
                {error: 'Missing required parameters: examType and subject are required'},
                {status: 400}
            )
        }

        // ✅ Normalize examType using map
        const normalizedExamType = normalizeExamType(examType)
        console.log('🔎 Normalized examType:', normalizedExamType)

        // Connect to DB
        console.log(`🔗 Connecting to database for examType: ${normalizedExamType}`)
        const connection = await connectDB(normalizedExamType)
        const {Question} = getModels(connection)

        // Build query
        const query: any = {
            examType: normalizedExamType, // normalized value
            subjectName: {$regex: new RegExp(subject, 'i')},
        }

        if (chapter) {
            query.topicName = {$regex: new RegExp(chapter, 'i')}
        }

        if (difficulty) {
            query.difficulty = difficulty.toLowerCase()
        }

        if (questionType) {
            query.questionType = questionType.toLowerCase()
        }

        console.log('🔍 Final MongoDB query:', query)

        // Execute query
        const start = Date.now()
        const questions = await Question.find(query).sort({questionNo: 1}).limit(limit).lean().exec()
        const duration = Date.now() - start

        console.log(`✅ Found ${questions.length} questions in ${duration}ms`)

        return NextResponse.json({
            success: true,
            questions,
            count: questions.length,
        })
    } catch (error: any) {
        console.error('❌ Error fetching questions:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                message:
                    process.env.NODE_ENV === 'development'
                        ? error.message
                        : 'Database query failed',
            },
            {status: 500}
        )
    }
}
