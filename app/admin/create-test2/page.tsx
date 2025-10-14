"use client"

import {useState, useEffect, useMemo} from "react"
import {
    Plus,
    Search,
    Eye,
    Save,
    Trash2,
    Target,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Settings,
    BarChart3,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react"
import {db} from "@/lib/firebase"
import {collection, getDocs, query, orderBy, doc, serverTimestamp, writeBatch, setDoc} from "firebase/firestore"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {QuestionFromDB} from '@/types/QuestionFromDB'
import {TestConfig} from "@/types/TestConfig";

interface Subject {
    id: string
    name: string
}

interface Topic {
    id: string
    name: string
    questionCount: number
}

interface SelectedQuestion extends QuestionFromDB {
    selectedSubject: string
}

export default function CreateTestPage() {
    // State for questions and subjects
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [questions, setQuestions] = useState<QuestionFromDB[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedTopic, setSelectedTopic] = useState<string>("")

    // State for test creation
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([])
    const [testConfig, setTestConfig] = useState<TestConfig>({
        title: "",
        description: "",
        examType: "jeemain",
        totalTime: 180,
        correctMarks: 4,
        wrongMarks: -1,
        subjectWise: {
            physics: 0,
            chemistry: 0,
            mathematics: 0,
        },
        instructions: "Read all instructions carefully before starting the test.",
    })

    // UI State
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [currentTab, setCurrentTab] = useState("select")
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
    const [saving, setSaving] = useState(false)
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)
    const [successTestId, setSuccessTestId] = useState("")
    const [downloadingPdf, setDownloadingPdf] = useState<'questions' | 'solutions' | 'answerkey' | null>(null);
    const [pdfSubjectName, setPdfSubjectName] = useState("");
    const [pdfTopicName, setPdfTopicName] = useState("");
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pendingDownloadType, setPendingDownloadType] = useState<'questions' | 'solutions' | 'answerkey' | null>(null);
    const [randomCount, setRandomCount] = useState<number>(10)
    const [showRandomModal, setShowRandomModal] = useState(false)

    // Load subjects on component mount
    useEffect(() => {
        loadSubjects()
    }, [])

    // Update subject-wise count when questions change
    useEffect(() => {
        const counts = {
            physics: selectedQuestions.filter((q) => q.selectedSubject.toLowerCase().includes("physics")).length,
            chemistry: selectedQuestions.filter((q) => q.selectedSubject.toLowerCase().includes("chemistry")).length,
            mathematics: selectedQuestions.filter((q) => q.selectedSubject.toLowerCase().includes("math")).length,
        }
        setTestConfig((prev) => ({
            ...prev,
            subjectWise: counts,
        }))
    }, [selectedQuestions])

    const loadSubjects = async () => {
        try {
            setLoading(true)
            const subjectsSnapshot = await getDocs(collection(db, "questions"))
            const subjectsData: Subject[] = subjectsSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || doc.id,
            }))
            setSubjects(subjectsData)
        } catch (error) {
            console.error("Error loading subjects:", error)
            alert("Failed to load subjects from Firebase")
        } finally {
            setLoading(false)
        }
    }

    const loadTopics = async (subjectId: string) => {
        try {
            setLoading(true)
            const topicsSnapshot = await getDocs(collection(db, "questions", subjectId, "topics"))
            const topicsData: Topic[] = topicsSnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || doc.id,
                questionCount: doc.data().questionCount || 0,
            }))
            setTopics(topicsData)
        } catch (error) {
            console.error("Error loading topics:", error)
            alert("Failed to load topics from Firebase")
        } finally {
            setLoading(false)
        }
    }

    const loadQuestions = async (subjectId: string, topicId: string) => {
        try {
            setLoading(true)
            const questionsSnapshot = await getDocs(
                query(collection(db, "questions", subjectId, "topics", topicId, "questions"), orderBy("question_no")),
            )
            const questionsData: QuestionFromDB[] = questionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                question_no: doc.data().question_no || 0,
                question_type: doc.data().question_type || "mcq",
                difficulty: doc.data().difficulty || "medium",
                question_description: doc.data().question_description || "",
                option1: doc.data().option1 || {},
                option2: doc.data().option2 || {},
                option3: doc.data().option3 || {},
                option4: doc.data().option4 || {},
                correct_answer: doc.data().correct_answer || "",
                solution: doc.data().solution || "",
                answer_key: doc.data().answer_key || "",
                subject: doc.data().subject || subjectId,
                topic: doc.data().topic || topicId,
                createdAt: doc.data().createdAt,
                updatedAt: doc.data().updatedAt,
                subtopic: doc.data().subtopic,
            }))
            setQuestions(questionsData)
        } catch (error) {
            console.error("Error loading questions:", error)
            alert("Failed to load questions from Firebase")
        } finally {
            setLoading(false)
        }
    }

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubject(subjectId)
        setSelectedTopic("")
        setQuestions([])
        setTopics([])
        if (subjectId) {
            loadTopics(subjectId)
        }
    }

    const handleTopicChange = (topicId: string) => {
        setSelectedTopic(topicId)
        setQuestions([])
        if (topicId && selectedSubject) {
            loadQuestions(selectedSubject, topicId)
        }
    }

    const isQuestionSelected = (questionId: string) => {
        console.log('🔍 Checking if question is selected:', questionId);
        console.log('👉 Current selectedSubject:', selectedSubject);
        console.log('👉 Current selectedTopic:', selectedTopic);
        console.log('🧠 Total selectedQuestions:', selectedQuestions.length);

        for (let i = 0; i < selectedQuestions.length; i++) {
            const q = selectedQuestions[i];

            const normalize = (str: string) =>
                str.toLowerCase().replace(/[\s-]+/g, '');

            const idMatch = normalize(q.id) === normalize(questionId);
            const subjectMatch = normalize(q.selectedSubject) === normalize(selectedSubject);
            const topicMatch = normalize(q.topic) === normalize(selectedTopic);

            console.log(`\n🔄 Iteration ${i + 1}:`);
            console.log('🟡 Selected Question:', {
                id: q.id,
                selectedSubject: q.selectedSubject,
                topic: q.topic,
            });
            console.log('🔍 Comparison results:');
            console.log(`  🔸 ID Match: ${normalize(q.id)} === ${normalize(questionId)} → ${idMatch}`);
            console.log(`  🔸 Subject Match: ${normalize(q.selectedSubject)} === ${normalize(selectedSubject)} → ${subjectMatch}`);
            console.log(`  🔸 Topic Match: ${normalize(q.topic)} === ${normalize(selectedTopic)} → ${topicMatch}`);

            if (idMatch && subjectMatch && topicMatch) {
                console.log('✅ Match found!');
                return true;
            }
        }

        console.log('❌ No match found.');
        return false;
    };

    const addQuestionToTest = (question: QuestionFromDB) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[\s-]+/g, '');

        let isAlreadySelected = false;
        for (let i = 0; i < selectedQuestions.length; i++) {
            const q = selectedQuestions[i];
            if (
                normalize(q.id) === normalize(question.id) &&
                normalize(q.selectedSubject) === normalize(selectedSubject) &&
                normalize(q.topic) === normalize(question.topic)
            ) {
                isAlreadySelected = true;
                break;
            }
        }

        if (isAlreadySelected) return;

        const selectedQuestion: SelectedQuestion = {
            ...question,
            selectedSubject: selectedSubject,
        };
        setSelectedQuestions((prev) => [...prev, selectedQuestion]);
    };

    const removeQuestionFromTest = (
        questionId: string,
        fromSubject?: string,
        fromTopic?: string
    ) => {
        const normalize = (str: string) => str.toLowerCase().replace(/[\s-]+/g, '');

        setSelectedQuestions((prev) =>
            prev.filter((q) => {
                const idMatch = normalize(q.id) === normalize(questionId);

                const subject = fromSubject || selectedSubject;
                const topic = fromTopic || selectedTopic;

                const subjectMatch = normalize(q.selectedSubject) === normalize(subject);
                const topicMatch = normalize(q.topic) === normalize(topic);

                return !(idMatch && subjectMatch && topicMatch);
            })
        );
    };


    const toggleExpanded = (questionId: string) => {
        const newExpanded = new Set(expandedQuestions)
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId)
        } else {
            newExpanded.add(questionId)
        }
        setExpandedQuestions(newExpanded)
    }

    const calculateTotalMarks = () => {
        return selectedQuestions.length * testConfig.correctMarks
    }

    const saveTest = async () => {
        if (!testConfig.title.trim()) {
            alert("Please enter a test title")
            return
        }

        if (selectedQuestions.length === 0) {
            alert("Please select at least one question")
            return
        }

        try {
            setSaving(true)

            // Generate test ID with better format
            const testId = `test_${testConfig.examType}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

            // Group questions by subject first
            const questionsBySubject: { [key: string]: SelectedQuestion[] } = {}
            selectedQuestions.forEach((question, globalIndex) => {
                const subjectKey = question.selectedSubject.toLowerCase().includes("physics")
                    ? "physics"
                    : question.selectedSubject.toLowerCase().includes("chemistry")
                        ? "chemistry"
                        : "mathematics"

                if (!questionsBySubject[subjectKey]) {
                    questionsBySubject[subjectKey] = []
                }
                questionsBySubject[subjectKey].push({
                    ...question,
                    // @ts-ignore
                    globalIndex: globalIndex + 1, // For overall test ordering
                })
            })

            // Prepare comprehensive test document
            const testDocument = {
                // Basic Info
                id: testId,
                title: testConfig.title,
                description: testConfig.description,
                examType: testConfig.examType,

                // Question Stats
                totalQuestions: selectedQuestions.length,
                subjectWiseCount: {
                    physics: questionsBySubject.physics?.length || 0,
                    chemistry: questionsBySubject.chemistry?.length || 0,
                    mathematics: questionsBySubject.mathematics?.length || 0,
                },

                // Scoring & Timing
                totalTime: testConfig.totalTime,
                correctMarks: testConfig.correctMarks,
                wrongMarks: testConfig.wrongMarks,
                totalMarks: calculateTotalMarks(),

                // Configuration
                subjectWise: testConfig.subjectWise,
                instructions: testConfig.instructions,

                // Questions Data (organized by subject)
                questions: {
                    physics: questionsBySubject.physics?.map((q, index) => ({
                        ...q,
                        subjectIndex: index + 1,
                    })) || [],
                    chemistry: questionsBySubject.chemistry?.map((q, index) => ({
                        ...q,
                        subjectIndex: index + 1,
                    })) || [],
                    mathematics: questionsBySubject.mathematics?.map((q, index) => ({
                        ...q,
                        subjectIndex: index + 1,
                    })) || [],
                },

                // Metadata
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: "active",
                version: "2.0", // For schema versioning
            }

            // Save as single document (much cleaner)
            const testDocRef = doc(db, "tests", testId)
            await setDoc(testDocRef, testDocument)

            setSuccessTestId(testId)
            setShowSuccessMessage(true)

            // Auto hide after 5 seconds
            setTimeout(() => {
                setShowSuccessMessage(false)
            }, 5000)

            // Reset form
            setSelectedQuestions([])
            setTestConfig({
                title: "",
                description: "",
                examType: "jeemain",
                totalTime: 180,
                correctMarks: 4,
                wrongMarks: -1,
                subjectWise: {
                    physics: 0,
                    chemistry: 0,
                    mathematics: 0,
                },
                instructions: "Read all instructions carefully before starting the test.",
            })
            setCurrentTab("select")
        } catch (error) {
            console.error("Error saving test:", error)
            alert("Failed to save test. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
        switch (difficulty) {
            case "easy":
                return "bg-green-100 text-green-800"
            case "medium":
                return "bg-yellow-100 text-yellow-800"
            case "hard":
                return "bg-red-100 text-red-800"
        }
    }

    const getTypeColor = (type: "mcq" | "integer") => {
        return type === "mcq" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
    }

    const renderHTML = (htmlContent: string) => {
        return {__html: htmlContent};
    };

    const generateQuestionsPDF1 = async (subjectName: string, topicName: string) => {
        setDownloadingPdf('questions');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ABC CLASSES', pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 15;
            pdf.setFontSize(16);
            pdf.text(`${testConfig.title || 'Test Paper'}`, pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 10;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Subject: ${subjectName}`, margin, yPosition);
            pdf.text(`Topic: ${topicName}`, pageWidth - margin - 80, yPosition);

            yPosition += 8;
            pdf.text(`Time: ${testConfig.totalTime} minutes`, margin, yPosition);
            pdf.text(`Total Marks: ${calculateTotalMarks()}`, pageWidth - margin - 80, yPosition);

            yPosition += 15;

            // Instructions
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Instructions:', margin, yPosition);
            yPosition += 8;

            pdf.setFont('helvetica', 'normal');
            const instructions = [
                `• Each question carries ${testConfig.correctMarks} marks`,
                `• Wrong answer carries ${testConfig.wrongMarks} marks`,
                '• Fill the OMR sheet carefully',
                '• No rough work on question paper'
            ];

            instructions.forEach(instruction => {
                pdf.text(instruction, margin, yPosition);
                yPosition += 6;
            });

            yPosition += 10;

            // Questions
            for (let i = 0; i < selectedQuestions.length; i++) {
                const question = selectedQuestions[i];

                // Check if we need a new page
                if (yPosition > pageHeight - 60) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Question number and type
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`Q${i + 1}.`, margin, yPosition);

                // Question type badge
                pdf.setFontSize(9);
                pdf.text(`[${question.question_type.toUpperCase()}]`, margin + 20, yPosition);
                pdf.text(`[${question.difficulty.toUpperCase()}]`, margin + 50, yPosition);

                yPosition += 10;

                // Question description (simplified - removing HTML)
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                const cleanDescription = question.question_description.replace(/<[^>]*>/g, '').trim();
                const lines = pdf.splitTextToSize(cleanDescription, pageWidth - 2 * margin);

                lines.forEach((line: string) => {
                    if (yPosition > pageHeight - 30) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(line, margin, yPosition);
                    yPosition += 6;
                });

                // Options for MCQ
                if (question.question_type === 'mcq') {
                    const options = {
                        A: question.option1,
                        B: question.option2,
                        C: question.option3,
                        D: question.option4
                    };

                    yPosition += 5;
                    Object.entries(options).forEach(([key, value]) => {
                        if (value) {
                            const cleanOption = value.replace(/<[^>]*>/g, '').trim();
                            const optionText = `(${key}) ${cleanOption}`;
                            const optionLines = pdf.splitTextToSize(optionText, pageWidth - 2 * margin - 10);

                            optionLines.forEach((line: string) => {
                                if (yPosition > pageHeight - 30) {
                                    pdf.addPage();
                                    yPosition = margin;
                                }
                                pdf.text(line, margin + 10, yPosition);
                                yPosition += 6;
                            });
                        }
                    });
                }

                yPosition += 15; // Space between questions
            }

            pdf.save(`${testConfig.title || 'Test'}_Questions.pdf`);
        } catch (error) {
            console.error('Error generating questions PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPdf(null);
        }
    };

    const generateSolutionsPDF1 = async (subjectName: string, topicName: string) => {
        setDownloadingPdf('solutions');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            let yPosition = margin;

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ABC CLASSES', pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 15;
            pdf.setFontSize(16);
            pdf.text(`${testConfig.title || 'Test Paper'} - Solutions`, pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 10;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Subject: ${subjectName}`, margin, yPosition);
            pdf.text(`Topic: ${topicName}`, pageWidth - margin - 80, yPosition);

            yPosition += 20;

            // Solutions
            for (let i = 0; i < selectedQuestions.length; i++) {
                const question = selectedQuestions[i];

                // Check if we need a new page
                if (yPosition > pageHeight - 80) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // Question number
                pdf.setFontSize(14);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`Solution ${i + 1}:`, margin, yPosition);
                yPosition += 10;

                // Question (brief)
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'normal');
                const cleanQuestion = question.question_description.replace(/<[^>]*>/g, '').trim();
                const questionLines = pdf.splitTextToSize(cleanQuestion.substring(0, 200) + '...', pageWidth - 2 * margin);

                questionLines.forEach((line: string) => {
                    pdf.text(line, margin, yPosition);
                    yPosition += 5;
                });
                yPosition += 5;

                // Answer
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`Answer: ${question.correct_answer}`, margin, yPosition);
                yPosition += 10;

                // Solution
                if (question.solution) {
                    pdf.setFontSize(11);
                    pdf.setFont('helvetica', 'normal');
                    const cleanSolution = question.solution.replace(/<[^>]*>/g, '').trim();
                    const solutionLines = pdf.splitTextToSize(cleanSolution, pageWidth - 2 * margin);

                    solutionLines.forEach((line: string) => {
                        if (yPosition > pageHeight - 30) {
                            pdf.addPage();
                            yPosition = margin;
                        }
                        pdf.text(line, margin, yPosition);
                        yPosition += 6;
                    });
                }

                yPosition += 15; // Space between solutions
            }

            pdf.save(`${testConfig.title || 'Test'}_Solutions.pdf`);
        } catch (error) {
            console.error('Error generating solutions PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPdf(null);
        }
    };

    const generateAnswerKeyPDF1 = async (subjectName: string, topicName: string) => {
        setDownloadingPdf('answerkey');

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 20;
            let yPosition = margin;

            // Header
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ABC CLASSES', pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 15;
            pdf.setFontSize(16);
            pdf.text(`${testConfig.title || 'Test Paper'} - Answer Key`, pageWidth / 2, yPosition, {align: 'center'});

            yPosition += 10;
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Subject: ${subjectName}`, margin, yPosition);
            pdf.text(`Topic: ${topicName}`, pageWidth - margin - 80, yPosition);

            yPosition += 20;

            // Answer Key Table
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('ANSWER KEY', pageWidth / 2, yPosition, {align: 'center'});
            yPosition += 15;

            // Table headers
            pdf.setFontSize(11);
            pdf.text('Q.No', margin, yPosition);
            pdf.text('Answer', margin + 30, yPosition);
            pdf.text('Type', margin + 70, yPosition);
            pdf.text('Q.No', margin + 100, yPosition);
            pdf.text('Answer', margin + 130, yPosition);
            pdf.text('Type', margin + 170, yPosition);

            yPosition += 10;

            // Draw line
            pdf.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
            yPosition += 5;

            // Answer entries (2 columns)
            pdf.setFont('helvetica', 'normal');
            for (let i = 0; i < selectedQuestions.length; i += 2) {
                const question1 = selectedQuestions[i];
                const question2 = selectedQuestions[i + 1];

                // Left column
                pdf.text(`${i + 1}`, margin + 5, yPosition);
                pdf.text(question1.correct_answer, margin + 30, yPosition);
                pdf.text(question1.question_type.toUpperCase(), margin + 70, yPosition);

                // Right column
                if (question2) {
                    pdf.text(`${i + 2}`, margin + 105, yPosition);
                    pdf.text(question2.correct_answer, margin + 130, yPosition);
                    pdf.text(question2.question_type.toUpperCase(), margin + 170, yPosition);
                }

                yPosition += 8;
            }

            pdf.save(`${testConfig.title || 'Test'}_AnswerKey.pdf`);
        } catch (error) {
            console.error('Error generating answer key PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setDownloadingPdf(null);
        }
    };

    const generateQuestionsPDF = async (subjectName: string, topicName: string) => {
        setDownloadingPdf("questions")
        try {
            const testData = {
                title: testConfig.title,
                subject: subjectName,
                topic: topicName,
                totalTime: testConfig.totalTime,
                correctMarks: testConfig.correctMarks,
                wrongMarks: testConfig.wrongMarks,
                questions: selectedQuestions
            }

            // Store data in session storage instead of URL
            const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            sessionStorage.setItem(testId, JSON.stringify(testData))

            // Open print page with just the ID
            window.open(
                `/print/test?id=${testId}`,
                '_blank',
                'width=1200,height=800'
            )

        } catch (error) {
            console.error("Error opening print page:", error)
            alert("Failed to open print page. Please try again.")
        } finally {
            setDownloadingPdf(null)
        }
    }

    const generateSolutionsPDF = async (subjectName: string, topicName: string) => {
        setDownloadingPdf("solutions")
        try {
            const container = document.createElement("div")
            container.style.width = "210mm"
            container.style.minHeight = "297mm"
            container.style.padding = "20mm"
            container.style.fontFamily = "Arial, sans-serif"
            container.style.backgroundColor = "white"
            container.style.position = "absolute"
            container.style.top = "-9999px"
            container.style.left = "-9999px"

            const headerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #059669; padding-bottom: 20px;">
                <h1 style="font-size: 28px; font-weight: bold; color: #047857; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    ABC CLASSES
                </h1>
                <div style="margin-top: 15px; font-size: 20px; font-weight: 600; color: #374151;">
                    ${testConfig.title || "Test Paper"} - SOLUTIONS
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px; color: #6b7280;">
                    <div><strong>Subject:</strong> ${subjectName}</div>
                    <div><strong>Topic:</strong> ${topicName}</div>
                </div>
            </div>
        `

            let solutionsHTML = ""
            selectedQuestions.forEach((question, index) => {
                const questionNumber = index + 1

                solutionsHTML += `
                <div style="margin-bottom: 40px; page-break-inside: avoid; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 15px;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: bold;">Solution ${questionNumber}</h3>
                    </div>
                    <div style="padding: 20px;">
                        <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 15px; margin-bottom: 15px; border-radius: 0 8px 8px 0;">
                            <strong style="color: #4338ca;">Question:</strong>
                            <div style="margin-top: 8px; font-size: 13px; color: #4b5563;">
                                ${
                    question.question_description.length > 150
                        ? question.question_description.substring(0, 150) + "..."
                        : question.question_description
                }
                            </div>
                        </div>
                        
                        <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                <div style="background: #22c55e; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; margin-right: 10px;">
                                    ✓ ANSWER
                                </div>
                                <span style="font-size: 18px; font-weight: bold; color: #166534;">
                                    ${question.correct_answer}
                                </span>
                            </div>
                        </div>
                        
                        ${
                    question.solution
                        ? `
                            <div style="border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;">
                                <div style="background: #f9fafb; padding: 10px; border-bottom: 1px solid #d1d5db;">
                                    <strong style="color: #374151;">💡 Solution Explanation:</strong>
                                </div>
                                <div style="padding: 15px; font-size: 13px; line-height: 1.6; color: #4b5563;">
                                    ${question.solution}
                                </div>
                            </div>
                        `
                        : `
                            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; text-align: center; color: #92400e;">
                                <em>Detailed solution will be discussed in class</em>
                            </div>
                        `
                }
                    </div>
                </div>
            `
            })

            container.innerHTML = headerHTML + solutionsHTML
            document.body.appendChild(container)

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
            })

            document.body.removeChild(container)

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            const canvasWidth = canvas.width
            const canvasHeight = canvas.height
            const ratio = canvasWidth / canvasHeight

            let width = pdfWidth
            let height = pdfWidth / ratio

            if (height > pdfHeight) {
                height = pdfHeight
                width = pdfHeight * ratio
            }

            const totalPages = Math.ceil(height / pdfHeight)

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage()
                const yOffset = -i * pdfHeight
                pdf.addImage(imgData, "PNG", 0, yOffset, width, height)
            }

            pdf.save(`${testConfig.title || "Test"}_Solutions.pdf`)
        } catch (error) {
            console.error("Error generating solutions PDF:", error)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setDownloadingPdf(null)
        }
    }

    const generateAnswerKeyPDF = async (subjectName: string, topicName: string) => {
        setDownloadingPdf("answerkey")
        try {
            const container = document.createElement("div")
            container.style.width = "210mm"
            container.style.minHeight = "297mm"
            container.style.padding = "20mm"
            container.style.fontFamily = "Arial, sans-serif"
            container.style.backgroundColor = "white"
            container.style.position = "absolute"
            container.style.top = "-9999px"
            container.style.left = "-9999px"

            const headerHTML = `
            <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px;">
                <h1 style="font-size: 28px; font-weight: bold; color: #6d28d9; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    ABC CLASSES
                </h1>
                <div style="margin-top: 15px; font-size: 20px; font-weight: 600; color: #374151;">
                    ${testConfig.title || "Test Paper"} - ANSWER KEY
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 14px; color: #6b7280;">
                    <div><strong>Subject:</strong> ${subjectName}</div>
                    <div><strong>Topic:</strong> ${topicName}</div>
                </div>
            </div>
        `

            // Create answer key table
            let answerKeyHTML = `
            <div style="background: linear-gradient(135deg, #7c3aed, #6d28d9); color: white; padding: 20px; border-radius: 12px; margin-bottom: 25px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px; font-weight: bold;">🎯 ANSWER KEY</h2>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Quick Reference for All Answers</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
        `

            // Group answers by subject
            const subjects = ["Physics", "Chemistry", "Mathematics"]
            subjects.forEach((subject) => {
                const subjectQuestions = selectedQuestions.filter((q) =>
                    q.selectedSubject.toLowerCase().includes(subject.toLowerCase()),
                )

                if (subjectQuestions.length > 0) {
                    const subjectColor = subject === "Physics" ? "#3b82f6" : subject === "Chemistry" ? "#059669" : "#dc2626"

                    answerKeyHTML += `
                    <div style="border: 2px solid ${subjectColor}; border-radius: 12px; overflow: hidden;">
                        <div style="background: ${subjectColor}; color: white; padding: 15px; text-align: center;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">${subject}</h3>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">${subjectQuestions.length} Questions</p>
                        </div>
                        <div style="padding: 20px;">
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                `

                    subjectQuestions.forEach((question, index) => {
                        const globalIndex = selectedQuestions.indexOf(question) + 1
                        answerKeyHTML += `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
                            <div style="font-weight: bold; color: #374151; margin-bottom: 5px;">Q${globalIndex}</div>
                            <div style="background: ${subjectColor}; color: white; padding: 6px 10px; border-radius: 6px; font-weight: bold; font-size: 14px;">
                                ${question.correct_answer}
                            </div>
                            <div style="font-size: 10px; color: #6b7280; margin-top: 5px; text-transform: uppercase;">
                                ${question.question_type}
                            </div>
                        </div>
                    `
                    })

                    answerKeyHTML += `
                            </div>
                        </div>
                    </div>
                `
                }
            })

            answerKeyHTML += `</div>`

            // Add summary table
            answerKeyHTML += `
            <div style="margin-top: 30px; background: #f1f5f9; border: 2px solid #cbd5e1; border-radius: 12px; overflow: hidden;">
                <div style="background: #475569; color: white; padding: 15px; text-align: center;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: bold;">📊 QUICK REFERENCE TABLE</h3>
                </div>
                <div style="padding: 20px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #e2e8f0;">
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Q.No</th>
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Answer</th>
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Type</th>
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Q.No</th>
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Answer</th>
                                <th style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">Type</th>
                            </tr>
                        </thead>
                        <tbody>
        `

            for (let i = 0; i < selectedQuestions.length; i += 2) {
                const q1 = selectedQuestions[i]
                const q2 = selectedQuestions[i + 1]

                answerKeyHTML += `
                <tr style="background: ${i % 4 === 0 ? "#ffffff" : "#f8fafc"};">
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${i + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; background: #dbeafe; font-weight: bold;">${q1.correct_answer}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase;">${q1.question_type}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold;">${q2 ? i + 2 : ""}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; background: #dbeafe; font-weight: bold;">${q2 ? q2.correct_answer : ""}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-size: 11px; text-transform: uppercase;">${q2 ? q2.question_type : ""}</td>
                </tr>
            `
            }

            answerKeyHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `

            container.innerHTML = headerHTML + answerKeyHTML
            document.body.appendChild(container)

            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
            })

            document.body.removeChild(container)

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF("p", "mm", "a4")
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()

            const canvasWidth = canvas.width
            const canvasHeight = canvas.height
            const ratio = canvasWidth / canvasHeight

            let width = pdfWidth
            let height = pdfWidth / ratio

            if (height > pdfHeight) {
                height = pdfHeight
                width = pdfHeight * ratio
            }

            const totalPages = Math.ceil(height / pdfHeight)

            for (let i = 0; i < totalPages; i++) {
                if (i > 0) pdf.addPage()
                const yOffset = -i * pdfHeight
                pdf.addImage(imgData, "PNG", 0, yOffset, width, height)
            }

            pdf.save(`${testConfig.title || "Test"}_AnswerKey.pdf`)
        } catch (error) {
            console.error("Error generating answer key PDF:", error)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setDownloadingPdf(null)
        }
    }

    const handlePdfDownload = (type: 'questions' | 'solutions' | 'answerkey') => {
        if (selectedQuestions.length === 0) {
            alert('Please select questions first');
            return;
        }

        setPendingDownloadType(type);
        setShowPdfModal(true);
    };

    const confirmPdfDownload = () => {
        // if (!pdfSubjectName.trim() || !pdfTopicName.trim()) {
        //     alert('Please enter both subject and topic names');
        //     return;
        // }

        const downloadFunctions = {
            questions: generateQuestionsPDF,
            solutions: generateSolutionsPDF,
            answerkey: generateAnswerKeyPDF
        };

        if (pendingDownloadType) {
            downloadFunctions[pendingDownloadType](pdfSubjectName, pdfTopicName);
        }

        setShowPdfModal(false);
        setPdfSubjectName("");
        setPdfTopicName("");
        setPendingDownloadType(null);
    };

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch =
            q.question_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.question_no.toString().includes(searchTerm)
        const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
        const matchesType = typeFilter === "all" || q.question_type === typeFilter
        return matchesSearch && matchesDifficulty && matchesType
    })
    const selectAllQuestions = () => {
        const questionsToAdd = filteredQuestions.filter(question => !isQuestionSelected(question.id))

        questionsToAdd.forEach(question => {
            const selectedQuestion: SelectedQuestion = {
                ...question,
                selectedSubject: selectedSubject,
            }
            setSelectedQuestions(prev => [...prev, selectedQuestion])
        })
    }

    const randomlySelectQuestions = (count: number) => {
        // Get all unselected questions
        const unselectedQuestions = filteredQuestions.filter(question => !isQuestionSelected(question.id))

        if (unselectedQuestions.length === 0) {
            alert('No unselected questions available')
            return
        }

        // Determine how many questions to select
        const actualCount = Math.min(count, unselectedQuestions.length)

        // Shuffle and select questions
        const shuffled = [...unselectedQuestions].sort(() => Math.random() - 0.5)
        const selectedForAddition = shuffled.slice(0, actualCount)

        // Add selected questions
        selectedForAddition.forEach(question => {
            const selectedQuestion: SelectedQuestion = {
                ...question,
                selectedSubject: selectedSubject,
            }
            setSelectedQuestions(prev => [...prev, selectedQuestion])
        })

        setShowRandomModal(false)
    }

    const RandomSelectModal = () => (
        showRandomModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Random Selection</h3>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="randomCount">Number of questions to select randomly</Label>
                            <Input
                                id="randomCount"
                                type="number"
                                min="1"
                                max={filteredQuestions.filter(q => !isQuestionSelected(q.id)).length}
                                value={randomCount}
                                onChange={(e) => setRandomCount(Number(e.target.value) || 1)}
                                placeholder="Enter number of questions"
                            />
                            <p className="text-sm text-gray-600 mt-1">
                                Available: {filteredQuestions.filter(q => !isQuestionSelected(q.id)).length} unselected
                                questions
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRandomModal(false)
                                setRandomCount(10)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => randomlySelectQuestions(randomCount)}
                            disabled={randomCount <= 0 || filteredQuestions.filter(q => !isQuestionSelected(q.id)).length === 0}
                        >
                            Select {Math.min(randomCount, filteredQuestions.filter(q => !isQuestionSelected(q.id)).length)} Questions
                        </Button>
                    </div>
                </div>
            </div>
        )
    )

    const PDFModal = () => {
        const [pdfSubjectName, setPdfSubjectName] = useState("");
        const [pdfTopicName, setPdfTopicName] = useState("");

        return (
            showPdfModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">PDF Download Settings</h3>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="pdfSubject">Subject Name</Label>
                                <Input
                                    id="pdfSubject"
                                    value={pdfSubjectName}
                                    onChange={(e) => setPdfSubjectName(e.target.value)}
                                    placeholder="e.g., Physics, Chemistry, Mathematics"
                                />
                            </div>

                            <div>
                                <Label htmlFor="pdfTopic">Topic Name</Label>
                                <Input
                                    id="pdfTopic"
                                    value={pdfTopicName}
                                    onChange={(e) => setPdfTopicName(e.target.value)}
                                    placeholder="e.g., Mechanics, Organic Chemistry"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowPdfModal(false);
                                    setPdfSubjectName("");
                                    setPdfTopicName("");
                                    setPendingDownloadType(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={confirmPdfDownload}>
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )
        )
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <PDFModal/>
            <RandomSelectModal/>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create Test</h1>
                            <p className="text-gray-600 mt-2">Build comprehensive tests by selecting questions from
                                Firebase</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-lg px-4 py-2">
                                {selectedQuestions.length} Questions Selected
                            </Badge>
                            <Badge variant="outline" className="text-lg px-4 py-2">
                                Total Marks: {calculateTotalMarks()}
                            </Badge>

                            {selectedQuestions.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => handlePdfDownload('questions')}
                                        disabled={downloadingPdf === 'questions'}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {downloadingPdf === 'questions' ? (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        ) : (
                                            <BookOpen className="h-4 w-4 mr-2"/>
                                        )}
                                        Question Paper
                                    </Button>

                                    <Button
                                        onClick={() => handlePdfDownload('solutions')}
                                        disabled={downloadingPdf === 'solutions'}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {downloadingPdf === 'solutions' ? (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                        ) : (
                                            <Target className="h-4 w-4 mr-2"/>
                                        )}
                                        Solutions
                                    </Button>

                                    <Button
                                        onClick={() => handlePdfDownload('answerkey')}
                                        disabled={downloadingPdf === 'answerkey'}
                                        variant="outline"
                                        size="sm"
                                    >
                                        {downloadingPdf === 'answerkey' ? (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                        ) : (
                                            <CheckCircle2 className="h-4 w-4 mr-2"/>
                                        )}
                                        Answer Key
                                    </Button>
                                </div>
                            )}

                        </div>
                    </div>
                </div>

                {/* Success Message */}
                {showSuccessMessage && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                        <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg max-w-md">
                            <div className="flex items-start space-x-3">
                                <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0"/>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">Test Created Successfully! 🎉</h3>
                                    <p className="text-green-100 mt-1">"{testConfig.title}" has been saved to
                                        Firebase</p>
                                    <p className="text-green-200 text-sm mt-2 font-mono">Test ID: {successTestId}</p>
                                    <div className="mt-3 flex items-center space-x-4 text-sm text-green-100">
                                        <span>📝 {selectedQuestions.length} questions</span>
                                        <span>⏱️ {testConfig.totalTime} mins</span>
                                        <span>🎯 {calculateTotalMarks()} marks</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSuccessMessage(false)}
                                    className="text-green-200 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="select" className="flex items-center space-x-2">
                            <Search className="h-4 w-4"/>
                            <span>Select Questions</span>
                        </TabsTrigger>
                        <TabsTrigger value="configure" className="flex items-center space-x-2">
                            <Settings className="h-4 w-4"/>
                            <span>Configure Test</span>
                        </TabsTrigger>
                        <TabsTrigger value="review" className="flex items-center space-x-2">
                            <Eye className="h-4 w-4"/>
                            <span>Review & Save</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Question Selection Tab */}
                    <TabsContent value="select" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Search className="h-5 w-5"/>
                                    <span>Question Selection</span>
                                </CardTitle>
                                <CardDescription>Browse and select questions from different subjects and
                                    topics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <Label>Subject</Label>
                                        <Select value={selectedSubject} onValueChange={handleSubjectChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Subject"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id}>
                                                        {subject.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Topic</Label>
                                        <Select value={selectedTopic} onValueChange={handleTopicChange}
                                                disabled={!selectedSubject}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Topic"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {topics.map((topic) => (
                                                    <SelectItem key={topic.id} value={topic.id}>
                                                        {topic.name} ({topic.questionCount})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Search</Label>
                                        <Input
                                            placeholder="Search questions..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label>Difficulty</Label>
                                        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Levels</SelectItem>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Type</Label>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger>
                                                <SelectValue/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="mcq">MCQ</SelectItem>
                                                <SelectItem value="integer">Integer</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {selectedSubject && selectedTopic && filteredQuestions.length > 0 && (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                    Showing {filteredQuestions.length} questions
                </span>
                                            <span className="text-sm text-gray-500">
                    ({filteredQuestions.filter(q => !isQuestionSelected(q.id)).length} unselected)
                </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Button
                                                onClick={selectAllQuestions}
                                                variant="outline"
                                                size="sm"
                                                disabled={filteredQuestions.filter(q => !isQuestionSelected(q.id)).length === 0}
                                                className="flex items-center space-x-2"
                                            >
                                                <CheckCircle2 className="h-4 w-4"/>
                                                <span>Select All ({filteredQuestions.filter(q => !isQuestionSelected(q.id)).length})</span>
                                            </Button>

                                            <Button
                                                onClick={() => setShowRandomModal(true)}
                                                variant="outline"
                                                size="sm"
                                                disabled={filteredQuestions.filter(q => !isQuestionSelected(q.id)).length === 0}
                                                className="flex items-center space-x-2"
                                            >
                                                <Target className="h-4 w-4"/>
                                                <span>Random Select</span>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Questions List */}
                                <div className="space-y-4">
                                    {loading ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div
                                                className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="ml-3">Loading questions...</span>
                                        </div>
                                    ) : !selectedSubject || !selectedTopic ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300"/>
                                            <p>Select a subject and topic to view questions</p>
                                        </div>
                                    ) : filteredQuestions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300"/>
                                            <p>No questions found matching your criteria</p>
                                        </div>
                                    ) : (
                                        filteredQuestions.map((question) => {
                                            const isSelected = isQuestionSelected(question.id)
                                            const isExpanded = expandedQuestions.has(question.id)

                                            return (
                                                <Card key={question.id}
                                                      className={`${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}>
                                                    <CardContent className="p-6">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-4 mb-4">
                                                                    <h3 className="text-lg font-semibold">Question {question.question_no}</h3>
                                                                    <Badge
                                                                        className={getTypeColor(question.question_type)}>
                                                                        {question.question_type.toUpperCase()}
                                                                    </Badge>
                                                                    <Badge
                                                                        className={getDifficultyColor(question.difficulty)}>
                                                                        {question.difficulty.toUpperCase()}
                                                                    </Badge>
                                                                </div>

                                                                <div
                                                                    className="prose prose-sm max-w-none mb-4"
                                                                    dangerouslySetInnerHTML={renderHTML(question.question_description)}
                                                                />

                                                                {question.question_type === "mcq" && (
                                                                    <div
                                                                        className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                                                                        {Object.entries({
                                                                            A: question.option1,
                                                                            B: question.option2,
                                                                            C: question.option3,
                                                                            D: question.option4
                                                                        }).map(([key, value]) => {
                                                                            if (!value) return null
                                                                            const isCorrect = question.correct_answer === key
                                                                            return (
                                                                                <div
                                                                                    key={key}
                                                                                    className={`p-2 rounded border ${
                                                                                        isCorrect ? "border-green-400 bg-green-50" : "border-gray-200"
                                                                                    }`}
                                                                                >
                                                                                    <div
                                                                                        className="flex items-start space-x-2">
                                                                                            <span
                                                                                                className={`font-bold px-2 py-1 rounded text-xs ${
                                                                                                    isCorrect ? "bg-green-500 text-white" : "bg-gray-300"
                                                                                                }`}
                                                                                            >
                                                                                              {key}
                                                                                            </span>
                                                                                        <div
                                                                                            className="prose prose-xs max-w-none flex-1"
                                                                                            dangerouslySetInnerHTML={renderHTML(value)}
                                                                                        />
                                                                                        {isCorrect && (
                                                                                            <CheckCircle2
                                                                                                className="h-4 w-4 text-green-500"/>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}

                                                                {question.question_type === "integer" && (
                                                                    <div
                                                                        className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                                                                        <span
                                                                            className="text-green-700 font-medium">Answer: </span>
                                                                        <span
                                                                            className="font-bold text-green-800">{question.correct_answer}</span>
                                                                    </div>
                                                                )}

                                                                {isExpanded && question.solution && (
                                                                    <div className="mt-4 p-4 bg-gray-50 rounded border">
                                                                        <h4 className="font-semibold mb-2 flex items-center">
                                                                            <Target className="h-4 w-4 mr-2"/>
                                                                            Solution
                                                                        </h4>
                                                                        <div
                                                                            className="prose prose-sm max-w-none"
                                                                            dangerouslySetInnerHTML={renderHTML(question.solution)}
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col space-y-2 ml-4">
                                                                <Button onClick={() => toggleExpanded(question.id)}
                                                                        variant="outline" size="sm">
                                                                    {isExpanded ? <ChevronUp className="h-4 w-4"/> :
                                                                        <ChevronDown className="h-4 w-4"/>}
                                                                </Button>

                                                                {isSelected ? (
                                                                    <Button
                                                                        onClick={() => removeQuestionFromTest(question.id)}
                                                                        variant="destructive"
                                                                        size="sm"
                                                                    >
                                                                        <Trash2 className="h-4 w-4"/>
                                                                    </Button>
                                                                ) : (
                                                                    <Button onClick={() => addQuestionToTest(question)}
                                                                            variant="default" size="sm">
                                                                        <Plus className="h-4 w-4"/>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Test Configuration Tab */}
                    <TabsContent value="configure" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5"/>
                                    <span>Test Configuration</span>
                                </CardTitle>
                                <CardDescription>Configure test settings, marking scheme, and other
                                    parameters</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Test Title *</Label>
                                            <Input
                                                id="title"
                                                value={testConfig.title}
                                                onChange={(e) => setTestConfig((prev) => ({
                                                    ...prev,
                                                    title: e.target.value
                                                }))}
                                                placeholder="Enter test title"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={testConfig.description}
                                                onChange={(e) => setTestConfig((prev) => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))}
                                                placeholder="Enter test description"
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <Label>Exam Type</Label>
                                            <Select
                                                value={testConfig.examType}
                                                onValueChange={(value: "jeemain" | "jeeadv" | "neet") =>
                                                    setTestConfig((prev) => ({...prev, examType: value}))
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="jeemain">JEE Main</SelectItem>
                                                    <SelectItem value="jeeadv">JEE Advanced</SelectItem>
                                                    <SelectItem value="neet">NEET</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="totalTime">Total Time (minutes)</Label>
                                            <Input
                                                id="totalTime"
                                                type="number"
                                                value={testConfig.totalTime}
                                                onChange={(e) =>
                                                    setTestConfig((prev) => ({
                                                        ...prev,
                                                        totalTime: Number.parseInt(e.target.value) || 0
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="correctMarks">Marks for Correct Answer</Label>
                                            <Input
                                                id="correctMarks"
                                                type="number"
                                                value={testConfig.correctMarks}
                                                onChange={(e) =>
                                                    setTestConfig((prev) => ({
                                                        ...prev,
                                                        correctMarks: Number.parseInt(e.target.value) || 0
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="wrongMarks">Marks for Wrong Answer</Label>
                                            <Input
                                                id="wrongMarks"
                                                type="number"
                                                value={testConfig.wrongMarks}
                                                onChange={(e) =>
                                                    setTestConfig((prev) => ({
                                                        ...prev,
                                                        wrongMarks: Number.parseInt(e.target.value) || 0
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="instructions">Test Instructions</Label>
                                    <Textarea
                                        id="instructions"
                                        value={testConfig.instructions}
                                        onChange={(e) => setTestConfig((prev) => ({
                                            ...prev,
                                            instructions: e.target.value
                                        }))}
                                        placeholder="Enter test instructions"
                                        rows={4}
                                    />
                                </div>

                                {/* Subject-wise Distribution */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-4 flex items-center">
                                        <BarChart3 className="h-4 w-4 mr-2"/>
                                        Subject-wise Question Distribution
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-blue-600">{testConfig.subjectWise.physics}</div>
                                            <div className="text-sm text-gray-600">Physics</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-green-600">{testConfig.subjectWise.chemistry}</div>
                                            <div className="text-sm text-gray-600">Chemistry</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-purple-600">{testConfig.subjectWise.mathematics}</div>
                                            <div className="text-sm text-gray-600">Mathematics</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Review Tab */}
                    <TabsContent value="review" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Eye className="h-5 w-5"/>
                                    <span>Review Test</span>
                                </CardTitle>
                                <CardDescription>Review your test configuration and selected questions before
                                    saving</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Test Summary */}
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <h3 className="text-xl font-bold text-blue-900 mb-4">{testConfig.title || "Untitled Test"}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-blue-600">{selectedQuestions.length}</div>
                                            <div className="text-sm text-blue-700">Total Questions</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-green-600">{testConfig.totalTime}</div>
                                            <div className="text-sm text-green-700">Minutes</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-purple-600">{calculateTotalMarks()}</div>
                                            <div className="text-sm text-purple-700">Total Marks</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="text-2xl font-bold text-orange-600">{testConfig.examType.toUpperCase()}</div>
                                            <div className="text-sm text-orange-700">Exam Type</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Selected Questions Preview */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Selected Questions
                                        ({selectedQuestions.length})</h3>
                                    {selectedQuestions.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300"/>
                                            <p>No questions selected. Go back to select questions.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {selectedQuestions.map((question, index) => (
                                                <div key={question.id} className="border rounded-lg p-4 bg-white">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <span className="font-semibold">Q{index + 1}</span>
                                                                <Badge className={getTypeColor(question.question_type)}>
                                                                    {question.question_type.toUpperCase()}
                                                                </Badge>
                                                                <Badge
                                                                    className={getDifficultyColor(question.difficulty)}>
                                                                    {question.difficulty.toUpperCase()}
                                                                </Badge>
                                                                <span className="text-sm text-gray-600">
                                  {question.selectedSubject} → {question.topic}
                                </span>
                                                            </div>
                                                            <div
                                                                className="prose prose-sm max-w-none text-gray-700"
                                                                dangerouslySetInnerHTML={renderHTML(
                                                                    question.question_description.substring(0, 200) + "...",
                                                                )}
                                                            />
                                                        </div>
                                                        <Button
                                                            onClick={() =>
                                                                removeQuestionFromTest(question.id, question.selectedSubject, question.topic)
                                                            }
                                                            variant="destructive"
                                                            size="sm"
                                                        >
                                                            <Trash2 className="h-4 w-4"/>
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-center pt-6">
                                    <Button
                                        onClick={saveTest}
                                        disabled={saving || selectedQuestions.length === 0 || !testConfig.title.trim()}
                                        size="lg"
                                        className="px-8"
                                    >
                                        {saving ? (
                                            <>
                                                <div
                                                    className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Saving Test...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2"/>
                                                Save Test to Firebase
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
