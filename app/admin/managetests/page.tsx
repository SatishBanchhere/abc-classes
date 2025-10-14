"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import {collection, getDocs, updateDoc, doc, Timestamp, getDoc} from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"
import {
    Play,
    Square,
    Trophy,
    TrophyIcon as TrophyOff,
    BookOpen,
    BookX,
    Clock,
    Users,
    FileText,
    Calendar,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    User,
    Timer,
    Target,
    Printer,
} from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteDoc } from "firebase/firestore"
import { Trash } from "lucide-react"
import type { TestConfig } from "@/types/TestConfig"
import { Test } from "@/types/Test"
// type Test = {
//     id: string
//     examType: string
//     correctMarks: number
//     wrongMarks: number
//     createdAt?: Timestamp
//     updatedAt?: Timestamp
//     started?: boolean
//     scoreReleased?: boolean
//     solutionsReleased?: boolean
//     subjectWise?: Record<string, number>
//     totalTime: number
//     testConfig: TestConfig
// }

type Submission = {
    id: string
    user_id: string
    user_name: string
    test_id: string
    test_name: string
    submitted_at: Timestamp
    score: number
    total_questions: number
    answered_questions: number
    correct_answers: number
    incorrect_answers: number
    unanswered_questions: number
    time_spent: number
    percentage: number
    question_status: Record<string, string>
}

