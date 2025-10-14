"use client"

import React, {useState} from "react"
import Link from "next/link"
import { ArrowLeft, Upload, Save, Edit, Trash2, Plus, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface Question {
    question_no: number
    question_text: string
    question_type: string
    option1?: string
    option2?: string
    option3?: string
    option4?: string
    correct_answer?: string
}

interface TestData {
    physics: Question[]
    chemistry: Question[]
    maths: Question[]
}

export default function UploadTestPage() {
    const [file, setFile] = useState<File | null>(null)
    const [testName, setTestName] = useState("")
    const [response, setResponse] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [testId, setTestId] = useState<string | null>(null)
    const [finalizing, setFinalizing] = useState(false)
    const [myTestData, setMyTestData] = useState<TestData | null>(null)
    const [editingQuestion, setEditingQuestion] = useState<{
        subject: string
        index: number
    } | null>(null)
    const [showRawData, setShowRawData] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(file){
            setFile(file);
            setFileType(file.type.startsWith("image/") ? "image" : "pdf")
        }
    }

    const handleTestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTestName(e.target.value)
    }

    const handleUpload = async () => {
        if(!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file)

        try{
            const endpoint = fileType === "pdf"
                                ? "/apiv/test-upload/upload-pdf"
                                : "/api/testupload/upload-image";

            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setMyTestData(data.result);
            setResponse(`${fileType === 'pdf' ? 'PDF' : 'Image'} uplaoded and processed successfully!`);
        }
        catch(err) {
            setResponse("Error : " + (err as Error).message);
        }
        finally {
            setLoading(false);
        }
    }

    const handleFinalizeTest = async () => {
        console.log("Button clicked")
        if (!testName.trim()) {
            setResponse("Error: Test name is required");
            return;
        }

        if (!myTestData) {
            setResponse("Error: No test data available");
            return;
        }

        // Validate that all MCQ questions have correct answers
        const allSubjects = [...myTestData.physics, ...myTestData.chemistry, ...myTestData.maths];
        const mcqQuestions = allSubjects.filter(q => q.question_type === "mcq");
        const questionsWithoutAnswers = mcqQuestions.filter(q => !q.correct_answer);

        if (questionsWithoutAnswers.length > 0) {
            setResponse(`Error: ${questionsWithoutAnswers.length} MCQ questions are missing correct answers`);
            return;
        }

        setFinalizing(true);
        try {
            const response = await fetch('/apiv/tests/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    testName,
                    testData: myTestData
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to finalize test');
            }

            setTestId(data.testId);
            setResponse("Test created successfully!");
            setShowSuccessDialog(true);
        } catch (error) {
            setResponse("Error: " + (error as Error).message);
        } finally {
            setFinalizing(false);
        }
    };

    const handleEditQuestion = (subject: string, index: number, field: string, value: string) => {
        if (!myTestData) return

        const updatedData = { ...myTestData }
        const subjectData = updatedData[subject as keyof TestData]
        if (subjectData && subjectData[index]) {
            ;(subjectData[index] as any)[field] = value
            setMyTestData(updatedData)
        }
    }

    const handleDeleteQuestion = (subject: string, index: number) => {
        if (!myTestData) return

        const updatedData = { ...myTestData }
        const subjectData = updatedData[subject as keyof TestData]
        if (subjectData) {
            subjectData.splice(index, 1)
            // Renumber questions
            subjectData.forEach((q, i) => {
                q.question_no = i + 1
            })
            setMyTestData(updatedData)
        }
    }

    const handleAddQuestion = (subject: string) => {
        if (!myTestData) return

        const updatedData = { ...myTestData }
        const subjectData = updatedData[subject as keyof TestData]
        if (subjectData) {
            const newQuestion: Question = {
                question_no: subjectData.length + 1,
                question_text: "New question text",
                question_type: "mcq",
                option1: "Option A",
                option2: "Option B",
                option3: "Option C",
                option4: "Option D",
                correct_answer: "A"
            }
            subjectData.push(newQuestion)
            setMyTestData(updatedData)
        }
    }

    const renderQuestionEditor = (question: Question, subject: string, index: number) => {
        const isEditing = editingQuestion?.subject === subject && editingQuestion?.index === index

        return (
            <Card key={`${subject}-${index}`} className="mb-4">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            Question {question.question_no} - {subject.charAt(0).toUpperCase() + subject.slice(1)}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingQuestion(isEditing ? null : { subject, index })}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteQuestion(subject, index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <Badge variant="secondary">{question.question_type.toUpperCase()}</Badge>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <Label>Question Text</Label>
                                <Textarea
                                    value={question.question_text}
                                    onChange={(e) => handleEditQuestion(subject, index, "question_text", e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Question Type</Label>
                                <Select
                                    value={question.question_type}
                                    onValueChange={(value) => handleEditQuestion(subject, index, "question_type", value)}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                                        <SelectItem value="multiple-select">Multiple Select</SelectItem>
                                        <SelectItem value="integer">Integer Type</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {question.question_type === "mcq" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Option A</Label>
                                            <Input
                                                value={question.option1 || ""}
                                                onChange={(e) => handleEditQuestion(subject, index, "option1", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Option B</Label>
                                            <Input
                                                value={question.option2 || ""}
                                                onChange={(e) => handleEditQuestion(subject, index, "option2", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Option C</Label>
                                            <Input
                                                value={question.option3 || ""}
                                                onChange={(e) => handleEditQuestion(subject, index, "option3", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label>Option D</Label>
                                            <Input
                                                value={question.option4 || ""}
                                                onChange={(e) => handleEditQuestion(subject, index, "option4", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Correct Answer</Label>
                                        <Select
                                            value={question.correct_answer || ""}
                                            onValueChange={(value) => handleEditQuestion(subject, index, "correct_answer", value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select correct answer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">Option A</SelectItem>
                                                <SelectItem value="B">Option B</SelectItem>
                                                <SelectItem value="C">Option C</SelectItem>
                                                <SelectItem value="D">Option D</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <strong>Question:</strong>
                                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">
                                    {question.question_text.replace(/\\\\text\{([^}]+)\}/g, "$1").replace(/\\\\newline/g, "\n")}
                                </p>
                            </div>
                            {question.question_type === "mcq" && (
                                <div className="grid grid-cols-2 gap-2">
                                    {[question.option1, question.option2, question.option3, question.option4].map((option, optIndex) => (
                                        <div key={optIndex} className={`text-sm ${question.correct_answer === String.fromCharCode(65 + optIndex) ? 'font-bold text-green-600' : ''}`}>
                                            <strong>{String.fromCharCode(65 + optIndex)}.</strong>{" "}
                                            {option?.replace(/\\\\text\{([^}]+)\}/g, "$1") || "No option"}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {question.correct_answer && (
                                <div className="text-sm mt-2">
                                    <strong>Correct Answer:</strong> {question.correct_answer}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    const getTotalQuestions = () => {
        if (!myTestData) return 0
        return myTestData.physics.length + myTestData.chemistry.length + myTestData.maths.length
    }

    return (
        <div className="flex min-h-screen w-full flex-col relative">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-[#1a73e8] text-white px-4 md:px-6">
                <Link href="/teachers" className="flex items-center gap-2 font-semibold">
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-lg">Back to Dashboard</span>
                </Link>
            </header>

            <main className="flex-1 p-4 md:p-6 relative z-10">
                <div className="mx-auto max-w-6xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Create New Test</h1>
                            <p className="text-muted-foreground">Upload test image and manage questions</p>
                        </div>
                        {myTestData && (
                            <Button onClick={handleFinalizeTest} disabled={finalizing || !testName.trim()} className="bg-[#1a73e8]">
                                <Save className="mr-2 h-4 w-4" />
                                {finalizing ? "Finalizing..." : "Finalize Test"}
                            </Button>
                        )}
                    </div>

                    <Tabs defaultValue="upload" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="upload">Upload & Process</TabsTrigger>
                            <TabsTrigger value="physics" disabled={!myTestData}>
                                Physics ({myTestData?.physics.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="chemistry" disabled={!myTestData}>
                                Chemistry ({myTestData?.chemistry.length || 0})
                            </TabsTrigger>
                            <TabsTrigger value="maths" disabled={!myTestData}>
                                Maths ({myTestData?.maths.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="space-y-4">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Test Information</CardTitle>
                                        <CardDescription>Enter basic test details</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="testName">Test Name</Label>
                                            <Input
                                                id="testName"
                                                type="text"
                                                value={testName}
                                                onChange={handleTestNameChange}
                                                placeholder="Enter test name"
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upload Test Image</CardTitle>
                                        <CardDescription>Upload an image containing test questions</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="image">Test Image</Label>
                                            <Input id="image" type="file" accept="image/*, .pdf" onChange={handleFileChange} />
                                        </div>
                                        <Button onClick={handleUpload} disabled={loading || !file} className="w-full">
                                            <Upload className="mr-2 h-4 w-4" />
                                            {loading ? "Processing..." : `Upload & Process ${fileType === 'pdf' ? 'PDF' : 'Image'}`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {myTestData && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            Processing Results
                                            <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
                                                {showRawData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                {showRawData ? "Hide" : "Show"} Raw Data
                                            </Button>
                                        </CardTitle>
                                        <CardDescription>Total Questions Extracted: {getTotalQuestions()}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{myTestData.physics.length}</div>
                                                <div className="text-sm text-muted-foreground">Physics</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{myTestData.chemistry.length}</div>
                                                <div className="text-sm text-muted-foreground">Chemistry</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">{myTestData.maths.length}</div>
                                                <div className="text-sm text-muted-foreground">Mathematics</div>
                                            </div>
                                        </div>

                                        {showRawData && (
                                            <div className="mt-4">
                                                <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-64">
                                                    {JSON.stringify(myTestData, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {response && (
                                <Alert variant={response.includes("Error") ? "destructive" : "default"}>
                                    <AlertDescription>{response}</AlertDescription>
                                </Alert>
                            )}
                        </TabsContent>

                        {["physics", "chemistry", "maths"].map((subject) => (
                            <TabsContent key={subject} value={subject} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold capitalize">
                                        {subject} Questions ({myTestData?.[subject as keyof TestData]?.length || 0})
                                    </h2>
                                    <Button onClick={() => handleAddQuestion(subject)} variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Question
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {myTestData?.[subject as keyof TestData]?.map((question, index) =>
                                        renderQuestionEditor(question, subject, index),
                                    ) || (
                                        <Card>
                                            <CardContent className="text-center py-8">
                                                <p className="text-muted-foreground">No questions available for {subject}</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
            </main>
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">Test Created Successfully!</DialogTitle>
                        <DialogDescription>
                            Your test is now ready to be shared with students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Test Name</Label>
                            <p className="font-medium">{testName}</p>
                        </div>
                        <div>
                            <Label>Test Link</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={`https://kkmishra.vercel.app/test?id=${testId}`}
                                    readOnly
                                    className="mt-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`/test?id=${testId}`)
                                    }}
                                >
                                    Copy
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Link href={`/test?id=${testId}`} passHref>
                                <Button className="bg-[#1a73e8]">
                                    View Test
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                onClick={() => setShowSuccessDialog(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}