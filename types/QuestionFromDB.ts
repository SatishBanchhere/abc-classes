import {Question} from "@/types/index";

export interface QuestionFromDB extends Question {
    __v: number
    _id: string // MongoDB document ID
    questionType: string
    questionDescription: string
    options: Record<string, string>
    solution?: string
    answer_key?: string
    subject: string
    subtopicName: string
    topicName: string
    createdAt?: any
    updatedAt?: any
}