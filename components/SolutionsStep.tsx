"use client"

import type React from "react"

import { useState, useRef } from "react"
import { AlertCircle, CheckCircle, Upload, FileText, ArrowLeft, ArrowRight } from "lucide-react"
import type { Solution, SolutionsStepProps } from "@/types"

function parseSolutionsFromHTML(html: string, questions: any[]): Solution[] {
  // Create temporary DOM element to work with HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Get the full HTML content
  const fullText = tempDiv.innerHTML;

  // Extract solution blocks using regex - pattern: (1.) (answer) solution content
  const solutionBlocks = fullText.split(/(?=\(\d+\.\))/g).filter(block => block.trim());

  const solutions: Solution[] = [];

  for (const block of solutionBlocks) {
    try {
      const solution = parseSolutionBlock(block, questions);
      if (solution) {
        solutions.push(solution);
      }
    } catch (error) {
      console.warn('Failed to parse solution block:', block.substring(0, 50) + '...', error);
    }
  }

  return solutions;
}

function makeImagesInline(html: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  tempDiv.querySelectorAll('img').forEach(img => {
    img.style.display = 'inline';
    img.style.verticalAlign = 'middle';
    img.style.margin = '0 4px';
  });
  return tempDiv.innerHTML;
}


function parseSolutionBlock(block: string, questions: any[]): Solution | null {
  // Extract question number from pattern like "(1.)"
  const questionNumberMatch = block.match(/\((\d+)\.\)/);
  if (!questionNumberMatch) return null;

  const questionNo = parseInt(questionNumberMatch[1], 10);

  // Remove the question number to get the content
  let content = block.replace(/\((\d+)\.\)/, '').trim();

  // Extract answer from pattern like "(C)" or "(B)" etc. right after question number
  const answerMatch = content.match(/^\s*\(([A-D])\)/);
  let answer = "";

  if (answerMatch) {
    answer = answerMatch[1];
    // Remove the answer from content to get the solution
    content = content.replace(/^\s*\([A-D]\)/, '').trim();
  }

  // Find corresponding question to get correct answer if not found
  const question = questions.find(q => q.question_no === questionNo);
  const finalAnswer = answer || question?.correct_answer || "";

  return {
    question_no: questionNo,
    // Clean and then make images inline
    solution: makeImagesInline(cleanHTML(content)),
    answer: finalAnswer
  };
}


function cleanHTML(html: string): string {
  // Remove extra whitespace and clean up HTML
  return html
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .trim();
}


