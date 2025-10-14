"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import {addNewExam, addNewsubject, addNewSubtopics, addNewChapters} from '@/utils/fetchDataFromJson'

interface AddDataDialogProps {
    isOpen: boolean
    onClose: () => void
    onDataAdded: () => void
    availableExams: string[]
    selectedExam?: string
    selectedSubject?: string
    selectedChapter?: string
    subjects?: any
}

type AddMode = 'exam' | 'subject' | 'chapter' | 'subtopics'

export default function AddDataDialog({
                                          isOpen,
                                          onClose,
                                          onDataAdded,
                                          availableExams,
                                          selectedExam,
                                          selectedSubject,
                                          selectedChapter,
                                          subjects
                                      }: AddDataDialogProps) {
    const [mode, setMode] = useState<AddMode>('exam')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Form states
    const [examName, setExamName] = useState('')
    const [subjectName, setSubjectName] = useState('')
    const [chapterNameList, setChapterNameList] = useState<[string, number][]>([['', 0]])
    const [subtopicsList, setSubtopicsList] = useState<[string, number][]>([['', 0]])
    const [selectedExamForAdd, setSelectedExamForAdd] = useState(selectedExam || '')
    const [selectedSubjectForAdd, setSelectedSubjectForAdd] = useState(selectedSubject || '')
    const [selectedChapterForAdd, setSelectedChapterForAdd] = useState(selectedChapter || '')

    const resetForm = () => {
        setExamName('')
        setSubjectName('')
        setChapterNameList([])
        setSubtopicsList([])
        setSelectedExamForAdd(selectedExam || '')
        setSelectedSubjectForAdd(selectedSubject || '')
        setSelectedChapterForAdd(selectedChapter || '')
        setSuccess(null)
        setError(null)
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    const addChapterField = () => {
        setChapterNameList([...chapterNameList, ['', 0]]);
    }

    const addSubtopicField = () => {
        setSubtopicsList([...subtopicsList, ['', 0]]);
    }

    const removeChapterField = (index: number) => {
        if (chapterNameList.length > 1) {
            setChapterNameList(chapterNameList.filter((_, i) => i !== index))
        }
    }

    const removeSubtopicField = (index: number) => {
        if (subtopicsList.length > 1) {
            setSubtopicsList(subtopicsList.filter((_, i) => i !== index))
        }
    }

    const updateSubtopic = (index: number, value: string, type: "text" | "number") => {
        const updated = [...subtopicsList]
        updated[index] = type === "text"
            ? [value, updated[index][1]]
            : [updated[index][0], Number(value)]
        setSubtopicsList(updated)
    }

    const updateChapter = (index: number, value: string, type: "text" | "number") => {
        const updated = [...chapterNameList];
        updated[index] = type === "text"
            ? [value, updated[index][1]]
            : [updated[index][0], Number(value)];
        setChapterNameList(updated);
    };


    const handleSubmit = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            let result = false

            switch (mode) {
                case 'exam':
                    if (!examName.trim()) {
                        setError('Exam name is required')
                        return
                    }
                    result = await addNewExam(examName.trim())
                    setSuccess(`Exam "${examName}" added successfully!`)
                    break

                case 'subject':
                    if (!selectedExamForAdd || !subjectName.trim()) {
                        setError('Exam and subject name are required')
                        return
                    }
                    result = await addNewsubject(selectedExamForAdd, subjectName.trim())
                    setSuccess(`Subject "${subjectName}" added successfully!`)
                    break

                case 'chapter':
                    if (!selectedExamForAdd || !selectedSubjectForAdd) {
                        setError('Exam, subject, and chapter name are required')
                        return
                    }
                    result = await addNewChapters(selectedExamForAdd, selectedSubjectForAdd, chapterNameList)
                    setSuccess(`Chapters added successfully!`)
                    break

                case 'subtopics':
                    if (!selectedExamForAdd || !selectedSubjectForAdd || !selectedChapterForAdd) {
                        setError('Exam, subject, and chapter are required')
                        return
                    }
                    const validSubtopics = subtopicsList.filter(([name]) => name.trim())
                    if (validSubtopics.length === 0) {
                        setError('At least one subtopic is required')
                        return
                    }
                    result = await addNewSubtopics(selectedExamForAdd, selectedSubjectForAdd, selectedChapterForAdd, validSubtopics)
                    setSuccess(`${validSubtopics.length} subtopics added successfully!`)
                    break
            }

            if (result) {
                onDataAdded()
                setTimeout(() => {
                    handleClose()
                }, 1500)
            } else {
                setError('Failed to add data. Please try again.')
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
            console.error('Error adding data:', err)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800">Add New Data</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Mode Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            What would you like to add?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { key: 'exam', label: 'New Exam' },
                                { key: 'subject', label: 'New Subject' },
                                { key: 'chapter', label: 'New Chapter' },
                                { key: 'subtopics', label: 'New Subtopics' }
                            ].map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setMode(key as AddMode)}
                                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                        mode === key
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Exam Selection (for subject, chapter, subtopics) */}
                        {mode !== 'exam' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Exam
                                </label>
                                <select
                                    value={selectedExamForAdd}
                                    onChange={(e) => setSelectedExamForAdd(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select an Exam</option>
                                    {availableExams.map((exam) => (
                                        <option key={exam} value={exam}>{exam}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Subject Selection (for chapter, subtopics) */}
                        {(mode === 'chapter' || mode === 'subtopics') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Subject
                                </label>
                                <select
                                    value={selectedSubjectForAdd}
                                    onChange={(e) => setSelectedSubjectForAdd(e.target.value)}
                                    disabled={!selectedExamForAdd}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select a Subject</option>
                                    {subjects && Object.keys(subjects).map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Chapter Selection (for subtopics) */}
                        {mode === 'subtopics' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Chapter
                                </label>
                                <select
                                    value={selectedChapterForAdd}
                                    onChange={(e) => setSelectedChapterForAdd(e.target.value)}
                                    disabled={!selectedSubjectForAdd}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                                >
                                    <option value="">Select a Chapter</option>
                                    {subjects?.[selectedSubjectForAdd]?.map((chapter: any) => (
                                        <option key={chapter.chapter} value={chapter.chapter}>
                                            {chapter.chapter}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Exam Name Input */}
                        {mode === 'exam' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exam Name
                                </label>
                                <input
                                    type="text"
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    placeholder="Enter exam name (e.g., JEE, NEET, GATE)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}

                        {/* Subject Name Input */}
                        {mode === 'subject' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Name
                                </label>
                                <input
                                    type="text"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                    placeholder="Enter subject name (e.g., physics, chemistry, mathematics)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        )}

                        {/* Chapter Name Input */}
                        {/*{mode === 'chapter' && (*/}
                        {/*    <div>*/}
                        {/*        <label className="block text-sm font-medium text-gray-700 mb-2">*/}
                        {/*            Chapter Name*/}
                        {/*        </label>*/}
                        {/*        <input*/}
                        {/*            type="text"*/}
                        {/*            value={chapterName}*/}
                        {/*            onChange={(e) => setChapterName(e.target.value)}*/}
                        {/*            placeholder="Enter chapter name (e.g., Mechanics, Organic Chemistry)"*/}
                        {/*            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*)}*/}

                        {/* Chapters List */}
                        {mode === 'chapter' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Chapters
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addChapterField}
                                        className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                                    >
                                        <Plus size={16} />
                                        Add Chapter
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {chapterNameList.map(([name, value], index) => (
                                        <div
                                            key={index}
                                            className="flex gap-2 p-4 mb-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                                        >
                                            <input
                                                type="number"
                                                value={value || ''}
                                                onChange={(e) => updateChapter(index, e.target.value, "number")}
                                                placeholder={`${index + 1}`}
                                                className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />

                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => updateChapter(index, e.target.value, "text")}
                                                placeholder={`Chapter ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />

                                            {chapterNameList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeChapterField(index)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Subtopics List */}
                        {mode === 'subtopics' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Subtopics
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addSubtopicField}
                                        className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-700"
                                    >
                                        <Plus size={16} />
                                        Add Subtopic
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {subtopicsList.map(([name, value], index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="number"
                                                value={value || (index + 1) || ''}
                                                onChange={(e) => updateSubtopic(index, e.target.value, "number")}
                                                placeholder={`${index + 1}`}
                                                className="w-16 text-center px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />

                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => updateSubtopic(index, e.target.value, "text")}
                                                placeholder={`Subtopic ${index + 1}`}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            />

                                            {subtopicsList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSubtopicField(index)}
                                                    className="p-2 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-sm">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    )
}