export default function TestListPage() {
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())
    const [submissions, setSubmissions] = useState<Record<string, Submission[]>>({})
    const [loadingSubmissions, setLoadingSubmissions] = useState<Set<string>>(new Set())

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const snapshot = await getDocs(collection(db, "tests"))
                const data = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...(doc.data() as Omit<Test, 'id'>),
                }))
                console.log("Fetched tests:", data)
                setTests(data)
            } catch (error) {
                console.error("Error fetching tests:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTests()
    }, [])

    const fetchSubmissions = async (testId: string) => {
        if (submissions[testId] || loadingSubmissions.has(testId)) return

        setLoadingSubmissions(prev => new Set(prev).add(testId))

        try {
            const submissionsSnapshot = await getDocs(collection(db, `tests/${testId}/submissions`))
            const submissionData = submissionsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Submission, 'id'>),
            }))

            console.log(`Submissions for test ${testId}:`, submissionData)
            setSubmissions(prev => ({
                ...prev,
                [testId]: submissionData
            }))
        } catch (error) {
            console.error(`Error fetching submissions for test ${testId}:`, error)
            setSubmissions(prev => ({
                ...prev,
                [testId]: []
            }))
        } finally {
            setLoadingSubmissions(prev => {
                const newSet = new Set(prev)
                newSet.delete(testId)
                return newSet
            })
        }
    }

    const handleDeleteTest = async (testId: string) => {
        try {
            await deleteDoc(doc(db, "tests", testId))
            setTests(prev => prev.filter((t) => t.id !== testId))
            setExpandedTests(prev => {
                const newSet = new Set(prev)
                newSet.delete(testId)
                return newSet
            })
            setSubmissions((prev) => {
                const copy = { ...prev }
                delete copy[testId]
                return copy
            })
        } catch (error) {
            console.error("Error deleting test:", error)
            alert("Failed to delete test.")
        }
    }

    const toggleTestExpanded = async (testId: string) => {
        const newExpanded = new Set(expandedTests)
        if (expandedTests.has(testId)) {
            newExpanded.delete(testId)
        } else {
            newExpanded.add(testId)
            // Fetch submissions when expanding
            await fetchSubmissions(testId)
        }
        setExpandedTests(newExpanded)
    }

    const updateTest = async (id: string, updatedFields: Partial<Test>) => {
        try {
            const ref = doc(db, "tests", id)
            await updateDoc(ref, { ...updatedFields, updatedAt: Timestamp.now() })
            setTests((prev) => prev.map((test) => (test.id === id ? { ...test, ...updatedFields } : test)))
        } catch (error) {
            console.error("Error updating test:", error)
        }
    }

    const fetchQuestionsFromFirebase = async (testId: string) => {
        try {
            const testRef = doc(db, "tests", testId)
            const testSnap = await getDoc(testRef)

            if (!testSnap.exists()) {
                console.error(`No test found with ID: ${testId}`)
                return []
            }

            const testData = testSnap.data()
            const rawQuestions = testData.questions || [] // array of questions

            // 🔄 Transform into the format renderQuestionsHtml expects
            const questions = rawQuestions.map((q: any) => ({
                question_description: q.questionDescription || "",
                question_type: q.questionType || "mcq",
                difficulty: q.difficulty || "Medium",
                options: q.options || {},
                correct_answer: q.correctAnswer || "",
                answer_key: q.answerKey || "",
                subject_id: q.subjectId || "",
                subject_name: q.subjectName || "",
                topic_id: q.topicId || "",
                topic_name: q.topicName || "",
                subtopic_name: q.subtopicName || "",
                solution: q.solution || "",
                // keep extra fields if needed
            }))

            console.log(`Questions for test ${testId}:`, questions)
            return questions
        } catch (error) {
            console.error(`Error fetching questions for test ${testId}:`, error)
            return []
        }
    }


    // Updated print functions
    const printQuestionPaper = async (testId: string) => {
        try {
            // Find the test data from current state
            const test = tests.find(t => t.id === testId)
            if (!test) {
                console.error('Test not found')
                return
            }

            console.log('Fetching questions for test paper:', testId)

            // Fetch questions from Firebase
            const questions = await fetchQuestionsFromFirebase(testId)

            // Prepare complete test data for session storage
            const printData = {
                ...test,
                questions: questions,
                type: 'paper',
                // Add any additional test config data
                correctMarks: test.testConfig?.correctMarks || 4,
                wrongMarks: test.testConfig?.wrongMarks || -1,
                totalTime: test.testConfig?.totalTime || 180,
            }

            console.log('Storing test data in session storage:', printData)

            // Store in session storage with testId as key
            sessionStorage.setItem(testId, JSON.stringify(printData))

            // Open print window
            const url = `/print/test?id=${testId}&type=paper`
            window.open(url, '_blank')
        } catch (error) {
            console.error('Error preparing question paper:', error)
        }
    }

    const printPaper = async (testId: string, type: "questions" | "answer-key" | "solutions") => {
        try {
            // Find the test data from current state
            const test = tests.find(t => t.id === testId)
            if (!test) {
                console.error('Test not found')
                return
            }

            console.log('Fetching questions for test paper:', testId)

            // Fetch questions from Firebase
            const questions = await fetchQuestionsFromFirebase(testId)

            // Prepare complete test data for session storage
            const printData = {
                ...test,
                questions: questions,
                type: 'paper',
                // Add any additional test config data
                correctMarks: test.testConfig?.correctMarks || 4,
                wrongMarks: test.testConfig?.wrongMarks || -1,
                totalTime: test.testConfig?.totalTime || 180,
            }

            console.log('Storing test data in session storage:', printData)

            // Store in session storage with testId as key
            sessionStorage.setItem(testId, JSON.stringify(printData))

            // Open print window
            let url = `/print/test?id=${testId}&type=paper`

            if(type === "questions") {
                url = `/print/test?id=${testId}`
            }
            else if(type === "answer-key") {
                url = `/print/test/answer-key?id=${testId}`
            }
            else if(type === "solutions") {
                url = `/print/test/solutions?id=${testId}`
            }
            window.open(url, '_blank')
        } catch (error) {
            console.error('Error preparing question paper:', error)
        }
    }
    // const printAnswerKey = async (testId: string) => {
    //     try {
    //         const test = tests.find(t => t.id === testId)
    //         if (!test) {
    //             console.error('Test not found')
    //             return
    //         }

    //         console.log('Fetching questions for answer key:', testId)

    //         // Fetch questions from Firebase
    //         const questions = await fetchQuestionsFromFirebase(testId)

    //         // Prepare data with answer key flags
    //         const printData = {
    //             ...test,
    //             questions: questions.map(q => ({
    //                 ...q,
    //                 showAnswer: true,
    //                 showCorrectOption: true
    //             })),
    //             type: 'answer-key',
    //             correctMarks: test.testConfig?.correctMarks || test.correctMarks || 4,
    //             wrongMarks: test.testConfig?.wrongMarks || test.wrongMarks || -1,
    //             totalTime: test.testConfig?.totalTime || test.totalTime || 180,
    //         }

    //         console.log('Storing answer key data in session storage:', printData)

    //         // Store in session storage
    //         sessionStorage.setItem(testId, JSON.stringify(printData))

    //         // Open print window
    //         const url = `/print/test?id=${testId}&type=answer-key`
    //         window.open(url, '_blank')
    //     } catch (error) {
    //         console.error('Error preparing answer key:', error)
    //     }
    // }

    // const printSolutions = async (testId: string) => {
    //     try {
    //         const test = tests.find(t => t.id === testId)
    //         if (!test) {
    //             console.error('Test not found')
    //             return
    //         }

    //         console.log('Fetching questions for solutions:', testId)

    //         // Fetch questions from Firebase
    //         const questions = await fetchQuestionsFromFirebase(testId)

    //         // Prepare data with solutions flags
    //         const printData = {
    //             ...test,
    //             questions: questions.map(q => ({
    //                 ...q,
    //                 showAnswer: true,
    //                 showSolution: true,
    //                 showCorrectOption: true
    //             })),
    //             type: 'solutions',
    //             correctMarks: test.testConfig?.correctMarks || test.correctMarks || 4,
    //             wrongMarks: test.testConfig?.wrongMarks || test.wrongMarks || -1,
    //             totalTime: test.testConfig?.totalTime || test.totalTime || 180,
    //         }

    //         console.log('Storing solutions data in session storage:', printData)

    //         // Store in session storage
    //         sessionStorage.setItem(testId, JSON.stringify(printData))

    //         // Open print window
    //         const url = `/print/test?id=${testId}&type=solutions`
    //         window.open(url, '_blank')
    //     } catch (error) {
    //         console.error('Error preparing solutions:', error)
    //     }
    // }


    // Helper functions
    const getTotalQuestions = (test: Test) => {
        if (test.testConfig?.subjectWise) {
            return Object.values(test.testConfig.subjectWise).reduce((total, count) => total + count, 0)
        }
        // if (test.subjectWise) {
        //     return Object.values(test.subjectWise).reduce((total, count) => total + count, 0)
        // }
        return 0
    }

    const getTotalMarks = (test: Test) => {
        const totalQuestions = getTotalQuestions(test)
        return totalQuestions * (test.testConfig?.correctMarks || 4)
    }

    const formatTimeMin = (totalMinutes: number) => {
        if (totalMinutes >= 60) {
            const hours = Math.floor(totalMinutes / 60)
            const mins = totalMinutes % 60
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
        }
        return `${totalMinutes}m`
    }


    const formatTimeSec = (seconds: number) => {
        if (seconds >= 3600) {
            const hours = Math.floor(seconds / 3600)
            const mins = Math.floor((seconds % 3600) / 60)
            const secs = seconds % 60
            return secs > 0
            ? `${hours}h ${mins}m ${secs}s`
            : mins > 0
            ? `${hours}h ${mins}m`
            : `${hours}h`
        } else if (seconds >= 60) {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
        }
        return `${seconds}s`
    }


    const getStatusBadge = (test: Test) => {
        const isActive = test.started === true || test.testConfig.status === "active"

        if (!isActive) {
            return <Badge variant="secondary">Not Started</Badge>
        }
        if (test.solutionsReleased) {
            return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Solutions Released</Badge>
        }
        if (test.scoreReleased) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Scores Released</Badge>
        }
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Active</Badge>
    }

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Management</h1>
                <p className="text-gray-600">Manage and monitor all tests in the system</p>
            </div>

            <div className="grid gap-6">
                {tests.map((test) => {
                    const totalQuestions = getTotalQuestions(test)
                    const totalMarks = getTotalMarks(test)
                    const totalTime = test.testConfig?.totalTime
                    const paperName = test.testConfig?.paperName || test.testConfig?.branchName || `Test ${test.id.slice(0, 8)}`
                    const examType = test.testConfig?.examType
                    const isActive = test.started === true || test.testConfig.status === "active"
                    const isExpanded = expandedTests.has(test.id)
                    const testSubmissions = submissions[test.id] || []

                    return (
                        <Card key={test.id} className="hover:shadow-lg transition-shadow duration-200">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <CardTitle className="text-2xl text-gray-900">{paperName}</CardTitle>
                                            <Badge className="bg-slate-100 text-slate-700">
                                                {examType?.toUpperCase() || 'TEST'}
                                            </Badge>
                                            <Link href={`/test/${test.id}`} passHref legacyBehavior>
                                                <a target="_blank" rel="noopener noreferrer">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        View Test
                                                    </Button>
                                                </a>
                                            </Link>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatTimeMin(totalTime)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {totalQuestions} Questions
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Trophy className="w-4 h-4" />
                                                {totalMarks} Marks
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Target className="w-4 h-4" />
                                                +{test.testConfig?.correctMarks || 4}
                                                {(test.testConfig.wrongMarks || 0) < 0 ? `, ${test.testConfig.wrongMarks}` : ""}
                                            </span>
                                        </div>

                                        {(test.testConfig?.subjectWise) && (
                                            <div className="pt-2 border-t border-slate-100">
                                                <p className="text-xs text-slate-500 mb-2">Subject Distribution:</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    {Object.entries(test.testConfig?.subjectWise || {}).map(([subject, count]) => (
                                                        <Badge key={subject} variant="outline" className="text-xs capitalize">
                                                            {subject}: {count}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(test)}
                                        <Collapsible>
                                            <CollapsibleTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleTestExpanded(test.id)}
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Users className="w-4 h-4 mr-1" />
                                                    Students
                                                    {isExpanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </Collapsible>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <Collapsible open={isExpanded} onOpenChange={() => toggleTestExpanded(test.id)}>
                                    <CollapsibleContent className="space-y-4">
                                        {/* Student Submissions */}
                                        <div className="border-t pt-4">
                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Student Submissions ({testSubmissions.length})
                                            </h4>

                                            {loadingSubmissions.has(test.id) ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p className="text-sm text-gray-500 mt-2">Loading submissions...</p>
                                                </div>
                                            ) : testSubmissions.length > 0 ? (
                                                <div className="grid gap-3 max-h-60 overflow-y-auto">
                                                    {testSubmissions.map((submission) => (
                                                        <Card key={submission.id} className="border border-gray-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <User className="w-4 h-4 text-gray-500" />
                                                                            <span className="font-medium text-gray-900">
                                                                                {submission.user_name || 'Anonymous User'}
                                                                            </span>
                                                                            <Badge variant="outline" className="text-xs">
                                                                                ID: {submission.user_id}
                                                                            </Badge>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                                            <span>Score: {submission.score || 0}</span>
                                                                            <span>Correct: {submission.correct_answers || 0}</span>
                                                                            <span>Wrong: {submission.incorrect_answers || 0}</span>
                                                                            <span>Percentage: {submission.percentage || 0}%</span>
                                                                        </div>

                                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                                            <span>Answered: {submission.answered_questions || 0}</span>
                                                                            <span>Unanswered: {submission.unanswered_questions || 0}</span>
                                                                            <span className="flex items-center gap-1">
                                                                                <Timer className="w-3 h-3" />
                                                                                {formatTimeSec(submission.time_spent || 0)}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <div className="text-right">
                                                                        <p className="text-xs text-gray-500">
                                                                            {submission.submitted_at?.toDate().toLocaleDateString()}
                                                                        </p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {submission.submitted_at?.toDate().toLocaleTimeString()}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p>No submissions yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-end pt-4 border-t">
                                    <div className="space-y-1 text-sm text-gray-500">
                                        <p className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            Created: {test.createdAt?.toDate().toLocaleDateString() || 'Unknown'}
                                        </p>
                                        {test.testConfig?.paperDate && <p>Paper Date: {test.testConfig.paperDate}</p>}
                                        {test.updatedAt && <p>Last updated: {test.updatedAt.toDate().toLocaleString()}</p>}
                                    </div>

                                    <div className="flex flex-col gap-3 items-end">


                                        {/* Print Buttons */}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => printPaper(test.id, "questions")}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Question Paper
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => printPaper(test.id, "answer-key")}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Answer Key
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => printPaper(test.id, "solutions")}
                                                className="flex items-center gap-1"
                                            >
                                                <Printer className="w-4 h-4" />
                                                Solutions
                                            </Button>
                                        </div>

                                        <div className="flex gap-2">
                                            {!isActive ? (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Start Test
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Start Test</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to start "{paperName}"? Students will be able to access this test once started.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                updateTest(test.id, {
                                                                    testConfig: {
                                                                    ...test.testConfig, // keep existing fields
                                                                    status: "active",   // update only status
                                                                    },
                                                                })
                                                                }
                                                                className="bg-blue-600 hover:bg-blue-700"
                                                            >
                                                                Start Test
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            ) : (
                                                <>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                                                            >
                                                                <Square className="w-4 h-4 mr-2" />
                                                                Reset Test
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Reset Test</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will reset the test to "Not Started" state and revoke all releases. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        updateTest(test.id, {
                                                                            started: false,
                                                                            scoreReleased: false,
                                                                            solutionsReleased: false,
                                                                            testConfig: {
                                                                                ...test.testConfig, // keep existing fields
                                                                                status: "inactive",   // update only status
                                                                            },
                                                                        })
                                                                    }
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Reset Test
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {test.scoreReleased ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                                                                >
                                                                    <TrophyOff className="w-4 h-4 mr-2" />
                                                                    Unrelease Score
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Unrelease Scores</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Students will no longer be able to view their scores. Are you sure?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => updateTest(test.id, { scoreReleased: false })}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Unrelease Score
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            onClick={() => updateTest(test.id, { scoreReleased: true })}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Trophy className="w-4 h-4 mr-2" />
                                                            Release Score
                                                        </Button>
                                                    )}

                                                    {test.solutionsReleased ? (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                                                                >
                                                                    <BookX className="w-4 h-4 mr-2" />
                                                                    Unrelease Solutions
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Unrelease Solutions</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Students will no longer be able to view the solutions. Are you sure?
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => updateTest(test.id, { solutionsReleased: false })}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Unrelease Solutions
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    ) : (
                                                        <Button
                                                            onClick={() => updateTest(test.id, { solutionsReleased: true })}
                                                            className="bg-purple-600 hover:bg-purple-700"
                                                        >
                                                            <BookOpen className="w-4 h-4 mr-2" />
                                                            Release Solutions
                                                        </Button>
                                                    )}


                                                </>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-red-300 text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash className="w-4 h-4 mr-2" />
                                                        Delete Test
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Test</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to <b>permanently delete</b> the test "<b>{paperName}</b>"?
                                                            All associated data including questions and submissions will be lost. This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-600 hover:bg-red-700"
                                                            onClick={async () => {
                                                                await handleDeleteTest(test.id)
                                                            }}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {tests.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                        <p className="text-gray-500">Create your first test to get started.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
