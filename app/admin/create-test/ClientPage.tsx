"use client"

import type React from "react"
import { toast } from "react-toastify"
import { useMemo, useState, useEffect } from "react"
import type { QuestionFromDB } from "@/types/QuestionFromDB"
import type { TestConfig } from "@/types/TestConfig"
import { addDoc, collection, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
    Plus,
    X,
    Check,
    Shuffle,
    BookOpen,
    Clock,
    Target,
    Award,
    ChevronDown,
    ChevronRight,
    Search,
    Grid,
    List,
} from "lucide-react"

// Fetch questions from API
async function fetchQuestionsFromApi(
    examType: string,
    subject: string,
    chapter?: string,
    subtopic?: string,
    difficulty?: string,
    questionType?: string,
) {
    const response = await fetch("/api/questions/get-questions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            examType,
            subject,
            chapter,
            subtopic,
            difficulty,
            questionType,
        }),
    })

    if (!response.ok) {
        throw new Error("Failed to fetch questions")
    }
    const data = await response.json()
    return data.questions || []
}

// Fetch questions from API
async function fetchQuestionsFromApiChapter(
    examType: string,
    subject: string,
    limit: number,
    chapter?: string,
    difficulty?: string,
    questionType?: string,
) {
    const response = await fetch("/api/questions/get-questions-chapter", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            examType,
            subject,
            limit,
            chapter,
            difficulty,
            questionType,
        }),
    })

    if (!response.ok) {
        throw new Error("Failed to fetch questions")
    }
    const data = await response.json()
    return data.questions || []
}

// Fetch questions from API
async function fetchQuestionsFromApiSubject(
    examType: string,
    subject: string,
    limit: number,
    difficulty?: string,
    questionType?: string,
) {
    const response = await fetch("/api/questions/get-questions-subtopic", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            examType,
            subject,
            limit,
            difficulty,
            questionType,
        }),
    })

    if (!response.ok) {
        throw new Error("Failed to fetch questions")
    }
    const data = await response.json()
    return data.questions || []
}

interface SelectedQuestion extends QuestionFromDB {
    selectedSubject: string
    selectedChapter: string
    selectedSubtopic: string
}

interface TestWithQuestions {
    testConfig: TestConfig
    questions: SelectedQuestion[]
    createdAt: Date
    updatedAt: Date
}

interface DialogProps {
    isOpen: boolean
    onClose: () => void
    children: React.ReactNode
    title: string
    size?: "sm" | "md" | "lg" | "xl"
}