export default function SolutionsStep({ solutions, setSolutions, questions, onNext, onPrev }: SolutionsStepProps) {
  const [currentHtml, setCurrentHtml] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const editorRef = useRef<HTMLDivElement>(null)

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

  const uploadImageToImgBB = async (imageUrl: string): Promise<string> => {
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
        .replace(/<br\s*\/?>\s*<br\s*\/?>/g, "<br>")
        .replace(/\n\s*\n/g, "\n")
        .replace(/&nbsp;/g, " ")
        .trim()
  }

  const handlePasteOld = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const html = e.clipboardData.getData("text/html")
    const text = e.clipboardData.getData("text/plain")

    if (html) {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadErrors([])

      try {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = html
        const images = Array.from(tempDiv.querySelectorAll("img"))
        let successCount = 0
        const errors: string[] = []

        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          const originalSrc = img.getAttribute("src")
          if (!originalSrc) continue

          if (originalSrc.includes("googleusercontent.com")) {
            try {
              const newUrl = await uploadImageToImgageKit(originalSrc)
              img.setAttribute("src", newUrl)
              img.removeAttribute("style")
              successCount++
            } catch (error) {
              errors.push(`Image ${i + 1}: Failed to upload`)
              console.error(`Failed to upload image ${originalSrc}`, error)
            }
          }
          setUploadProgress(Math.floor(((i + 1) / images.length) * 100))
        }

        setUploadErrors(errors)
        const cleanHtml = cleanWordHtml(tempDiv.innerHTML)
        const processedHtml = processHtml(cleanHtml)
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
        setIsUploading(false)
      }
    } else if (text) {
      setCurrentHtml(text)
      if (editorRef.current) {
        editorRef.current.textContent = text
      }
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault()
    const html = e.clipboardData.getData("text/html")
    const text = e.clipboardData.getData("text/plain")

    if (html) {
      setIsUploading(true)
      setUploadProgress(0)
      setUploadErrors([])

      try {
        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = html
        const images = Array.from(tempDiv.querySelectorAll("img"))
        let successCount = 0
        const errors: string[] = []

        const imagesToUpload: {element: HTMLImageElement; originalSrc: string; index:number}[] = [];

        for (let i = 0; i < images.length; i++) {
          const img = images[i]
          const originalSrc = img.getAttribute("src")
          if (!originalSrc) continue

          if (originalSrc.includes("googleusercontent.com")) {
            imagesToUpload.push({element: img, originalSrc, index: i});
          }
        }

        if(imagesToUpload.length > 0){
          try{
            const uploadUrls = await batchUploadImages(imagesToUpload.map(item => item.originalSrc))
            imagesToUpload.forEach((item, idx)=>{
              if(uploadUrls[idx]){
                item.element.setAttribute("src", uploadUrls[idx]);
                item.element.removeAttribute("style");
                successCount++;
              }
              else{
                errors.push(`Image ${item.index+1}: Failed to upload`)
              }
            })
          }
          catch(err){
            console.error("Batch upload failed:", error);
            errors.push("Batch upload failed");
          }
        }

        setUploadProgress(100);

        setUploadErrors(errors)
        const cleanHtml = cleanWordHtml(tempDiv.innerHTML)
        const processedHtml = processHtml(cleanHtml)
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
        setIsUploading(false)
      }
    } else if (text) {
      setCurrentHtml(text)
      if (editorRef.current) {
        editorRef.current.textContent = text
      }
    }
  }

  const batchUploadImages = async (imageUrls: string[]): Promise<string[]> => {
    // return imageUrls;
    try{
      const response = await fetch('/api/batch-upload-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({imageUrls})
      })
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`)
      }

      const data = await response.json();

      if(data.success){
        return data.results.map((result:any)=>result.success ? result.url : null);
      }
      else{
        throw new Error(`HTTP error! status: ${response.status}: ${response.statusText}`)
      }
    }
    catch(err){
      console.error("Batch upload failed:", err);
      throw err;
    }
  }

  const processSolutions = async () => {
    if (!currentHtml.trim()) {
      setError("Please paste solution content first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/extract-solutions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solutionsHTML: currentHtml }),
      })

      const data = await response.json()

      if (response.ok) {
        const newSolutions = data.solutions || []
        // Map correct answers from questions
        const solutionsWithAnswers = newSolutions.map((sol: Solution) => {
          const question = questions.find((q) => q.question_no === sol.question_no)
          return {
            ...sol,
            answer: question?.correct_answer || sol.answer,
          }
        })

        setSolutions([...solutions, ...solutionsWithAnswers])
        setCurrentHtml("")
        if (editorRef.current) {
          editorRef.current.innerHTML = ""
        }
      } else {
        setError(data.error || "Failed to process solutions")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const processSolutionsWithoutAI = async () => {
    if (!currentHtml.trim()) {
      setError("Please paste solution content first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Parse solutions using the new function
      const parsedSolutions = parseSolutionsFromHTML(currentHtml, questions);

      // Map answers from questions (additional safety)
      const solutionsWithAnswers = parsedSolutions.map((sol) => {
        const question = questions.find((q) => q.question_no === sol.question_no)
        return {
          ...sol,
          answer: sol.answer || question?.correct_answer || "",
        }
      })

      setSolutions([...solutions, ...solutionsWithAnswers])
      setCurrentHtml("")
      if (editorRef.current) {
        editorRef.current.innerHTML = ""
      }

      console.log(`Parsed ${solutionsWithAnswers.length} solutions successfully`);
    } catch (err) {
      setError("Parsing error occurred")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }


  const remainingSolutions = questions.length - solutions.length

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Solution Processing</h2>
            <p className="text-gray-600">
              Process solutions in batches. Paste your HTML content containing solutions below.
            </p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>Total Questions: {questions.length}</span>
              <span>Solutions Processed: {solutions.length}</span>
              <span>Remaining: {remainingSolutions}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label htmlFor="solutions-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Solutions Content (Batch Processing)
                </label>
                <div
                    ref={editorRef}
                    contentEditable
                    onPaste={handlePaste}
                    className="h-[300px] max-h-[300px] min-h-[300px] overflow-y-auto overflow-x-hidden p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                      lineHeight: "1.5"
                    }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Paste content containing multiple solutions. The AI will automatically separate and process them.
                </p>
              </div>

              {(isUploading || isProcessing) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                    {isUploading && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700">{uploadProgress}%</span>
                        </div>
                    )}
                    {isProcessing && (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                          <p className="text-sm text-orange-700">Processing solutions with AI...</p>
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

              <button
                  onClick={processSolutions}
                  disabled={!currentHtml || isProcessing}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Process Solutions (Batch)
                    </>
                )}
              </button>

              <button
                  onClick={processSolutionsWithoutAI}
                  disabled={!currentHtml || isProcessing}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Parse Solutions (No AI)
                    </>
                )}
              </button>
            </div>

            {/* Solutions List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Processed Solutions ({solutions.length}/{questions.length})
              </h3>

              <div className="max-h-96 overflow-y-auto space-y-3 border border-gray-200 rounded-md p-3">
                {solutions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No solutions processed yet</p>
                    </div>
                ) : (
                    solutions.map((sol) => (
                        <div key={sol.question_no} className="bg-gray-50 border border-gray-200 rounded-md p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-900">Solution {sol.question_no}</span>
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Answer: {sol.answer}
                      </span>
                          </div>
                          <div
                              className="text-sm text-gray-600 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: sol.solution.substring(0, 100) + "..." }}
                          />
                        </div>
                    ))
                )}
              </div>

              {solutions.length === questions.length && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700 font-medium">All solutions processed successfully!</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
