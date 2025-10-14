import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SubtopicDialog({ open, onClose, chapter, onSave }) {
    const [subtopicSelections, setSubtopicSelections] = useState([])

    useEffect(() => {
        if (chapter && open) {
            setSubtopicSelections(
                chapter.subtopics.map(subtopic => ({
                    id: subtopic.id,
                    name: subtopic.name,
                    availableQuestions: subtopic.totalQuestions || 0,
                    questionCount: 0
                }))
            )
        }
    }, [chapter, open])

    const updateQuestionCount = (subtopicId, count) => {
        setSubtopicSelections(prev =>
            prev.map(sub =>
                sub.id === subtopicId
                    ? { ...sub, questionCount: Math.min(parseInt(count) || 0, sub.availableQuestions) }
                    : sub
            )
        )
    }

    const handleSave = () => {
        const validSelections = subtopicSelections.filter(sub => sub.questionCount > 0)
        onSave(validSelections)
    }

    const totalSelected = subtopicSelections.reduce((sum, sub) => sum + sub.questionCount, 0)

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        Select Questions from Subtopics
                    </DialogTitle>
                    <p className="text-gray-600">
                        Chapter: {chapter?.name}
                    </p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-900 font-medium">
                            Total Questions Selected: {totalSelected}
                        </p>
                    </div>

                    {subtopicSelections.map((subtopic) => (
                        <div key={subtopic.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                            <div className="flex-1">
                                <h4 className="font-medium">{subtopic.name}</h4>
                                <p className="text-sm text-gray-600">
                                    Available: {subtopic.availableQuestions} questions
                                </p>
                            </div>

                            <div className="w-32">
                                <Label className="text-xs">Questions</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max={subtopic.availableQuestions}
                                    value={subtopic.questionCount}
                                    onChange={(e) => updateQuestionCount(subtopic.id, e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={totalSelected === 0}>
                        Save Selection ({totalSelected} questions)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
