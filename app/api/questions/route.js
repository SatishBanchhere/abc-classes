import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const examType = searchParams.get('examType');

        if (!examType) {
            return Response.json(
                { message: 'examType is required' },
                { status: 400 }
            );
        }

        // Connect to the specific database for this exam type
        const connection = await connectDB(examType);
        const { Question } = getModels(connection);

        const subjectId = searchParams.get('subjectId');
        const topicId = searchParams.get('topicId');
        const subtopicName = searchParams.get('subtopicName');
        const difficulty = searchParams.get('difficulty');
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = parseInt(searchParams.get('skip')) || 0;

        const filter = { examType };
        if (subjectId) filter.subjectId = subjectId;
        if (topicId) filter.topicId = topicId;
        if (subtopicName) filter.subtopicName = subtopicName;
        if (difficulty) filter.difficulty = difficulty;

        const questions = await Question.find(filter)
            .limit(limit)
            .skip(skip)
            .sort({ questionNo: 1 });

        const total = await Question.countDocuments(filter);

        return Response.json({
            questions,
            total,
            examType,
            hasMore: skip + questions.length < total
        });
    } catch (error) {
        return Response.json(
            { message: 'Failed to fetch questions', error: error.message },
            { status: 500 }
        );
    }
}
