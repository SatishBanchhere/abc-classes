"use client"

import type React from "react"

import { useState, useRef } from "react"
import { AlertCircle, CheckCircle, Upload, FileText, ArrowLeft, ArrowRight } from "lucide-react"
import type { Question, QuestionsStepProps} from "@/types"

// Define option format types
type OptionFormat = 'numbers' | 'lowercase' | 'uppercase';

interface OptionFormatConfig {
  value: OptionFormat;
  label: string;
  pattern: RegExp;
  options: string[];
}

const OPTION_FORMATS: OptionFormatConfig[] = [
  {
    value: 'numbers',
    label: '(1) (2) (3) (4)',
    pattern: /\(([1-4])\)\s*([^()]*?)(?=\([1-4]\)|$)/g,
    options: ['1', '2', '3', '4']
  },
  {
    value: 'lowercase',
    label: '(a) (b) (c) (d)', // Removed the period
    pattern: /\(([a-d])\)\s*([^()]*?)(?=\([a-d]\)|$)/g, // Removed the period from pattern
    options: ['a', 'b', 'c', 'd']
  },
  {
    value: 'uppercase',
    label: '(A) (B) (C) (D)',
    pattern: /\(([A-D])\)\s*([^()]*?)(?=\([A-D]\)|$)/g,
    options: ['A', 'B', 'C', 'D']
  }
];

function parseQuestionsFromHTML(html: string, subtopics: string[], answerKey: any[] = [], optionFormat: OptionFormat = 'numbers'): Question[] {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get all content
  const fullHTML = tempDiv.innerHTML;

  // Split by question numbers - more robust pattern
  const questionBlocks = fullHTML.split(/(?=<[^>]*>\s*\(\d+\.\))/g)
      .filter(block => block.trim() && block.includes('('))
      .filter(block => /\(\d+\.\)/.test(block)); // Only blocks that actually contain question numbers

  const questions: Question[] = [];

  console.log(`Found ${questionBlocks.length} potential question blocks`);

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i];
    try {
      const question = parseQuestionBlock(block, subtopics, answerKey, optionFormat);
      if (question) {
        questions.push(question);
        console.log(`Successfully parsed question ${question.question_no}`);
      }
    } catch (error) {
      console.warn(`Failed to parse question block ${i + 1}:`, error);
      console.log('Block content:', block.substring(0, 200) + '...');
    }
  }

  return questions;
}

