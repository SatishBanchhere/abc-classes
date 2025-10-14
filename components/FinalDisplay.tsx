"use client"

import {useState, useEffect} from "react"
import {
    Download,
    FileText,
    CheckCircle,
    BarChart3,
    ArrowLeft,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Upload,
    Database,
    BookOpen,
    Target, Trash2,
} from "lucide-react"
import type {Question, Solution, AnswerKeyItem} from "@/types"
import {db} from "@/lib/firebase";
import {
    writeBatch,
    doc,
    collection,
    serverTimestamp,
    increment
} from "firebase/firestore";

interface FinalDisplayProps {
    questions: Question[]
    solutions: Solution[]
    answerKey: AnswerKeyItem[]
    onPrev: () => void
    setQuestions: (questions: Question[]) => void
    setSolutions: (solutions: Solution[]) => void
    setAnswerKey: (answerKey: AnswerKeyItem[]) => void
    selectedTopic: string
    setSelectedTopic: (key: string) => void
    selectedExam: string
    selectedSubject: string
    selectedChapter: string
}

interface Subject {
    id: string
    name: string
}

interface Topic {
    id: string
    name: string
    subjectId: string
}

export default function FinalDisplay({
                                         questions,
                                         solutions,
                                         answerKey,
                                         onPrev,
                                         setQuestions,
                                         setSolutions,
                                         setAnswerKey,
                                         selectedTopic,
                                         setSelectedTopic,
                                         selectedExam,
                                         selectedSubject,
                                         selectedChapter
                                     }: FinalDisplayProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "questions" | "solutions" | "answerkey">("questions")
    const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())
    const [showFirebaseDialog, setShowFirebaseDialog] = useState(false)
    const [newTopicName, setNewTopicName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [selectedSubjectName, setSelectedSubjectName] = useState("")
    const [editingQuestions, setEditingQuestions] = useState<Set<number>>(new Set())
    const [editingAnswers, setEditingAnswers] = useState<Set<number>>(new Set())

    // ImageKit upload function for external URLs
    const uploadImageToImgageKit = async (imageUrl: string): Promise<string> => {
        try {
            const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

            const blob = await response.blob();
            const file = new File([blob], "upload.jpg", { type: blob.type });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", "upload.jpg");

            const auth = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`);

            const imagekitResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`
                },
                body: formData
            });

            if (!imagekitResponse.ok) {
                const errorText = await imagekitResponse.text();
                console.error('ImageKit error response:', errorText);
                throw new Error(`ImageKit upload failed with status ${imagekitResponse.status}`);
            }

            const data = await imagekitResponse.json();
            console.log("Successfully uploaded to ImageKit:", data);

            return data.url;

        } catch (error) {
            console.error("Error uploading image to ImageKit:", error);
            throw error;
        }
    };

    // Base64 upload function for screenshots/pasted images
    const uploadBase64ToImageKit = async (base64Image: string): Promise<string> => {
        try {
            const response = await fetch(base64Image);
            const blob = await response.blob();
            const file = new File([blob], "upload.jpg", { type: blob.type });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", "upload.jpg");

            const auth = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`);

            const imagekitResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${auth}`
                },
                body: formData
            });

            if (!imagekitResponse.ok) {
                const errorText = await imagekitResponse.text();
                console.error('ImageKit error response:', errorText);
                throw new Error(`ImageKit upload failed with status ${imagekitResponse.status}`);
            }

            const data = await imagekitResponse.json();
            console.log("Successfully uploaded base64 to ImageKit:", data);

            return data.url;

        } catch (error) {
            console.error("Error uploading base64 image to ImageKit:", error);
            throw error;
        }
    };

    // Unified upload function
    const uploadImageToImageKit = async (imageUrl: string): Promise<string> => {
        try {
            if (imageUrl.startsWith('data:')) {
                return await uploadBase64ToImageKit(imageUrl);
            }
            return await uploadImageToImgageKit(imageUrl);
        } catch (error) {
            console.error('Error uploading to ImageKit:', error);
            throw error;
        }
    };

    const handleInputQuestions = async (questionNo: number, field: string, value: string) => {
        if (field === 'question_description') {
            setIsUploading(true);

            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;

                // Find all <p> tags and unwrap images
                tempDiv.querySelectorAll('p').forEach(p => {
                    if (
                        p.children.length === 1 &&
                        p.children[0].tagName === 'IMG' &&
                        (!p.textContent || p.textContent.trim() === '')
                    ) {
                        p.parentNode?.replaceChild(p.children[0], p);
                    }
                });

                // Do the same for <div>
                tempDiv.querySelectorAll('div').forEach(div => {
                    if (
                        div !== tempDiv &&
                        div.children.length === 1 &&
                        div.children[0].tagName === 'IMG' &&
                        (!div.textContent || div.textContent.trim() === '')
                    ) {
                        div.parentNode?.replaceChild(div.children[0], div);
                    }
                });

                const images = Array.from(tempDiv.querySelectorAll("img"));
                let successCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const originalSrc = img.getAttribute("src");
                    if (!originalSrc) continue;

                    // Skip if already uploaded to ImageKit
                    if (originalSrc.includes('imagekit.io')) {
                        continue;
                    }

                    // Handle base64 images (screenshots/pasted images)
                    if (originalSrc.startsWith('data:')) {
                        try {
                            const newUrl = await uploadBase64ToImageKit(originalSrc);
                            img.setAttribute("src", newUrl);
                            img.removeAttribute("style");
                            successCount++;
                        } catch (error) {
                            errors.push(`Image ${i + 1}: Failed to upload base64`);
                            console.error(`Failed to upload base64 image`, error);
                        }
                    }
                    // Handle external URLs (like Google Drive links)
                    else if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                        try {
                            const newUrl = await uploadImageToImgageKit(originalSrc);
                            img.setAttribute("src", newUrl);
                            img.removeAttribute("style");
                            successCount++;
                        } catch (error) {
                            errors.push(`Image ${i + 1}: Failed to upload`);
                            console.error(`Failed to upload image ${originalSrc}`, error);
                        }
                    }
                }

                // Set inline styles for all images
                tempDiv.querySelectorAll('img').forEach(img => {
                    img.style.display = 'inline';
                    img.style.verticalAlign = 'middle';
                    img.style.margin = '0 4px';
                });

                value = tempDiv.innerHTML;

                if (errors.length > 0) {
                    console.warn(`${errors.length} images failed to upload:`, errors);
                }

            } catch (error) {
                console.error('Error processing images:', error);
            } finally {
                setIsUploading(false);
            }
        }

        const updatedQuestions = questions.map((q) =>
            q.question_no === questionNo ? { ...q, [field]: value } : q
        );
        setQuestions(updatedQuestions);
    };

    const handleInputSolutions = async (questionNo: number, field: string, value: string) => {
        console.log("✏️ handleInputSolutions called", { questionNo, field, value });

        if (field === 'solution') {
            console.log("📌 Processing solution field...");
            setIsUploading(true);

            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = value;
                console.log("📥 Initial HTML loaded into tempDiv:", tempDiv.innerHTML);

                // Find all <p> tags and unwrap images
                tempDiv.querySelectorAll('p').forEach(p => {
                    if (
                        p.children.length === 1 &&
                        p.children[0].tagName === 'IMG' &&
                        (!p.textContent || p.textContent.trim() === '')
                    ) {
                        console.log("🔄 Unwrapping <p> with single <img>", p.outerHTML);
                        p.parentNode?.replaceChild(p.children[0], p);
                    }
                });

                // Do the same for <div>
                tempDiv.querySelectorAll('div').forEach(div => {
                    if (
                        div !== tempDiv &&
                        div.children.length === 1 &&
                        div.children[0].tagName === 'IMG' &&
                        (!div.textContent || div.textContent.trim() === '')
                    ) {
                        console.log("🔄 Unwrapping <div> with single <img>", div.outerHTML);
                        div.parentNode?.replaceChild(div.children[0], div);
                    }
                });

                // Upload images to ImageKit
                const images = Array.from(tempDiv.querySelectorAll("img"));
                console.log(`🖼 Found ${images.length} image(s) in solution`);

                let successCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const originalSrc = img.getAttribute("src");
                    console.log(`➡️ Processing image ${i + 1}:`, originalSrc);

                    if (!originalSrc) {
                        console.warn(`⚠️ Image ${i + 1} has no src, skipping`);
                        continue;
                    }

                    if (originalSrc.includes('imagekit.io')) {
                        console.log(`✅ Image ${i + 1} already uploaded to ImageKit, skipping`);
                        continue;
                    }

                    if (originalSrc.startsWith('data:')) {
                        console.log(`📤 Uploading base64 image ${i + 1}...`);
                        try {
                            const newUrl = await uploadBase64ToImageKit(originalSrc);
                            console.log(`✅ Uploaded base64 image ${i + 1}:`, newUrl);
                            img.setAttribute("src", newUrl);
                            img.removeAttribute("style");
                            successCount++;
                        } catch (error) {
                            errors.push(`Image ${i + 1}: Failed to upload base64`);
                            console.error(`❌ Failed to upload base64 image ${i + 1}`, error);
                        }
                    } else if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                        console.log(`📤 Uploading external image ${i + 1}...`);
                        try {
                            const newUrl = await uploadImageToImgageKit(originalSrc);
                            console.log(`✅ Uploaded external image ${i + 1}:`, newUrl);
                            img.setAttribute("src", newUrl);
                            img.removeAttribute("style");
                            successCount++;
                        } catch (error) {
                            errors.push(`Image ${i + 1}: Failed to upload`);
                            console.error(`❌ Failed to upload external image ${i + 1} (${originalSrc})`, error);
                        }
                    }
                }

                // Set inline styles for all images
                tempDiv.querySelectorAll('img').forEach(img => {
                    img.style.display = 'inline';
                    img.style.verticalAlign = 'middle';
                    img.style.margin = '0 4px';
                });

                value = tempDiv.innerHTML;
                console.log("📤 Final processed solution HTML:", value);

                if (errors.length > 0) {
                    console.warn(`${errors.length} image(s) failed to upload:`, errors);
                } else {
                    console.log(`🎉 All ${successCount} images uploaded successfully`);
                }

            } catch (error) {
                console.error('🔥 Error processing images:', error);
            } finally {
                console.log("⏳ Upload finished, setting isUploading = false");
                setIsUploading(false);
            }
        }

        console.log("📝 Updating solutions array...");
        const updatedSolutions = solutions.map((s) => {
            const updated = s.question_no === questionNo ? { ...s, [field]: value } : s;
            if (s.question_no === questionNo) {
                console.log("✅ Updating solution:", { before: s, after: updated });
            }
            return updated;
        });

        console.log("📦 Final updatedSolutions:", updatedSolutions);
        setSolutions(updatedSolutions);
    };

    const handleInputOptions = async (questionNo: number, optionField: string, value: string) => {
        console.log("✏️ handleInputOptions called", { questionNo, optionField, value });

        setIsUploading(true);

        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = value;

            // Find all <p> tags and unwrap images
            tempDiv.querySelectorAll('p').forEach(p => {
                if (
                    p.children.length === 1 &&
                    p.children[0].tagName === 'IMG' &&
                    (!p.textContent || p.textContent.trim() === '')
                ) {
                    p.parentNode?.replaceChild(p.children, p);
                }
            });

            // Do the same for <div>
            tempDiv.querySelectorAll('div').forEach(div => {
                if (
                    div !== tempDiv &&
                    div.children.length === 1 &&
                    div.children.tagName === 'IMG' &&
                    (!div.textContent || div.textContent.trim() === '')
                ) {
                    div.parentNode?.replaceChild(div.children, div);
                }
            });

            // Upload images to ImageKit
            const images = Array.from(tempDiv.querySelectorAll("img"));
            console.log(`🖼 Found ${images.length} image(s) in option`);

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const originalSrc = img.getAttribute("src");
                if (!originalSrc) continue;

                if (originalSrc.includes('imagekit.io')) {
                    continue;
                }

                if (originalSrc.startsWith('data:')) {
                    try {
                        const newUrl = await uploadBase64ToImageKit(originalSrc);
                        img.setAttribute("src", newUrl);
                        img.removeAttribute("style");
                    } catch (error) {
                        console.error(`Failed to upload base64 image`, error);
                    }
                } else if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                    try {
                        const newUrl = await uploadImageToImgageKit(originalSrc);
                        img.setAttribute("src", newUrl);
                        img.removeAttribute("style");
                    } catch (error) {
                        console.error(`Failed to upload image ${originalSrc}`, error);
                    }
                }
            }

            // Set inline styles for all images
            tempDiv.querySelectorAll('img').forEach(img => {
                img.style.display = 'inline';
                img.style.verticalAlign = 'middle';
                img.style.margin = '0 4px';
            });

            value = tempDiv.innerHTML;

        } catch (error) {
            console.error('Error processing images:', error);
        } finally {
            setIsUploading(false);
        }

        const updatedQuestions = questions.map((q) =>
            q.question_no === questionNo ? { ...q, [optionField]: value } : q
        );
        setQuestions(updatedQuestions);
    };

    const handleInputAnswerKey = async (questionNo: number, field: string, value: string) => {
        const updatedAnswerKey = answerKey.map((item) =>
            item.question_no === questionNo ? { ...item, [field]: value } : item
        );
        setAnswerKey(updatedAnswerKey);

        // Sync changes to correct_answer or question_type in questions array too
        if (field === 'answer') {
            const updatedQuestions = questions.map((q) =>
                q.question_no === questionNo ? { ...q, correct_answer: value } : q
            );
            setQuestions(updatedQuestions);
        }
        if (field === 'question_type') {
            const updatedQuestions = questions.map((q) =>
                q.question_no === questionNo ? { ...q, question_no: Number(value) } : q
            );
            setQuestions(updatedQuestions);
        }
    };

    const handleDelete = (questionNo: number) => {
        if (window.confirm(`Are you sure you want to delete Question ${questionNo}? This will also delete its solution and answer key.`)) {
            const updatedQuestions = questions.filter(q => q.question_no !== questionNo);
            setQuestions(updatedQuestions);

            const updatedSolutions = solutions.filter(s => s.question_no !== questionNo);
            setSolutions(updatedSolutions);

            const updatedAnswerKey = answerKey.filter(ak => ak.question_no !== questionNo);
            setAnswerKey(updatedAnswerKey);

            console.log(`🗑️ Deleted Question ${questionNo} and its associated data`);
        }
    }

    const toggleExpanded = (questionNo: number) => {
        const newExpanded = new Set(expandedQuestions)
        if (newExpanded.has(questionNo)) {
            newExpanded.delete(questionNo)
        } else {
            newExpanded.add(questionNo)
        }
        setExpandedQuestions(newExpanded)
    }

    const updateDifficulty = (questionNo: number, newDifficulty: "easy" | "medium" | "hard") => {
        const updatedQuestions = questions.map((q) =>
            q.question_no === questionNo ? {...q, difficulty: newDifficulty} : q,
        )
        setQuestions(updatedQuestions)
    }

    const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
        switch (difficulty) {
            case "easy":
                return "bg-gradient-to-r from-green-400 to-emerald-500 text-black"
            case "medium":
                return "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
            case "hard":
                return "bg-gradient-to-r from-red-400 to-pink-500 text-black"
        }
    }

    const getDifficultyIcon = (difficulty: "easy" | "medium" | "hard") => {
        switch (difficulty) {
            case "easy":
                return "🟢"
            case "medium":
                return "🟡"
            case "hard":
                return "🔴"
        }
    }

    const uploadToFirebase = async () => {
        if (!selectedSubject || !selectedChapter) {
            alert("Please enter both subject and topic names");
            return;
        }

        setIsUploading(true);

        try {
            const subjectId = selectedSubject.replace(/\s+/g, '-');
            const topicId = selectedChapter.replace(/\s+/g, '-');

            const batch = writeBatch(db);
            const subjectRef = doc(db, `questions_${selectedExam}`, subjectId);
            const topicRef = doc(collection(subjectRef, 'topics'), topicId);

            questions.forEach((question) => {
                const subtopicDocRef = doc(topicRef, 'subtopics', question.subtopic);
                const subtopicRef = collection(topicRef, 'subtopics', `${question.subtopic}`, "questions");
                const questionRef = doc(subtopicRef, `q${question.question_no}`);

                const solution = solutions.find(s => s.question_no === question.question_no);
                const answerKeyItem = answerKey.find(ak => ak.question_no === question.question_no);

                const questionData = {
                    question_no: question.question_no,
                    question_type: question.question_type,
                    difficulty: question.difficulty,
                    question_description: question.question_description,
                    options: {
                        A: question.option1 || null,
                        B: question.option2 || null,
                        C: question.option3 || null,
                        D: question.option4 || null,
                    },
                    correct_answer: question.correct_answer,
                    solution: solution?.solution || null,
                    answer_key: answerKeyItem?.answer || null,
                    subject: selectedSubjectName,
                    topic: newTopicName,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                batch.set(questionRef, questionData);

                batch.set(subtopicDocRef, {
                    name: question.subtopic,
                    totalQuestions: increment(1),
                    updatedAt: serverTimestamp()
                })
            });

            batch.set(subjectRef, {
                name: selectedSubjectName,
                updatedAt: serverTimestamp()
            }, {merge: true});

            batch.set(topicRef, {
                name: newTopicName,
                totalQuestions: increment(questions.length),
                subjectId: subjectId,
                subjectName: selectedSubjectName,
                updatedAt: serverTimestamp()
            }, {merge: true});

            await batch.commit();

            alert("Successfully uploaded all questions to Firebase!");
            setShowFirebaseDialog(false);
        } catch (error: any) {
            console.error("Upload failed:", error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const uploadToMongoDB = async () => {
        if(!selectedSubject || !selectedChapter || !selectedExam) {
            alert("Please enter both subject and topic names");
            return;
        }

        setIsUploading(true);

        try{
            const uploadData = {
                selectedExam,
                selectedSubject,
                selectedChapter,
                questions,
                solutions: solutions.map(s => ({
                    question_no: s.question_no,
                    solution: s.solution,
                    //@ts-ignore
                    answer: s.answer || s.correct_answer,
                })),
                answerKey: answerKey.map(ak => ({
                    question_no: ak.question_no,
                    answer: ak.answer,
                    question_type: ak.question_type,
                }))
            }

            const response = await fetch('/api/upload-questions', {
                method: 'POST',
                headers: {
                    ContentType: "application/json",
                },
                body: JSON.stringify(uploadData)
            })

            const result = await response.json();

            if(!response.ok){
                throw new Error("Failed to upload questions", result.message, response.status);
            }

            alert(`Successfully uploaded ${result.count} questions to ${result.examType} database!`);
            setShowFirebaseDialog(false);
        }
        catch (error) {
            console.error("Failed to upload questions");
        }
        finally {
            setIsUploading(false);
        }
    }

    const exportData = (type: "json" | "csv") => {
        const data = {
            answerKey,
            questions,
            solutions,
            summary: {
                totalQuestions: questions.length,
                totalSolutions: solutions.length,
                mcqCount: questions.filter((q) => q.question_type === "mcq").length,
                integerCount: questions.filter((q) => q.question_type === "integer").length,
                completionRate: Math.round((solutions.length / questions.length) * 100) || 0,
                difficultyBreakdown: {
                    easy: questions.filter((q) => q.difficulty === "easy").length,
                    medium: questions.filter((q) => q.difficulty === "medium").length,
                    hard: questions.filter((q) => q.difficulty === "hard").length,
                },
            },
        }

        if (type === "json") {
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"})
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `question_data_${new Date().toISOString().split("T")[0]}.json`
            a.click()
            URL.revokeObjectURL(url)
        } else {
            const csvContent = [
                "Question No,Type,Difficulty,Question,Option A,Option B,Option C,Option D,Correct Answer,Solution",
                ...questions.map((q) => {
                    const solution = solutions.find((s) => s.question_no === q.question_no)
                    return `${q.question_no},${q.question_type},${q.difficulty},"${q.question_description.replace(/"/g, '""')}","${q.option1 || ""}","${q.option2 || ""}","${q.option3 || ""}","${q.option4 || ""}",${q.correct_answer},"${solution?.solution.replace(/"/g, '""') || ""}"`
                }),
            ].join("\n")

            const blob = new Blob([csvContent], {type: "text/csv"})
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `question_data_${new Date().toISOString().split("T")[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
        }
    }

    const completionRate = Math.round((solutions.length / questions.length) * 100) || 0
    const mcqCount = questions.filter((q) => q.question_type === "mcq").length
    const integerCount = questions.filter((q) => q.question_type === "integer").length
    const difficultyStats = {
        easy: questions.filter((q) => q.difficulty === "easy").length,
        medium: questions.filter((q) => q.difficulty === "medium").length,
        hard: questions.filter((q) => q.difficulty === "hard").length,
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-indigo-600/20 backdrop-blur-sm"></div>
                <div className="relative text-center">
                    <div
                        className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                        <CheckCircle className="h-12 w-12 text-green-300"/>
                    </div>
                    <h2 className="text-4xl font-bold mb-3">Processing Complete! 🎉</h2>
                    <p className="text-violet-100 text-xl">Review your processed data and export the results</p>
                </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div
                    className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Answer Keys</p>
                            <p className="text-4xl font-bold">{answerKey.length}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <FileText className="h-8 w-8 text-blue-200"/>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Questions</p>
                            <p className="text-4xl font-bold">{questions.length}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <BookOpen className="h-8 w-8 text-green-200"/>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Solutions</p>
                            <p className="text-4xl font-bold">{solutions.length}</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Target className="h-8 w-8 text-orange-200"/>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Completion</p>
                            <p className="text-4xl font-bold">{completionRate}%</p>
                        </div>
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <BarChart3 className="h-8 w-8 text-purple-200"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Tab Navigation */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <nav className="-mb-px flex space-x-8 px-8" aria-label="Tabs">
                        {[
                            {key: "overview", label: "Overview", count: null, color: "indigo", icon: BarChart3},
                            {
                                key: "questions",
                                label: "Questions",
                                count: questions.length,
                                color: "green",
                                icon: BookOpen
                            },
                            {
                                key: "solutions",
                                label: "Solutions",
                                count: solutions.length,
                                color: "orange",
                                icon: Target
                            },
                            {
                                key: "answerkey",
                                label: "Answer Key",
                                count: answerKey.length,
                                color: "blue",
                                icon: FileText
                            },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`py-6 px-2 border-b-3 font-bold text-sm transition-all duration-300 flex items-center space-x-2 ${
                                    activeTab === tab.key
                                        ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50 rounded-t-lg`
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg"
                                }`}
                            >
                                <tab.icon className="h-5 w-5"/>
                                <span>{tab.label}</span>
                                {tab.count !== null && (
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            activeTab === tab.key ? `bg-${tab.color}-500 text-white` : "bg-gray-200 text-gray-700"
                                        }`}
                                    >
                    {tab.count}
                  </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-8">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div
                                    className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <BookOpen className="h-6 w-6 mr-3 text-blue-600"/>
                                        Question Types
                                    </h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-700 font-medium">Multiple Choice (MCQ)</span>
                                            <span
                                                className="font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full text-lg">
                        {mcqCount}
                      </span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-700 font-medium">Integer Type</span>
                                            <span
                                                className="font-bold text-green-600 bg-green-100 px-4 py-2 rounded-full text-lg">
                        {integerCount}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-8 border-2 border-green-200 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <Target className="h-6 w-6 mr-3 text-green-600"/>
                                        Processing Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-700 font-medium">Questions Processed</span>
                                            <span className="font-bold text-green-600 text-lg">
                        {questions.length}/{answerKey.length}
                      </span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                            <span className="text-gray-700 font-medium">Solutions Processed</span>
                                            <span className="font-bold text-green-600 text-lg">
                        {solutions.length}/{questions.length}
                      </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                        <BarChart3 className="h-6 w-6 mr-3 text-purple-600"/>
                                        Difficulty Levels
                                    </h3>
                                    <div className="space-y-4">
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                      <span className="text-gray-700 font-medium flex items-center">
                        <span className="text-xl mr-2">🟢</span>
                        Easy
                      </span>
                                            <span
                                                className="font-bold text-green-600 bg-green-100 px-4 py-2 rounded-full text-lg">
                        {difficultyStats.easy}
                      </span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                      <span className="text-gray-700 font-medium flex items-center">
                        <span className="text-xl mr-2">🟡</span>
                        Medium
                      </span>
                                            <span
                                                className="font-bold text-yellow-600 bg-yellow-100 px-4 py-2 rounded-full text-lg">
                        {difficultyStats.medium}
                      </span>
                                        </div>
                                        <div
                                            className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                      <span className="text-gray-700 font-medium flex items-center">
                        <span className="text-xl mr-2">🔴</span>
                        Hard
                      </span>
                                            <span
                                                className="font-bold text-red-600 bg-red-100 px-4 py-2 rounded-full text-lg">
                        {difficultyStats.hard}
                      </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Questions Tab */}
                    {activeTab === "questions" && (
                        <div className="space-y-6">
                            {questions.map((q) => {
                                const solution = solutions.find((s) => s.question_no === q.question_no)
                                const answerKeyItem = answerKey.find((ak) => ak.question_no === q.question_no)
                                const isExpanded = expandedQuestions.has(q.question_no)

                                return (
                                    <div
                                        key={q.question_no}
                                        className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                                    >
                                        {/* Enhanced Question Header */}
                                        <div
                                            className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 p-8 border-b-2 border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-4 mb-4">
                                                        <h3 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                            Question {q.question_no}
                                                        </h3>
                                                        <span
                                                            className={`inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-md ${
                                                                q.question_type === "mcq"
                                                                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                                                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                                            }`}
                                                        >
                                                          {q.question_type.toUpperCase()}
                                                        </span>

                                                        {/* Enhanced Difficulty Dropdown */}
                                                        <div className="relative">
                                                            <select
                                                                value={q.difficulty}
                                                                onChange={(e) =>
                                                                    updateDifficulty(q.question_no, e.target.value as "easy" | "medium" | "hard")
                                                                }
                                                                className={`appearance-none px-4 py-2 text-sm font-bold rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${getDifficultyColor(q.difficulty)}`}
                                                            >
                                                                <option value="easy">🟢 Easy</option>
                                                                <option value="medium">🟡 Medium</option>
                                                                <option value="hard">🔴 Hard</option>
                                                            </select>
                                                            <ChevronDown
                                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none"/>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced Question Description with HTML Rendering */}
                                                    <div className="mb-6">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <label className="block text-sm font-bold text-gray-700">
                                                                Question Description
                                                            </label>
                                                            {/*<pre>{JSON.stringify(q, null, 2)}</pre>*/}
                                                            <button
                                                                onClick={()=>handleDelete(q.question_no)}
                                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                                title="Delete question"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>

                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        document.execCommand('bold');
                                                                    }}
                                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                                    type="button"
                                                                >
                                                                    <strong>B</strong>
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        document.execCommand('italic');
                                                                    }}
                                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                                    type="button"
                                                                >
                                                                    <em>I</em>
                                                                </button>
                                                                <button
                                                                    onClick={async (e) => {
                                                                        e.preventDefault();
                                                                        const url = prompt('Enter image URL:');
                                                                        if (url) {
                                                                            try {
                                                                                // Upload to ImageKit first
                                                                                const uploadedUrl = await uploadImageToImageKit(url);

                                                                                // Create image element with inline styles
                                                                                const img = document.createElement('img');
                                                                                img.src = uploadedUrl;
                                                                                img.style.display = 'inline';
                                                                                img.style.verticalAlign = 'middle';
                                                                                img.style.margin = '0 4px';

                                                                                // Insert the image at cursor position
                                                                                const selection = window.getSelection();
                                                                                if (selection && selection.rangeCount > 0) {
                                                                                    const range = selection.getRangeAt(0);
                                                                                    range.deleteContents();
                                                                                    range.insertNode(img);

                                                                                    // Move cursor after the image
                                                                                    range.setStartAfter(img);
                                                                                    range.collapse(true);
                                                                                    selection.removeAllRanges();
                                                                                    selection.addRange(range);
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Failed to upload image:', error);
                                                                                alert('Failed to upload image. Please try again.');
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                                    type="button"
                                                                >
                                                                    IMG
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div
                                                            contentEditable={true}
                                                            suppressContentEditableWarning={true}
                                                            className="prose prose-lg max-w-none text-gray-800 p-4 bg-white rounded-xl shadow-sm border-2 border-gray-300 focus:border-blue-500 focus:outline-none cursor-text min-h-[120px] hover:border-blue-300 transition-colors question-description-editor"
                                                            dangerouslySetInnerHTML={{__html: q.question_description}}
                                                            onPaste={async (e) => {
                                                                e.preventDefault();
                                                                const html = e.clipboardData.getData("text/html");
                                                                const text = e.clipboardData.getData("text/plain");

                                                                // Handle image files (screenshots)
                                                                const items = e.clipboardData.items;
                                                                for (const item of items) {
                                                                    if (item.type.indexOf('image') === 0) {
                                                                        const file = item.getAsFile();
                                                                        if (file) {
                                                                            try {
                                                                                // Convert to base64
                                                                                const reader = new FileReader();
                                                                                reader.onload = async (evt) => {
                                                                                    const base64Image = evt.target?.result as string;

                                                                                    // Upload to ImageKit
                                                                                    const uploadedUrl = await uploadBase64ToImageKit(base64Image);

                                                                                    // Insert image at cursor
                                                                                    const img = document.createElement('img');
                                                                                    img.src = uploadedUrl;
                                                                                    img.style.display = 'inline';
                                                                                    img.style.verticalAlign = 'middle';
                                                                                    img.style.margin = '0 4px';

                                                                                    const selection = window.getSelection();
                                                                                    if (selection && selection.rangeCount > 0) {
                                                                                        const range = selection.getRangeAt(0);
                                                                                        range.deleteContents();
                                                                                        range.insertNode(img);
                                                                                        range.setStartAfter(img);
                                                                                        range.collapse(true);
                                                                                        selection.removeAllRanges();
                                                                                        selection.addRange(range);
                                                                                    }

                                                                                    // Save updated content
                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                    await handleInputQuestions(q.question_no, 'question_description', newContent);
                                                                                };
                                                                                reader.readAsDataURL(file);
                                                                            } catch (error) {
                                                                                console.error('Failed to upload pasted image:', error);
                                                                            }
                                                                            return; // Exit after handling image
                                                                        }
                                                                    }
                                                                }

                                                                // Handle HTML content (like your existing handlePaste)
                                                                if (html) {
                                                                    setIsUploading(true);
                                                                    try {
                                                                        const tempDiv = document.createElement("div");
                                                                        tempDiv.innerHTML = html;
                                                                        const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                        for (let i = 0; i < images.length; i++) {
                                                                            const img = images[i];
                                                                            const originalSrc = img.getAttribute("src");
                                                                            if (!originalSrc) continue;

                                                                            if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                try {
                                                                                    const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                    img.setAttribute("src", newUrl);
                                                                                    img.removeAttribute("style");
                                                                                } catch (error) {
                                                                                    console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                }
                                                                            }
                                                                        }

                                                                        const processedHtml = tempDiv.innerHTML;
                                                                        e.currentTarget.innerHTML = processedHtml;

                                                                        // Save the content
                                                                        await handleInputQuestions(q.question_no, 'question_description', processedHtml);
                                                                    } catch (error) {
                                                                        console.error("Error processing paste:", error);
                                                                    } finally {
                                                                        setIsUploading(false);
                                                                    }
                                                                } else if (text) {
                                                                    // Handle plain text
                                                                    e.currentTarget.textContent = text;
                                                                    await handleInputQuestions(q.question_no, 'question_description', text);
                                                                }
                                                            }}
                                                            onBlur={async (e) => {
                                                                const newContent = e.currentTarget.innerHTML;
                                                                await handleInputQuestions(q.question_no, 'question_description', newContent);
                                                            }}
                                                            onKeyDown={(e) => {
                                                                // Save on Ctrl+S
                                                                if (e.ctrlKey && e.key === 's') {
                                                                    e.preventDefault();
                                                                    const newContent = e.currentTarget.innerHTML;
                                                                    handleInputQuestions(q.question_no, 'question_description', newContent);
                                                                }
                                                            }}
                                                            style={{
                                                                minHeight: '120px',
                                                                whiteSpace: 'pre-wrap'
                                                            }}
                                                        />

                                                        {isUploading && (
                                                            <div className="flex items-center text-blue-600 text-sm mt-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                                Uploading images to ImageKit...
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center mt-2">
                                                            <div className="text-xs text-gray-500">
                                                                💡 Click to edit directly. Use toolbar buttons for formatting. Press Ctrl+S to save manually.
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                Auto-saves when you click outside
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Enhanced MCQ Options with HTML Rendering */}
                                                    {q.question_type === "mcq" && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                            {q.option1 && (
                                                                <div
                                                                    className={`p-4 rounded-xl border-3 transition-all duration-200 hover:scale-102 ${
                                                                        q.correct_answer === "A"
                                                                            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200"
                                                                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start space-x-3">
            <span
                className={`font-bold text-lg px-3 py-1 rounded-full ${
                    q.correct_answer === "A"
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-gray-700"
                }`}
            >
              A
            </span>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="prose prose-sm max-w-none flex-1 p-2 border-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-text min-h-[40px] rounded-lg"
                                                                            dangerouslySetInnerHTML={{__html: q.option1}}
                                                                            onPaste={async (e) => {
                                                                                e.preventDefault();
                                                                                const html = e.clipboardData.getData("text/html");
                                                                                const text = e.clipboardData.getData("text/plain");

                                                                                // Handle image files (screenshots)
                                                                                const items = e.clipboardData.items;
                                                                                for (const item of items) {
                                                                                    if (item.type.indexOf('image') === 0) {
                                                                                        const file = item.getAsFile();
                                                                                        if (file) {
                                                                                            try {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = async (evt) => {
                                                                                                    const base64Image = evt.target?.result as string;
                                                                                                    const uploadedUrl = await uploadBase64ToImageKit(base64Image);
                                                                                                    const img = document.createElement('img');
                                                                                                    img.src = uploadedUrl;
                                                                                                    img.style.display = 'inline';
                                                                                                    img.style.verticalAlign = 'middle';
                                                                                                    img.style.margin = '0 4px';
                                                                                                    const selection = window.getSelection();
                                                                                                    if (selection && selection.rangeCount > 0) {
                                                                                                        const range = selection.getRangeAt(0);
                                                                                                        range.deleteContents();
                                                                                                        range.insertNode(img);
                                                                                                        range.setStartAfter(img);
                                                                                                        range.collapse(true);
                                                                                                        selection.removeAllRanges();
                                                                                                        selection.addRange(range);
                                                                                                    }
                                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                                    await handleInputOptions(q.question_no, 'option1', newContent);
                                                                                                };
                                                                                                reader.readAsDataURL(file);
                                                                                            } catch (error) {
                                                                                                console.error('Failed to upload pasted image:', error);
                                                                                            }
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                // Handle HTML content
                                                                                if (html) {
                                                                                    setIsUploading(true);
                                                                                    try {
                                                                                        const tempDiv = document.createElement("div");
                                                                                        tempDiv.innerHTML = html;
                                                                                        const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                                        for (let i = 0; i < images.length; i++) {
                                                                                            const img = images[i];
                                                                                            const originalSrc = img.getAttribute("src");
                                                                                            if (!originalSrc) continue;

                                                                                            if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                                try {
                                                                                                    const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                                    img.setAttribute("src", newUrl);
                                                                                                    img.removeAttribute("style");
                                                                                                } catch (error) {
                                                                                                    console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                                }
                                                                                            }
                                                                                        }

                                                                                        const processedHtml = tempDiv.innerHTML;
                                                                                        e.currentTarget.innerHTML = processedHtml;
                                                                                        await handleInputOptions(q.question_no, 'option1', processedHtml);
                                                                                    } catch (error) {
                                                                                        console.error("Error processing paste:", error);
                                                                                    } finally {
                                                                                        setIsUploading(false);
                                                                                    }
                                                                                } else if (text) {
                                                                                    e.currentTarget.textContent = text;
                                                                                    await handleInputOptions(q.question_no, 'option1', text);
                                                                                }
                                                                            }}
                                                                            onBlur={async (e) => {
                                                                                const newContent = e.currentTarget.innerHTML;
                                                                                await handleInputOptions(q.question_no, 'option1', newContent);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.ctrlKey && e.key === 's') {
                                                                                    e.preventDefault();
                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                    handleInputOptions(q.question_no, 'option1', newContent);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {q.option2&& (
                                                                <div
                                                                    className={`p-4 rounded-xl border-3 transition-all duration-200 hover:scale-102 ${
                                                                        q.correct_answer === "B"
                                                                            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200"
                                                                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start space-x-3">
                                                                    <span
                                                                        className={`font-bold text-lg px-3 py-1 rounded-full ${
                                                                            q.correct_answer === "B"
                                                                                ? "bg-green-500 text-white"
                                                                                : "bg-gray-300 text-gray-700"
                                                                        }`}
                                                                    >
                                                                      B
                                                                    </span>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="prose prose-sm max-w-none flex-1 p-2 border-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-text min-h-[40px] rounded-lg"
                                                                            dangerouslySetInnerHTML={{__html: q.option2}}
                                                                            onPaste={async (e) => {
                                                                                e.preventDefault();
                                                                                const html = e.clipboardData.getData("text/html");
                                                                                const text = e.clipboardData.getData("text/plain");

                                                                                // Handle image files (screenshots)
                                                                                const items = e.clipboardData.items;
                                                                                for (const item of items) {
                                                                                    if (item.type.indexOf('image') === 0) {
                                                                                        const file = item.getAsFile();
                                                                                        if (file) {
                                                                                            try {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = async (evt) => {
                                                                                                    const base64Image = evt.target?.result as string;
                                                                                                    const uploadedUrl = await uploadBase64ToImageKit(base64Image);
                                                                                                    const img = document.createElement('img');
                                                                                                    img.src = uploadedUrl;
                                                                                                    img.style.display = 'inline';
                                                                                                    img.style.verticalAlign = 'middle';
                                                                                                    img.style.margin = '0 4px';
                                                                                                    const selection = window.getSelection();
                                                                                                    if (selection && selection.rangeCount > 0) {
                                                                                                        const range = selection.getRangeAt(0);
                                                                                                        range.deleteContents();
                                                                                                        range.insertNode(img);
                                                                                                        range.setStartAfter(img);
                                                                                                        range.collapse(true);
                                                                                                        selection.removeAllRanges();
                                                                                                        selection.addRange(range);
                                                                                                    }
                                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                                    await handleInputOptions(q.question_no, 'option1', newContent);
                                                                                                };
                                                                                                reader.readAsDataURL(file);
                                                                                            } catch (error) {
                                                                                                console.error('Failed to upload pasted image:', error);
                                                                                            }
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                // Handle HTML content
                                                                                if (html) {
                                                                                    setIsUploading(true);
                                                                                    try {
                                                                                        const tempDiv = document.createElement("div");
                                                                                        tempDiv.innerHTML = html;
                                                                                        const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                                        for (let i = 0; i < images.length; i++) {
                                                                                            const img = images[i];
                                                                                            const originalSrc = img.getAttribute("src");
                                                                                            if (!originalSrc) continue;

                                                                                            if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                                try {
                                                                                                    const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                                    img.setAttribute("src", newUrl);
                                                                                                    img.removeAttribute("style");
                                                                                                } catch (error) {
                                                                                                    console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                                }
                                                                                            }
                                                                                        }

                                                                                        const processedHtml = tempDiv.innerHTML;
                                                                                        e.currentTarget.innerHTML = processedHtml;
                                                                                        await handleInputOptions(q.question_no, 'option2', processedHtml);
                                                                                    } catch (error) {
                                                                                        console.error("Error processing paste:", error);
                                                                                    } finally {
                                                                                        setIsUploading(false);
                                                                                    }
                                                                                } else if (text) {
                                                                                    e.currentTarget.textContent = text;
                                                                                    await handleInputOptions(q.question_no, 'option2', text);
                                                                                }
                                                                            }}
                                                                            onBlur={async (e) => {
                                                                                const newContent = e.currentTarget.innerHTML;
                                                                                await handleInputOptions(q.question_no, 'option2', newContent);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.ctrlKey && e.key === 's') {
                                                                                    e.preventDefault();
                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                    handleInputOptions(q.question_no, 'option2', newContent);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {q.option3 && (
                                                                <div
                                                                    className={`p-4 rounded-xl border-3 transition-all duration-200 hover:scale-102 ${
                                                                        q.correct_answer === "C"
                                                                            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200"
                                                                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start space-x-3">
                                                                        <span
                                                                            className={`font-bold text-lg px-3 py-1 rounded-full ${
                                                                                q.correct_answer === "C"
                                                                                    ? "bg-green-500 text-white"
                                                                                    : "bg-gray-300 text-gray-700"
                                                                            }`}
                                                                        >
                                                                          C
                                                                        </span>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="prose prose-sm max-w-none flex-1 p-2 border-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-text min-h-[40px] rounded-lg"
                                                                            dangerouslySetInnerHTML={{__html: q.option3}}
                                                                            onPaste={async (e) => {
                                                                                e.preventDefault();
                                                                                const html = e.clipboardData.getData("text/html");
                                                                                const text = e.clipboardData.getData("text/plain");

                                                                                // Handle image files (screenshots)
                                                                                const items = e.clipboardData.items;
                                                                                for (const item of items) {
                                                                                    if (item.type.indexOf('image') === 0) {
                                                                                        const file = item.getAsFile();
                                                                                        if (file) {
                                                                                            try {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = async (evt) => {
                                                                                                    const base64Image = evt.target?.result as string;
                                                                                                    const uploadedUrl = await uploadBase64ToImageKit(base64Image);
                                                                                                    const img = document.createElement('img');
                                                                                                    img.src = uploadedUrl;
                                                                                                    img.style.display = 'inline';
                                                                                                    img.style.verticalAlign = 'middle';
                                                                                                    img.style.margin = '0 4px';
                                                                                                    const selection = window.getSelection();
                                                                                                    if (selection && selection.rangeCount > 0) {
                                                                                                        const range = selection.getRangeAt(0);
                                                                                                        range.deleteContents();
                                                                                                        range.insertNode(img);
                                                                                                        range.setStartAfter(img);
                                                                                                        range.collapse(true);
                                                                                                        selection.removeAllRanges();
                                                                                                        selection.addRange(range);
                                                                                                    }
                                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                                    await handleInputOptions(q.question_no, 'option3', newContent);
                                                                                                };
                                                                                                reader.readAsDataURL(file);
                                                                                            } catch (error) {
                                                                                                console.error('Failed to upload pasted image:', error);
                                                                                            }
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                // Handle HTML content
                                                                                if (html) {
                                                                                    setIsUploading(true);
                                                                                    try {
                                                                                        const tempDiv = document.createElement("div");
                                                                                        tempDiv.innerHTML = html;
                                                                                        const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                                        for (let i = 0; i < images.length; i++) {
                                                                                            const img = images[i];
                                                                                            const originalSrc = img.getAttribute("src");
                                                                                            if (!originalSrc) continue;

                                                                                            if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                                try {
                                                                                                    const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                                    img.setAttribute("src", newUrl);
                                                                                                    img.removeAttribute("style");
                                                                                                } catch (error) {
                                                                                                    console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                                }
                                                                                            }
                                                                                        }

                                                                                        const processedHtml = tempDiv.innerHTML;
                                                                                        e.currentTarget.innerHTML = processedHtml;
                                                                                        await handleInputOptions(q.question_no, 'option3', processedHtml);
                                                                                    } catch (error) {
                                                                                        console.error("Error processing paste:", error);
                                                                                    } finally {
                                                                                        setIsUploading(false);
                                                                                    }
                                                                                } else if (text) {
                                                                                    e.currentTarget.textContent = text;
                                                                                    await handleInputOptions(q.question_no, 'option3', text);
                                                                                }
                                                                            }}
                                                                            onBlur={async (e) => {
                                                                                const newContent = e.currentTarget.innerHTML;
                                                                                await handleInputOptions(q.question_no, 'option3', newContent);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.ctrlKey && e.key === 's') {
                                                                                    e.preventDefault();
                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                    handleInputOptions(q.question_no, 'option3', newContent);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {q.option4 && (
                                                                <div
                                                                    className={`p-4 rounded-xl border-3 transition-all duration-200 hover:scale-102 ${
                                                                        q.correct_answer === "D"
                                                                            ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg ring-2 ring-green-200"
                                                                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start space-x-3">
                                                                        <span
                                                                            className={`font-bold text-lg px-3 py-1 rounded-full ${
                                                                                q.correct_answer === "D"
                                                                                    ? "bg-green-500 text-white"
                                                                                    : "bg-gray-300 text-gray-700"
                                                                            }`}
                                                                        >
                                                                          D
                                                                        </span>
                                                                        <div
                                                                            contentEditable={true}
                                                                            suppressContentEditableWarning={true}
                                                                            className="prose prose-sm max-w-none flex-1 p-2 border-2 border-transparent hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-200 cursor-text min-h-[40px] rounded-lg"
                                                                            dangerouslySetInnerHTML={{__html: q.option4}}
                                                                            onPaste={async (e) => {
                                                                                e.preventDefault();
                                                                                const html = e.clipboardData.getData("text/html");
                                                                                const text = e.clipboardData.getData("text/plain");

                                                                                // Handle image files (screenshots)
                                                                                const items = e.clipboardData.items;
                                                                                for (const item of items) {
                                                                                    if (item.type.indexOf('image') === 0) {
                                                                                        const file = item.getAsFile();
                                                                                        if (file) {
                                                                                            try {
                                                                                                const reader = new FileReader();
                                                                                                reader.onload = async (evt) => {
                                                                                                    const base64Image = evt.target?.result as string;
                                                                                                    const uploadedUrl = await uploadBase64ToImageKit(base64Image);
                                                                                                    const img = document.createElement('img');
                                                                                                    img.src = uploadedUrl;
                                                                                                    img.style.display = 'inline';
                                                                                                    img.style.verticalAlign = 'middle';
                                                                                                    img.style.margin = '0 4px';
                                                                                                    const selection = window.getSelection();
                                                                                                    if (selection && selection.rangeCount > 0) {
                                                                                                        const range = selection.getRangeAt(0);
                                                                                                        range.deleteContents();
                                                                                                        range.insertNode(img);
                                                                                                        range.setStartAfter(img);
                                                                                                        range.collapse(true);
                                                                                                        selection.removeAllRanges();
                                                                                                        selection.addRange(range);
                                                                                                    }
                                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                                    await handleInputOptions(q.question_no, 'option4', newContent);
                                                                                                };
                                                                                                reader.readAsDataURL(file);
                                                                                            } catch (error) {
                                                                                                console.error('Failed to upload pasted image:', error);
                                                                                            }
                                                                                            return;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                // Handle HTML content
                                                                                if (html) {
                                                                                    setIsUploading(true);
                                                                                    try {
                                                                                        const tempDiv = document.createElement("div");
                                                                                        tempDiv.innerHTML = html;
                                                                                        const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                                        for (let i = 0; i < images.length; i++) {
                                                                                            const img = images[i];
                                                                                            const originalSrc = img.getAttribute("src");
                                                                                            if (!originalSrc) continue;

                                                                                            if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                                try {
                                                                                                    const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                                    img.setAttribute("src", newUrl);
                                                                                                    img.removeAttribute("style");
                                                                                                } catch (error) {
                                                                                                    console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                                }
                                                                                            }
                                                                                        }

                                                                                        const processedHtml = tempDiv.innerHTML;
                                                                                        e.currentTarget.innerHTML = processedHtml;
                                                                                        await handleInputOptions(q.question_no, 'option4', processedHtml);
                                                                                    } catch (error) {
                                                                                        console.error("Error processing paste:", error);
                                                                                    } finally {
                                                                                        setIsUploading(false);
                                                                                    }
                                                                                } else if (text) {
                                                                                    e.currentTarget.textContent = text;
                                                                                    await handleInputOptions(q.question_no, 'option4', text);
                                                                                }
                                                                            }}
                                                                            onBlur={async (e) => {
                                                                                const newContent = e.currentTarget.innerHTML;
                                                                                await handleInputOptions(q.question_no, 'option4', newContent);
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.ctrlKey && e.key === 's') {
                                                                                    e.preventDefault();
                                                                                    const newContent = e.currentTarget.innerHTML;
                                                                                    handleInputOptions(q.question_no, 'option1', newContent);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Enhanced Integer Answer Display */}
                                                    {q.question_type === "integer" && (
                                                        <div
                                                            className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-400 rounded-2xl shadow-lg">
                                                            <div className="flex items-center justify-center space-x-4">
                                                                <span className="text-lg font-semibold text-green-700">Correct Answer:</span>
                                                                <span
                                                                    className="text-3xl font-bold text-green-800 bg-white px-6 py-3 rounded-xl shadow-md">
                                                              {q.correct_answer}

                                                            </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Enhanced Expand Button */}
                                                <button
                                                    onClick={() => toggleExpanded(q.question_no)}
                                                    className="ml-6 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
                                                >
                                                    {isExpanded ? <ChevronUp className="h-6 w-6"/> :
                                                        <ChevronDown className="h-6 w-6"/>}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Enhanced Expanded Content */}
                                        {isExpanded && (
                                            <div className="bg-white p-8 space-y-8">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    {/* Enhanced Answer Key Info */}
                                                    <div
                                                        className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
                                                        <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                                                            <FileText className="h-6 w-6 mr-3"/>
                                                            Answer Key
                                                        </h4>
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                                                <span className="text-blue-700 font-medium">Correct Answer:</span>
                                                                <input
                                                                    type="text"
                                                                    value={answerKeyItem?.answer || ""}
                                                                    onChange={(e) =>
                                                                        handleInputAnswerKey(q.question_no, "answer", e.target.value)
                                                                    }
                                                                    className="font-bold text-blue-900 bg-blue-100 px-4 py-2 rounded-full text-lg outline-none border border-blue-200 focus:border-blue-400"
                                                                />
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm">
                                                                <span className="text-blue-700 font-medium">Question Type:</span>
                                                                <select
                                                                    value={answerKeyItem?.question_type || ""}
                                                                    onChange={(e) =>
                                                                        handleInputAnswerKey(q.question_no, "question_type", e.target.value)
                                                                    }
                                                                    className="font-bold text-blue-900 bg-blue-100 px-4 py-2 rounded-full text-lg outline-none border border-blue-200 focus:border-blue-400"
                                                                >
                                                                    <option value="mcq">MCQ</option>
                                                                    <option value="integer">INTEGER</option>
                                                                </select>
                                                            </div>
                                                        </div>



                                                    </div>

                                                    {/* Enhanced Solution */}
                                                    {solution && (
                                                        <div
                                                            className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
                                                            <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                                                                <Target className="h-6 w-6 mr-3"/>
                                                                Solution
                                                            </h4>
                                                            <div className="bg-white rounded-xl p-4 shadow-sm">
                                                                <div
                                                                    contentEditable={true}
                                                                    suppressContentEditableWarning={true}
                                                                    className="prose prose-sm max-w-none text-green-800 p-2 border-2 border-transparent hover:border-green-300 focus:border-green-500 focus:outline-none transition-all duration-200 cursor-text min-h-[80px] rounded-lg"
                                                                    dangerouslySetInnerHTML={{__html: solution.solution}}
                                                                    onPaste={async (e) => {
                                                                        e.preventDefault();
                                                                        const html = e.clipboardData.getData("text/html");
                                                                        const text = e.clipboardData.getData("text/plain");

                                                                        // Handle image files (screenshots)
                                                                        const items = e.clipboardData.items;
                                                                        for (const item of items) {
                                                                            if (item.type.indexOf('image') === 0) {
                                                                                const file = item.getAsFile();
                                                                                if (file) {
                                                                                    try {
                                                                                        // Convert to base64
                                                                                        const reader = new FileReader();
                                                                                        reader.onload = async (evt) => {
                                                                                            const base64Image = evt.target?.result as string;

                                                                                            // Upload to ImageKit
                                                                                            const uploadedUrl = await uploadBase64ToImageKit(base64Image);

                                                                                            // Insert image at cursor
                                                                                            const img = document.createElement('img');
                                                                                            img.src = uploadedUrl;
                                                                                            img.style.display = 'inline';
                                                                                            img.style.verticalAlign = 'middle';
                                                                                            img.style.margin = '0 4px';

                                                                                            const selection = window.getSelection();
                                                                                            if (selection && selection.rangeCount > 0) {
                                                                                                const range = selection.getRangeAt(0);
                                                                                                range.deleteContents();
                                                                                                range.insertNode(img);
                                                                                                range.setStartAfter(img);
                                                                                                range.collapse(true);
                                                                                                selection.removeAllRanges();
                                                                                                selection.addRange(range);
                                                                                            }

                                                                                            // Save updated content
                                                                                            const newContent = e.currentTarget.innerHTML;
                                                                                            await handleInputQuestions(q.question_no, 'question_description', newContent);
                                                                                        };
                                                                                        reader.readAsDataURL(file);
                                                                                    } catch (error) {
                                                                                        console.error('Failed to upload pasted image:', error);
                                                                                    }
                                                                                    return; // Exit after handling image
                                                                                }
                                                                            }
                                                                        }

                                                                        // Handle HTML content (like your existing handlePaste)
                                                                        if (html) {
                                                                            setIsUploading(true);
                                                                            try {
                                                                                const tempDiv = document.createElement("div");
                                                                                tempDiv.innerHTML = html;
                                                                                const images = Array.from(tempDiv.querySelectorAll("img"));

                                                                                for (let i = 0; i < images.length; i++) {
                                                                                    const img = images[i];
                                                                                    const originalSrc = img.getAttribute("src");
                                                                                    if (!originalSrc) continue;

                                                                                    if (originalSrc.includes("googleusercontent.com") || originalSrc.startsWith('http')) {
                                                                                        try {
                                                                                            const newUrl = await uploadImageToImgageKit(originalSrc);
                                                                                            img.setAttribute("src", newUrl);
                                                                                            img.removeAttribute("style");
                                                                                        } catch (error) {
                                                                                            console.error(`Failed to upload image ${originalSrc}`, error);
                                                                                        }
                                                                                    }
                                                                                }

                                                                                const processedHtml = tempDiv.innerHTML;
                                                                                e.currentTarget.innerHTML = processedHtml;

                                                                                // Save the content
                                                                                // await handleInputQuestions(q.question_no, 'question_description', processedHtml);
                                                                                await handleInputSolutions(q.question_no, 'solution', processedHtml);
                                                                            } catch (error) {
                                                                                console.error("Error processing paste:", error);
                                                                            } finally {
                                                                                setIsUploading(false);
                                                                            }
                                                                        } else if (text) {
                                                                            // Handle plain text
                                                                            e.currentTarget.textContent = text;
                                                                            await handleInputSolutions(q.question_no, 'solution', text);
                                                                            // await handleInputQuestions(q.question_no, 'question_description', text);
                                                                        }
                                                                    }}
                                                                    onBlur={async (e) => {
                                                                        const newContent = e.currentTarget.innerHTML;
                                                                        await handleInputSolutions(q.question_no, 'solution', newContent);
                                                                    }}
                                                                    onKeyDown={(e) => {
                                                                        if (e.ctrlKey && e.key === 's') {
                                                                            e.preventDefault();
                                                                            const newContent = e.currentTarget.innerHTML;
                                                                            handleInputSolutions(q.question_no, 'solution', newContent);
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="text-xs text-gray-500 mt-2">
                                                                    💡 Click to edit solution. Press Ctrl+S to save manually.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Enhanced Solutions Tab */}
                    {activeTab === "solutions" && (
                        <div className="space-y-6">
                            {solutions.map((sol) => (
                                <div
                                    key={sol.question_no}
                                    className="border-2 border-gray-200 rounded-2xl p-8 bg-gradient-to-r from-white to-orange-50 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                                            <Target className="h-6 w-6 mr-3 text-orange-600"/>
                                            Solution {sol.question_no}
                                        </h3>
                                        <span
                                            className="inline-flex px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
                      Answer: {sol.answer}
                    </span>
                                    </div>
                                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div
                                            contentEditable={true}
                                            suppressContentEditableWarning={true}
                                            className="prose prose-lg max-w-none text-gray-700 p-2 border-2 border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none transition-all duration-200 cursor-text min-h-[100px] rounded-lg"
                                            dangerouslySetInnerHTML={{__html: sol.solution}}
                                            onBlur={async (e) => {
                                                const newContent = e.currentTarget.innerHTML;
                                                await handleInputSolutions(sol.question_no, 'solution', newContent);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.ctrlKey && e.key === 's') {
                                                    e.preventDefault();
                                                    const newContent = e.currentTarget.innerHTML;
                                                    handleInputSolutions(sol.question_no, 'solution', newContent);
                                                }
                                            }}
                                        />
                                        <div className="text-xs text-gray-500 mt-2">
                                            💡 Click to edit solution. Press Ctrl+S to save manually.
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Answer Key Tab */}
                    {activeTab === "answerkey" && (
                        <div className="overflow-hidden shadow-2xl ring-1 ring-black ring-opacity-5 rounded-2xl">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gradient-to-r from-gray-50 via-blue-50 to-indigo-50">
                                <tr>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Question No.
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                                        Correct Answer
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {answerKey.map((item, index) => (
                                    <tr
                                        key={item.question_no}
                                        className={`hover:bg-blue-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap text-lg font-bold text-gray-900">
                                            {item.question_no}
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <select
                                                value={item.question_type}
                                                onChange={(e) => handleInputAnswerKey(item.question_no, 'question_type', e.target.value)}
                                                className="inline-flex px-4 py-2 text-sm font-bold rounded-full shadow-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            >
                                                <option className="text-black bg-gradient-to-r" value="mcq">MCQ</option>
                                                <option className="text-black bg-gradient-to-r" value="integer">INTEGER</option>
                                            </select>
                                        </td>
                                        <td className="px-8 py-6 whitespace-nowrap text-lg font-bold text-gray-900">
                                            <input
                                                type="text"
                                                value={item.answer}
                                                onChange={(e) => handleInputAnswerKey(item.question_no, 'answer', e.target.value)}
                                                className="bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-xl font-mono text-xl shadow-md border-2 border-transparent focus:border-indigo-500 focus:outline-none transition-all duration-200"
                                            />
                                        </td>
                                    </tr>
                                ))}
                                </tbody>

                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Export & Firebase Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Export Section */}
                <div
                    className="bg-gradient-to-br from-indigo-50 to-purple-100 rounded-2xl shadow-xl border-2 border-indigo-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Download className="h-6 w-6 mr-3 text-indigo-600"/>
                        Export Data
                    </h3>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => exportData("json")}
                            className="flex items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 transform hover:scale-105"
                        >
                            <Download className="h-5 w-5 mr-2"/>
                            Export JSON
                        </button>
                        <button
                            onClick={() => exportData("csv")}
                            className="flex items-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 transform hover:scale-105"
                        >
                            <Download className="h-5 w-5 mr-2"/>
                            Export CSV
                        </button>
                    </div>
                </div>
                {/* MongoDB Upload Section */}
                <div
                    className="bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl shadow-xl border-2 border-orange-200 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Database className="h-6 w-6 mr-3 text-orange-600"/>
                        Upload to MongoDB
                    </h3>
                    <button
                        onClick={() => {
                            setShowFirebaseDialog(true)
                            console.log({selectedTopic})
                        }}
                        className="w-full flex items-center justify-center px-6 py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-4 focus:ring-orange-300 transition-all duration-200 transform hover:scale-105"
                    >
                        <Upload className="h-5 w-5 mr-2"/>
                        Upload to MongoDB
                    </button>
                </div>
            </div>

            {/* Enhanced MongoDB Dialog */}
            {showFirebaseDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <Database className="h-6 w-6 mr-3 text-orange-600"/>
                            Upload to MongoDB
                        </h3>

                        <div className="space-y-6">
                            {/* Subject Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                <div
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 min-h-[50px] flex items-center">
                                    {selectedSubject || "Enter subject name (e.g., Physics, Chemistry)"}
                                </div>
                            </div>

                            {/* Topic Display */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                                <div
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-800 min-h-[50px] flex items-center">
                                    {selectedChapter || "Enter topic name"}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    onClick={() => setShowFirebaseDialog(false)}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadToMongoDB}
                                    disabled={isUploading}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {isUploading ? "Uploading..." : "Upload"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Navigation */}
            <div className="flex justify-between">
                <button
                    onClick={onPrev}
                    className="flex items-center px-8 py-4 border-2 border-gray-300 rounded-xl shadow-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-200 transform hover:scale-105"
                >
                    <ArrowLeft className="h-5 w-5 mr-2"/>
                    Back to Solutions
                </button>

                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center px-8 py-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-200 transform hover:scale-105"
                >
                    <RefreshCw className="h-5 w-5 mr-2"/>
                    Start New Session
                </button>
            </div>
        </div>
    )
}
