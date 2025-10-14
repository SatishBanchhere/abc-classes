import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';

// Comprehensive exam type mapping
const EXAM_TYPE_MAPPING = {
    // JEE variations
    'JEE': 'JEE MAINS',
    'JEEM': 'JEE MAINS',
    'JEEMAIN': 'JEE MAINS',
    'JEEMAINS': 'JEE MAINS',
    'JEE MAIN': 'JEE MAINS',
    'JEE MAINS': 'JEE MAINS',
    'JEE ADVANCED': 'JEE ADVANCED',
    'JEEADV': 'JEE ADVANCED',
    'JEEADVANCED': 'JEE ADVANCED',

    // NEET variations
    'NEET': 'NEET',
    'NEETUG': 'NEET',
    'NEET UG': 'NEET',
    'NEET-UG': 'NEET'
};

function normalizeExamType(inputExamType) {
    if (!inputExamType || typeof inputExamType !== 'string') {
        return null;
    }

    // Clean and normalize the input
    const cleaned = inputExamType
        .trim()
        .toUpperCase()
        .replace(/[-_\s]+/g, ' ')  // Replace hyphens, underscores, multiple spaces with single space
        .replace(/\s+/g, ' ')      // Replace multiple spaces with single space
        .trim();

    // Direct mapping
    if (EXAM_TYPE_MAPPING[cleaned]) {
        return EXAM_TYPE_MAPPING[cleaned];
    }

    // Try without spaces
    const withoutSpaces = cleaned.replace(/\s/g, '');
    if (EXAM_TYPE_MAPPING[withoutSpaces]) {
        return EXAM_TYPE_MAPPING[withoutSpaces];
    }

    console.log(`Unknown exam type: "${inputExamType}" (cleaned: "${cleaned}")`);
    return null;
}

