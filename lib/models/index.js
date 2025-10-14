import mongoose from 'mongoose';

// Define schemas (same as before)
const subjectSchema = new mongoose.Schema({
    subjectId: { type: String, required: true },
    name: { type: String, required: true },
    examType: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
subjectSchema.index({ subjectId: 1, examType: 1 }, { unique: true });

const topicSchema = new mongoose.Schema({
    topicId: { type: String, required: true },
    name: { type: String, required: true },
    subjectId: { type: String, required: true },
    subjectName: { type: String, required: true },
    examType: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
topicSchema.index({ topicId: 1, subjectId: 1, examType: 1 }, { unique: true });

const subtopicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    subjectId: { type: String, required: true },
    examType: { type: String, required: true },
    totalQuestions: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
subtopicSchema.index({ name: 1, topicId: 1, subjectId: 1, examType: 1 }, { unique: true });

const questionSchema = new mongoose.Schema({
    questionNo: { type: Number, required: true },
    questionType: { type: String, required: true },
    difficulty: { type: String, required: true },
    questionDescription: { type: String, required: true },
    options: {
        A: String,
        B: String,
        C: String,
        D: String
    },
    correctAnswer: { type: String, required: true },
    solution: String,
    answerKey: String,
    locked: { type: Boolean, default: false },
    examType: { type: String, required: true },
    subjectId: { type: String, required: true },
    subjectName: { type: String, required: true },
    topicId: { type: String, required: true },
    topicName: { type: String, required: true },
    subtopicName: { type: String, required: true },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { strict: false });

// Compound indexes
questionSchema.index({ examType: 1, subjectId: 1, topicId: 1, subtopicName: 1 });
questionSchema.index({ examType: 1, subjectId: 1, topicId: 1 });
questionSchema.index({ difficulty: 1, questionType: 1 });
questionSchema.index({ locked: 1});

// Factory function to get models for a specific connection
export function getModels(connection) {
    console.log(connection.models);
    const Subject = connection.models.Subject || connection.model('Subject', subjectSchema);
    const Topic = connection.models.Topic || connection.model('Topic', topicSchema);
    const Subtopic = connection.models.Subtopic || connection.model('Subtopic', subtopicSchema);
    const Question = connection.models.Question || connection.model('Question', questionSchema);

    return { Subject, Topic, Subtopic, Question };
}
