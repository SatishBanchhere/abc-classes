import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType');
        const subjectName = searchParams.get('subjectName');
        const chapterName = searchParams.get('chapterName');
        const subtopicName = searchParams.get('subtopicName');
        const difficulty = searchParams.get('difficulty') || null;
        const limit = parseInt(searchParams.get('limit')) || 0;

        if (!examType || !subjectName || !chapterName || !subtopicName) {
            return new Response(JSON.stringify({ error: 'Missing required query parameters' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const connection = await connectDB(examType);
        const { Question } = getModels(connection);

        const filter = {
            examType,
            subjectName,
            topicName: chapterName,
            subtopicName,
        };

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        const questions = await Question.find(filter).limit(limit).lean();

        return new Response(JSON.stringify({ questions }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error fetching questions:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