function RandomSelectDialog({
                                isOpen,
                                subjects,
                                onClose,
                                onSubmit,
                            }: {
    isOpen: boolean
    subjects: string[]
    onClose: () => void
    onSubmit: (questionCounts: Record<string, { mcq: number; integer: number }>) => void
}) {
    const [counts, setCounts] = useState<Record<string, { mcq: number; integer: number }>>({})

    useEffect(() => {
        if (isOpen && subjects.length > 0) {
            const initial = Object.fromEntries(subjects.map((s) => [s, { mcq: 0, integer: 0 }]))
            setCounts(initial)
        }
    }, [isOpen, subjects])

    const getTotalQuestions = () => {
        return Object.values(counts).reduce((total, selection) => total + selection.mcq + selection.integer, 0)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Random Selection" size="lg">
            <div className="space-y-6">
                <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <strong>Configure MCQ and Integer question counts</strong> for each subject.
                </div>

                {subjects.map((subject) => (
                    <div
                        key={subject}
                        className="p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-gray-800 capitalize text-lg">{subject}</h4>
                            <div className="text-sm font-medium text-gray-600">
                                Total: {(counts[subject]?.mcq || 0) + (counts[subject]?.integer || 0)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-xl">
                                <label className="font-medium text-blue-600">MCQ</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={counts[subject]?.mcq ?? 0}
                                    onChange={(e) =>
                                        setCounts((c) => ({
                                            ...c,
                                            [subject]: { ...c[subject], mcq: +e.target.value },
                                        }))
                                    }
                                    className="w-20 p-2 border border-gray-300 rounded-lg text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 border border-gray-300 rounded-xl">
                                <label className="font-medium text-purple-600">Integer</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={counts[subject]?.integer ?? 0}
                                    onChange={(e) =>
                                        setCounts((c) => ({
                                            ...c,
                                            [subject]: { ...c[subject], integer: +e.target.value },
                                        }))
                                    }
                                    className="w-20 p-2 border border-gray-300 rounded-lg text-center focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-green-800 font-medium">
                        <strong>Total Questions:</strong> {getTotalQuestions()}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(counts)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Select Questions ({getTotalQuestions()})
                    </button>
                </div>
            </div>
        </Dialog>
    )
}

function DifficultySelectDialog({
                                    isOpen,
                                    subjects,
                                    onClose,
                                    onSubmit,
                                }: {
    isOpen: boolean
    subjects: string[]
    onClose: () => void
    onSubmit: (
        questionCounts: Record<string, { mcq: number; integer: number }>,
        difficulty: {
            easy: number
            medium: number
            hard: number
        },
    ) => void
}) {
    const [counts, setCounts] = useState<Record<string, { mcq: number; integer: number }>>({})
    const [difficulty, setDifficulty] = useState({ easy: 50, medium: 30, hard: 20 })

    useEffect(() => {
        if (isOpen && subjects.length > 0) {
            const initial = Object.fromEntries(subjects.map((s) => [s, { mcq: 0, integer: 0 }]))
            setCounts(initial)
        }
    }, [isOpen, subjects])

    const totalPercent = difficulty.easy + difficulty.medium + difficulty.hard
    const getTotalQuestions = () => {
        return Object.values(counts).reduce((total, selection) => total + selection.mcq + selection.integer, 0)
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Difficulty-Based Selection" size="lg">
            <div className="space-y-6">
                <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <strong>Configure difficulty distribution</strong> and question counts per subject.
                </div>

                {/* Difficulty Distribution */}
                <div className="p-4 border-2 border-purple-200 rounded-2xl bg-purple-50">
                    <h4 className="text-lg font-bold text-purple-800 mb-4">Difficulty Distribution (%)</h4>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-xl bg-white">
                            <label className="font-bold text-green-600">Easy</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={difficulty.easy}
                                onChange={(e) => setDifficulty((d) => ({ ...d, easy: +e.target.value }))}
                                className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-xl bg-white">
                            <label className="font-bold text-yellow-600">Medium</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={difficulty.medium}
                                onChange={(e) => setDifficulty((d) => ({ ...d, medium: +e.target.value }))}
                                className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 border border-gray-300 rounded-xl bg-white">
                            <label className="font-bold text-red-600">Hard</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={difficulty.hard}
                                onChange={(e) => setDifficulty((d) => ({ ...d, hard: +e.target.value }))}
                                className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            />
                        </div>
                    </div>

                    <div className="mt-3 p-2 bg-white rounded-lg border">
            <span className={totalPercent === 100 ? "text-green-600 font-medium" : "text-red-600 font-bold"}>
              Total: {totalPercent}% {totalPercent !== 100 && " (Must equal 100%)"}
            </span>
                    </div>
                </div>

                {/* Subject Questions */}
                <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">Question Counts per Subject</h4>
                    {subjects.map((subject) => (
                        <div
                            key={subject}
                            className="p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 transition-all duration-200"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h5 className="font-bold text-gray-800 capitalize">{subject}</h5>
                                <div className="text-sm font-medium text-gray-600">
                                    Total: {(counts[subject]?.mcq || 0) + (counts[subject]?.integer || 0)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-blue-600">MCQ</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={counts[subject]?.mcq ?? 0}
                                        onChange={(e) =>
                                            setCounts((c) => ({
                                                ...c,
                                                [subject]: { ...c[subject], mcq: +e.target.value },
                                            }))
                                        }
                                        className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-purple-600">Integer</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={counts[subject]?.integer ?? 0}
                                        onChange={(e) =>
                                            setCounts((c) => ({
                                                ...c,
                                                [subject]: { ...c[subject], integer: +e.target.value },
                                            }))
                                        }
                                        className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="text-sm text-green-800 font-medium">
                        <strong>Total Questions:</strong> {getTotalQuestions()}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl hover:bg-gray-300 transition-all duration-200 font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={totalPercent !== 100}
                        onClick={() => onSubmit(counts, difficulty)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Generate Questions ({getTotalQuestions()})
                    </button>
                </div>
            </div>
        </Dialog>
    )
}

const Dialog = ({ isOpen, onClose, children, title, size = "md" }: DialogProps) => {
    if (!isOpen) return null

    const sizeClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-4xl",
        xl: "max-w-7xl",
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div
                className={`bg-white p-8 rounded-3xl shadow-2xl w-full ${sizeClasses[size]} max-h-[95vh] overflow-hidden flex flex-col border border-gray-100 animate-in slide-in-from-bottom-4 duration-300`}
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">{children}</div>
            </div>
        </div>
    )
}

const ChapterGrid = ({
                         chapters,
                         onChapterClick,
                         selectedSubject,
                         searchTerm,
                         setSearchTerm,
                         onRandomSelect, // New prop
                         showRandomButton = false, // New prop
                         randomLimit = 0, // New prop
                         onRandomLimitChange, // New prop
                     }: {
    chapters: any[]
    onChapterClick: (chapterName: string, subjectName?: string) => void
    selectedSubject?: string
    searchTerm: string
    setSearchTerm: (term: string) => void
    onRandomSelect?: ((subject: string, limit: number) => void)
  | ((subject: string, chapter: string, limit: number) => void);
    showRandomButton?: boolean
    randomLimit?: number
    onRandomLimitChange?: (limit: number) => void
}) => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const filteredChapters = chapters.filter((chapter) =>
        chapter.chapter.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <div className="space-y-6">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-2xl border border-gray-200">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search chapters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                    />
                </div>

                {/* Random Selection Controls */}
                {showRandomButton && (
                    <div className="flex items-center gap-3 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
                        <input
                            type="number"
                            value={randomLimit || ""}
                            onChange={(e) => onRandomLimitChange?.(Number(e.target.value))}
                            className="w-20 p-2 border-2 border-gray-200 rounded-lg text-center focus:border-green-500 focus:ring-2 focus:ring-green-100"
                            placeholder="0"
                        />
                        <button
                        //@ts-ignore
                            onClick={() => onRandomSelect?.(selectedSubject || "", randomLimit)}
                            disabled={!randomLimit}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-bold"
                        >
                            <Shuffle size={16} />
                            Random from Chapter
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-blue-500 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600 font-medium">
                Showing {filteredChapters.length} of {chapters.length} chapters
            </div>

            {/* Rest of the component remains the same */}
            <div
                className={
                    viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"
                }
            >
                {filteredChapters.map((chapter, index) => (
                    <div
                        key={chapter.chapter}
                        className={`group relative overflow-hidden border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-[1.02] ${
                            viewMode === "list" ? "flex items-center" : ""
                        }`}
                    >
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
                            #{index + 1}
                        </div>

                        <div className={`p-6 ${viewMode === "list" ? "flex-1 flex items-center justify-between" : ""}`}>
                            <div className={viewMode === "list" ? "flex-1" : ""}>
                                <h4
                                    className={`font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-200 ${
                                        viewMode === "grid" ? "mt-6 mb-3 text-sm leading-tight" : "text-base"
                                    }`}
                                >
                                    {chapter.chapter}
                                </h4>
                                <div className="text-xs text-gray-500 font-medium">{chapter.subtopics?.length || 0} subtopics</div>
                            </div>

                            <button
                                onClick={() => onChapterClick(chapter.chapter, selectedSubject)}
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group-hover:rotate-12"
                                title="View Subtopics"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredChapters.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Search size={48} className="mx-auto" />
                    </div>
                    <p className="text-gray-500 font-medium">No chapters found matching "{searchTerm}"</p>
                </div>
            )}
        </div>
    )
}

const SubtopicDialog = ({
                            isOpen,
                            onClose,
                            subtopics,
                            onSubtopicClick,
                            chapterName,
                            subjectName,
                            onRandomSelect,
                            randomLimit,
                            onRandomLimitChange,
                        }: {
    isOpen: boolean
    onClose: () => void
    subtopics: { name: string }[]
    onSubtopicClick: (subtopic: string) => void
    chapterName: string
    subjectName?: string
    onRandomSelect?: (subject: string, chapter: string, limit: number) => void
    randomLimit?: number
    onRandomLimitChange?: (limit: number) => void
}) => (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Subtopics in ${chapterName}`} size="lg">
        <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-xl border border-blue-200">
                <strong>{subtopics.length}</strong> subtopics available in this chapter
            </div>

            {/* Random Selection Controls */}
            {onRandomSelect && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-bold text-gray-700">Random Questions from Chapter:</label>
                            <input
                                type="number"
                                value={randomLimit || ""}
                                onChange={(e) => onRandomLimitChange?.(Number(e.target.value))}
                                className="w-20 p-2 border-2 border-gray-200 rounded-lg text-center focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                placeholder="0"
                            />
                        </div>
                        <button
                            onClick={() => onRandomSelect(subjectName || "", chapterName, randomLimit || 0)}
                            disabled={!randomLimit}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-bold"
                        >
                            <Shuffle size={16} />
                            Random from All Subtopics
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subtopics.map((subtopic, index) => (
                    <div
                        key={index}
                        className="group flex items-center justify-between p-4 border-2 border-gray-100 rounded-2xl hover:border-blue-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">
                                {index + 1}
                            </div>
                            <span className="font-semibold text-gray-700 group-hover:text-gray-900">{subtopic.name}</span>
                        </div>
                        <button
                            onClick={() => onSubtopicClick(subtopic.name)}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            title="View Questions"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </Dialog>
)

// Questions Dialog Component - Enhanced Version
const QuestionsDialog = ({
                             isOpen,
                             onClose,
                             questions,
                             selectedQuestions,
                             onQuestionToggle,
                             onRandomSelect,
                             questionLimit,
                             subtopicName,
                             loading,
                         }: {
    isOpen: boolean
    onClose: () => void
    questions: QuestionFromDB[]
    selectedQuestions: Set<string>
    onQuestionToggle: (questionId: string) => void
    onRandomSelect: () => void
    questionLimit: number
    subtopicName: string
    loading: boolean
}) => (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Questions in ${subtopicName}`} size="xl">
        {loading ? (
            <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Loading questions...</p>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center mb-8 flex-shrink-0 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <div className="text-sm text-gray-700 bg-white px-4 py-2 rounded-xl shadow-sm border">
                        <span className="font-semibold">Selected:</span>{" "}
                        <span className="text-blue-600 font-bold">{selectedQuestions.size}</span> /
                        <span className="font-semibold ml-2">Available:</span>{" "}
                        <span className="text-green-600 font-bold">{questions.length}</span>
                        {questionLimit > 0 && (
                            <>
                                <span className="font-semibold ml-2">/ Target:</span>{" "}
                                <span className="text-purple-600 font-bold">{questionLimit}</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onRandomSelect}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        disabled={questionLimit === 0}
                        title={questionLimit === 0 ? "Set question limit first" : "Select random questions"}
                    >
                        <Shuffle size={18} />
                        <span className="font-semibold">Random {questionLimit > 0 ? questionLimit : ""}</span>
                    </button>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-4">
                    {questions.map((question, index) => (
                        <div
                            key={question._id}
                            className="border-2 border-gray-100 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-lg"
                        >
                            <div className="flex items-start gap-6 p-8">
                                <input
                                    type="checkbox"
                                    checked={selectedQuestions.has(question._id)}
                                    onChange={() => onQuestionToggle(question._id)}
                                    className="mt-6 flex-shrink-0 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-md">
                      {question.questionType?.toUpperCase()}
                    </span>
                                        <span className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 rounded-full font-semibold border">
                      {question.difficulty}
                    </span>
                                        <span className="text-sm text-gray-600 font-semibold bg-white px-3 py-2 rounded-full border shadow-sm">
                      Question {index + 1}
                    </span>
                                    </div>

                                    {/* Enhanced question display matching your sample */}
                                    <div className="mb-10">
                                        <div className="mb-10 p-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 shadow-lg">
                                            <div className="flex gap-6 items-start">
                                                <strong className="text-blue-600 text-3xl flex-shrink-0 font-bold bg-white px-3 py-2 rounded-xl shadow-md border-2 border-blue-200">
                                                    Q{index + 1}.
                                                </strong>
                                                <div
                                                    className="flex-1 text-slate-800 leading-relaxed text-lg font-medium"
                                                    style={{
                                                        wordWrap: "break-word",
                                                        overflowWrap: "break-word",
                                                        maxWidth: "100%",
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: question.questionDescription }}
                                                />
                                            </div>
                                        </div>

                                        {/* Enhanced MCQ Options matching your sample */}
                                        {question.questionType === "mcq" && question.options && (
                                            <div className="space-y-6">
                                                {["A", "B", "C", "D"].map((optionKey) => {
                                                    const optionContent = question.options[optionKey as keyof typeof question.options]
                                                    if (!optionContent) return null

                                                    return (
                                                        <div
                                                            key={optionKey}
                                                            className="flex items-start space-x-6 rounded-2xl border-2 border-slate-200 p-8 bg-white hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-lg transition-all duration-300"
                                                        >
                              <span className="font-bold text-blue-600 bg-gradient-to-r from-blue-100 to-purple-100 px-5 py-3 rounded-xl text-lg flex-shrink-0 min-w-[50px] text-center mr-2 border-2 border-blue-200 shadow-md">
                                {optionKey}
                              </span>
                                                            <div
                                                                className="flex-1 text-slate-800 leading-relaxed text-base font-medium"
                                                                style={{
                                                                    wordWrap: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    maxWidth: "100%",
                                                                }}
                                                                dangerouslySetInnerHTML={{ __html: optionContent }}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Enhanced Integer question indication matching your sample */}
                                        {question.questionType === "integer" && (
                                            <div className="space-y-6">
                                                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 p-10 shadow-lg">
                                                    <div className="block mb-6 font-bold text-2xl text-slate-800 flex items-center gap-4">
                                                        <span className="text-3xl">📝</span>
                                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              Enter your numerical answer:
                            </span>
                                                    </div>
                                                    <div className="w-full max-w-sm border-2 border-slate-300 text-2xl p-6 rounded-2xl shadow-md font-mono bg-white hover:border-blue-400 transition-colors">
                                                        [Numerical Answer Required]
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 flex items-start shadow-sm">
                                                        <span className="text-amber-600 mr-3 text-lg">⚠️</span>
                                                        <span className="font-medium">
                              Round off your answer to the nearest integer if required
                            </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                        Done ({selectedQuestions.size} selected)
                    </button>
                </div>
            </>
        )}
    </Dialog>
)

export default function CreateTest({ examData }: any) {
    // Basic state
    const [selectedExam, setSelectedExam] = useState<string>("")
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([])
    const [saving, setSaving] = useState(false)

    // Paper type configuration
    const [paperType, setPaperType] = useState<string>("")
    const [questionLimit, setQuestionLimit] = useState<number>(0)
    const [subjectQuestionLimits, setSubjectQuestionLimits] = useState<Record<string, number>>({})
    const [chapterQuestionLimits, setChapterQuestionLimits] = useState<Record<string, number>>({})
    const [subtopicQuestionLimits, setSubtopicQuestionLimits] = useState<Record<string, number>>({})

    // Selection state
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedChapter, setSelectedChapter] = useState<string>("")
    const [selectedSubtopic, setSelectedSubtopic] = useState<string>("")
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

    // Dialog states
    const [subtopicDialogOpen, setSubtopicDialogOpen] = useState(false)
    const [questionsDialogOpen, setQuestionsDialogOpen] = useState(false)
    const [currentChapterSubtopics, setCurrentChapterSubtopics] = useState<{ name: string }[]>([])
    const [currentQuestions, setCurrentQuestions] = useState<QuestionFromDB[]>([])
    const [questionsLoading, setQuestionsLoading] = useState(false)
    const [currentSubtopic, setCurrentSubtopic] = useState<string>("")
    const [currentChapter, setCurrentChapter] = useState<string>("")
    const [currentSubject, setCurrentSubject] = useState<string>("")
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set())

    // Test configuration
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
            biology: 0,
        },
    })

    const [randomDialogOpen, setRandomDialogOpen] = useState(false)
    const [difficultyDialogOpen, setDifficultyDialogOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleRandomChapterSelection = async (subject: string, limit: number) => {
        console.log("▶️ handleRandomChapterSelection called with:", { subject, limit })

        if (limit === 0) {
            console.warn("⚠️ Chapter limit is 0. Aborting random selection.")
            toast.warn("Please set number of questions first!")
            return
        }

        try {
            setQuestionsLoading(true)
            console.log("⏳ Setting questions loading...")

            const allQuestions: SelectedQuestion[] = []

            console.log("📡 Fetching questions for subject:", subject, "examType:", testConfig.examType)
            const questions = await fetchQuestionsFromApiSubject(testConfig.examType, subject, limit)
            console.log("✅ Questions fetched:", questions.length, "questions")

            const formattedQuestions: SelectedQuestion[] = questions.map((q: QuestionFromDB, idx: number) => {
                const mapped = {
                    ...q,
                    selectedSubject: subject,
                    selectedChapter: q.topicName,
                    selectedSubtopic: q.subtopicName,
                }
                console.log(`🗂️ Mapping Q${idx + 1}:`, mapped)
                return mapped
            })

            console.log("📋 Formatted Questions Count:", formattedQuestions.length)
            allQuestions.push(...formattedQuestions)

            console.log("📚 All Questions after push:", allQuestions.length)

            // Shuffle
            const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5)
            console.log("🔀 Shuffled Questions Count:", shuffledQuestions.length)

            console.log("🎯 Chapter limit to slice:", limit)
            const randomSelectedQuestions = shuffledQuestions.slice(0, limit)
            console.log("✅ Randomly Selected Questions Count:", randomSelectedQuestions.length)
            console.table(randomSelectedQuestions)

            setSelectedQuestions((prev) => {
                const filtered = prev.filter((q) => q.selectedSubject !== subject)
                console.log("🧹 Previous questions filtered:", filtered.length)
                const updated = [...filtered, ...randomSelectedQuestions]
                console.log("📌 Updated selectedQuestions length:", updated.length)
                return updated
            })

            toast.success(`Selected ${randomSelectedQuestions.length} random questions from ${subject}`)
        } catch (error) {
            console.error("❌ Error in random chapter selection:", error)
            toast.error("Failed to select random questions")
        } finally {
            setQuestionsLoading(false)
            console.log("✅ Finished: questionsLoading set to false")
        }
    }

    const handleRandomSubtopicSelection = async (subject: string, chapter: string, subtopicLimit: number) => {
        if (subtopicLimit === 0) {
            toast.warn("Please set number of questions first!")
            return
        }

        try {
            setQuestionsLoading(true)
            const chapterData = subjects[subject]?.find((ch) => ch.chapter === chapter)
            const allQuestions: SelectedQuestion[] = []

            const questions = await fetchQuestionsFromApiChapter(testConfig.examType, subject, subtopicLimit, chapter)

            const formattedQuestions = questions.map((q: QuestionFromDB) => ({
                ...q,
                selectedSubject: subject,
                selectedChapter: chapter,
                selectedSubtopic: q.subtopicName,
            }))

            allQuestions.push(...formattedQuestions)

            // Get all questions from all subtopics in this chapter
            // for (const subtopic of chapterData?.subtopics || []) {
            //     const questions = await fetchQuestionsFromApi(
            //         testConfig.examType,
            //         subject,
            //         chapter,
            //         subtopic.name
            //     )
            //
            //     const formattedQuestions = questions.map((q: QuestionFromDB) => ({
            //         ...q,
            //         selectedSubject: subject,
            //         selectedChapter: chapter,
            //         selectedSubtopic: subtopic.name,
            //     }))
            //
            //     allQuestions.push(...formattedQuestions)
            // }

            // Randomly select questions
            const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
            const randomSelected = shuffled.slice(0, subtopicLimit)

            // Remove existing questions from this chapter and add new ones
            setSelectedQuestions((prev) => [
                ...prev.filter((q) => !(q.selectedSubject === subject && q.selectedChapter === chapter)),
                ...randomSelected,
            ])

            toast.success(`Selected ${randomSelected.length} random questions from ${chapter}`)
            setSubtopicDialogOpen(false)
        } catch (error) {
            console.error("Error in random subtopic selection:", error)
            toast.error("Failed to select random questions")
        } finally {
            setQuestionsLoading(false)
        }
    }

    const handleRandomSelection = async (questionCounts: Record<string, { mcq: number; integer: number }>) => {
        setLoading(true)
        console.log("Sending random selection request:", {
            examType: testConfig.examType,
            subjectSelections: questionCounts,
        })

        try {
            const res = await fetch("/api/select-random-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examType: testConfig.examType,
                    subjectSelections: questionCounts,
                }),
            })

            console.log("Response status:", res.status)

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || `HTTP ${res.status}`)
            }

            const data = await res.json()
            console.log("API Response:", data)

            // Format questions for your existing structure
            const formattedQuestions: SelectedQuestion[] = data.questions.map((q: any) => ({
                ...q,
                selectedSubject: q.subjectName || q.subjectId,
                selectedChapter: q.topicName || "Mixed Topics",
                selectedSubtopic: q.subtopicName || "Mixed Subtopics",
            }))

            setSelectedQuestions(formattedQuestions)
            toast.success(`Successfully loaded ${data.total} questions!`)
        } catch (error) {
            console.error("Random selection error:", error)
            toast.error(`Failed to load questions: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setLoading(false)
            setRandomDialogOpen(false)
        }
    }

    const handleDifficultySelection = async (
        questionCounts: Record<string, { mcq: number; integer: number }>,
        difficulty: { easy: number; medium: number; hard: number },
    ) => {
        setLoading(true)
        console.log("Sending difficulty selection request:", {
            examType: testConfig.examType,
            subjectSelections: questionCounts,
            difficultyPercentages: difficulty,
        })

        try {
            const res = await fetch("/api/select-difficulty-questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examType: testConfig.examType,
                    subjectSelections: questionCounts,
                    difficultyPercentages: difficulty,
                }),
            })

            console.log("Response status:", res.status)

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || `HTTP ${res.status}`)
            }

            const data = await res.json()
            console.log("API Response:", data)

            // Format questions for your existing structure
            const formattedQuestions: SelectedQuestion[] = data.questions.map((q: any) => ({
                ...q,
                selectedSubject: q.subjectName || q.subjectId,
                selectedChapter: q.topicName || "Mixed Topics",
                selectedSubtopic: q.subtopicName || "Mixed Subtopics",
            }))

            setSelectedQuestions(formattedQuestions)
            toast.success(`Successfully loaded ${data.total} questions with difficulty distribution!`)
        } catch (error) {
            console.error("Difficulty selection error:", error)
            toast.error(`Failed to load questions: ${error instanceof Error ? error.message : "Unknown error"}`)
        } finally {
            setLoading(false)
            setDifficultyDialogOpen(false)
        }
    }

    //@ts-ignore
    const exams = examData.map((item) => item.name)

    const subjects = useMemo(() => {
        const selectedExamData = examData.find(
            (exam: {
                name: string
                subjects: { name: string; chapters: { name: string; subtopics: { name: string }[] }[] }[]
            }) => exam.name === selectedExam,
        )

        const subjectsMap: Record<string, ({ name: string; subtopics: { name: string }[] } & { chapter: string })[]> =
            //@ts-ignore
            selectedExamData?.subjects?.reduce(
                (acc: { [x: string]: any }, subject: { name: string | number; chapters: any[] }) => {
                    //@ts-ignore
                    acc[subject.name] = subject.chapters.map((ch) => ({
                        ...ch,
                        chapter: ch.name,
                    }))
                    return acc
                },
                {} as Record<string, ({ name: string; subtopics: { name: string }[] } & { chapter: string })[]>,
            ) || {}

        return subjectsMap
    }, [selectedExam, examData])

    // Handle paper type change
    const handlePaperTypeChange = (type: string) => {
        setPaperType(type)
        setSelectedSubjects([])
        setSelectedSubject("")
        setSelectedChapter("")
        setSelectedQuestions([])
        setQuestionLimit(0)
        setSubjectQuestionLimits({})

        // Update test config
        setTestConfig((prev) => ({
            ...prev,
            paperType: type,
        }))
    }

    // Handle question limit change
    const handleQuestionLimitChange = (limit: number) => {
        setQuestionLimit(limit)
    }

    // Handle subject question limit change
    const handleSubjectQuestionLimitChange = (subject: string, limit: number) => {
        setSubjectQuestionLimits((prev) => ({
            ...prev,
            [subject]: limit,
        }))
    }

    // Handle chapter click
    const handleChapterClick = (chapterName: string, subjectName?: string) => {
        const subject = subjectName || selectedSubject
        const chapter = subjects[subject]?.find((ch) => ch.chapter === chapterName)

        if (chapter && chapter.subtopics) {
            setCurrentChapterSubtopics(chapter.subtopics)
            setCurrentChapter(chapterName)
            setCurrentSubject(subject)
            setSubtopicDialogOpen(true)
        }
    }

    // Handle subtopic click
    const handleSubtopicClick = async (subtopicName: string) => {
        // Check if question limit is set for the current context
        const currentLimit =
            paperType === "Subjectwise Paper" || paperType === "Chapterwise Paper"
                ? questionLimit
                : subjectQuestionLimits[currentSubject] || 0

        if (currentLimit === 0) {
            toast.warn("Please define the number of questions first!")
            return
        }

        setQuestionsLoading(true)
        setCurrentSubtopic(subtopicName)
        setSelectedQuestionIds(new Set())

        try {
            const questions = await fetchQuestionsFromApi(testConfig.examType, currentSubject, currentChapter, subtopicName)
            setCurrentQuestions(questions)
            setSubtopicDialogOpen(false)
            setQuestionsDialogOpen(true)
        } catch (error) {
            console.error("Error fetching questions:", error)
            toast.error("Failed to load questions")
        } finally {
            setQuestionsLoading(false)
        }
    }

    // Handle question toggle
    const handleQuestionToggle = (questionId: string) => {
        setSelectedQuestionIds((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(questionId)) {
                newSet.delete(questionId)
            } else {
                newSet.add(questionId)
            }
            return newSet
        })
    }

    // Handle random question selection
    const handleRandomSelect = () => {
        const currentLimit =
            paperType === "Subjectwise Paper" || paperType === "Chapterwise Paper"
                ? questionLimit
                : subjectQuestionLimits[currentSubject] || 0

        if (currentLimit === 0) {
            toast.warn("Please set question limit first!")
            return
        }

        const shuffled = [...currentQuestions].sort(() => Math.random() - 0.5)
        const randomSelected = shuffled.slice(0, currentLimit)
        setSelectedQuestionIds(new Set(randomSelected.map((q) => q._id)))
        toast.success(`Selected ${randomSelected.length} random questions`)
    }

    // Handle questions dialog close (save selected questions)
    const handleQuestionsDialogClose = () => {
        const selectedQs = currentQuestions
            .filter((q) => selectedQuestionIds.has(q._id))
            .map((q) => ({
                ...q,
                selectedSubject: currentSubject,
                selectedChapter: currentChapter,
                selectedSubtopic: currentSubtopic,
            }))

        setSelectedQuestions((prev) => [
            ...prev.filter(
                (q) =>
                    !(
                        q.selectedSubject === currentSubject &&
                        q.selectedChapter === currentChapter &&
                        q.selectedSubtopic === currentSubtopic
                    ),
            ),
            ...selectedQs,
        ])

        setQuestionsDialogOpen(false)
        toast.success(`Added ${selectedQs.length} questions from ${currentSubtopic}`)
    }

    // Handle test config change
    const handleTestConfigChange = (field: keyof TestConfig, value: any) => {
        setTestConfig((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    // Update subject counts
    useEffect(() => {
        const subjectCounts = {
            physics: 0,
            chemistry: 0,
            mathematics: 0,
            biology: 0,
        }
        console.log({ selectedQuestions })
        selectedQuestions.forEach((q) => {
            const subject = q.selectedSubject?.toLowerCase()
            if (subject?.includes("physics")) subjectCounts.physics++
            else if (subject?.includes("chemistry")) subjectCounts.chemistry++
            else if (subject?.includes("math")) subjectCounts.mathematics++
            else if (subject?.includes("biology")) subjectCounts.biology++
        })

        setTestConfig((prev) => ({
            ...prev,
            subjectWise: subjectCounts,
        }))
    }, [selectedQuestions])

    // Save test
    const handleSaveTest = async () => {
        if (!testConfig.paperName) {
            toast.error("Please enter a paper name")
            return
        }

        if (selectedQuestions.length === 0) {
            toast.error("Please select questions first")
            return
        }

        setSaving(true)
        try {
            console.log({ selectedQuestions })
            // 1️⃣ Try locking questions first
            const lockResponse = await fetch("/api/modification/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    examType: testConfig.examType,
                    questions: selectedQuestions.map((q) => q._id),
                }),
            })

            if (!lockResponse.ok) {
                const errMsg = await lockResponse.text()
                throw new Error(`Failed to lock questions: ${errMsg}`)
            }

            // 2️⃣ Proceed with saving only if lock is successful
            const testData: TestWithQuestions = {
                testConfig,
                questions: selectedQuestions,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            const docRef = await addDoc(collection(db, "tests"), testData);
            await setDoc(docRef, {id: docRef.id}, {merge:true})

            toast.success("Test saved successfully!")

            // 3️⃣ Reset form
            // setSelectedQuestions([])
            // setSelectedSubjects([])
            // setPaperType("")
            // setQuestionLimit(0)
            // setSubjectQuestionLimits({})
            // setSelectedSubject("")
            // setSelectedChapter("")
            // setTestConfig({
            //     branchName: "",
            //     examType: "jeemain",
            //     paperType: "",
            //     paperName: "",
            //     paperDate: "",
            //     paperTime: "",
            //     startFrom: 1,
            //     optionType: "",
            //     status: "inactive",
            //     totalTime: 0,
            //     correctMarks: 0,
            //     wrongMarks: 0,
            //     subjectWise: {
            //         physics: 0,
            //         chemistry: 0,
            //         mathematics: 0,
            //         biology: 0,
            //     },
            // })
        } catch (error) {
            console.error("Error saving test:", error)
            toast.error(error instanceof Error ? error.message : "Failed to save test")
        } finally {
            setSaving(false)
        }
    }

    const [searchTerm, setSearchTerm] = useState<string>("")
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())

    const toggleSubjectExpansion = (subject: string) => {
        setExpandedSubjects((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(subject)) {
                newSet.delete(subject)
            } else {
                newSet.add(subject)
            }
            return newSet
        })
    }

    return (
        <>
            {/* UI-only: inject global style overrides to remove gradients and enforce a compact, accessible palette.
          No logic, data, or structure modified. Everything remains in this single file. */}
            <style
                // Prevent hydration warnings due to runtime-injected styles
                suppressHydrationWarning
                dangerouslySetInnerHTML={{
                    __html: `
          :root{
            --color-text:#0f172a;            /* slate-900 */
            --color-bg:#ffffff;              /* white */
            --color-muted:#f1f5f9;           /* slate-100 */
            --color-border:#e5e7eb;          /* gray-200 */
            --color-primary:#2563eb;         /* blue-600 */
            --color-primary-hover:#1d4ed8;   /* blue-700 */
            --color-success:#16a34a;         /* green-600 */
            --color-success-hover:#15803d;   /* green-700 */
            --color-danger:#dc2626;          /* red-600 */
          }

          /* Remove all Tailwind gradient backgrounds used throughout and replace with solids */
          [class*="bg-gradient-to-"]{ background-image:none !important; }

          /* Primary (was blue->purple) */
          [class*="from-blue-500"][class*="to-purple-600"],
          [class*="from-blue-500"],
          [class*="to-purple-600"],
          button[class*="from-purple-500"][class*="to-pink-600"],
          button[class*="from-blue-500"],
          button[class*="to-purple-600"]{
            background-color:var(--color-primary) !important;
            color:#fff !important;
          }
          button[class*="from-blue-500"]:hover,
          button[class*="to-purple-600"]:hover,
          button[class*="from-purple-500"][class*="to-pink-600"]:hover{
            background-color:var(--color-primary-hover) !important;
          }

          /* Success (was green->emerald) */
          [class*="from-green-500"][class*="to-emerald-600"],
          [class*="from-green-500"],
          [class*="to-emerald-600"]{
            background-color:var(--color-success) !important;
            color:#fff !important;
          }
          [class*="from-green-500"]:hover,
          [class*="to-emerald-600"]:hover{
            background-color:var(--color-success-hover) !important;
          }

          /* Muted panels previously using subtle gradients */
          [class*="from-gray-50"][class*="to-blue-50"],
          [class*="from-slate-50"][class*="to-blue-50"],
          [class*="from-blue-50"][class*="to-purple-50"]{
            background-color:var(--color-muted) !important;
          }
          [class*="from-green-50"][class*="to-emerald-50"]{
            background-color:#f0fdf4 !important; /* green-50 */
          }
          [class*="from-amber-50"][class*="to-orange-50"]{
            background-color:#fffbeb !important; /* amber-50 */
          }

          /* Make gradient text normal readable text */
          [class*="bg-clip-text"][class*="text-transparent"]{
            -webkit-background-clip:initial !important;
            background-clip:initial !important;
            color:var(--color-text) !important;
          }

          /* Borders and cards: normalize slate/gray borders */
          [class*="border-slate-200"],
          [class*="border-gray-200"]{
            border-color:var(--color-border) !important;
          }

          /* Inputs: when they used colored focus rings from gradients, keep neutral or primary */
          input[type="text"], input[type="number"], select, textarea{
            background-color:#fff;
          }
          input:focus, select:focus, textarea:focus{
            outline:none;
            box-shadow:0 0 0 4px rgba(37, 99, 235, 0.15) !important; /* primary focus */
            border-color:var(--color-primary) !important;
          }

          /* Header background previously gradient page bg */
          .min-h-screen[class*="bg-gradient-to-"]{
            background: #f8fafc !important; /* slate-50 */
          }

          /* Keep info badges readable on white */
          [class*="text-blue-600"][class*="bg-clip-text"]{
            color:var(--color-text) !important;
          }
        `,
                }}
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
                <div className="space-y-8 p-4 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                            Create Test
                        </h1>
                        <p className="text-gray-600 text-lg font-medium">Design and configure your custom test papers</p>
                    </div>

                    {/* Test Configuration */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">Test Configuration</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                    <Target size={16} className="text-blue-500" />
                                    Paper Name*
                                </label>
                                <input
                                    type="text"
                                    value={testConfig.paperName}
                                    onChange={(e) => handleTestConfigChange("paperName", e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="Enter paper name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                    <BookOpen size={16} className="text-purple-500" />
                                    Paper Type*
                                </label>
                                <select
                                    value={paperType}
                                    onChange={(e) => handlePaperTypeChange(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                >
                                    <option value="">Select Paper Type</option>
                                    <option value="Full Portion Paper">Full Portion Paper</option>
                                    <option value="Subjectwise Paper">Subjectwise Paper</option>
                                    <option value="Groupwise / Revision Paper">Groupwise / Revision Paper</option>
                                    <option value="Chapterwise Paper">Chapterwise Paper</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                    <Award size={16} className="text-green-500" />
                                    Exam Type
                                </label>
                                <select
                                    value={testConfig.examType}
                                    onChange={(e) => handleTestConfigChange("examType", e.target.value as "jeemain" | "jeeadv" | "neet")}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                >
                                    <option value="jeemain">JEE Main</option>
                                    <option value="jeeadv">JEE Advanced</option>
                                    <option value="neet">NEET</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                    <Clock size={16} className="text-orange-500" />
                                    Total Time (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={testConfig.totalTime || ""}
                                    onChange={(e) => handleTestConfigChange("totalTime", Number(e.target.value))}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="180"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700">Correct Marks</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={testConfig.correctMarks || ""}
                                    onChange={(e) => handleTestConfigChange("correctMarks", Number(e.target.value))}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="4"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700">Wrong Marks</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={testConfig.wrongMarks || ""}
                                    onChange={(e) => handleTestConfigChange("wrongMarks", Number(e.target.value))}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                    placeholder="-1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-3 text-gray-700">Status</label>
                                <select
                                    value={testConfig.status}
                                    onChange={(e) => handleTestConfigChange("status", e.target.value as "active" | "inactive")}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                >
                                    <option value="inactive">Inactive</option>
                                    <option value="active">Active</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {selectedSubjects.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200 mt-6">
                            <h4 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-3">
                                <Shuffle size={20} className="text-blue-600" />
                                Question Selection Options
                            </h4>

                            {loading && (
                                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
                                        <span className="text-yellow-700 font-medium">Selecting questions...</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setRandomDialogOpen(true)}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <Shuffle size={20} />
                                    <div className="text-left">
                                        <div className="font-bold">Random Selection</div>
                                        <div className="text-sm opacity-90">Choose MCQ & Integer counts</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setDifficultyDialogOpen(true)}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    <Target size={20} />
                                    <div className="text-left">
                                        <div className="font-bold">Difficulty-Based</div>
                                        <div className="text-sm opacity-90">Select by difficulty %</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Exam Selection */}
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
                            Select Exam
                        </h2>
                        <select
                            value={selectedExam}
                            onChange={(e) => {
                                setSelectedExam(e.target.value)
                                setSelectedSubjects([])
                                setSelectedSubject("")
                                setSelectedChapter("")
                                setSelectedQuestions([])
                            }}
                            className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                        >
                            <option value="">Select an Exam</option>
                            {exams.map((exam: string, index: number) => (
                                <option key={index} value={exam}>
                                    {exam}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Paper Type Specific UI */}
                    {selectedExam && paperType && (
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                                {paperType} Configuration
                            </h2>

                            {/* Full Portion Paper */}
                            {paperType === "Full Portion Paper" && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-6 text-gray-700">Select Subjects</h3>
                                        <div className="space-y-6">
                                            {Object.keys(subjects || {}).map((subject: string) => (
                                                <div
                                                    key={subject}
                                                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                                >
                                                    {/* Subject Header */}
                                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSubjects.includes(subject)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedSubjects((prev) => [...prev, subject])
                                                                            //@ts-ignore
                                                                            setExpandedSubjects((prev) => new Set([...prev, subject]))
                                                                        } else {
                                                                            setSelectedSubjects((prev) => prev.filter((s) => s !== subject))
                                                                            setSubjectQuestionLimits((prev) => {
                                                                                const newLimits = { ...prev }
                                                                                delete newLimits[subject]
                                                                                return newLimits
                                                                            })
                                                                            setExpandedSubjects((prev) => {
                                                                                const newSet = new Set(prev)
                                                                                newSet.delete(subject)
                                                                                return newSet
                                                                            })
                                                                        }
                                                                    }}
                                                                    className="mr-3 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                                                                />
                                                                <span className="font-bold text-gray-800 text-lg">{subject}</span>
                                                            </label>
                                                            {selectedSubjects.includes(subject) && (
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="text-sm font-bold text-gray-700">Questions:</label>
                                                                        <input
                                                                            type="number"
                                                                            value={subjectQuestionLimits[subject] || ""}
                                                                            onChange={(e) =>
                                                                                handleSubjectQuestionLimitChange(subject, Number(e.target.value))
                                                                            }
                                                                            className="w-20 p-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleSubjectExpansion(subject)}
                                                                        className="p-2 hover:bg-white rounded-lg transition-all duration-200"
                                                                    >
                                                                        {expandedSubjects.has(subject) ? (
                                                                            <ChevronDown size={20} className="text-gray-600" />
                                                                        ) : (
                                                                            <ChevronRight size={20} className="text-gray-600" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Chapters - Collapsible */}
                                                    {selectedSubjects.includes(subject) && expandedSubjects.has(subject) && (
                                                        <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                                                            <ChapterGrid
                                                                chapters={subjects[subject] || []}
                                                                onChapterClick={(chapterName) => handleChapterClick(chapterName, subject)}
                                                                selectedSubject={subject}
                                                                searchTerm={searchTerm}
                                                                setSearchTerm={setSearchTerm}
                                                                showRandomButton={true}
                                                                randomLimit={chapterQuestionLimits[subject] || 0}
                                                                onRandomLimitChange={(limit) =>
                                                                    setChapterQuestionLimits((prev) => ({ ...prev, [subject]: limit }))
                                                                }
                                                                onRandomSelect={handleRandomChapterSelection}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Subjectwise Paper */}
                            {paperType === "Subjectwise Paper" && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700">Select Subject</label>
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) => {
                                                    setSelectedSubject(e.target.value)
                                                    setSelectedChapter("")
                                                    setSelectedQuestions([])
                                                    setSearchTerm("")
                                                }}
                                                className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                            >
                                                <option value="">Select Subject</option>
                                                {Object.keys(subjects || {}).map((subject: string) => (
                                                    <option key={subject} value={subject}>
                                                        {subject}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700">Total Questions*</label>
                                            <input
                                                type="number"
                                                value={questionLimit || ""}
                                                onChange={(e) => handleQuestionLimitChange(Number(e.target.value))}
                                                className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                                placeholder="Enter number of questions"
                                            />
                                        </div>
                                    </div>
                                    {selectedSubject && (
                                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                                            <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-3">
                                                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                                Chapters in {selectedSubject}
                                            </h3>
                                            <ChapterGrid
                                                chapters={subjects[selectedSubject] || []}
                                                onChapterClick={handleChapterClick}
                                                searchTerm={searchTerm}
                                                setSearchTerm={setSearchTerm}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Chapterwise Paper */}
                            {paperType === "Chapterwise Paper" && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700">Select Subject</label>
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) => {
                                                    setSelectedSubject(e.target.value)
                                                    setSelectedChapter("")
                                                    setSelectedQuestions([])
                                                    setSearchTerm("")
                                                }}
                                                className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                            >
                                                <option value="">Select Subject</option>
                                                {Object.keys(subjects || {}).map((subject: string) => (
                                                    <option key={subject} value={subject}>
                                                        {subject}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700">Select Chapter</label>
                                            <select
                                                value={selectedChapter}
                                                onChange={(e) => setSelectedChapter(e.target.value)}
                                                className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                                disabled={!selectedSubject}
                                            >
                                                <option value="">Select Chapter</option>
                                                {selectedSubject &&
                                                    subjects[selectedSubject]?.map((chapter, index) => (
                                                        <option key={chapter.chapter} value={chapter.chapter}>
                                                            #{index + 1} {chapter.chapter}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-3 text-gray-700">Total Questions*</label>
                                            <input
                                                type="number"
                                                value={questionLimit || ""}
                                                onChange={(e) => handleQuestionLimitChange(Number(e.target.value))}
                                                className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-gray-50 hover:bg-white"
                                                placeholder="Enter number of questions"
                                            />
                                        </div>
                                    </div>
                                    {selectedChapter && (
                                        <div className="animate-in slide-in-from-bottom-4 duration-500">
                                            <h3 className="text-xl font-bold mb-6 text-gray-700 flex items-center gap-3">
                                                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></div>
                                                Subtopics in {selectedChapter}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {subjects[selectedSubject]
                                                    ?.find((ch) => ch.chapter === selectedChapter)
                                                    ?.subtopics?.map((subtopic, index) => (
                                                        <div
                                                            key={index}
                                                            className="group flex items-center justify-between p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200">
                                                                    {index + 1}
                                                                </div>
                                                                <span className="font-bold text-gray-700 group-hover:text-gray-900">
                                  {subtopic.name}
                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentSubject(selectedSubject)
                                                                    setCurrentChapter(selectedChapter)
                                                                    handleSubtopicClick(subtopic.name)
                                                                }}
                                                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                                                title="View Questions"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Groupwise / Revision Paper */}
                            {paperType === "Groupwise / Revision Paper" && (
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-xl font-bold mb-6 text-gray-700">Select Subjects (Multiple allowed)</h3>
                                        <div className="space-y-6">
                                            {Object.keys(subjects || {}).map((subject: string) => (
                                                <div
                                                    key={subject}
                                                    className="border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                                >
                                                    {/* Subject Header */}
                                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <label className="flex items-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedSubjects.includes(subject)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedSubjects((prev) => [...prev, subject])
                                                                            //@ts-ignore
                                                                            setExpandedSubjects((prev) => new Set([...prev, subject]))
                                                                        } else {
                                                                            setSelectedSubjects((prev) => prev.filter((s) => s !== subject))
                                                                            setSubjectQuestionLimits((prev) => {
                                                                                const newLimits = { ...prev }
                                                                                delete newLimits[subject]
                                                                                return newLimits
                                                                            })
                                                                            setExpandedSubjects((prev) => {
                                                                                const newSet = new Set(prev)
                                                                                newSet.delete(subject)
                                                                                return newSet
                                                                            })
                                                                        }
                                                                    }}
                                                                    className="mr-3 w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                                                                />
                                                                <span className="font-bold text-gray-800 text-lg">{subject}</span>
                                                            </label>

                                                            {selectedSubjects.includes(subject) && (
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <label className="text-sm font-bold text-gray-700">Questions:</label>
                                                                        <input
                                                                            type="number"
                                                                            value={subjectQuestionLimits[subject] || ""}
                                                                            onChange={(e) =>
                                                                                handleSubjectQuestionLimitChange(subject, Number(e.target.value))
                                                                            }
                                                                            className="w-20 p-2 border-2 border-gray-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleSubjectExpansion(subject)}
                                                                        className="p-2 hover:bg-white rounded-lg transition-all duration-200"
                                                                    >
                                                                        {expandedSubjects.has(subject) ? (
                                                                            <ChevronDown size={20} className="text-gray-600" />
                                                                        ) : (
                                                                            <ChevronRight size={20} className="text-gray-600" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Chapters - Collapsible */}
                                                    {selectedSubjects.includes(subject) && expandedSubjects.has(subject) && (
                                                        <div className="p-6 animate-in slide-in-from-top-2 duration-300">
                                                            <ChapterGrid
                                                                chapters={subjects[subject] || []}
                                                                onChapterClick={(chapterName) => handleChapterClick(chapterName, subject)}
                                                                selectedSubject={subject}
                                                                searchTerm={searchTerm}
                                                                setSearchTerm={setSearchTerm}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selected Questions Summary */}
                    {selectedQuestions.length > 0 && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-3xl border-2 border-green-200 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                                    <Check className="text-white" size={24} />
                                </div>
                                <p className="text-green-800 font-bold text-2xl">{selectedQuestions.length} questions selected!</p>
                            </div>

                            <div className="text-sm text-green-700 grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-4 rounded-2xl shadow-md border border-green-200">
                                    <div className="font-bold text-lg text-blue-600">{testConfig.subjectWise.physics}</div>
                                    <div className="text-gray-600 font-medium">Physics Questions</div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-md border border-green-200">
                                    <div className="font-bold text-lg text-purple-600">{testConfig.subjectWise.chemistry}</div>
                                    <div className="text-gray-600 font-medium">Chemistry Questions</div>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-md border border-green-200">
                                    <div className="font-bold text-lg text-orange-600">{testConfig.subjectWise.mathematics}</div>
                                    <div className="text-gray-600 font-medium">Mathematics Questions</div>
                                </div>
                                {testConfig.examType === "neet" && (
                                    <div className="bg-white p-4 rounded-2xl shadow-md border border-green-200">
                                        <div className="font-bold text-lg text-green-600">{testConfig.subjectWise.biology}</div>
                                        <div className="text-gray-600 font-medium">Biology Questions</div>
                                    </div>
                                )}
                            </div>

                            {/* Question breakdown by subject/chapter */}
                            <div className="mb-8 space-y-3">
                                {Object.entries(
                                    selectedQuestions.reduce(
                                        (acc, q) => {
                                            const key = `${q.selectedSubject} > ${q.selectedChapter} > ${q.selectedSubtopic}`
                                            acc[key] = (acc[key] || 0) + 1
                                            return acc
                                        },
                                        {} as Record<string, number>,
                                    ),
                                ).map(([path, count]) => (
                                    <div
                                        key={path}
                                        className="text-xs text-green-700 bg-white px-4 py-3 rounded-2xl border border-green-200 shadow-sm font-medium"
                                    >
                                        <span className="font-bold">{path}:</span> {count} questions
                                    </div>
                                ))}
                            </div>

                            <div>
                                <button
                                    onClick={handleSaveTest}
                                    disabled={saving}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                                >
                                    {saving ? (
                                        <span className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </span>
                                    ) : (
                                        `Save Test (${selectedQuestions.length} questions)`
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RandomSelectDialog
                isOpen={randomDialogOpen}
                subjects={selectedSubjects}
                onClose={() => setRandomDialogOpen(false)}
                onSubmit={handleRandomSelection}
            />
            <DifficultySelectDialog
                isOpen={difficultyDialogOpen}
                subjects={selectedSubjects}
                onClose={() => setDifficultyDialogOpen(false)}
                onSubmit={handleDifficultySelection}
            />

            {/* Dialogs */}
            <SubtopicDialog
                isOpen={subtopicDialogOpen}
                onClose={() => setSubtopicDialogOpen(false)}
                subtopics={currentChapterSubtopics}
                onSubtopicClick={handleSubtopicClick}
                chapterName={currentChapter}
                subjectName={currentSubject}
                onRandomSelect={handleRandomSubtopicSelection}
                randomLimit={subtopicQuestionLimits[`${currentSubject}-${currentChapter}`] || 0}
                onRandomLimitChange={(limit) =>
                    setSubtopicQuestionLimits((prev) => ({
                        ...prev,
                        [`${currentSubject}-${currentChapter}`]: limit,
                    }))
                }
            />

            <QuestionsDialog
                isOpen={questionsDialogOpen}
                onClose={handleQuestionsDialogClose}
                questions={currentQuestions}
                selectedQuestions={selectedQuestionIds}
                onQuestionToggle={handleQuestionToggle}
                onRandomSelect={handleRandomSelect}
                questionLimit={
                    paperType === "Subjectwise Paper" || paperType === "Chapterwise Paper"
                        ? questionLimit
                        : subjectQuestionLimits[currentSubject] || 0
                }
                subtopicName={currentSubtopic}
                loading={questionsLoading}
            />
        </>
    )
}
