"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Upload, BookOpen } from "lucide-react"
import type { AnswerKeyStepProps } from "@/types"

export default function AnswerKeyStep({ answerKey, setAnswerKey, onNext, selectedTopic, setSelectedTopic }: AnswerKeyStepProps) {
  const [html, setHtml] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const extractAnswerKey = async () => {
    if (!html.trim()) {
      setError("Please paste HTML content first")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      const response = await fetch("/api/extract-answer-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ htmlContent: html }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswerKey(data.answer_key)
        setSelectedTopic(data.topic || "General")
      } else {
        setError(data.error || "Failed to extract answer key")
      }
    } catch (err) {
      setError("Network error occurred")
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Answer Key Extraction</h2>
            <p className="text-gray-600">
              Paste your HTML content below to automatically extract the answer key and topic using AI processing.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="html-content" className="block text-sm font-medium text-gray-700 mb-2">
                HTML Content
              </label>
              <textarea
                  id="html-content"
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  value={html}
                  onChange={(e) => setHtml(e.target.value)}
                  placeholder="Paste your HTML content containing answer key here..."
              />
            </div>

            {error && (
                <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <button
                onClick={extractAnswerKey}
                disabled={isProcessing || !html.trim()}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing with AI...
                  </>
              ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Extract Answer Key & Topic
                  </>
              )}
            </button>
          </div>
        </div>

        {answerKey.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Extraction Successful</h3>
              </div>

              {/* Topic Display */}
              {selectedTopic && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Detected Topic</p>
                        <p className="text-lg font-semibold text-blue-900">{selectedTopic}</p>
                      </div>
                    </div>
                  </div>
              )}

              {/* Answer Key Table */}
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Answer Key ({answerKey.length} questions)</h4>
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Question No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Correct Answer
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {answerKey.map((item) => (
                        <tr key={item.question_no} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.question_no}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item.question_type === "mcq" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                            }`}
                        >
                          {item.question_type.toUpperCase()}
                        </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="bg-gray-100 px-3 py-1 rounded-md font-mono">{item.answer}</span>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6">
                <button
                    onClick={onNext}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Continue to Question Processing
                </button>
              </div>
            </div>
        )}
      </div>
  )
}