export async function POST(request) {
    let connection = null;

    try {
        // Parse request body
        let body;
        try {
            body = await request.json();
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return new Response(JSON.stringify({
                error: 'Invalid JSON in request body',
                details: parseError.message
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { examType: rawExamType, subjectChapters, difficulty, questionType } = body;

        console.log('=== API REQUEST DEBUG ===');
        console.log('Raw examType:', rawExamType);
        console.log('Request body:', JSON.stringify(body, null, 2));

        // Normalize exam type
        const normalizedExamType = normalizeExamType(rawExamType);

        if (!normalizedExamType) {
            const availableTypes = Object.keys(EXAM_TYPE_MAPPING).join(', ');
            return new Response(JSON.stringify({
                error: `Invalid exam type: "${rawExamType}". Available types: ${availableTypes}`
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Normalized examType:', normalizedExamType);

        // Validate required parameters
        if (!subjectChapters || typeof subjectChapters !== 'object') {
            return new Response(JSON.stringify({
                error: 'subjectChapters is required and must be an object'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if subjectChapters is empty
        if (Object.keys(subjectChapters).length === 0) {
            return new Response(JSON.stringify({
                error: 'subjectChapters cannot be empty'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Connect to database using the DB connection mapping (which uses JEE for JEE MAINS)
        const dbExamType = normalizedExamType === 'JEE MAINS' ? 'JEE' : normalizedExamType;
        console.log('Connecting to database with examType:', dbExamType);

        connection = await connectDB(dbExamType);
        console.log('Database connection successful');

        const { Question } = getModels(connection);

        // First, let's check what data exists in the database
        console.log('=== DATABASE INSPECTION ===');

        // Get total count for this exam type (using normalized form)
        const totalCount = await Question.countDocuments({ examType: normalizedExamType });
        console.log(`Total questions for ${normalizedExamType}:`, totalCount);

        if (totalCount === 0) {
            // Try alternative exam type formats
            const alternativeQueries = [
                { examType: rawExamType },
                { examType: dbExamType },
                { examType: 'JEE' },
                { examType: 'JEEMAIN' }
            ];

            let foundAlternative = null;
            for (const query of alternativeQueries) {
                const count = await Question.countDocuments(query);
                if (count > 0) {
                    foundAlternative = query.examType;
                    console.log(`Found ${count} questions with examType: "${foundAlternative}"`);
                    break;
                }
            }

            if (!foundAlternative) {
                // Show what exam types actually exist
                const distinctExamTypes = await Question.distinct('examType');
                console.log('Available exam types in database:', distinctExamTypes);

                return new Response(JSON.stringify({
                    error: `No questions found for exam type: ${normalizedExamType}`,
                    questions: {},
                    totalCount: 0,
                    debug: {
                        requestedExamType: rawExamType,
                        normalizedExamType,
                        dbExamType,
                        availableExamTypes: distinctExamTypes
                    }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Get sample questions to understand data structure
        const sampleQuestions = await Question.find({ examType: normalizedExamType }).limit(3).lean();
        console.log('Sample questions structure:', JSON.stringify(sampleQuestions.map(q => ({
            examType: q.examType,
            subjectName: q.subjectName,
            subjectId: q.subjectId,
            topicName: q.topicName,
            topicId: q.topicId,
            subtopicName: q.subtopicName,
            difficulty: q.difficulty,
            questionType: q.questionType
        })), null, 2));

        // Execute the main query - IGNORE CHAPTERS, just get all questions for the subjects
        const orConditions = [];

        Object.keys(subjectChapters).forEach((subjectKey) => {
            // Try different combinations of subject matching (ignore chapters)
            const conditions = [
                // Exact match by name
                {
                    examType: normalizedExamType,
                    subjectName: subjectKey
                },
                // Match by ID
                {
                    examType: normalizedExamType,
                    subjectId: subjectKey
                },
                // Case insensitive matching
                {
                    examType: normalizedExamType,
                    subjectName: { $regex: new RegExp(`^${subjectKey}$`, 'i') }
                }
            ];

            conditions.forEach(condition => {
                const finalCondition = { ...condition };

                // Add optional filters
                if (difficulty && difficulty.trim() !== '') {
                    finalCondition.difficulty = difficulty;
                }
                if (questionType && questionType.trim() !== '') {
                    finalCondition.questionType = questionType;
                }

                orConditions.push(finalCondition);
            });
        });

        console.log('=== QUERY CONDITIONS (IGNORING CHAPTERS) ===');
        console.log('Total OR conditions:', orConditions.length);
        console.log('Querying for subjects only:', Object.keys(subjectChapters));

        // Execute the main query
        const questions = await Question.find({
            $or: orConditions
        }).lean();

        console.log(`Found ${questions.length} questions matching subjects (ignoring chapters)`);

        // Group questions by subject only (ignore chapters)
        const groupedQuestions = {};
        questions.forEach(question => {
            // Find which subject this question matches from the request
            let matchedSubject = null;

            Object.keys(subjectChapters).forEach((subjectKey) => {
                if (
                    question.subjectName === subjectKey ||
                    question.subjectId === subjectKey ||
                    (question.subjectName && question.subjectName.toLowerCase() === subjectKey.toLowerCase())
                ) {
                    matchedSubject = subjectKey;
                }
            });

            // Fallback to question's own subject name
            const subject = matchedSubject || question.subjectName || question.subjectId;

            if (!groupedQuestions[subject]) {
                groupedQuestions[subject] = {
                    // Create a dummy "all" chapter to hold all questions for this subject
                    "all": []
                };
            }

            // Put all questions in the "all" chapter bucket
            groupedQuestions[subject]["all"].push(question);
        });

        console.log('=== RESPONSE SUMMARY ===');
        console.log('Grouped questions structure:');
        Object.entries(groupedQuestions).forEach(([subject, chapters]) => {
            Object.entries(chapters).forEach(([chapter, questions]) => {
                console.log(`${subject} -> ${chapter}: ${questions.length} questions`);
            });
        });

        return new Response(JSON.stringify({
            success: true,
            questions: groupedQuestions,
            totalCount: questions.length,
            debug: {
                requestedExamType: rawExamType,
                normalizedExamType,
                dbExamType,
                requestedSubjects: Object.keys(subjectChapters),
                queryConditionsCount: orConditions.length
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('=== API ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                name: error.name
            } : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}