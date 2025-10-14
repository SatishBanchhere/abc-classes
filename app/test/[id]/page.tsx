"use client"
import type React from "react"
import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {
    Flag,
    HelpCircle,
    Sparkles,
    Timer,
    BookOpen,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Shield,
    User as UserIcon,
    Calculator,
    Lock,
    AlertTriangle,
    RefreshCw,
    Phone,
    Mail
} from "lucide-react"
import {AlertCircle, CheckCircle, Clock} from 'lucide-react'
import "katex/dist/katex.min.css"
import {serverTimestamp, doc, setDoc, getDoc} from "firebase/firestore"
import {auth, db} from "@/lib/firebase"
import {useTest} from "./TestContext"
import {onAuthStateChanged, User} from "firebase/auth"
import {useRouter} from "next/navigation"
import {TestData, TestQuestion, TestSubmission} from "@/lib/data-fetcher";
import { QuestionFromDB } from "@/types/QuestionFromDB"

type QuestionStatus = "not-visited" | "not-answered" | "answered" | "marked-review" | "answered-marked-review"

const TestPage: React.FC = () => {
    const {data, testId} = useTest()
    const [testData, setTestData] = useState<TestData | null>(data)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [currentSubject, setCurrentSubject] = useState<string>("physics")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1)
    const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({})
    const [integerAnswers, setIntegerAnswers] = useState<Record<number, string>>({})
    const [questionStatus, setQuestionStatus] = useState<Record<number, QuestionStatus>>({})
    const [timeLeft, setTimeLeft] = useState<number>(0)
    const [showInstructions, setShowInstructions] = useState<boolean>(true)
    const [submitting, setSubmitting] = useState(false)
    const [userId, setUserId] = useState<string>("")
    const [expandedSolution, setExpandedSolution] = useState<boolean>(false)
    const [testResults, setTestResults] = useState<{
        score: number
        correct: number
        incorrect: number
        attempted: number
        total: number
        unanswered: number
        percentage: number
        timeSpent: string
    } | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [isVerified, setIsVerified] = useState<boolean | null>(null)
    const [timerStarted, setTimerStarted] = useState<boolean>(false)
    const [showFullscreenWarning, setShowFullscreenWarning] = useState<boolean>(false)
    const [fullscreenBreachCount, setFullscreenBreachCount] = useState<number>(0)
    const [studentName, setStudentName] = useState<string>("Test Taker");
    const router = useRouter()
    const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState<boolean | null>(null)



    // Organize questions by subject
    const [organizedQuestions, setOrganizedQuestions] = useState<{
        physics: TestQuestion[]
        chemistry: TestQuestion[]
        mathematics: TestQuestion[]
        biology: TestQuestion[]
    }>({physics: [], chemistry: [], mathematics: [], biology: []})


    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser)
        if (currentUser) {
            setUserId(currentUser.uid)
            try {
                // Check student data
                const studentDocRef = doc(db, "students", currentUser.uid)
                const studentDoc = await getDoc(studentDocRef)
                console.log(currentUser.uid)
                
                if (studentDoc.exists()) {
                    const studentData = studentDoc.data()
                    console.log({studentData})
                    setStudentName(studentData.name)
                    setIsVerified(studentData.isVerified || false)
                } else {
                    setIsVerified(false)
                }

                // Check if user has already submitted this test
                const userTestHistoryRef = doc(db, "students", currentUser.uid, "testHistory", testId)
                const userTestHistoryDoc = await getDoc(userTestHistoryRef)
                
                if (userTestHistoryDoc.exists()) {
                    console.log("User has already submitted this test")
                    setHasAlreadySubmitted(true)
                } else {
                    console.log("User has not submitted this test yet")
                    setHasAlreadySubmitted(false)
                }
                
            } catch (error) {
                console.error("Error fetching user data:", error)
                setIsVerified(false)
                setHasAlreadySubmitted(false)
            }
        } else {
            setIsVerified(null)
            setHasAlreadySubmitted(null)
        }
        setLoading(false)
    })

    return () => unsubscribe()
}, [testId]) // Add testId as dependency

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                setUserId(currentUser.uid)
                try {
                    const studentDocRef = doc(db, "students", currentUser.uid)
                    const studentDoc = await getDoc(studentDocRef)
                    console.log(currentUser.uid)
                    if (studentDoc.exists()) {
                        const studentData = studentDoc.data()
                        console.log({studentData})
                        setStudentName(studentData.name);
                        setIsVerified(studentData.isVerified || false)
                    } else {
                        setIsVerified(false)
                    }
                } catch (error) {
                    console.error("Error fetching student data:", error)
                    setIsVerified(false)
                }
            } else {
                setIsVerified(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Initialize test data when component mounts
    useEffect(() => {
        if (data && data.questions) {
            setTestData(data)
            // Don't start timer here - wait for user to agree to instructions
            setTimeLeft(data.testConfig.totalTime * 60)

            // Organize questions by subject
            const organized = {
                physics: [] as TestQuestion[],
                chemistry: [] as TestQuestion[],
                mathematics: [] as TestQuestion[],
                biology: [] as TestQuestion[]
            }

            let questionIndex = 1
            data.questions.forEach((question:TestQuestion) => {
                // Add a sequential question number for display
                question.displayIndex = questionIndex++

                const subject = question.selectedSubject!.toLowerCase()
                organized[subject as keyof typeof organized].push(question)
            })

            setOrganizedQuestions(organized)

            // Initialize question status
            const initialStatus: Record<number, QuestionStatus> = {}
            data.questions.forEach((question:TestQuestion, index:number) => {
                initialStatus[index] = "not-visited"
            })
            setQuestionStatus(initialStatus)

            // Set initial subject with questions
            const availableSubjects = Object.keys(organized).filter(
                (subject) => organized[subject as keyof typeof organized].length > 0
            )
            if (availableSubjects.length > 0) {
                setCurrentSubject(availableSubjects[0])
                setCurrentQuestionIndex(0)
            }
        }
    }, [data])

    // Enhanced fullscreen functions
    const enterFullscreen = async () => {
        try {
            const elem = document.documentElement

            // if (elem.requestFullscreen) {
            //     await elem.requestFullscreen()
            // } else if ((elem as any).webkitRequestFullscreen) { // Safari
            //     await (elem as any).webkitRequestFullscreen()
            // } else if ((elem as any).msRequestFullscreen) { // IE11
            //     await (elem as any).msRequestFullscreen()
            // } else if ((elem as any).mozRequestFullScreen) { // Firefox
            //     await (elem as any).mozRequestFullScreen()
            // }
        } catch (error) {
            console.warn('Fullscreen request failed:', error)
        }
    }

    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).webkitExitFullscreen) { // Safari
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).msExitFullscreen) { // IE11
                await (document as any).msExitFullscreen()
            } else if ((document as any).mozCancelFullScreen) { // Firefox
                await (document as any).mozCancelFullScreen()
            }
        } catch (error) {
            console.warn('Exit fullscreen failed:', error)
        }
    }

    const isInFullscreen = () => {
        return true;
        return !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).msFullscreenElement ||
            (document as any).mozFullScreenElement
        )
    }

    // Handle fullscreen change events
    // useEffect(() => {
    //     const handleFullscreenChange = () => {
    //         const isFullscreen = isInFullscreen()

    //         // If user exits fullscreen during test (not on instructions screen)
    //         if (!isFullscreen && !showInstructions && timerStarted && testData && !submitting && !showFullscreenWarning) {
    //             setShowFullscreenWarning(true)
    //             setFullscreenBreachCount(prev => prev + 1)
    //         }
    //     }

    //     document.addEventListener('fullscreenchange', handleFullscreenChange)
    //     document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    //     document.addEventListener('msfullscreenchange', handleFullscreenChange)
    //     document.addEventListener('mozfullscreenchange', handleFullscreenChange)

    //     return () => {
    //         document.removeEventListener('fullscreenchange', handleFullscreenChange)
    //         document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    //         document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    //         document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    //     }
    // }, [showInstructions, timerStarted, testData, submitting, showFullscreenWarning])

    // Handle fullscreen warning dismiss
    const handleFullscreenWarningDismiss = async () => {
        setShowFullscreenWarning(false)
        try {
            await enterFullscreen()
        } catch (error) {
            console.warn('Re-entering fullscreen failed:', error)
        }
    }

    // Enhanced timer countdown effect - only starts after agreeing to instructions
    useEffect(() => {
        if (!timerStarted) return

        if (timeLeft <= 0) {
            if (testData && userId && !testResults) {
                submitTest()
            }
            return
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1)
        }, 1000)

        return () => clearTimeout(timer)
    }, [timeLeft, testData, userId, testResults, timerStarted])

    // Update question status when visited
    useEffect(() => {
        const currentQuestion = getCurrentQuestion()
        if (currentQuestion) {
            const questionIndex = getQuestionGlobalIndex(currentQuestion)
            setQuestionStatus((prev) => {
                if (prev[questionIndex] === "not-visited") {
                    return {...prev, [questionIndex]: "not-answered"}
                }
                return prev
            })
        }
    }, [currentSubject, currentQuestionIndex])

    // Get global index for a question
    const getQuestionGlobalIndex = (question: TestQuestion): number => {
        if (!testData) return 0
        return testData.questions.findIndex(q => q._id === question._id)
    }


    // Format time as HH:MM:SS
    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // Get current question
    const getCurrentQuestion = (): TestQuestion | null => {
        if (!organizedQuestions[currentSubject as keyof typeof organizedQuestions]) {
            return null
        }
        const subjectQuestions = organizedQuestions[currentSubject as keyof typeof organizedQuestions]
        return subjectQuestions[currentQuestionIndex] || null
    }

    // Handle MCQ answer selection
    const handleMcqAnswerSelect = (question: TestQuestion, optionKey: string) => {
        const globalIndex = getQuestionGlobalIndex(question)
        const optionIndex = optionKey.charCodeAt(0) - "A".charCodeAt(0) + 1
        setMcqAnswers((prev) => {
            if (prev[globalIndex] === optionIndex) {
                return prev
            }
            return {...prev, [globalIndex]: optionIndex}
        })
        updateQuestionStatusToAnswered(globalIndex)
    }

    // Handle numerical answer input
    const handleIntegerAnswerInput = (question: TestQuestion, value: string) => {
        const globalIndex = getQuestionGlobalIndex(question)
        setIntegerAnswers((prev) => ({...prev, [globalIndex]: value}))
        if (value.trim()) {
            updateQuestionStatusToAnswered(globalIndex)
        } else {
            setQuestionStatus((prev) => {
                if (prev[globalIndex] === "answered-marked-review") {
                    return {...prev, [globalIndex]: "marked-review"}
                }
                return {...prev, [globalIndex]: "not-answered"}
            })
        }
    }

    // Helper to update question status to answered
    const updateQuestionStatusToAnswered = (globalIndex: number) => {
        setQuestionStatus((prev) => {
            if (prev[globalIndex] === "marked-review") {
                return {...prev, [globalIndex]: "answered-marked-review"}
            }
            return {...prev, [globalIndex]: "answered"}
        })
    }

    // Handle marking questions for review
    const handleMarkForReview = (globalIndex: number) => {
        setQuestionStatus((prev) => {
            if (prev[globalIndex] === "answered") {
                return {...prev, [globalIndex]: "answered-marked-review"}
            } else if (prev[globalIndex] === "not-answered") {
                return {...prev, [globalIndex]: "marked-review"}
            } else if (prev[globalIndex] === "marked-review") {
                return {...prev, [globalIndex]: "not-answered"}
            } else if (prev[globalIndex] === "answered-marked-review") {
                return {...prev, [globalIndex]: "answered"}
            }
            return prev
        })
    }

    // Clear responses for a question
    const handleClearResponse = (question: TestQuestion) => {
        const globalIndex = getQuestionGlobalIndex(question)
        if (question.questionType === "mcq") {
            setMcqAnswers((prev) => {
                const newAnswers = {...prev}
                delete newAnswers[globalIndex]
                return newAnswers
            })
        } else {
            setIntegerAnswers((prev) => {
                const newAnswers = {...prev}
                delete newAnswers[globalIndex]
                return newAnswers
            })
        }
        setQuestionStatus((prev) => {
            if (prev[globalIndex] === "answered-marked-review") {
                return {...prev, [globalIndex]: "marked-review"}
            }
            return {...prev, [globalIndex]: "not-answered"}
        })
    }

    // Navigation functions
    const goToNextQuestion = () => {
        const currentSubjectQuestions = organizedQuestions[currentSubject as keyof typeof organizedQuestions]
        if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else {
            const subjects = Object.keys(organizedQuestions).filter(
                (subject) => organizedQuestions[subject as keyof typeof organizedQuestions].length > 0
            )
            const currentSubjectIndex = subjects.indexOf(currentSubject)
            if (currentSubjectIndex < subjects.length - 1) {
                const nextSubject = subjects[currentSubjectIndex + 1]
                setCurrentSubject(nextSubject)
                setCurrentQuestionIndex(0)
            }
        }
    }

    const goToPrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        } else {
            const subjects = Object.keys(organizedQuestions).filter(
                (subject) => organizedQuestions[subject as keyof typeof organizedQuestions].length > 0
            )
            const currentSubjectIndex = subjects.indexOf(currentSubject)
            if (currentSubjectIndex > 0) {
                const prevSubject = subjects[currentSubjectIndex - 1]
                const prevSubjectQuestions = organizedQuestions[prevSubject as keyof typeof organizedQuestions]
                setCurrentSubject(prevSubject)
                setCurrentQuestionIndex(prevSubjectQuestions.length - 1)
            }
        }
    }

    const saveAndNext = () => {
        goToNextQuestion()
    }

    const saveAndMarkForReview = () => {
        const currentQuestion = getCurrentQuestion()
        if (currentQuestion) {
            handleMarkForReview(getQuestionGlobalIndex(currentQuestion))
        }
        goToNextQuestion()
    }

    // Helper functions
    const hasAnswer = (question: TestQuestion): boolean => {
        const globalIndex = getQuestionGlobalIndex(question)
        return mcqAnswers[globalIndex] !== undefined || !!integerAnswers[globalIndex]
    }

    const getStatusColorClass = (status: QuestionStatus): string => {
        switch (status) {
            case "not-visited":
                return "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
            case "not-answered":
                return "bg-red-50 border-red-400 text-red-700 hover:bg-red-100 shadow-md"
            case "answered":
                return "bg-green-50 border-green-400 text-green-700 hover:bg-green-100 shadow-md"
            case "marked-review":
                return "bg-purple-50 border-purple-400 text-purple-700 hover:bg-purple-100 shadow-md"
            case "answered-marked-review":
                return "bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100 shadow-md"
            default:
                return "bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm"
        }
    }

    const getTotalAnsweredCount = (): number => {
        return Object.keys(mcqAnswers).length + Object.keys(integerAnswers).length
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case "medium":
                return "bg-amber-50 text-amber-700 border-amber-200"
            case "hard":
                return "bg-rose-50 text-rose-700 border-rose-200"
            default:
                return "bg-slate-50 text-slate-700 border-slate-200"
        }
    }

    const calculateScore = () => {
        if (!testData) return {score: 0, correct: 0, incorrect: 0, attempted: 0, total: 0, unanswered: 0}
        let correct = 0
        let incorrect = 0
        let attempted = 0

        Object.entries(mcqAnswers).forEach(([globalIndexStr, selectedOption]) => {
            const globalIndex = Number(globalIndexStr)
            const question = testData.questions[globalIndex]
            if (question && question.correctAnswer) {
                attempted++
                const correctOption = question.correctAnswer.charCodeAt(0) - "A".charCodeAt(0) + 1
                if (selectedOption === correctOption) {
                    correct++
                } else {
                    incorrect++
                }
            }
        })

        Object.entries(integerAnswers).forEach(([globalIndexStr, answer]) => {
            const globalIndex = Number(globalIndexStr)
            const question = testData.questions[globalIndex]
            if (question && question.correctAnswer && answer.trim() !== "") {
                attempted++
                if (answer.trim() === question.correctAnswer.trim()) {
                    correct++
                } else {
                    incorrect++
                }
            }
        })

        const score = correct * testData.testConfig.correctMarks - incorrect * Math.abs(testData.testConfig.wrongMarks)
        const totalQuestions = testData.questions.length
        return {
            score,
            correct,
            incorrect,
            attempted,
            total: totalQuestions,
            unanswered: totalQuestions - attempted,
        }
    }

    // Enhanced agree to instructions handler
    const handleAgreeToInstructions = async () => {
        try {
            // Enter fullscreen first
            await enterFullscreen()

            // Small delay to ensure fullscreen is applied
            setTimeout(() => {
                setShowInstructions(false)
                setTimerStarted(true) // Start timer only after agreeing
            }, 300)

        } catch (error) {
            console.warn('Fullscreen failed, proceeding with test:', error)
            // Continue with test even if fullscreen fails
            setShowInstructions(false)
            setTimerStarted(true)
        }
    }

    // Submit test to Firebase
    const submitTest = async () => {
        if (!testData || !userId) return
        setSubmitting(true)
        try {
            const {score, correct, incorrect, attempted, total, unanswered} = calculateScore()
            const percentage = attempted > 0 ? Math.round((score / (total*testData.testConfig.correctMarks)) * 100) : 0
            const timeSpent = testData.testConfig.totalTime * 60 - timeLeft
            const submissionData: TestSubmission = {
                user_id: userId,
                test_id: testId,
                test_name: testData.testConfig.paperName,
                submitted_at: serverTimestamp(),
                score,
                correct_answers: correct,
                incorrect_answers: incorrect,
                unanswered_questions: unanswered,
                time_spent: timeSpent,
                percentage,
                total_questions: total,
                mcq_answers: mcqAnswers,
                integer_answers: integerAnswers,
                question_status: questionStatus,
                answered_questions: attempted,
            }

            const userTestRef = doc(db, "students", userId, "testHistory", testId)
            await setDoc(userTestRef, submissionData)
            const testSubmissionRef = doc(db, "tests", testId, "submissions", userId)
            await setDoc(testSubmissionRef, {
                ...submissionData,
                user_name: studentName
            })

            // Exit fullscreen before redirecting
            await exitFullscreen()
            router.push(`/testresult/${testId}`)
        } catch (err: any) {
            console.error("Error submitting test:", err)
            alert(`Failed to submit test: ${err instanceof Error ? err.message : "Unknown error"}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleSubmitTest = () => {
        if (confirm("Are you sure you want to submit the test? You won't be able to make changes after submission.")) {
            submitTest()
        }
    }

    // Exit fullscreen when component unmounts
    useEffect(() => {
        return () => {
            if (isInFullscreen()) {
                exitFullscreen()
            }
        }
    }, [])

    // Add this check after the loading state but before the verification check
    if (hasAlreadySubmitted === true) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative p-4">
                <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <CheckCircle2 className="h-8 sm:h-10 w-8 sm:w-10 text-blue-600"/>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800">Test Already Completed</h1>
                        <p className="text-slate-600">You have already submitted this test. You can view your results below.</p>
                    </div>

                    <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl mb-6 sm:mb-8 shadow-sm">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5"/>
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-2">Test Status: Completed</p>
                                <p>You can only take each test once. Click below to view your detailed results and analysis.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg font-semibold"
                            onClick={() => router.push(`/testresult/${testId}`)}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4"/>
                            View Test Results
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 hover:bg-slate-50 font-semibold"
                            onClick={() => router.push('/test-series')}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }


    // Fullscreen Warning Modal
    if (showFullscreenWarning) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div
                    className="bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-2 sm:mx-4 border border-red-200">
                    <div className="text-center mb-6">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600"/>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">
                            Fullscreen Mode Breached
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg">
                            You have exited fullscreen mode during the examination
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 sm:p-6 mb-6">
                        <div className="flex items-start">
                            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5"/>
                            <div className="text-sm text-red-700">
                                <p className="font-medium mb-2">Security Notice:</p>
                                <ul className="space-y-1">
                                    <li>• Fullscreen mode is required during examination</li>
                                    <li>• This breach has been recorded (Breach #{fullscreenBreachCount})</li>
                                    <li>• Multiple breaches may affect your test validity</li>
                                    <li>• Please avoid switching applications or tabs</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Button
                            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg font-semibold"
                            onClick={handleFullscreenWarningDismiss}
                        >
                            <Shield className="mr-2 h-5 w-5"/>
                            Return to Fullscreen & Continue
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Enhanced Results screen
    if (testResults) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center relative p-2 sm:p-0">
                {/* {renderWatermarks()} */}
                <div
                    className="bg-white/95 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-8 sm:mb-10">
                        <div
                            className="p-4 sm:p-6 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 mx-auto mb-4 sm:mb-6 w-fit shadow-lg">
                            <CheckCircle2 className="h-12 w-12 sm:h-16 sm:w-16 text-emerald-600"/>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">
                            Test Submitted Successfully
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg">Your examination has been completed and results have been
                            recorded</p>
                        <div className="mt-4 px-4 sm:px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <p className="text-emerald-700 font-medium">Results are now available for review</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        <div className="text-center p-4 sm:p-6 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">{testResults.correct}</div>
                            <div className="text-xs sm:text-sm text-emerald-700 font-medium">Correct Answers</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 bg-rose-50 rounded-2xl border border-rose-200 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-rose-600 mb-2">{testResults.incorrect}</div>
                            <div className="text-xs sm:text-sm text-rose-700 font-medium">Incorrect Answers</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">{testResults.score}</div>
                            <div className="text-xs sm:text-sm text-blue-700 font-medium">Total Score</div>
                        </div>
                        <div className="text-center p-4 sm:p-6 bg-violet-50 rounded-2xl border border-violet-200 shadow-sm">
                            <div className="text-2xl sm:text-3xl font-bold text-violet-600 mb-2">{testResults.percentage}%</div>
                            <div className="text-xs sm:text-sm text-violet-700 font-medium">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            className="bg-slate-800 hover:bg-slate-900 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg font-semibold"
                            onClick={() => router.push('/dashboard')}
                        >
                            View Detailed Results
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Enhanced loading state
    if (loading) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center relative p-4">
                {/* {renderWatermarks()} */}
                <div
                    className="text-center relative z-10 bg-white/80 backdrop-blur-lg p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl">
                    <div className="relative mb-6 sm:mb-8">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                            <BookOpen className="w-8 sm:w-10 h-8 sm:h-10 text-white animate-pulse"/>
                        </div>
                        <div
                            className="absolute inset-0 w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl animate-ping opacity-20"></div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold mb-4 text-slate-800">
                        Loading Examination Environment
                    </h1>
                    <p className="text-slate-600 mb-6">Please wait while we prepare your test interface...</p>
                    <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                             style={{animationDelay: '0.1s'}}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                             style={{animationDelay: '0.2s'}}></div>
                    </div>
                </div>
            </div>
        )
    }

    // Enhanced Account Verification screen
    if (!isVerified) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 flex items-center justify-center p-4 sm:p-6 relative">
                {/* {renderWatermarks()} */}
                <div
                    className="w-full max-w-2xl bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-200 relative z-10 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 sm:p-6">
                        <div className="flex items-center justify-center">
                            <div
                                className="w-16 sm:w-20 h-16 sm:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Shield className="w-8 sm:w-10 h-8 sm:h-10 text-white"/>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">Account Verification Required</h2>
                            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                                Your account needs verification to access our comprehensive examination platform and
                                educational resources.
                            </p>
                        </div>

                        {/* Verification Benefits */}
                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            <div
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
                                <div className="flex items-center mb-4">
                                    <div
                                        className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                                        <BookOpen className="w-5 sm:w-6 h-5 sm:h-6 text-white"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Examination Access</h3>
                                </div>
                                <ul className="text-sm text-slate-700 space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2"/>
                                        Full-length mock tests
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2"/>
                                        Chapter-wise practice tests
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2"/>
                                        Previous year papers
                                    </li>
                                </ul>
                            </div>

                            <div
                                className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 sm:p-6">
                                <div className="flex items-center mb-4">
                                    <div
                                        className="w-10 sm:w-12 h-10 sm:h-12 bg-emerald-500 rounded-xl flex items-center justify-center mr-4">
                                        <Calculator className="w-5 sm:w-6 h-5 sm:h-6 text-white"/>
                                    </div>
                                    <h3 className="font-semibold text-slate-800">Performance Analytics</h3>
                                </div>
                                <ul className="text-sm text-slate-700 space-y-2">
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/>
                                        Detailed score analysis
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/>
                                        Progress tracking
                                    </li>
                                    <li className="flex items-center">
                                        <CheckCircle className="w-4 h-4 text-emerald-500 mr-2"/>
                                        Comparative rankings
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div
                            className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-500 mr-3"/>
                                <h3 className="font-semibold text-slate-800">Need Verification?</h3>
                            </div>
                            <p className="text-slate-700 mb-4">Contact our support team to verify your account and
                                unlock full access.</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Phone className="w-4 h-4 text-slate-500 mr-2"/>
                                    <span className="text-slate-700">+91 98765 43210</span>
                                </div>
                                <div className="flex items-center">
                                    <Mail className="w-4 h-4 text-slate-500 mr-2"/>
                                    <span className="text-slate-700">support@kkmishraclasses.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <Button
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg font-semibold"
                                onClick={() => router.push('/contact')}
                            >
                                Contact Support for Verification
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }



    // Enhanced error state
    if (error) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center relative p-4">
                {/* {renderWatermarks()} */}
                <div
                    className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <XCircle className="h-8 sm:h-10 w-8 sm:w-10 text-red-600"/>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800">Unable to Load Test</h1>
                        <p className="text-slate-600">We encountered an issue while loading your examination</p>
                    </div>

                    <div
                        className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl text-red-700 mb-6 sm:mb-8 shadow-sm">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5"/>
                            <div className="text-sm">{error}</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 hover:bg-slate-50 font-semibold"
                            onClick={() => router.push('/dashboard')}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Test status checks
    if (!(testData?.testConfig.status === "active")) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center relative p-4">
                {/* {renderWatermarks()} */}
                <div
                    className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <Clock className="h-8 sm:h-10 w-8 sm:w-10 text-amber-600"/>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800">Test Not Available</h1>
                        <p className="text-slate-600">This examination has not been activated yet</p>
                    </div>

                    <div
                        className="p-4 sm:p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl mb-6 sm:mb-8 shadow-sm">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5"/>
                            <div className="text-sm text-amber-700">
                                <p className="font-medium mb-2">Test Status: Scheduled</p>
                                <p>Please check back later or contact your instructor for the test schedule.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white shadow-lg font-semibold"
                            onClick={() => window.location.reload()}
                        >
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Check Again
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 hover:bg-slate-50 font-semibold"
                            onClick={() => router.push('/test-series')}
                        >
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    if (!testData) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center relative p-4">
                {/* {renderWatermarks()} */}
                <div
                    className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 relative z-10">
                    <div className="text-center mb-6 sm:mb-8">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <AlertCircle className="h-8 sm:h-10 w-8 sm:w-10 text-purple-600"/>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-slate-800">Test Not Found</h1>
                        <p className="text-slate-600">The requested examination could not be located</p>
                    </div>

                    <div
                        className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl mb-6 sm:mb-8 shadow-sm">
                        <div className="flex items-start">
                            <AlertCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0 mt-0.5"/>
                            <div className="text-sm text-purple-700">
                                <p className="font-medium mb-2">Possible Reasons:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Test may have been removed</li>
                                    <li>Invalid test identifier</li>
                                    <li>Access permissions required</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg font-semibold"
                        onClick={() => router.push('/dashboard')}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    // Enhanced instructions screen with fullscreen and timer details
    if (showInstructions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
                {/* {renderWatermarks()} */}

                {/* Professional exam header */}
                <header className="bg-white border-b-2 border-blue-600 text-slate-800 px-2 sm:p-4 shadow-lg relative z-10">
                    <div className="flex flex-col gap-2 md:flex-row justify-between items-center max-w-7xl mx-auto">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="p-2 sm:p-3 bg-blue-600 rounded-xl shadow-lg">
                                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white"/>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg sm:text-xl text-blue-600">
                                    {testData.testConfig.paperName}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-600">Computer Based Examination</p>
                            </div>
                        </div>
                        <div className="flex flex-row flex-wrap gap-4 sm:gap-8 items-center mt-2 md:mt-0">
                            <div className="text-right">
                                <div className="text-xs text-slate-600">Candidate</div>
                                <div className="font-semibold flex items-center">
                                    <UserIcon className="w-4 h-4 mr-2"/>
                                    {studentName}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-600">Duration</div>
                                <div className="text-base sm:text-lg font-bold text-emerald-600 flex items-center">
                                    <Timer className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                                    {formatTime(timeLeft)}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div
                    className="max-w-6xl mx-auto my-6 sm:my-12 p-4 sm:p-8 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl relative z-10 border border-slate-200">
                    <div className="text-center mb-6 sm:mb-10">
                        <div
                            className="w-16 sm:w-20 h-16 sm:h-20 mx-auto bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                            <BookOpen className="h-8 sm:h-10 w-8 sm:w-10 text-blue-600"/>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                            Examination Instructions
                        </h1>
                        <p className="text-slate-600 text-base sm:text-lg">Please read all instructions carefully before starting
                            your test</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
                        {/* Test Configuration */}
                        <div
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <Calculator className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 mr-3"/>
                                <h3 className="font-bold text-slate-800">Test Configuration</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Duration:</span>
                                    <span
                                        className="font-semibold text-slate-800">{testData.testConfig.totalTime} minutes</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Total Questions:</span>
                                    <span className="font-semibold text-slate-800">{testData.questions.length}</span>
                                </div>
                                <div className="border-t border-blue-200 pt-3 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-700">Physics:</span>
                                        <span className="font-semibold">{testData.testConfig.subjectWise.physics}</span>
                                    </div>
                                    {testData.testConfig.subjectWise.chemistry !== 0 && (<div className="flex justify-between">
                                        <span className="text-slate-700">Chemistry:</span>
                                        <span
                                            className="font-semibold">{testData.testConfig.subjectWise.chemistry}</span>
                                    </div>)}
                                    {testData.testConfig.subjectWise.mathematics !== 0 && (<div className="flex justify-between">
                                        <span className="text-slate-700">Mathematics:</span>
                                        <span
                                            className="font-semibold">{testData.testConfig.subjectWise.mathematics}</span>
                                    </div>)}
                                </div>
                            </div>
                        </div>

                        {/* Marking Scheme */}
                        <div
                            className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <CheckCircle className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600 mr-3"/>
                                <h3 className="font-bold text-slate-800">Marking Scheme</h3>
                            </div>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Correct Answer:</span>
                                    <span
                                        className="font-semibold text-emerald-600">+{testData.testConfig.correctMarks}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Incorrect Answer:</span>
                                    <span
                                        className="font-semibold text-rose-600">{testData.testConfig.wrongMarks}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700">Unanswered:</span>
                                    <span className="font-semibold text-slate-600">0</span>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines */}
                        <div
                            className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600 mr-3"/>
                                <h3 className="font-bold text-slate-800">Important Guidelines</h3>
                            </div>
                            <ul className="text-sm text-slate-700 space-y-2">
                                <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0"/>
                                    Timer starts after agreement
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0"/>
                                    Navigate using question palette
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0"/>
                                    Mark questions for review
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0"/>
                                    Auto-submit on time expiry
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Enhanced fullscreen notice */}
                    <div
                        className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl shadow-sm">
                        <div className="flex items-center mb-4">
                            <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-purple-600 mr-3"/>
                            <h3 className="font-bold text-slate-800">Fullscreen Mode & Security</h3>
                        </div>
                        <ul className="text-sm text-slate-700 space-y-2">
                            <li className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0"/>
                                Test will automatically enter fullscreen mode for security
                            </li>
                            <li className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0"/>
                                Exiting fullscreen will trigger security warnings
                            </li>
                            <li className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0"/>
                                Multiple fullscreen breaches may be flagged
                            </li>
                            <li className="flex items-start">
                                <AlertTriangle className="w-4 h-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0"/>
                                Avoid switching tabs or applications during test
                            </li>
                        </ul>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl shadow-lg font-semibold text-base sm:text-lg"
                            onClick={handleAgreeToInstructions}
                        >
                            <CheckCircle2 className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6"/>
                            I Agree - Start Examination
                            {/* I Agree - Start Fullscreen Examination */}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const currentQuestion = getCurrentQuestion()
    if (!currentQuestion) return null

    // Main test interface with enhanced header showing timer status
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 relative">
            {/* {renderWatermarks()} */}

            {/* Professional exam header */}
            <header className="bg-white border-b-2 border-blue-600 text-slate-800 px-2 sm:p-3 shadow-lg relative z-10">
                <div className="flex flex-col gap-2 md:flex-row justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg">
                            <BookOpen className="h-6 w-6 text-white"/>
                        </div>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg text-blue-600">
                                {testData.testConfig.paperName}
                            </h1>
                            <p className="text-xs text-slate-600">Computer Based Examination</p>
                        </div>
                    </div>
                    <div className="flex flex-row flex-wrap gap-3 sm:gap-6 items-center mt-2 md:mt-0">
                        <div className="text-right">
                            <div className="text-xs text-slate-600">Candidate</div>
                            <div className="font-semibold text-xs sm:text-sm flex items-center">
                                <UserIcon className="w-3 h-3 mr-1"/>
                                {studentName}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-slate-600">Time Remaining</div>
                            <div className={`text-base sm:text-lg font-bold flex items-center ${
                                timeLeft < 600 ? 'text-red-600' : timeLeft < 1800 ? 'text-amber-600' : 'text-emerald-600'
                            }`}>
                                <Timer className="h-4 w-4 mr-2"/>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        {fullscreenBreachCount > 0 && (
                            <div className="text-right">
                                <div className="text-xs text-slate-600">Security Breaches</div>
                                <div className="text-sm font-bold text-red-600 flex items-center">
                                    <AlertTriangle className="h-3 w-3 mr-1"/>
                                    {fullscreenBreachCount}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-col md:flex-row relative z-10">
                {/* Enhanced Question Area */}
                <div className="flex flex-col md:flex-row relative z-10">
                    {/* Enhanced Question Palette */}
                    <div className="w-full md:w-80 bg-white/95 backdrop-blur-sm border-r border-slate-200 shadow-lg">
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="font-bold text-lg mb-4 text-slate-800 border-b border-slate-200 pb-3">
                                    Question Palette
                                </h3>

                                {/* Enhanced Legend */}
                                <div className="space-y-3 text-xs bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 bg-slate-50 border-2 border-slate-300 rounded-md shadow-sm"></div>
                                            <span className="text-slate-700 font-medium">Not Visited</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 bg-red-50 border-2 border-red-400 rounded-md shadow-sm"></div>
                                            <span className="text-slate-700 font-medium">Not Answered</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 bg-green-50 border-2 border-green-400 rounded-md shadow-sm"></div>
                                            <span className="text-slate-700 font-medium">Answered</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 bg-purple-50 border-2 border-purple-400 rounded-md shadow-sm"></div>
                                            <span className="text-slate-700 font-medium">Marked for Review</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-5 h-5 bg-blue-50 border-2 border-blue-400 rounded-md shadow-sm"></div>
                                            <span className="text-slate-700 font-medium">Answered & Marked</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced subject tabs */}
                            <Tabs defaultValue="physics" value={currentSubject} onValueChange={setCurrentSubject}>
                                <TabsList className="w-full grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl shadow-sm">
                                {Object.keys(organizedQuestions).map((subject) => {
                                    console.log("Organized Questions:", organizedQuestions[subject as keyof typeof organizedQuestions]);

                                    // Only render if there are questions
                                    if (organizedQuestions[subject as keyof typeof organizedQuestions].length > 0) {
                                        return (
                                            <TabsTrigger
                                                key={subject}
                                                value={subject}
                                                className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg py-2"
                                            >
                                                {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                            </TabsTrigger>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}

                                </TabsList>

                                {Object.entries(organizedQuestions).map(([subject, questions]) => (
                                    <TabsContent key={subject} value={subject} className="mt-6">
                                        <div className="grid grid-cols-5 gap-3">
                                            {questions.map((question, index) => {
                                                const globalIndex = getQuestionGlobalIndex(question)
                                                const isCurrentQuestion = currentSubject === subject && currentQuestionIndex === index

                                                return (
                                                    <button
                                                        key={question._id}
                                                        className={`w-12 h-12 text-sm font-bold border-2 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                                            isCurrentQuestion
                                                                ? 'ring-2 ring-blue-400 ring-offset-2 scale-105'
                                                                : ''
                                                        } ${getStatusColorClass(questionStatus[globalIndex] || "not-visited")}`}
                                                        onClick={() => {
                                                            setCurrentSubject(subject)
                                                            setCurrentQuestionIndex(index)
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </TabsContent>
                                ))}
                            </Tabs>

                            {/* Enhanced stats and submit section */}
                            <div className="mt-8 space-y-6">
                                <div
                                    className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                                    <h4 className="font-semibold text-slate-800 mb-3">Progress Summary</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-center">
                                            <div
                                                className="font-bold text-xl text-slate-800">{testData.questions.length}</div>
                                            <div className="text-slate-600">Total Questions</div>
                                        </div>
                                        <div className="text-center">
                                            <div
                                                className="font-bold text-xl text-emerald-600">{getTotalAnsweredCount()}</div>
                                            <div className="text-slate-600">Answered</div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-xl font-bold py-4 rounded-xl"
                                    onClick={handleSubmitTest}
                                    disabled={submitting || !userId}
                                >
                                    {submitting ? (
                                        <>
                                            <Timer className="mr-2 h-5 w-5 animate-spin"/>
                                            Submitting Test...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-5 w-5"/>
                                            Submit Final Answers
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Question Area */}
                    <div className="flex-1 p-6">
                        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-slate-200 rounded-2xl">
                            <CardContent className="p-8">
                                {/* Enhanced question header */}
                                <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-200">
                                    <div className="flex items-center space-x-4">
                                        <h3 className="text-2xl font-bold text-slate-800">
                                            Question {currentQuestionIndex + 1}
                                        </h3>
                                        <Badge
                                            className="bg-blue-100 text-blue-800 border border-blue-300 font-bold px-3 py-1">
                                            {currentQuestion.questionType === "mcq" ? "Multiple Choice" : "Numerical Answer"}
                                        </Badge>
                                        <Badge
                                            className={`border font-bold px-3 py-1 ${getDifficultyColor(currentQuestion.difficulty)}`}>
                                            {currentQuestion.difficulty?.toUpperCase() || "MEDIUM"}
                                        </Badge>
                                        <span
                                            className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-lg font-medium">
                                        {currentQuestion.subjectName}
                                    </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold px-4"
                                            onClick={() => handleMarkForReview(getQuestionGlobalIndex(currentQuestion))}
                                        >
                                            <Flag className="h-4 w-4 mr-2"/>
                                            {questionStatus[getQuestionGlobalIndex(currentQuestion)] === "marked-review" ||
                                            questionStatus[getQuestionGlobalIndex(currentQuestion)] === "answered-marked-review"
                                                ? "Unmark"
                                                : "Mark for Review"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-2 border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold px-4"
                                            onClick={() => setShowInstructions(true)}
                                        >
                                            <HelpCircle className="h-4 w-4 mr-2"/>
                                            Instructions
                                        </Button>
                                    </div>
                                </div>

                                {/* Enhanced question content */}
                                <div className="mb-10">
                                    <div
                                        className="mb-10 p-8 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 shadow-sm">
                                        <div className="flex gap-4 items-start">
                                            <strong className="text-blue-600 text-2xl flex-shrink-0 font-bold">
                                                Q{currentQuestionIndex + 1}.
                                            </strong>
                                            <div
                                                className="flex-1 text-slate-800 leading-relaxed text-lg"
                                                style={{
                                                    wordWrap: "break-word",
                                                    overflowWrap: "break-word",
                                                    maxWidth: "100%",
                                                }}
                                                dangerouslySetInnerHTML={{__html: currentQuestion.questionDescription}}
                                            />
                                        </div>
                                    </div>

                                    {/* Enhanced MCQ Options */}
                                    {currentQuestion.questionType === "mcq" && (
                                        <RadioGroup
                                            value={
                                                mcqAnswers[getQuestionGlobalIndex(currentQuestion)] !== undefined
                                                    ? String.fromCharCode(64 + mcqAnswers[getQuestionGlobalIndex(currentQuestion)])
                                                    : ""
                                            }
                                            onValueChange={(value) => handleMcqAnswerSelect(currentQuestion, value)}
                                            className="space-y-5"
                                        >
                                            {["A", "B", "C", "D"].map((optionKey) => {
                                                const optionContent = currentQuestion.options[optionKey as keyof typeof currentQuestion.options]
                                                if (!optionContent) return null

                                                const optionNumber = optionKey.charCodeAt(0) - "A".charCodeAt(0) + 1
                                                const isSelected = mcqAnswers[getQuestionGlobalIndex(currentQuestion)] === optionNumber

                                                return (
                                                    <div
                                                        key={optionKey}
                                                        className={`flex items-start space-x-5 rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md ${
                                                            isSelected
                                                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                                                : "border-slate-200 bg-white"
                                                        }`}
                                                        onClick={() => handleMcqAnswerSelect(currentQuestion, optionKey)}
                                                    >
                                                        <RadioGroupItem
                                                            value={optionKey}
                                                            id={`option-${optionKey}`}
                                                            className="mt-1 flex-shrink-0 w-5 h-5"
                                                        />
                                                        <Label
                                                            htmlFor={`option-${optionKey}`}
                                                            className="flex-1 cursor-pointer flex items-start"
                                                        >
                                                        <span
                                                            className="font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-xl text-base flex-shrink-0 min-w-[40px] text-center mr-5 border border-blue-200 shadow-sm">
                                                            {optionKey}
                                                        </span>
                                                            <div
                                                                className="flex-1 text-slate-800 leading-relaxed text-base"
                                                                style={{
                                                                    wordWrap: "break-word",
                                                                    overflowWrap: "break-word",
                                                                    maxWidth: "100%",
                                                                }}
                                                                dangerouslySetInnerHTML={{__html: optionContent}}
                                                            />
                                                        </Label>
                                                    </div>
                                                )
                                            })}
                                        </RadioGroup>
                                    )}

                                    {/* Enhanced Integer Input */}
                                    {currentQuestion.questionType === "integer" && (
                                        <div className="space-y-6">
                                            <div
                                                className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 p-8 shadow-sm">
                                                <Label htmlFor="integer-answer"
                                                       className="block mb-5 font-bold text-xl text-slate-800">
                                                    Enter your numerical answer:
                                                </Label>
                                                <Input
                                                    id="integer-answer"
                                                    type="number"
                                                    placeholder="Enter your numerical answer"
                                                    value={integerAnswers[getQuestionGlobalIndex(currentQuestion)] || ""}
                                                    onChange={(e) => handleIntegerAnswerInput(currentQuestion, e.target.value)}
                                                    className="w-full max-w-sm border-2 border-slate-300 focus:border-blue-500 text-xl p-5 rounded-xl shadow-sm font-mono"
                                                />
                                                <p className="text-sm text-slate-600 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-600"/>
                                                    Round off your answer to the nearest integer if required
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced Navigation Buttons */}
                                <div className="flex justify-between items-center pt-8 border-t border-slate-200">
                                    <div>
                                        <Button
                                            variant="outline"
                                            className="border-2 border-red-300 hover:bg-red-50 hover:border-red-400 text-red-700 font-semibold px-6 py-3"
                                            onClick={() => handleClearResponse(currentQuestion)}
                                            disabled={!hasAnswer(currentQuestion)}
                                        >
                                            <XCircle className="mr-2 h-5 w-5"/>
                                            Clear Response
                                        </Button>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="border-2 border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-8 py-3"
                                            onClick={goToPrevQuestion}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold px-6 py-3"
                                            onClick={saveAndMarkForReview}
                                        >
                                            <Flag className="mr-2 h-5 w-5"/>
                                            Mark & Next
                                        </Button>
                                        <Button
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg font-semibold px-8 py-3"
                                            onClick={saveAndNext}
                                        >
                                            <CheckCircle2 className="mr-2 h-5 w-5"/>
                                            Save & Next
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestPage
