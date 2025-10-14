import { QuestionFromDB } from "./QuestionFromDB"
import { TestConfig } from "./TestConfig"

export interface Test {
    id: string
    createdAt: any
    questions: QuestionFromDB[]
    scoreReleased: boolean
    solutionsReleased: boolean
    started: boolean
    testConfig: TestConfig
    updatedAt: any
}