function parseQuestionBlock(block: string, subtopics: string[], answerKey: any[], optionFormat: OptionFormat): Question | null {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = block;

  // Extract question number (with period for questions)
  const questionNumberMatch = block.match(/\((\d+)\.\)/);
  if (!questionNumberMatch) return null;

  const questionNo = parseInt(questionNumberMatch[1], 10);

  let questionDescription = '';
  let optionsFound = false;
  const options = [null, null, null, null];

  // Define option patterns based on format
  let optionPattern: RegExp;
  let optionExtractPattern: RegExp;

  switch (optionFormat) {
    case 'numbers':
      optionPattern = /\(([1-4])\)\s*/;
      optionExtractPattern = /\(([1-4])\)/;
      break;
    case 'lowercase':
      optionPattern = /\(([a-d])\)\s*/;
      optionExtractPattern = /\(([a-d])\)/;
      break;
    case 'uppercase':
      optionPattern = /\(([A-D])\)\s*/;
      optionExtractPattern = /\(([A-D])\)/;
      break;
    default:
      optionPattern = /\(([1-4])\)\s*/;
      optionExtractPattern = /\(([1-4])\)/;
  }

  // First pass: Identify where options start
  const allParagraphs = tempDiv.querySelectorAll('p');
  let optionStartIndex = -1;
  let tableElement = null;

  // Find where options begin or if there's a table
  for (let i = 0; i < allParagraphs.length; i++) {
    const p = allParagraphs[i];
    const pText = p.textContent || '';

    // Check if this paragraph contains option markers
    if (pText.match(optionExtractPattern)) {
      optionStartIndex = i;
      optionsFound = true;
      break;
    }
  }

  // Check for table containing options
  const table = tempDiv.querySelector('table');
  if (table) {
    tableElement = table;
    optionsFound = true;
  }

  // Second pass: Build question description (everything before options)
  let questionParts = [];

  for (let i = 0; i < allParagraphs.length; i++) {
    const p = allParagraphs[i];
    const pText = p.textContent || '';
    const pHTML = p.innerHTML || '';

    // If this paragraph contains the question number
    if (pText.includes(`(${questionNo}.)`)) {
      // Extract content after question number, preserving all HTML including images
      const contentAfterNumber = pHTML.replace(/\(\d+\.\)\s*(&nbsp;)*\s*/i, '').trim();
      if (contentAfterNumber) {
        questionParts.push(contentAfterNumber);
      }
    }
    // If we haven't reached options yet and this isn't empty
    else if ((optionStartIndex === -1 || i < optionStartIndex) && pText.trim() && !pText.match(optionExtractPattern)) {
      // Include this paragraph as part of question description
      questionParts.push(pHTML.trim());
    }
    // Stop if we've reached the options
    else if (optionsFound && i >= optionStartIndex) {
      break;
    }
  }

  // Join all question parts, preserving images and formatting
  questionDescription = questionParts.join(' ').trim();

  // Third pass: Extract options
  if (tableElement) {
    // Extract options from table
    const cells = tableElement.querySelectorAll('td');

    cells.forEach(cell => {
      const cellHTML = cell.innerHTML;
      const cellText = cell.textContent || '';
      const optionMatch = cellText.match(optionExtractPattern);

      if (optionMatch) {
        let optionIndex: number;

        if (optionFormat === 'numbers') {
          optionIndex = parseInt(optionMatch[1]) - 1;
        } else if (optionFormat === 'lowercase') {
          optionIndex = optionMatch[1].charCodeAt(0) - 'a'.charCodeAt(0);
        } else if (optionFormat === 'uppercase') {
          optionIndex = optionMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        }

        if (optionIndex >= 0 && optionIndex <= 3) {
          // Remove option marker but keep all other HTML including images
          const optionContent = cellHTML.replace(optionPattern, '').replace(/^(&nbsp;|\s)+/, '').trim();
          options[optionIndex] = optionContent;
        }
      }
    });
  } else if (optionStartIndex !== -1) {
    // Extract options from paragraphs
    for (let i = optionStartIndex; i < allParagraphs.length; i++) {
      const p = allParagraphs[i];
      const pText = p.textContent || '';
      const pHTML = p.innerHTML || '';
      const optionMatch = pText.match(optionExtractPattern);

      if (optionMatch) {
        let optionIndex: number;

        if (optionFormat === 'numbers') {
          optionIndex = parseInt(optionMatch[1]) - 1;
        } else if (optionFormat === 'lowercase') {
          optionIndex = optionMatch[1].charCodeAt(0) - 'a'.charCodeAt(0);
        } else if (optionFormat === 'uppercase') {
          optionIndex = optionMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
        }

        if (optionIndex >= 0 && optionIndex <= 3) {
          // Remove option marker but preserve all other HTML
          const optionContent = pHTML.replace(optionPattern, '').replace(/^(&nbsp;|\s)+/, '').trim();
          options[optionIndex] = optionContent;
        }
      }
    }
  }

  // Clean up question description while preserving images
  questionDescription = questionDescription
      .replace(/(&nbsp;){2,}/g, ' ') // Replace multiple &nbsp; with single space
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();

  // Determine question type
  const hasOptions = options.some(option => option !== null && option !== '');
  const questionType = hasOptions ? "mcq" : "integer";

  // Find correct answer from answer key
  const answerKeyItem = answerKey.find(ak => ak.question_no === questionNo);
  const correctAnswer = answerKeyItem?.answer || "";

  // Assign subtopic and assess difficulty
  const subtopic = assignSubtopic(questionDescription, subtopics);
  const difficulty = assessDifficulty(questionDescription);

  console.log(`Question ${questionNo}:`, {
    questionDescription: questionDescription.substring(0, 200) + '...',
    options: options.map((opt, i) => opt ? `Option ${i+1}: ${opt.substring(0, 100)}...` : null),
    hasOptions,
    optionFormat
  });

  return {
    question_no: questionNo,
    question_type: questionType,
    question_description: cleanHTML(questionDescription),
    option1: options[0] ? cleanHTML(options[0]) : null,
    option2: options[1] ? cleanHTML(options[1]) : null,
    option3: options[2] ? cleanHTML(options[2]) : null,
    option4: options[3] ? cleanHTML(options[3]) : null,
    correct_answer: correctAnswer,
    difficulty,
    subtopic
  };
}

