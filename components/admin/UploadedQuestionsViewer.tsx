"use client"

import { useState, useEffect } from "react"
import {
    X,
    Search,
    Database,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    Target
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    doc,
    getDoc
} from "firebase/firestore"

interface Question {
    id: string
    question_no: number
    question_type: "mcq" | "integer"
    difficulty: "easy" | "medium" | "hard"
    question_description: string
    options?: {
        A?: string
        B?: string
        C?: string
        D?: string
    }
    correct_answer: string
    solution?: string
    answer_key?: string
    subject: string
    topic: string
    createdAt?: any
    updatedAt?: any
}

interface Subject {
    id: string
    name: string
}

interface Topic {
    id: string
    name: string
    questionCount: number
}

interface UploadedQuestionsViewerProps {
    onClose: () => void
    isOpen: boolean
}

export default function UploadedQuestionsViewer({ onClose, isOpen }: UploadedQuestionsViewerProps) {
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [topics, setTopics] = useState<Topic[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedTopic, setSelectedTopic] = useState<string>("")
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
    const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const QUESTIONS_PER_PAGE = 10

    // Load subjects when component opens
    useEffect(() => {
        if (isOpen) {
            loadSubjects()
        }
    }, [isOpen])

    const loadSubjects = async () => {
        try {
            setLoading(true)

            // Get all subject documents from Firebase
            const subjectsSnapshot = await getDocs(collection(db, "questions"))

            if (subjectsSnapshot.empty) {
                console.log("No subjects found in Firebase")
                setSubjects([])
                return
            }

            const subjectsData: Subject[] = []

            for (const subjectDoc of subjectsSnapshot.docs) {
                // Get subject name from document data or use document ID as fallback
                const subjectData = subjectDoc.data()

                subjectsData.push({
                    id: subjectDoc.id,
                    name: subjectData.name || subjectDoc.id
                })
            }

            setSubjects(subjectsData)
            console.log("Loaded subjects:", subjectsData)

        } catch (error) {
            console.error("Error loading subjects:", error)
            alert("Failed to load subjects from Firebase. Check console for details.")
        } finally {
            setLoading(false)
        }
    }

    const loadTopics = async (subjectId: string) => {
        try {
            setLoading(true)

            // Get topics collection from the selected subject
            const topicsSnapshot = await getDocs(collection(db, "questions", subjectId, "topics"))

            if (topicsSnapshot.empty) {
                console.log(`No topics found for subject: ${subjectId}`)
                setTopics([])
                return
            }

            const topicsData: Topic[] = []

            for (const topicDoc of topicsSnapshot.docs) {
                const topicData = topicDoc.data()

                topicsData.push({
                    id: topicDoc.id,
                    name: topicData.name || topicDoc.id,
                    questionCount: topicData.questionCount || 0
                })
            }

            setTopics(topicsData)
            console.log("Loaded topics:", topicsData)

        } catch (error) {
            console.error("Error loading topics:", error)
            alert("Failed to load topics from Firebase. Check console for details.")
        } finally {
            setLoading(false)
        }
    }

    const loadQuestions = async (subjectId: string, topicId: string, reset = false) => {
        try {
            setLoading(true)

            // Build the questions collection path based on your Firebase structure
            const questionsCollectionPath = collection(db, "questions", subjectId, "topics", topicId, "questions")

            let questionsQuery = query(
                questionsCollectionPath,
                orderBy("question_no"),
                limit(QUESTIONS_PER_PAGE)
            )

            // If not resetting and we have a lastDoc, start after it for pagination
            if (!reset && lastDoc) {
                questionsQuery = query(
                    questionsCollectionPath,
                    orderBy("question_no"),
                    startAfter(lastDoc),
                    limit(QUESTIONS_PER_PAGE)
                )
            }

            const questionsSnapshot = await getDocs(questionsQuery)

            if (questionsSnapshot.empty) {
                console.log(`No questions found for ${subjectId}/${topicId}`)
                if (reset) {
                    setQuestions([])
                }
                return
            }

            const questionsData: Question[] = questionsSnapshot.docs.map(doc => {
                const data = doc.data()
                return {
                    id: doc.id,
                    question_no: data.question_no || 0,
                    question_type: data.question_type || "mcq",
                    difficulty: data.difficulty || "medium",
                    question_description: data.question_description || "",
                    options: data.options || {},
                    correct_answer: data.correct_answer || "",
                    solution: data.solution || "",
                    answer_key: data.answer_key || "",
                    subject: data.subject || subjectId,
                    topic: data.topic || topicId,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt
                } as Question
            })

            if (reset) {
                setQuestions(questionsData)
            } else {
                setQuestions(prev => [...prev, ...questionsData])
            }

            // Update pagination state
            setLastDoc(questionsSnapshot.docs[questionsSnapshot.docs.length - 1] || null)
            setHasMore(questionsSnapshot.docs.length === QUESTIONS_PER_PAGE)

            console.log("Loaded questions:", questionsData)

        } catch (error) {
            console.error("Error loading questions:", error)
            alert("Failed to load questions from Firebase. Check console for details.")
        } finally {
            setLoading(false)
        }
    }

    const handleSubjectChange = (subjectId: string) => {
        setSelectedSubject(subjectId)
        setSelectedTopic("")
        setQuestions([])
        setTopics([])
        setLastDoc(null)
        setHasMore(true)

        if (subjectId) {
            loadTopics(subjectId)
        }
    }

    const handleTopicChange = (topicId: string) => {
        setSelectedTopic(topicId)
        setQuestions([])
        setLastDoc(null)
        setHasMore(true)

        if (topicId && selectedSubject) {
            // Add a small delay to ensure state is updated
            setTimeout(() => {
                loadQuestions(selectedSubject, topicId, true)
            }, 100)
        }
    }

    const loadMoreQuestions = () => {
        if (selectedSubject && selectedTopic && hasMore && !loading) {
            loadQuestions(selectedSubject, selectedTopic, false)
        }
    }

    const toggleExpanded = (questionId: string) => {
        const newExpanded = new Set(expandedQuestions)
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId)
        } else {
            newExpanded.add(questionId)
        }
        setExpandedQuestions(newExpanded)
    }

    const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
        switch (difficulty) {
            case "easy":
                return "bg-green-100 text-green-800 border-green-300"
            case "medium":
                return "bg-yellow-100 text-yellow-800 border-yellow-300"
            case "hard":
                return "bg-red-100 text-red-800 border-red-300"
        }
    }

    const getTypeColor = (type: "mcq" | "integer") => {
        return type === "mcq"
            ? "bg-blue-100 text-blue-800 border-blue-300"
            : "bg-purple-100 text-purple-800 border-purple-300"
    }

    // Render HTML content safely
    const renderHTML = (htmlContent: string) => {
        return { __html: htmlContent }
    }

    // Filter questions based on search and filters
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.question_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.question_no.toString().includes(searchTerm)
        const matchesDifficulty = difficultyFilter === "all" || q.difficulty === difficultyFilter
        const matchesType = typeFilter === "all" || q.question_type === typeFilter

        return matchesSearch && matchesDifficulty && matchesType
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <Database className="h-8 w-8" />
                        <div>
                            <h2 className="text-2xl font-bold">Questions Database</h2>
                            <p className="text-blue-200">View questions from Firebase</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 bg-gray-50 border-b">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                        {/* Subject Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Topic Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Topic
                            </label>
                            <select
                                value={selectedTopic}
                                onChange={(e) => handleTopicChange(e.target.value)}
                                disabled={!selectedSubject || loading}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Select Topic</option>
                                {topics.map(topic => (
                                    <option key={topic.id} value={topic.id}>
                                        {topic.name} ({topic.questionCount} questions)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search questions..."
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={difficultyFilter}
                                onChange={(e) => setDifficultyFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Levels</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type
                            </label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="mcq">MCQ</option>
                                <option value="integer">Integer</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats */}
                    {questions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                                <span className="text-sm text-gray-600">Total: </span>
                                <span className="font-bold text-gray-900">{filteredQuestions.length}</span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                                <span className="text-sm text-gray-600">MCQ: </span>
                                <span className="font-bold text-blue-600">
                                    {filteredQuestions.filter(q => q.question_type === "mcq").length}
                                </span>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                                <span className="text-sm text-gray-600">Integer: </span>
                                <span className="font-bold text-purple-600">
                                    {filteredQuestions.filter(q => q.question_type === "integer").length}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-lg font-medium text-gray-600">Loading...</span>
                        </div>
                    ) : !selectedSubject || !selectedTopic ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <Database className="h-16 w-16 mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold mb-2">Select Subject and Topic</h3>
                            <p>Choose a subject and topic to view questions from Firebase</p>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <AlertCircle className="h-16 w-16 mb-4 text-gray-300" />
                            <h3 className="text-xl font-bold mb-2">No Questions Found</h3>
                            <p>No questions match your current selection or filters</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredQuestions.map((question) => {
                                const isExpanded = expandedQuestions.has(question.id)

                                return (
                                    <div
                                        key={question.id}
                                        className="border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white"
                                    >
                                        {/* Question Header */}
                                        <div className="bg-gray-50 p-6 border-b">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <h3 className="text-xl font-bold text-gray-900">
                                                            Question {question.question_no}
                                                        </h3>
                                                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getTypeColor(question.question_type)}`}>
                                                            {question.question_type.toUpperCase()}
                                                        </span>
                                                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(question.difficulty)}`}>
                                                            {question.difficulty.toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm text-gray-600 mb-4">
                                                        <span className="font-medium">{question.subject}</span> → <span className="font-medium">{question.topic}</span>
                                                    </div>

                                                    {/* Question Description */}
                                                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                                                        <div
                                                            className="prose prose-sm max-w-none text-gray-800"
                                                            dangerouslySetInnerHTML={renderHTML(question.question_description)}
                                                        />
                                                    </div>

                                                    {/* MCQ Options */}
                                                    {question.question_type === "mcq" && question.options && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                                            {Object.entries(question.options).map(([key, value]) => {
                                                                if (!value) return null
                                                                const isCorrect = question.correct_answer === key
                                                                return (
                                                                    <div
                                                                        key={key}
                                                                        className={`p-3 rounded-lg border-2 ${
                                                                            isCorrect
                                                                                ? "border-green-400 bg-green-50"
                                                                                : "border-gray-200 bg-gray-50"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start space-x-3">
                                                                            <span className={`font-bold px-2 py-1 rounded text-sm ${
                                                                                isCorrect ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"
                                                                            }`}>
                                                                                {key}
                                                                            </span>
                                                                            <div
                                                                                className="prose prose-sm max-w-none flex-1"
                                                                                dangerouslySetInnerHTML={renderHTML(value)}
                                                                            />
                                                                            {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Integer Answer */}
                                                    {question.question_type === "integer" && (
                                                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                                            <div className="flex items-center justify-center space-x-3">
                                                                <span className="text-green-700 font-medium">Correct Answer:</span>
                                                                <span className="text-2xl font-bold text-green-800 bg-white px-4 py-2 rounded shadow-sm">
                                                                    {question.correct_answer}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => toggleExpanded(question.id)}
                                                    className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Expanded Content */}
                                        {isExpanded && question.solution && (
                                            <div className="bg-white p-6">
                                                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                                    <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center">
                                                        <Target className="h-5 w-5 mr-2" />
                                                        Solution
                                                    </h4>
                                                    <div
                                                        className="prose prose-sm max-w-none text-green-800 bg-white p-4 rounded shadow-sm"
                                                        dangerouslySetInnerHTML={renderHTML(question.solution)}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {/* Load More Button */}
                            {hasMore && questions.length > 0 && selectedSubject && selectedTopic && (
                                <div className="text-center mt-8">
                                    <button
                                        onClick={loadMoreQuestions}
                                        disabled={loading}
                                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? "Loading..." : "Load More Questions"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {filteredQuestions.length > 0 && (
                                <span>Showing {filteredQuestions.length} questions from Firebase</span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}