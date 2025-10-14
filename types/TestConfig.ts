export interface TestConfig {
    branchName: string
    examType: "jeemain" | "jeeadv" | "neet"
    paperType: string
    paperName: string
    paperDate: string
    paperTime: string
    startFrom: number
    optionType: string
    status: "active" | "inactive"
    totalTime: number
    correctMarks: number
    wrongMarks: number
    subjectWise: {
        physics: number
        chemistry: number
        mathematics: number
        biology: number
    }
}