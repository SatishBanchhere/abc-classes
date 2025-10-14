export interface AnswerKeyStepProps {
    answerKey: AnswerKeyItem[]
    selectedTopic: string
    setAnswerKey: (key: AnswerKeyItem[]) => void
    setSelectedTopic: (key: string) => void
    onNext: () => void
}

export type Question = {
    question_no: number
    question_type: "mcq" | "integer"
    difficulty: "easy" | "medium" | "hard" | "Unknown"
    question_description: string
    option1: string | null
    option2: string | null
    option3: string | null
    option4: string | null
    correct_answer: string
    subtopic: string
}

export type Solution = {
    question_no: number
    solution: string
    answer: string
}

export type AnswerKeyItem = {
    question_no: number
    answer: string
    question_type: "mcq" | "integer"
}

export interface QuestionsStepProps {
    questions: Question[]
    setQuestions: (questions: Question[]) => void
    answerKey: AnswerKeyItem[]
    onNext: () => void
    onPrev: () => void
    subtopics:  {
        name: string
        totalQuestions?: number
    }[]
}

export interface SolutionsStepProps {
    solutions: Solution[]
    setSolutions: (solutions: Solution[]) => void
    questions: Question[]
    onNext: () => void
    onPrev: () => void
}