"use client"
import {useMemo, useState} from 'react';
import {useExamSubjects} from '@/hooks/useExamSubjects'
import {useExamSubjectChapters} from '@/hooks/useExamSubjectChapters'
import {useExams} from "@/hooks/useExams";
import {Chapter} from "@/types/Chapter";
import {getFirestore, collection, getDocs, doc, getDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {QuestionFromDB} from '@/types/QuestionFromDB'
import {TestConfig} from "@/types/TestConfig";
import {QuestionLevel} from '@/types/QuestionLevel'

interface SelectedQuestion extends QuestionFromDB {
    selectedSubject: string
}

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title: string;
}

const Dialog = ({ isOpen, onClose, children, title }: DialogProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default function CreateTest({examData}:any) {
    const [selectedExam, setSelectedExam] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedChapter, setSelectedChapter] = useState<string>("");
    const [subtopics, setSubtopics] = useState<string[]>([]);
    const [chapterValues, setChapterValues] = useState<Record<string, number>>({});
    const [subtopicValues, setSubtopicValues] = useState<Record<string, Record<string, number>>>({});
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
    const [questionLevel, setQuestionLevel] = useState<QuestionLevel>({
        easy: 25,
        medium: 50,
        hard: 25
    });
    const [testConfig, setTestConfig] = useState<TestConfig>({
        branchName: "",
        examType: "jeemain",
        paperType: "",
        paperName: "",
        paperDate: "",
        paperTime: "",
        startFrom: 1,
        optionType: "",
        status: "inactive",
        totalTime: 0,
        correctMarks: 0,
        wrongMarks: 0,
        subjectWise: {
            physics: 0,
            chemistry: 0,
            mathematics: 0,
            biology: 0
        }
    });

    // Dialog states
    const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false);
    const [questionLevelDialogOpen, setQuestionLevelDialogOpen] = useState(false);
    const [currentChapterForSubtopics, setCurrentChapterForSubtopics] = useState("");
    const [tempSubtopicValues, setTempSubtopicValues] = useState<Record<string, number>>({});
    const [tempQuestionLevel, setTempQuestionLevel] = useState<QuestionLevel>({
        easy: 25,
        medium: 50,
        hard: 25
    });

    // const {exams, loading: examsLoading, error: examsError} = useExams();
    //@ts-ignore
    const exams = examData.map(item => item.name);
    // const {subjects, loading: subjectsLoading, error: subjectsError} = useExamSubjects(selectedExam);
    const subjects = useMemo(() => {
        console.log("Subject data:", examData);
        const selectedExamData = examData.find(
            (exam: { name: string; subjects: { name: string; chapters: { name: string; subtopics: { name: string }[] }[] }[] }) =>
                exam.name === selectedExam
        );
        console.log("SelectedExam data:", selectedExamData);

        const subjectsMap: Record<
            string,
            ({ name: string; subtopics: { name: string }[] } & { chapter: string })[]
        > =
            //@ts-ignore
            selectedExamData?.subjects?.reduce((acc, subject) => {
                //@ts-ignore
                acc[subject.name] = subject.chapters.map(ch => ({
                    ...ch,
                    chapter: ch.name, // add 'chapter' key
                }));
                return acc;
            }, {} as Record<
                string,
                ({ name: string; subtopics: { name: string }[] } & { chapter: string })[]
            >) || {};

        return subjectsMap;
    }, [selectedExam, examData]);

    // const {
    //     data,
    //     loading: chaptersLoading,
    //     error: chaptersError
    // } = useExamSubjectChapters(selectedExam, selectedSubject);
    function getSubtopics(
        examData: {
            name: string;
            subjects: {
                name: string;
                chapters: {
                    name: string;
                    subtopics: { name: string }[];
                }[];
            }[];
        }[],
        selectedExam: string,
        selectedSubject: string,
        selectedChapter: string
    ): string[] {
        const exam = examData.find(e => e.name === selectedExam);
        if (!exam) return [];

        const subject = exam.subjects.find(s => s.name === selectedSubject);
        if (!subject) return [];

        const chapter = subject.chapters.find(c => c.name === selectedChapter);
        if (!chapter) return [];

        // Return array of subtopic names
        return chapter.subtopics.map(st => st.name);
    }


    const handleInputChange = (name: string, value: number, type: "chapter" | "subtopic") => {
        if (type === "chapter") {
            setSubtopicValues((prev) => ({
                ...prev,
                [name]: {}
            }));
            setChapterValues((prev) => ({
                ...prev,
                [name]: value
            }))
        } else {
            const totalChapterValue: number = chapterValues?.[selectedChapter];
            let totalSubtopicValue: number;
            if (subtopics.length > 0 && subtopicValues[selectedChapter]) {
                totalSubtopicValue = Object.values(subtopicValues?.[selectedChapter]).reduce((sum: number, value: number) => sum + value, 0);
                totalSubtopicValue -= subtopicValues[selectedChapter][name];
                totalSubtopicValue += value;
                if (totalSubtopicValue > totalChapterValue) {
                    alert("Jyada ho gaya");
                    return;
                }
            }

            setSubtopicValues((prev) => ({
                ...prev,
                [selectedChapter]: {
                    ...prev[selectedChapter] || {},
                    [name]: value
                }
            }))
        }
    }

    const handleButtonClick = (chapterName: string) => {
        setCurrentChapterForSubtopics(chapterName);
        data?.forEach((chapter: Chapter) => {
            if (chapter.chapter === chapterName) {
                console.log("These are the subtopics ", chapter.subtopics);
                setSubtopics(chapter.subtopics);
                // Initialize temp values with current values
            }
        });
        setTempSubtopicValues(subtopicValues[chapterName] || {});
        setSubtopicDialogOpen(true);
    }

    const handleSubtopicSave = () => {
        const totalChapterValue = chapterValues[currentChapterForSubtopics];
        const totalSubtopicValue = Object.values(tempSubtopicValues).reduce((sum, value) => sum + value, 0);

        if (totalSubtopicValue > totalChapterValue) {
            alert("Total subtopic values cannot exceed chapter value");
            return;
        }

        setSubtopicValues(prev => ({
            ...prev,
            [currentChapterForSubtopics]: tempSubtopicValues
        }));
        setSubtopicDialogOpen(false);
    }

    const handleTempSubtopicChange = (subtopic: string, value: number) => {
        setTempSubtopicValues(prev => ({
            ...prev,
            [subtopic]: value
        }));
    }

    const handleRandomQuestions = async () => {
        const topicsRef = collection(db, `questions_${selectedExam}`, selectedSubject.toLowerCase(), "topics");
        console.log(Object.keys(subtopicValues)) // chapter names
        for (const topic of Object.keys(subtopicValues)) {
            const subtopicsRef = collection(topicsRef, topic.toLowerCase(), "subtopics");
            for (const subtopic of Object.keys(subtopicValues[topic])) {
                const questionsRef = collection(subtopicsRef, subtopic, "questions");
                const questionsSnap = await getDocs(questionsRef);
                const allQuestions: QuestionFromDB[] = questionsSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }) as QuestionFromDB);

                const noOfQuestionsReq: number = subtopicValues[topic][subtopic];
                const questions: QuestionFromDB[] = allQuestions
                    .sort(() => Math.random() - 0.5)
                    .slice(0, noOfQuestionsReq);

                setSelectedQuestions({
                    ...selectedQuestions,
                    ...questions.map(q => ({
                        ...q,
                        selectedSubject: topic
                    }))
                })

                console.log({topic, subtopic, questions});
            }
        }
    }

    const handleCompletelyRandomQuestions = async () => {
        console.log("=== START: handleCompletelyRandomQuestions ===");
        console.log("Selected Exam:", selectedExam);
        console.log("Selected Subject:", selectedSubject);
        console.log("Chapter Names:", Object.keys(subtopicValues));
        console.log({subtopicValues})

        const topicsRef = collection(db, `questions_${selectedExam}`, selectedSubject, "topics");

        for (const topic of Object.keys(subtopicValues)) {
            console.log(`\n🔹 Processing Topic: ${topic}`);

            const topicRef = doc(topicsRef, topic);
            const topicSnap = await getDoc(topicRef);

            if (!topicSnap.exists()) {
                console.warn(`⚠️ Topic "${topic}" not found in Firestore`);
                continue;
            }

            const topicData: any = topicSnap.data();
            console.log("Topic Data:", topicData);

            const totalQuestions = topicData.totalQuestions;
            console.log(`Total Questions in Topic "${topic}":`, totalQuestions);

            const questionsReqForThisTopic = chapterValues[topic];
            console.log(`Questions Requested for Topic "${topic}":`, questionsReqForThisTopic);

            // Get subtopics inside this topic
            const subtopicsRef = collection(topicsRef, topic.toLowerCase(), "subtopics");
            console.log(`Fetching subtopics for Topic "${topic}"...`);

            for (const subtopic of Object.keys(subtopicValues[topic])) {
                console.log(`   ↳ Subtopic: ${subtopic}`);

                const subtopicRef = doc(subtopicsRef, subtopic, "questions");
                const subtopicSnap = await getDoc(subtopicRef);

                if (!subtopicSnap.exists()) {
                    console.warn(`   ⚠️ Subtopic "${subtopic}" not found`);
                    continue;
                }

                const subtopicData: any = subtopicSnap.data();
                console.log(`   Subtopic Data for "${subtopic}":`, subtopicData);
            }
        }

        console.log("=== END: handleCompletelyRandomQuestions ===\n");
        setQuestionLevelDialogOpen(false);
    };

    const handleQuestionLevelChange = (level: keyof QuestionLevel, value: number) => {
        setTempQuestionLevel(prev => ({
            ...prev,
            [level]: value
        }));
    }

    const handleQuestionLevelSave = () => {
        const total = tempQuestionLevel.easy + tempQuestionLevel.medium + tempQuestionLevel.hard;
        if (total !== 100) {
            alert("Total percentage must equal 100%");
            return;
        }
        setQuestionLevel(tempQuestionLevel);
        handleCompletelyRandomQuestions();
    }

    return (
        <>
            <div className="space-y-4 p-6 bg-gray-50 min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h1 className="text-2xl font-bold mb-4">Create Test</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <select
                            value={selectedExam}
                            onChange={(e) => {
                                setSelectedExam(e.target.value);
                                setSelectedSubject("");
                                setSelectedChapter("");
                                setSubtopics([]);
                            }}
                            className="p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Select an Exam</option>
                            {exams.map((exam: string, index: number) => (
                                <option key={index} value={exam}>
                                    {exam}
                                </option>
                            ))}
                        </select>

                        <select
                            disabled={selectedExam === ""}
                            value={selectedSubject}
                            onChange={(e) => {
                                setSelectedSubject(e.target.value);
                                setSelectedChapter("");
                                setSubtopics([]);
                            }}
                            className="p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        >
                            <option value="">
                                {"Select a Subject"}
                            </option>

                        </select>

                        <select
                            disabled={selectedExam === "" || selectedSubject === ""}
                            value={selectedChapter}
                            onChange={(e)=> {
                                setSelectedChapter(e.target.value)
                                // data?.forEach((chapter: Chapter) => {
                                //     if(chapter.chapter === e.target.value){
                                //         setSubtopics(chapter.subtopics)
                                //     }
                                // })
                                setSubtopics(getSubtopics(examData, selectedExam, selectedSubject, e.target.value));
                            }}
                            className="p-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                        >
                            <option value="">Select a Chapter</option>
                            {
                                //@ts-ignore
                                subjects?.[selectedSubject]?.map((chapter: Chapter, index: number) => (
                                <option key={index} value={chapter.chapter}>
                                    {chapter.chapter}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Chapters</h2>
                    <div className="space-y-3">
                        {
                            //@ts-ignore
                            subjects?.[selectedSubject]?.map((chapter: Chapter, index: number) => (
                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                                <span className="flex-1 font-medium">{chapter.chapter}</span>
                                <input
                                    type='number'
                                    value={chapterValues[chapter.chapter] || ""}
                                    onChange={(e) => {
                                        handleInputChange(chapter.chapter, Number(e.target.value), "chapter")
                                    }}
                                    className="w-20 p-2 border border-gray-300 rounded-md"
                                    placeholder="0"
                                />
                                <button
                                    onClick={() => handleButtonClick(chapter.chapter)}
                                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                                    disabled={!chapterValues[chapter.chapter]}
                                >
                                    Configure Subtopics
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex space-x-4">
                        <button
                            onClick={handleRandomQuestions}
                            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Random Questions
                        </button>

                        <button
                            onClick={() => {
                                setTempQuestionLevel(questionLevel);
                                setQuestionLevelDialogOpen(true);
                            }}
                            className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 transition-colors"
                        >
                            Load Questions
                        </button>
                    </div>
                </div>
            </div>

            {/* Subtopic Configuration Dialog */}
            <Dialog
                isOpen={subtopicDialogOpen}
                onClose={() => setSubtopicDialogOpen(false)}
                title={`Configure Subtopics for ${currentChapterForSubtopics}`}
            >
                <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                        Total questions for chapter: {chapterValues[currentChapterForSubtopics]}
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {subtopics?.map((subtopic: string, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                                <span className="flex-1 text-sm">{subtopic}</span>
                                <input
                                    type='number'
                                    value={tempSubtopicValues[subtopic] || ""}
                                    onChange={(e) => handleTempSubtopicChange(subtopic, Number(e.target.value))}
                                    className="w-20 p-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="text-sm text-gray-600">
                        Total allocated: {Object.values(tempSubtopicValues).reduce((sum, val) => sum + val, 0)}
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <button
                            onClick={() => setSubtopicDialogOpen(false)}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubtopicSave}
                            className="flex-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Question Level Configuration Dialog */}
            <Dialog
                isOpen={questionLevelDialogOpen}
                onClose={() => setQuestionLevelDialogOpen(false)}
                title="Configure Question Difficulty Levels"
            >
                <div className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <label className="flex-1 font-medium text-green-600">Easy (%)</label>
                            <input
                                type='number'
                                value={tempQuestionLevel.easy}
                                onChange={(e) => handleQuestionLevelChange('easy', Number(e.target.value))}
                                className="w-20 p-2 border border-gray-300 rounded-md"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <label className="flex-1 font-medium text-yellow-600">Medium (%)</label>
                            <input
                                type='number'
                                value={tempQuestionLevel.medium}
                                onChange={(e) => handleQuestionLevelChange('medium', Number(e.target.value))}
                                className="w-20 p-2 border border-gray-300 rounded-md"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="flex items-center space-x-3">
                            <label className="flex-1 font-medium text-red-600">Hard (%)</label>
                            <input
                                type='number'
                                value={tempQuestionLevel.hard}
                                onChange={(e) => handleQuestionLevelChange('hard', Number(e.target.value))}
                                className="w-20 p-2 border border-gray-300 rounded-md"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                    <div className="text-sm text-gray-600 border-t pt-3">
                        Total: {tempQuestionLevel.easy + tempQuestionLevel.medium + tempQuestionLevel.hard}%
                        {tempQuestionLevel.easy + tempQuestionLevel.medium + tempQuestionLevel.hard !== 100 &&
                            <span className="text-red-500 ml-2">(Must equal 100%)</span>
                        }
                    </div>
                    <div className="flex space-x-2 pt-4">
                        <button
                            onClick={() => setQuestionLevelDialogOpen(false)}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleQuestionLevelSave}
                            className="flex-1 bg-purple-500 text-white py-2 rounded-md hover:bg-purple-600 transition-colors"
                        >
                            Generate Questions
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