// Updated cleanHTML function to preserve images
function cleanHTML(html: string): string {
  if (!html) return '';

  // Clean up HTML while preserving images and essential formatting
  return html
      .replace(/(&nbsp;){2,}/g, ' ') // Replace multiple &nbsp; with space
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/>\s+</g, '><') // Remove spaces between tags
      .trim();
}



function assignSubtopic(questionText: string, subtopics: string[]): string {
  const lowerText = questionText.toLowerCase();

  // Simple keyword matching for subtopic assignment
  const keywordMap: Record<string, string[]> = {
    'electromagnetic_induction': ['inductor', 'inductance', 'magnetic field', 'emf', 'flux', 'coil'],
    'circuits': ['resistor', 'resistance', 'battery', 'current', 'circuit'],
    'magnetism': ['magnetic', 'solenoid', 'field'],
    // Add more mappings as needed
  };

  for (const subtopic of subtopics) {
    const keywords = keywordMap[subtopic.toLowerCase().replace(/\s+/g, '_')] || [];
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return subtopic;
    }
  }

  // Default to first subtopic or 'General'
  return subtopics.length > 0 ? subtopics[0] : 'General';
}

function assessDifficulty(questionText: string): "easy" | "medium" | "hard" {
  const text = questionText.toLowerCase();

  // Simple heuristic based on keywords and length
  const hardKeywords = ['complex', 'advanced', 'derive', 'prove', 'analyze'];
  const easyKeywords = ['basic', 'simple', 'find', 'calculate'];

  if (hardKeywords.some(keyword => text.includes(keyword)) || questionText.length > 300) {
    return 'hard';
  } else if (easyKeywords.some(keyword => text.includes(keyword)) || questionText.length < 100) {
    return 'easy';
  }

  return 'medium';
}

function cleanHTMLold(html: string): string {
  // Remove extra whitespace and clean up HTML
  return html
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
}

// Add this helper function after your upload functions
const convertImagesToInline = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Set inline styles for all images
  tempDiv.querySelectorAll('img').forEach(img => {
    img.style.display = 'inline';
    img.style.verticalAlign = 'middle';
    img.style.margin = '0 4px';
  });

  return tempDiv.innerHTML;
};


