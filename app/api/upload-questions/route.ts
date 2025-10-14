import connectDB from '@/lib/db/connection';
import { getModels } from '@/lib/models';

export async function POST(request) {
    try {
        console.log("📥 Incoming request to /api/upload");

        const {
            selectedSubject,
            selectedChapter,
            selectedExam,
            questions,
            solutions,
            answerKey
        } = await request.json();

        console.log("🔎 Parsed request body:", {
            selectedSubject,
            selectedChapter,
            selectedExam,
            questionsCount: questions?.length,
            solutionsCount: solutions?.length,
            answerKeyCount: answerKey?.length,
        });

        // Validation
        if (!selectedSubject || !selectedChapter || !questions?.length || !selectedExam) {
            console.warn("⚠️ Validation failed: Missing required fields", {
                selectedSubject, selectedChapter, questionsCount: questions?.length, selectedExam
            });
            return Response.json(
                { message: 'Missing required fields (including examType)' },
                { status: 400 }
            );
        }

        // Connect to DB
        console.log(`🔗 Connecting to DB for exam type: ${selectedExam}`);
        const connection = await connectDB(selectedExam);
        const { Subject, Topic, Subtopic, Question } = getModels(connection);
        console.log("✅ Models loaded:", Object.keys({ Subject, Topic, Subtopic, Question }));

        const session = await connection.startSession();
        session.startTransaction();
        console.log("🚀 Transaction started");

        try {
            const subjectId = selectedSubject;
            const topicId = selectedChapter;

            // Upsert subject
            console.log("📘 Upserting subject:", { subjectId, selectedSubject, selectedExam });
            await Subject.findOneAndUpdate(
                { subjectId, examType: selectedExam },
                {
                    $set: {
                        name: selectedSubject,
                        examType: selectedExam,
                        updatedAt: new Date()
                    },
                    $inc: { totalQuestions: questions.length },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true, session }
            );

            // Upsert topic (using selectedChapter as topic name)
            console.log("📗 Upserting topic:", { topicId, selectedChapter, subjectId, selectedExam });
            await Topic.findOneAndUpdate(
                { topicId, subjectId, examType: selectedExam },
                {
                    $set: {
                        name: selectedChapter,
                        subjectId,
                        subjectName: selectedSubject,
                        examType: selectedExam,
                        updatedAt: new Date()
                    },
                    $inc: { totalQuestions: questions.length },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true, session }
            );

            // Group questions by subtopic
            console.log("🗂 Grouping questions by subtopic...");
            const subtopicGroups = questions.reduce((acc, question) => {
                if (!acc[question.subtopic]) {
                    acc[question.subtopic] = [];
                }
                acc[question.subtopic].push(question);
                return acc;
            }, {});
            console.log("✅ Subtopic groups created:", Object.keys(subtopicGroups));

            // Upsert subtopics
            for (const [subtopicName, subtopicQuestions] of Object.entries(subtopicGroups)) {
                console.log(`📙 Upserting subtopic: ${subtopicName} with ${subtopicQuestions.length} questions`);
                await Subtopic.findOneAndUpdate(
                    { name: subtopicName, topicId, subjectId, examType: selectedExam },
                    {
                        $set: {
                            topicName: selectedChapter,
                            subjectId,
                            examType: selectedExam,
                            updatedAt: new Date()
                        },
                        $inc: { totalQuestions: subtopicQuestions.length },
                        $setOnInsert: { createdAt: new Date() }
                    },
                    { upsert: true, session }
                );
            }

            // Prepare questions
            console.log("📝 Preparing question documents for insertion...");
            const questionDocs = questions.map(question => {
                const solution = solutions?.find(s => s.question_no === question.question_no);
                const answerKeyItem = answerKey?.find(ak => ak.question_no === question.question_no);

                return {
                    questionNo: question.question_no,
                    questionType: question.question_type || "MCQ",
                    difficulty: question.difficulty || "Medium",
                    questionDescription: question.question_description || "",
                    options: {
                        A: question.option1 || "",
                        B: question.option2 || "",
                        C: question.option3 || "",
                        D: question.option4 || "",
                    },
                    correctAnswer: question.correct_answer,
                    solution: solution?.solution || "",
                    answerKey: answerKeyItem?.answer || "",
                    locked: false,
                    examType: selectedExam,
                    subjectId: subjectId,
                    subjectName: selectedSubject,
                    topicId: topicId,
                    topicName: selectedChapter,
                    subtopicName: question.subtopic || "General",

                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            });
            console.log(`✅ Prepared ${questionDocs.length} question documents`);

            // Insert questions
            console.log("📤 Inserting questions into DB...");
            await Question.insertMany(questionDocs, { session, ordered: false });
            console.log("✅ Questions inserted successfully");

            await session.commitTransaction();
            console.log("🎉 Transaction committed successfully");

            return Response.json({
                message: `Successfully uploaded questions to ${selectedExam} database`,
                examType: selectedExam,
                count: questions.length,
                subtopicsCount: Object.keys(subtopicGroups).length
            });

        } catch (error) {
            console.error("❌ Error during transaction, aborting...", error);
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
            console.log("🔒 Session ended");
        }

    } catch (error) {
        console.error('🔥 Upload failed:', error);

        if (error.code === 11000) {
            console.warn("⚠️ Duplicate question detected:", error.message);
            return Response.json(
                { message: 'Duplicate question found', error: error.message },
                { status: 409 }
            );
        }

        return Response.json(
            { message: 'Upload failed', error: error.message },
            { status: 500 }
        );
    }
}
