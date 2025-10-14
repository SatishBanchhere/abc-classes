"use client"

import React, { useState, useMemo } from "react"
import { ChevronDown, BookOpen, Target, Users, List, Lock, Unlock, RefreshCw } from "lucide-react"
import { toast } from "react-toastify"

interface SubtopicData {
    name: string
}

interface ChapterData {
    name: string
    subtopics: SubtopicData[]
}

interface SubjectData {
    name: string
    chapters: ChapterData[]
}

interface ExamData {
    name: string
    subjects: SubjectData[]
}

interface ClientPageProps {
    examData: ExamData[]
}

interface LockStatus {
    lockedCount: number
    totalCount: number
    unlockedCount: number
}

export default function ClientPage({ examData }: ClientPageProps) {
    const [selectedExam, setSelectedExam] = useState<string>("")
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedChapter, setSelectedChapter] = useState<string>("")
    const [lockStatus, setLockStatus] = useState<LockStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [unlocking, setUnlocking] = useState(false)

    // Get available subjects based on selected exam
    const availableSubjects = useMemo(() => {
        if (!selectedExam) return []
        const exam = examData.find(e => e.name === selectedExam)
        return exam?.subjects || []
    }, [selectedExam, examData])

    // Get available chapters based on selected subject
    const availableChapters = useMemo(() => {
        if (!selectedSubject) return []
        const subject = availableSubjects.find(s => s.name === selectedSubject)
        return subject?.chapters || []
    }, [selectedSubject, availableSubjects])

    // Get subtopics based on selected chapter
    const subtopics = useMemo(() => {
        if (!selectedChapter) return []
        const chapter = availableChapters.find(c => c.name === selectedChapter)
        return chapter?.subtopics || []
    }, [selectedChapter, availableChapters])

    // Reset dependent selections when parent selection changes
    const handleExamChange = (examName: string) => {
        setSelectedExam(examName)
        setSelectedSubject("")
        setSelectedChapter("")
        setLockStatus(null)
    }

    const handleSubjectChange = (subjectName: string) => {
        setSelectedSubject(subjectName)
        setSelectedChapter("")
        setLockStatus(null)
    }

    const handleChapterChange = (chapterName: string) => {
        setSelectedChapter(chapterName)
        setLockStatus(null)
    }

    // Fetch lock status for selected exam, subject, and chapter
    const fetchLockStatus = async () => {
        if (!selectedExam || !selectedSubject || !selectedChapter) {
            toast.error("Please select exam, subject, and chapter first")
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/modification/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examType: selectedExam.toLowerCase().replace(/\s+/g, ''),
                    subjectId: selectedSubject,
                    topicName: selectedChapter,
                    action: 'count'
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch lock status')
            }

            const data = await response.json()
            setLockStatus({
                lockedCount: data.lockedCount,
                totalCount: data.totalCount,
                unlockedCount: data.unlockedCount
            })

            if (data.lockedCount === 0) {
                toast.info("All questions are already unlocked!")
            } else {
                toast.success(`Found ${data.lockedCount} locked questions out of ${data.totalCount} total`)
            }

        } catch (error: any) {
            console.error('Error fetching lock status:', error)
            toast.error(`Failed to fetch lock status: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Unlock questions
    const unlockQuestions = async () => {
        if (!selectedExam || !selectedSubject || !selectedChapter) {
            toast.error("Please select exam, subject, and chapter first")
            return
        }

        if (!lockStatus || lockStatus.lockedCount === 0) {
            toast.info("No locked questions to unlock")
            return
        }

        setUnlocking(true)
        try {
            const response = await fetch('/api/modification/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examType: selectedExam.toLowerCase().replace(/\s+/g, ''),
                    subjectId: selectedSubject,
                    topicName: selectedChapter,
                    lock: false,
                    action: 'update'
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to unlock questions')
            }

            const data = await response.json()

            // Refresh lock status
            await fetchLockStatus()

            toast.success(`Successfully unlocked ${data.modified} questions!`)

        } catch (error: any) {
            console.error('Error unlocking questions:', error)
            toast.error(`Failed to unlock questions: ${error.message}`)
        } finally {
            setUnlocking(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Question Unlock Manager
                    </h1>
                    <p className="text-gray-600 text-lg font-medium">
                        Check and unlock questions by exam, subject and chapter
                    </p>
                </div>

                {/* Dropdown Navigation */}
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                            <Target className="text-white" size={24} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800">Navigation</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Exam Selection */}
                        <div>
                            <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                <BookOpen size={16} className="text-blue-500" />
                                Select Exam
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedExam}
                                    onChange={(e) => handleExamChange(e.target.value)}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                                >
                                    <option value="">Choose an exam...</option>
                                    {examData.map((exam, index) => (
                                        <option key={index} value={exam.name}>
                                            {exam.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                            <div className="mt-2 text-sm text-gray-500 font-medium">
                                {examData.length} exams available
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div>
                            <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                <Users size={16} className="text-purple-500" />
                                Select Subject
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => handleSubjectChange(e.target.value)}
                                    disabled={!selectedExam}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {!selectedExam ? "Select exam first..." : "Choose a subject..."}
                                    </option>
                                    {availableSubjects.map((subject, index) => (
                                        <option key={index} value={subject.name}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                            <div className="mt-2 text-sm text-gray-500 font-medium">
                                {availableSubjects.length} subjects available
                            </div>
                        </div>

                        {/* Chapter Selection */}
                        <div>
                            <label className="block text-sm font-bold mb-3 text-gray-700 flex items-center gap-2">
                                <List size={16} className="text-green-500" />
                                Select Chapter
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedChapter}
                                    onChange={(e) => handleChapterChange(e.target.value)}
                                    disabled={!selectedSubject}
                                    className="w-full p-4 border-2 border-gray-200 rounded-2xl font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-gray-50 hover:bg-white appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">
                                        {!selectedSubject ? "Select subject first..." : "Choose a chapter..."}
                                    </option>
                                    {availableChapters.map((chapter, index) => (
                                        <option key={index} value={chapter.name}>
                                            #{index + 1} {chapter.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                            </div>
                            <div className="mt-2 text-sm text-gray-500 font-medium">
                                {availableChapters.length} chapters available
                            </div>
                        </div>
                    </div>
                </div>

                {/* Breadcrumb */}
                {(selectedExam || selectedSubject || selectedChapter) && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <span className="px-3 py-1 bg-blue-100 rounded-full text-blue-700">
                                {selectedExam || "No Exam"}
                            </span>
                            {selectedSubject && (
                                <>
                                    <span className="text-gray-400">→</span>
                                    <span className="px-3 py-1 bg-purple-100 rounded-full text-purple-700">
                                        {selectedSubject}
                                    </span>
                                </>
                            )}
                            {selectedChapter && (
                                <>
                                    <span className="text-gray-400">→</span>
                                    <span className="px-3 py-1 bg-green-100 rounded-full text-green-700">
                                        {selectedChapter}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Lock Status and Actions */}
                {selectedChapter && (
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-lg">
                                <Lock className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">Question Lock Status</h2>
                                <p className="text-gray-600 font-medium">
                                    Check and unlock questions for {selectedChapter}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={fetchLockStatus}
                                disabled={loading}
                                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold"
                            >
                                <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
                                {loading ? "Checking..." : "Check Lock Status"}
                            </button>

                            {lockStatus && lockStatus.lockedCount > 0 && (
                                <button
                                    onClick={unlockQuestions}
                                    disabled={unlocking}
                                    className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold"
                                >
                                    <Unlock className={unlocking ? "animate-pulse" : ""} size={20} />
                                    {unlocking ? "Unlocking..." : `Unlock ${lockStatus.lockedCount} Questions`}
                                </button>
                            )}
                        </div>

                        {/* Lock Status Display */}
                        {lockStatus && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                                    <div className="text-3xl font-bold text-blue-600 mb-2">
                                        {lockStatus.totalCount}
                                    </div>
                                    <div className="text-gray-700 font-medium">Total Questions</div>
                                </div>

                                <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
                                    <div className="text-3xl font-bold text-red-600 mb-2 flex items-center gap-2">
                                        <Lock size={24} />
                                        {lockStatus.lockedCount}
                                    </div>
                                    <div className="text-gray-700 font-medium">Locked Questions</div>
                                </div>

                                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                                    <div className="text-3xl font-bold text-green-600 mb-2 flex items-center gap-2">
                                        <Unlock size={24} />
                                        {lockStatus.unlockedCount}
                                    </div>
                                    <div className="text-gray-700 font-medium">Unlocked Questions</div>
                                </div>
                            </div>
                        )}

                        {/* Status Messages */}
                        {lockStatus && lockStatus.lockedCount === 0 && (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                                <div className="flex items-center gap-3 text-green-700">
                                    <Unlock size={24} />
                                    <div>
                                        <div className="font-bold text-lg">All Questions Unlocked!</div>
                                        <div className="text-sm">All {lockStatus.totalCount} questions in this chapter are already unlocked.</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Help Text */}
                {!selectedExam && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-200">
                        <div className="text-center">
                            <div className="text-amber-600 mb-4">
                                <Target size={48} className="mx-auto" />
                            </div>
                            <h3 className="text-xl font-bold text-amber-800 mb-2">
                                Get Started
                            </h3>
                            <p className="text-amber-700 font-medium">
                                Select an exam, subject, and chapter to check the lock status of questions.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
