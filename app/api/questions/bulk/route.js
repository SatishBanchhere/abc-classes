import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';

export async function POST(request) {
    try {
        const { examType, subjectChapters, difficulty } = await request.json();

        // subjectChapters format:
        // {
        //   "Physics": ["Mechanics", "Thermodynamics"],
        //   "Chemistry": ["Organic Chemistry", "Inorganic Chemistry"]
        // }

        if (!examType || !subjectChapters) {
            return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const connection = await connectDB(examType);
        const { Question } = getModels(connection);

        // Build the query to get all questions for all subjects and chapters at once
        const orConditions = [];

        Object.entries(subjectChapters).forEach(([subjectName, chapters]) => {
            chapters.forEach(chapterName => {
                const condition = {
                    examType,
                    subjectName,
                    topicName: chapterName
                };

                if (difficulty) {
                    condition.difficulty = difficulty;
                }

                orConditions.push(condition);
            });
        });

        // Single database query for all subjects and chapters
        const questions = await Question.find({
            $or: orConditions
        }).lean();

        // Group questions by subject and chapter for easier frontend processing
        const groupedQuestions = {};
        questions.forEach(question => {
            const subject = question.subjectName;
            const chapter = question.topicName;

            if (!groupedQuestions[subject]) {
                groupedQuestions[subject] = {};
            }
            if (!groupedQuestions[subject][chapter]) {
                groupedQuestions[subject][chapter] = [];
            }

            groupedQuestions[subject][chapter].push(question);
        });

        return new Response(JSON.stringify({
            questions: groupedQuestions,
            totalCount: questions.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching bulk questions:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
