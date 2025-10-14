
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Key, BookOpen } from 'lucide-react'

export default function PaperPreview({ open, onClose, paper }) {
    if (!paper) return null

    const downloadQuestionPaper = () => {
        // Implementation for downloading question paper PDF
        console.log('Downloading question paper...')
    }

    const downloadAnswerKey = () => {
        // Implementation for downloading answer key PDF
        console.log('Downloading answer key...')
    }

    const downloadSolutions = () => {
        // Implementation for downloading solutions PDF
        console.log('Downloading solutions...')
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Paper Generated Successfully! 🎉
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Paper Summary */}
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                        <h3 className="text-xl font-bold mb-4">{paper.config.paperName}</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{paper.totalQuestions}</div>
                                <div className="text-sm text-gray-600">Total Questions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{paper.config.duration}</div>
                                <div className="text-sm text-gray-600">Minutes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{paper.subjectName}</div>
                                <div className="text-sm text-gray-600">Subject</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{paper.examination}</div>
                                <div className="text-sm text-gray-600">Exam Type</div>
                            </div>
                        </div>
                    </div>

                    {/* Chapter-wise Breakdown */}
                    <div className="space-y-3">
                        <h4 className="font-semibold text-lg">Chapter-wise Question Distribution:</h4>
                        {paper.chapters.map((chapter) => (
                            <div key={chapter.id} className="bg-white p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-medium">{chapter.name}</h5>
                                    <Badge variant="secondary">{chapter.questionCount} questions</Badge>
                                </div>

                                {chapter.subtopics.length > 0 && (
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm text-gray-600">Subtopics:</p>
                                        {chapter.subtopics.map((subtopic) => (
                                            <div key={subtopic.id} className="flex justify-between text-sm">
                                                <span>{subtopic.name}</span>
                                                <span className="text-gray-500">{subtopic.questionCount} questions</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Download Options */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-semibold text-lg mb-4 text-center">Download Options</h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Button
                                onClick={downloadQuestionPaper}
                                className="flex items-center justify-center space-x-2 h-16"
                                variant="outline"
                            >
                                <FileText className="h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-medium">Question Paper</div>
                                    <div className="text-xs text-gray-500">Ready to print</div>
                                </div>
                            </Button>

                            <Button
                                onClick={downloadAnswerKey}
                                className="flex items-center justify-center space-x-2 h-16"
                                variant="outline"
                            >
                                <Key className="h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-medium">Answer Key</div>
                                    <div className="text-xs text-gray-500">All correct answers</div>
                                </div>
                            </Button>

                            <Button
                                onClick={downloadSolutions}
                                className="flex items-center justify-center space-x-2 h-16"
                                variant="outline"
                            >
                                <BookOpen className="h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-medium">Solutions</div>
                                    <div className="text-xs text-gray-500">Step-by-step</div>
                                </div>
                            </Button>
                        </div>
                    </div>

                    {/* Paper Details */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">Paper Information:</h5>
                        <div className="text-sm space-y-1">
                            <p><strong>Branch:</strong> {paper.branchName}</p>
                            <p><strong>Paper Type:</strong> {paper.paperType}</p>
                            <p><strong>Date:</strong> {paper.config.paperDate}</p>
                            <p><strong>Time:</strong> {paper.config.paperTime.hours}:{paper.config.paperTime.minutes} {paper.config.paperTime.period}</p>
                            <p><strong>Duration:</strong> {paper.config.duration} minutes</p>
                            <p><strong>Question Start From:</strong> {paper.config.questionStartFrom}</p>
                            <p><strong>Status:</strong> {paper.config.status}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