export default function QuestionsStep({ questions, setQuestions, answerKey, onNext, onPrev, subtopics }: QuestionsStepProps) {
  // State for Box 1 (AI Processing)
  const [currentHtml1, setCurrentHtml1] = useState("")
  const [isProcessing1, setIsProcessing1] = useState(false)
  const [isUploading1, setIsUploading1] = useState(false)
  const [uploadProgress1, setUploadProgress1] = useState(0)
  const [error1, setError1] = useState("")
  const [uploadErrors1, setUploadErrors1] = useState<string[]>([])
  const [selectedOptionFormat1, setSelectedOptionFormat1] = useState<OptionFormat>('numbers')
  const editorRef1 = useRef<HTMLDivElement>(null)

  // State for Box 2 (Manual Processing)
  const [currentHtml2, setCurrentHtml2] = useState("")
  const [isProcessing2, setIsProcessing2] = useState(false)
  const [isUploading2, setIsUploading2] = useState(false)
  const [uploadProgress2, setUploadProgress2] = useState(0)
  const [error2, setError2] = useState("")
  const [uploadErrors2, setUploadErrors2] = useState<string[]>([])
  const [selectedOptionFormat2, setSelectedOptionFormat2] = useState<OptionFormat>('numbers')
  const editorRef2 = useRef<HTMLDivElement>(null)

  let imgbbKeyIndex = 0;

  const imgbbKeys = [
    "2dfb9cad799cf7777bfa71cb3907a3bc",
    "1fe17867594b2137892a90a463ebf120",
    "2f25c3e32c9082b12c9a5bf021f1ac51",
    "1407a5be98d5071bb1cc43454c2a2de3",
    "a6dd8f4f434d674283299baada6e8483",
    "2a1453bbbaf18bc3c637d0c76c9d72b7",
    "0fe4e8e268b7ccf431b384c528924bce",
    "7a476eca22c5c8e30411aa90295f925a",
    "2e389b96ea81fc13592acd8c68cdfd07",
    "5a9378166a4a2d45a332fa8cfac6a193",
    "208840b14bf426da11a8b074984a7a63",
    "fd7bbddbbdaddaebe6f45e4b1831bfaa",
    "9df031f4faca7945fcb74f88ce399ae8",
    "98bbf140c38cace85319b9b8459fc215",
    "ee5e9bc93e3d6017a8dc3c0ae63abdc9",
    "dfe0ab87bdb50fa14f19ffc2ebfea981",
    "b666525694f1ff7eced8b53cd5082ed9",
    "10daa814708db34597341f4581e2c94d",
    "88b8ea89634ee5a0d35964e59c53d27c",
    "1ed826483d1cae41659be4f59da2232b"
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadImageToImgBBOld = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

      const blob = await response.blob();
      const file = new File([blob], "upload.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("image", file);

      // Try keys starting from current imgbbKeyIndex
      for (let attempt = 0; attempt < imgbbKeys.length; attempt++) {
        const index = (imgbbKeyIndex + attempt) % imgbbKeys.length;
        const key = imgbbKeys[index];

        try {
          const imgbbResponse = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
            method: "POST",
            body: formData
          });

          if (!imgbbResponse.ok) {
            console.warn(`Key ${index + 1} failed with status ${imgbbResponse.status}`);
            await sleep(2000);
            continue;
          }

          const data = await imgbbResponse.json();
          console.log(`Uploaded using key ${index + 1}`, data);

          // Update state so next call starts from the next key
          imgbbKeyIndex = (index + 1) % imgbbKeys.length;
          return data.data.url;

        } catch (err) {
          console.warn(`Error with key ${index + 1}:`, err);
          await sleep(2000);
        }
      }

      throw new Error("All ImgBB keys failed to upload");

    } catch (error) {
      console.error("Final error uploading image:", error);
      throw error;
    }
  };

  const uploadImageToImgageKit = async (imageUrl: string): Promise<string> => {
    // return imageUrl;
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

      const blob = await response.blob();
      const file = new File([blob], "upload.jpg", { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", "upload.jpg");

      // Create basic auth header for ImageKit
      const auth = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`);

      // FIXED: Use the correct ImageKit upload endpoint
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

  const processHtml = (html: string) => {
    let processed = html
    processed = processed.replace(/>\s+</g, "><")
    processed = processed.replace(/<span[^>]*>\s*(<img[^>]+>)\s*<\/span>/g, "$1")
    processed = processed.replace(/<\/?span[^>]*>/g, "")
    processed = processed.replace(/(<img[^>]+>)\s*/g, "$1")
    processed = processed.replace(/<img([^>]*?)>/g, (match, rest) => {
      if (rest.includes("style=")) return match
      const widthMatch = rest.match(/width="(\d+)"/)
      const width = widthMatch ? Number.parseInt(widthMatch[1], 10) : 0
      return width >= 100
          ? `<img${rest} style="display: block; margin: 4px 0;">`
          : `<img${rest} style="display: inline-block; vertical-align: middle;">`
    })
    return processed
  }

  const cleanWordHtml = (html: string): string => {
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html
    const elements = tempDiv.querySelectorAll("*:not(img)")
    elements.forEach((el) => {
      el.removeAttribute("style")
      el.removeAttribute("class")
      if (el.tagName === "P" && el.innerHTML.trim() === "") {
        el.remove()
      }
    })
    return tempDiv.innerHTML
        .replace(/<br\s*\/?>s*<br\s*\/?>/g, "<br>")
        .replace(/\n\s*\n/g, "\n")
        .replace(/&nbsp;/g, " ")
        .trim()
  }

  const handlePaste = async (e: React.ClipboardEvent, boxNumber: 1 | 2) => {
    e.preventDefault()
    const html = e.clipboardData.getData("text/html")
    const text = e.clipboardData.getData("text/plain")

    console.log(`[handlePaste] boxNumber=${boxNumber}`)
    console.log(`[handlePaste] Raw HTML length: ${html?.length || 0}`)
    console.log(`[handlePaste] Raw Text length: ${text?.length || 0}`)

    const setIsUploading = boxNumber === 1 ? setIsUploading1 : setIsUploading2
    const setUploadProgress = boxNumber === 1 ? setUploadProgress1 : setUploadProgress2
    const setUploadErrors = boxNumber === 1 ? setUploadErrors1 : setUploadErrors2
    const setCurrentHtml = boxNumber === 1 ? setCurrentHtml1 : setCurrentHtml2
    const editorRef = boxNumber === 1 ? editorRef1 : editorRef2

    if (html) {
      console.log(`[handlePaste] Detected HTML paste`)
      setIsUploading(true)
      setUploadProgress(0)
      setUploadErrors([])

      try {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = html
        const images = Array.from(tempDiv.querySelectorAll("img"))
        console.log(`[handlePaste] Found ${images.length} <img> tags in pasted HTML`)

        let successCount = 0
        const errors: string[] = []

        const googleImagesToUpload: {element: HTMLImageElement; originalSrc: string; index: number}[] = []
        const base64ImagesToUpload: {element: HTMLImageElement; originalSrc: string; index: number}[] = []

        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          const originalSrc = img.getAttribute("src")
          if (!originalSrc) continue

          if (originalSrc.includes("googleusercontent.com")) {
            console.log(`[handlePaste] Google image detected at index ${i}`)
            googleImagesToUpload.push({element: img, originalSrc, index: i})
          } else if (originalSrc.startsWith("data:image/")) {
            console.log(`[handlePaste] Base64 image detected at index ${i}`)
            base64ImagesToUpload.push({element: img, originalSrc, index: i})
          } else {
            console.log(`[handlePaste] Skipping image at index ${i}, src=${originalSrc}`)
          }
        }

        // Process Google Drive images
        if (googleImagesToUpload.length > 0) {
          console.log(`[handlePaste] Uploading ${googleImagesToUpload.length} Google images...`)
          try {
            const uploadUrls = await batchUploadImages(googleImagesToUpload.map(item => item.originalSrc))
            googleImagesToUpload.forEach((item, idx) => {
              if (uploadUrls[idx]) {
                console.log(`[handlePaste] Google image ${item.index + 1} uploaded successfully`)
                item.element.setAttribute("src", uploadUrls[idx])
                item.element.removeAttribute("style")
                successCount++
              } else {
                console.warn(`[handlePaste] Google image ${item.index + 1} failed to upload`)
                errors.push(`Google Image ${item.index + 1}: Failed to upload`)
              }
            })
          } catch (err) {
            console.error("Google images batch upload failed:", err)
            errors.push("Google images batch upload failed")
          }
        }

        // Process base64 images
        if (base64ImagesToUpload.length > 0) {
          console.log(`[handlePaste] Uploading ${base64ImagesToUpload.length} base64 images...`)
          try {
            const uploadUrls = await batchUploadBase64Images(base64ImagesToUpload.map(item => item.originalSrc))
            base64ImagesToUpload.forEach((item, idx) => {
              if (uploadUrls[idx]) {
                console.log(`[handlePaste] Base64 image ${item.index + 1} uploaded successfully`)
                item.element.setAttribute("src", uploadUrls[idx])
                item.element.removeAttribute("style")
                successCount++
              } else {
                console.warn(`[handlePaste] Base64 image ${item.index + 1} failed to upload`)
                errors.push(`Base64 Image ${item.index + 1}: Failed to upload`)
              }
            })
          } catch (err) {
            console.error("Base64 images batch upload failed:", err)
            errors.push("Base64 images batch upload failed")
          }
        }

        console.log(`[handlePaste] Upload complete: ${successCount} successful, ${errors.length} errors`)
        setUploadProgress(100)
        setUploadErrors(errors)

        const cleanHtml = cleanWordHtml(tempDiv.innerHTML)
        const processedHtml = processHtml(cleanHtml)
        console.log(`[handlePaste] Final processed HTML length: ${processedHtml.length}`)

        setCurrentHtml(processedHtml)
        if (editorRef.current) {
          editorRef.current.innerHTML = processedHtml
        }
      } catch (error) {
        console.error("Error processing paste:", error)
        const processedHtml = cleanWordHtml(html)
        setCurrentHtml(processedHtml)
        if (editorRef.current) {
          editorRef.current.innerHTML = processedHtml
        }
      } finally {
        console.log(`[handlePaste] Done. Resetting upload state.`)
        setIsUploading(false)
      }
    } else if (text) {
      console.log(`[handlePaste] Plain text paste detected`)
      setCurrentHtml(text)
      if (editorRef.current) {
        editorRef.current.textContent = text
      }
    } else {
      console.warn(`[handlePaste] Nothing to paste`)
    }
  }

  const batchUploadBase64Images = async (base64DataUrls: string[]): Promise<string[]> => {
    try {
      const response = await fetch('/api/batch-upload-base64-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Images: base64DataUrls })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        return data.results.map((result: any) => result.success ? result.url : null)
      } else {
        throw new Error(`Base64 upload failed: ${data.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error("Base64 batch upload failed:", err)
      throw err
    }
  }

  const batchUploadImages = async (imageUrls: string[]): Promise<string[]> => {
    try {
      const response = await fetch('/api/batch-upload-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        return data.results.map((result: any) => result.success ? result.url : null)
      } else {
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      console.error("Batch upload failed:", err)
      throw err
    }
  }

  const processQuestions = async (boxNumber: 1 | 2) => {
    const currentHtml = boxNumber === 1 ? currentHtml1 : currentHtml2
    const selectedOptionFormat = boxNumber === 1 ? selectedOptionFormat1 : selectedOptionFormat2
    const setIsProcessing = boxNumber === 1 ? setIsProcessing1 : setIsProcessing2
    const setError = boxNumber === 1 ? setError1 : setError2
    const setCurrentHtml = boxNumber === 1 ? setCurrentHtml1 : setCurrentHtml2
    const editorRef = boxNumber === 1 ? editorRef1 : editorRef2

    if (!currentHtml.trim()) {
      setError("Please paste question content first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      console.log(subtopics)
      const response = await fetch("/api/extract-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionsHTML: currentHtml, subtopics, optionFormat: selectedOptionFormat }),
      })

      const data = await response.json()

      if (response.ok) {
        const newQuestions = data.questions || []
        // Map correct answers from answer key
        const questionsWithAnswers = newQuestions.map((q: Question) => {
          const answerKeyItem = answerKey.find((ak) => ak.question_no === q.question_no)
          return {
            ...q,
            correct_answer: answerKeyItem?.answer || q.correct_answer,
          }
        })

        setQuestions([...questions, ...questionsWithAnswers])
        setCurrentHtml("")
        if (editorRef.current) {
          editorRef.current.innerHTML = ""
        }
      } else {
        setError(data.error || "Failed to process questions")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const processQuestionsWithoutAI = async (boxNumber: 1 | 2) => {
    const currentHtml = boxNumber === 1 ? currentHtml1 : currentHtml2
    const selectedOptionFormat = boxNumber === 1 ? selectedOptionFormat1 : selectedOptionFormat2
    const setIsProcessing = boxNumber === 1 ? setIsProcessing1 : setIsProcessing2
    const setError = boxNumber === 1 ? setError1 : setError2
    const setCurrentHtml = boxNumber === 1 ? setCurrentHtml1 : setCurrentHtml2
    const editorRef = boxNumber === 1 ? editorRef1 : editorRef2

    if (!currentHtml.trim()) {
      setError("Please paste question content first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Convert subtopics to string array
      const subtopicNames = subtopics.map((topic: { name: string }) => topic.name)

      // Parse questions using the new function with selected option format
      const parsedQuestions = parseQuestionsFromHTML(currentHtml, subtopicNames, answerKey, selectedOptionFormat)

      // Apply inline image styles to all parsed questions
      const questionsWithInlineImages = parsedQuestions.map((q) => ({
        ...q,
        question_description: convertImagesToInline(q.question_description),
        option1: q.option1 ? convertImagesToInline(q.option1) : null,
        option2: q.option2 ? convertImagesToInline(q.option2) : null,
        option3: q.option3 ? convertImagesToInline(q.option3) : null,
        option4: q.option4 ? convertImagesToInline(q.option4) : null,
      }))

      // Map correct answers from answerKey (additional safety)
      const questionsWithAnswers = questionsWithInlineImages.map((q) => {
        const answerKeyItem = answerKey.find((ak) => ak.question_no === q.question_no)
        return {
          ...q,
          correct_answer: answerKeyItem?.answer || q.correct_answer,
        }
      })

      setQuestions([...questions, ...questionsWithAnswers])
      setCurrentHtml("")
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }

      console.log(`Parsed ${questionsWithAnswers.length} questions successfully with format: ${selectedOptionFormat}`)
    } catch (err) {
      setError("Parsing error occurred")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const remainingQuestions = answerKey.length - questions.length

  const renderProcessingBox = (boxNumber: 1 | 2, title: string, description: string) => {
    const currentHtml = boxNumber === 1 ? currentHtml1 : currentHtml2
    const isProcessing = boxNumber === 1 ? isProcessing1 : isProcessing2
    const isUploading = boxNumber === 1 ? isUploading1 : isUploading2
    const uploadProgress = boxNumber === 1 ? uploadProgress1 : uploadProgress2
    const error = boxNumber === 1 ? error1 : error2
    const uploadErrors = boxNumber === 1 ? uploadErrors1 : uploadErrors2
    const selectedOptionFormat = boxNumber === 1 ? selectedOptionFormat1 : selectedOptionFormat2
    const setSelectedOptionFormat = boxNumber === 1 ? setSelectedOptionFormat1 : setSelectedOptionFormat2
    const editorRef = boxNumber === 1 ? editorRef1 : editorRef2

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>

          <div className="space-y-4">
            {/* Option Format Selector */}
            <div>
              <label htmlFor={`option-format-${boxNumber}`} className="block text-sm font-medium text-gray-700 mb-2">
                Option Format
              </label>
              <select
                  id={`option-format-${boxNumber}`}
                  value={selectedOptionFormat}
                  onChange={(e) => setSelectedOptionFormat(e.target.value as OptionFormat)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {OPTION_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`questions-content-${boxNumber}`} className="block text-sm font-medium text-gray-700 mb-2">
                Questions Content
              </label>
              <div
                  ref={editorRef}
                  contentEditable
                  onPaste={(e) => handlePaste(e, boxNumber)}
                  className="h-[300px] max-h-[300px] min-h-[300px] overflow-y-auto overflow-x-hidden p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                  style={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                    lineHeight: "1.5"
                  }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste content containing questions using the selected option format.
              </p>
            </div>

            {(isUploading || isProcessing) && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  {isUploading && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-700">{uploadProgress}%</span>
                      </div>
                  )}
                  {isProcessing && (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <p className="text-sm text-blue-700">Processing questions with {selectedOptionFormat} format...</p>
                      </div>
                  )}
                  {uploadErrors.length > 0 && (
                      <p className="text-xs text-red-600 mt-1">{uploadErrors.length} images failed to upload</p>
                  )}
                </div>
            )}

            {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="flex space-x-2">
              <button
                  onClick={() => processQuestions(boxNumber)}
                  disabled={!currentHtml || isProcessing}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      AI Process
                    </>
                )}
              </button>

              <button
                  onClick={() => processQuestionsWithoutAI(boxNumber)}
                  disabled={!currentHtml || isProcessing}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Parse Only
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Question Processing</h2>
            <p className="text-gray-600">
              Process up to 10 questions at a time using either box. Each box can handle different question formats.
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Total Questions: {answerKey.length}</span>
              <span>Processed: {questions.length}</span>
              <span>Remaining: {remainingQuestions}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Box 1 */}
            {renderProcessingBox(1, "Processing Box 1", "Use this box for your first batch of questions")}

            {/* Processing Box 2 */}
            {renderProcessingBox(2, "Processing Box 2", "Use this box for your second batch of questions")}
          </div>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Processed Questions ({questions.length}/{answerKey.length})
          </h3>

          <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-md p-3">
            {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No questions processed yet</p>
                </div>
            ) : (
                questions.map((q) => (
                    <div
                        key={q.question_no}
                        className="bg-gray-50 border border-gray-200 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Question {q.question_no}
                        </span>
                        <div className="flex space-x-2">
                          <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  q.question_type === "mcq"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-green-100 text-green-800"
                              }`}
                          >
                            {q.question_type.toUpperCase()}
                          </span>
Q
                          {q.subtopic && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                {q.subtopic}
                              </span>
                          )}

                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Answer: {q.correct_answer}
                          </span>
                        </div>
                      </div>

                      <div
                          className="text-sm text-gray-600 line-clamp-2"
                          dangerouslySetInnerHTML={{
                            __html: q.question_description.substring(0, 100) + "...",
                          }}
                      />
                    </div>
                ))
            )}
          </div>

          {questions.length === answerKey.length && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md mt-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700 font-medium">All questions processed successfully!</p>
              </div>
          )}
        </div>
      </div>
  )
}