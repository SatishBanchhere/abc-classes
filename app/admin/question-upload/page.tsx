"use client"

import {useState} from "react"
import AnswerKeyStep from "@/components/AnswerKeyStep"
import QuestionsStep from "@/components/QuestionsStep"
import SolutionsStep from "@/components/SolutionsStep"
import FinalDisplay from "@/components/FinalDisplay"
import AddDataDialog from "@/components/AddDataDialog"
import {Question, Solution, AnswerKeyItem} from '@/types'
import { useExamSubjects } from '@/hooks/useExamSubjects'
import { useExamSubjectChapters } from '@/hooks/useExamSubjectChapters'
import {useExams} from "@/hooks/useExams"
import {Chapter} from "@/types/Chapter"
import { Plus } from "lucide-react"

export default function Home({examData}:any) {
    console.log("Received exam data:", examData)
    const [currentStep, setCurrentStep] = useState(1)
    const [answerKey, setAnswerKey] = useState<AnswerKeyItem[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [solutions, setSolutions] = useState<Solution[]>([])
    const [selectedTopic, setSelectedTopic] = useState<string>("")
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)

    const [selectedExam, setSelectedExam] = useState<string>("")
    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedChapter, setSelectedChapter] = useState<string>("")
    const [subtopics, setSubtopics] = useState<string[]>([])

    const { exams, loading: examsLoading, error: examsError, refetch: refetchExams } = useExams()
    const { subjects, loading: subjectsLoading, error: subjectsError, refetch: refetchSubjects } = useExamSubjects(selectedExam)
    const { data, loading: chaptersLoading, error: chaptersError, refetch: refetchChapters } = useExamSubjectChapters(selectedExam, selectedSubject)

    const steps = [
        {number: 1, title: "Answer Key Extraction", description: "Extract answer key from HTML content"},
        {number: 2, title: "Question Processing", description: "Process questions in batches (up to 10)"},
        {number: 3, title: "Solution Processing", description: "Process solutions in batches"},
        {number: 4, title: "Review & Export", description: "Review data and export results"},
    ]

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    const handleDataAdded = () => {
        // Refresh the appropriate data based on what was added
        refetchExams()
        if (selectedExam) refetchSubjects()
        if (selectedExam && selectedSubject) refetchChapters()
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Dropdowns Section */}
                <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Select Exam Configuration
                        </h2>
                        <button
                            onClick={() => setIsAddDialogOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                        >
                            <Plus size={20} />
                            Add New Data
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Exam Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Exam
                            </label>
                            <select
                                value={selectedExam}
                                onChange={(e)=>{
                                    setSelectedExam(e.target.value)
                                    setSelectedSubject("")
                                    setSelectedChapter("")
                                    setSubtopics([])
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white text-gray-900"
                            >
                                <option value="">Select an Exam</option>
                                {exams.map((exam: string, index: number) => (
                                    <option key={index} value={exam}>
                                        {exam}
                                    </option>
                                ))}
                            </select>
                            {examsLoading && <p className="text-sm text-blue-600">Loading exams...</p>}
                            {examsError && <p className="text-sm text-red-600">Error loading exams</p>}
                        </div>

                        {/* Subject Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Subject
                            </label>
                            <select
                                disabled={selectedExam === "" || subjectsLoading}
                                value={selectedSubject}
                                onChange={(e)=> {
                                    setSelectedSubject(e.target.value)
                                    setSelectedChapter("")
                                    setSubtopics([])
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a Subject</option>
                                {Object.keys(subjects || {}).map((subject: string, index: number) => (
                                    <option key={index} value={subject}>
                                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                    </option>
                                ))}
                            </select>
                            {subjectsLoading && <p className="text-sm text-blue-600">Loading subjects...</p>}
                            {subjectsError && <p className="text-sm text-red-600">Error loading subjects</p>}
                        </div>

                        {/* Chapter Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Select Chapter
                            </label>
                            <select
                                disabled={selectedExam === "" || selectedSubject === "" || chaptersLoading}
                                value={selectedChapter}
                                onChange={(e)=> {
                                    setSelectedChapter(e.target.value)
                                    data?.forEach((chapter: Chapter) => {
                                        if(chapter.chapter === e.target.value){
                                            setSubtopics(chapter.subtopics)
                                        }
                                    })
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a Chapter</option>
                                {subjects?.[selectedSubject]?.map((chapter: Chapter, index: number) => (
                                    <option key={index} value={chapter.chapter}>
                                        {chapter.chapter}
                                    </option>
                                ))}
                            </select>
                            {chaptersLoading && <p className="text-sm text-blue-600">Loading chapters...</p>}
                            {chaptersError && <p className="text-sm text-red-600">Error loading chapters</p>}
                        </div>
                    </div>

                    {/* Selected Configuration Summary */}
                    {(selectedExam || selectedSubject || selectedChapter) && (
                        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <h3 className="text-sm font-medium text-indigo-800 mb-2">Selected Configuration:</h3>
                            <div className="text-sm text-indigo-700 space-y-1">
                                {selectedExam && <p><span className="font-medium">Exam:</span> {selectedExam}</p>}
                                {selectedSubject && <p><span className="font-medium">Subject:</span> {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}</p>}
                                {selectedChapter && <p><span className="font-medium">Chapter:</span> {selectedChapter}</p>}
                                {subtopics.length > 0 && (
                                    <p><span className="font-medium">Available Subtopics:</span> {subtopics.length}</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Steps Components */}
                <AnswerKeyStep
                    answerKey={answerKey}
                    setAnswerKey={setAnswerKey}
                    onNext={nextStep}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                />

                <QuestionsStep
                    questions={questions}
                    setQuestions={setQuestions}
                    answerKey={answerKey}
                    onNext={nextStep}
                    onPrev={prevStep}
                    subtopics={subtopics}
                />

                <SolutionsStep
                    solutions={solutions}
                    setSolutions={setSolutions}
                    questions={questions}
                    onNext={nextStep}
                    onPrev={prevStep}
                />

                <FinalDisplay
                    questions={questions}
                    solutions={solutions}
                    answerKey={answerKey}
                    onPrev={prevStep}
                    setQuestions={setQuestions}
                    selectedTopic={selectedTopic}
                    setSelectedTopic={setSelectedTopic}
                    selectedExam={selectedExam}
                    selectedSubject={selectedSubject}
                    selectedChapter={selectedChapter}
                />

                {/* Add Data Dialog */}
                <AddDataDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onDataAdded={handleDataAdded}
                    availableExams={exams}
                    selectedExam={selectedExam}
                    selectedSubject={selectedSubject}
                    selectedChapter={selectedChapter}
                    subjects={subjects}
                />
            </div>
        </div>
    )
}
