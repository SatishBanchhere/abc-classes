import {NextRequest, NextResponse} from "next/server";
import connectDB from "@/lib/db/connection";
import {getModels} from "@/lib/models";

export async function POST(request: NextRequest){
    try{
        const {examType, subjectId, topicName} = await request.json();

        if (!subjectId || !topicName) {
            return NextResponse.json({ error: 'subjectId and topicName are required' }, { status: 400 });
        }

        const dbConn = await connectDB(examType);

        const {Question} = getModels(dbConn);

        const questions = await Question.find({
            subjectId,
            topicName,
            subtopicName: "General"
        }).lean();

        return NextResponse.json({
            questionsCount: questions.length,
            questions
        }, {status: 200});
    }
    catch(error:any){
        console.error(error);
        return NextResponse.json({ error: error.message, status: 500 });
    }


}