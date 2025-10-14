"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

const TestPaperContent = () => {
    const searchParams = useSearchParams()
    const testId = searchParams.get("id") // pulls from ?id=...
    const [testData, setTestData] = useState(null)
    const [questions, setQuestions] = useState([])
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (!testId) return // wait until id is available
        try {
            const storedData = sessionStorage.getItem(testId)
            if (storedData) {
                const parsedData = JSON.parse(storedData)
                setTestData(parsedData)
                setQuestions(parsedData.questions || [])
                setIsReady(true)
                // optional: remove after loading
                setTimeout(() => {
                    sessionStorage.removeItem(testId)
                }, 1000)
            } else {
                console.error("No data found in session storage")
            }
        } catch (error) {
            console.error("Error retrieving test data:", error)
        }
    }, [testId])

    const calculateTotalMarks = () => {
        return questions.length * (testData?.correctMarks || 0)
    }

    // Helper function to safely render HTML content
    const createMarkup = (htmlString) => {
        return { __html: htmlString || "" }
    }

    // Helper function to render questions HTML for print window
    const renderQuestionsHtml = (questions, testData) => {
        let questionsHtml = ""
        questions.forEach((question, index) => {
            const questionNumber = index + 1
            const optionsHtml =
                question.question_type === "mcq" && question.options
                    ? `<div class="options-container">
                    ${Object.entries(question.options)
                        .map(([key, value]) => {
                            if (!value) return ""
                            return `
                            <div class="option-item">
                                <div class="option-letter">${key}</div>
                                <div class="option-content html-content">${value || ""}</div>
                            </div>
                        `
                        })
                        .join("")}
                </div>`
                    : ""

            const integerAnswerHtml =
                question.question_type === "integer"
                    ? `<div style="margin-top: 20px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;">
                    <strong>Answer:</strong> _______________
                </div>`
                    : ""

            questionsHtml += `
                <div class="question-container">
                    <div class="question-header">
                        <div class="question-number">Q.${questionNumber}</div>
                        <div class="question-badge">${question.question_type?.toUpperCase() || "MCQ"}</div>
                        <div class="question-badge">${question.difficulty?.toUpperCase() || "MEDIUM"}</div>
                        <div style="margin-left: auto; font-size: 10pt;">
                            [${testData.correctMarks} Mark${testData.correctMarks !== 1 ? "s" : ""}]
                        </div>
                    </div>
                    <div class="question-content">
                        <div class="question-text html-content">${question.question_description || ""}</div>
                        ${optionsHtml}
                        ${integerAnswerHtml}
                    </div>
                </div>
            `
        })
        return questionsHtml
    }

    // Helper function to generate the full HTML content for the print window
    const generatePrintHtml = (layoutType) => {
        const isCompressed = layoutType === "compressed"

        const headerHtml = `
            <header class="header-section">
                <h1 class="institute-name">ABC CLASSES</h1>
                <div class="test-title">${testData.title || "Test Paper"}</div>
                <div class="test-info">
                    <div>
                        <strong>Subject:</strong> ${testData.subject || ""}
                    </div>
                    <div>
                        <strong>Topic:</strong> ${testData.topic || ""}
                    </div>
                    <div>
                        <strong>Date:</strong> ${new Date().toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Time:</strong> ${testData.totalTime} minutes
                    </div>
                    <div>
                        <strong>Total Marks:</strong> ${calculateTotalMarks()}
                    </div>
                </div>
            </header>
        `

        const studentInfoHtml = `
            <div class="student-info">
                <div class="info-row">
                    <span>
                        <strong>Name:</strong> _________________________
                    </span>
                    <span>
                        <strong>Roll No.:</strong> ___________
                    </span>
                    <span>
                        <strong>Class:</strong> ___________
                    </span>
                </div>
                <div class="info-row">
                    <span>
                        <strong>Father's Name:</strong> _________________________
                    </span>
                    <span>
                        <strong>Date:</strong> ___________
                    </span>
                </div>
            </div>
        `

        const instructionsHtml = `
            <div class="instructions-box">
                <h3 class="instructions-title">INSTRUCTIONS</h3>
                <div class="instructions-grid">
                    <div>
                        • Each question carries <strong>${testData.correctMarks} marks</strong>
                    </div>
                    <div>
                        • Wrong answer deducts <strong>${Math.abs(testData.wrongMarks)} marks</strong>
                    </div>
                    <div>• Fill the OMR sheet carefully with HB pencil</div>
                    <div>• No rough work on question paper</div>
                    <div>• Mobile phones are strictly prohibited</div>
                    <div>• Read all questions carefully before answering</div>
                </div>
            </div>
        `

        const questionsContent = renderQuestionsHtml(questions, testData)

        const footerHtml = `
            <footer class="signature-section">
                <div class="signature-box">
                    <div>Invigilator's Signature</div>
                </div>
                <div class="signature-box">
                    <div>Student's Signature</div>
                </div>
            </footer>
        `

        const baseStyles = `
            @page {
                size: A4;
                margin: 15mm;
            }
            * {
                box-sizing: border-box;
            }
            body {
                font-family: 'Times New Roman', serif !important;
                font-size: 12pt !important;
                line-height: 1.4 !important;
                color: #000 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
            }
            .print-controls {
                display: none !important;
            }
            .header-section {
                text-align: center;
                border: 3px double #000;
                padding: 20px;
                margin-bottom: 25px;
                background: #f9f9f9 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .institute-name {
                font-size: 24pt !important;
                font-weight: bold !important;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin: 0;
            }
            .test-title {
                font-size: 18pt !important;
                font-weight: 600 !important;
                margin: 15px 0 10px 0;
                text-decoration: underline;
            }
            .test-info {
                display: flex;
                justify-content: space-between;
                font-size: 11pt !important;
                margin-top: 15px;
                flex-wrap: wrap;
            }
            .student-info {
                border: 2px solid #000;
                padding: 15px;
                margin: 20px 0;
                background: #f9f9f9 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 11pt !important;
                flex-wrap: wrap;
            }
            .instructions-box {
                border: 2px solid #000;
                padding: 15px;
                margin: 20px 0;
                background: #f5f5f5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .instructions-title {
                font-size: 14pt !important;
                font-weight: bold !important;
                text-align: center;
                margin: 0 0 10px 0;
                text-decoration: underline;
            }
            .instructions-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                font-size: 10pt !important;
            }
            .question-container {
                border: 1.5px solid #333;
                margin-bottom: 25px;
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .question-header {
                background: #e6e6e6 !important;
                padding: 12px 15px;
                border-bottom: 1px solid #333;
                display: flex;
                align-items: center;
                gap: 12px;
                flex-wrap: wrap;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .question-number {
                background: #000 !important;
                color: #fff !important;
                padding: 6px 12px;
                font-weight: bold !important;
                font-size: 11pt !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .question-badge {
                background: #666 !important;
                color: #fff !important;
                padding: 4px 8px;
                font-size: 8pt !important;
                text-transform: uppercase;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .question-content {
                padding: 20px;
            }
            .question-text {
                font-size: 11pt !important;
                line-height: 1.6 !important;
                margin-bottom: 15px;
                font-weight: 500 !important;
            }
            .options-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
                margin-top: 15px;
            }
            .option-item {
                display: flex;
                align-items: flex-start;
                padding: 10px;
                border: 1px solid #666;
                background: #fafafa !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .option-letter {
                background: #000 !important;
                color: #fff !important;
                padding: 4px 8px;
                margin-right: 10px;
                font-weight: bold !important;
                min-width: 20px;
                text-align: center;
                flex-shrink: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .option-content {
                flex: 1;
            }
            .signature-section {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
            }
            .signature-box {
                border-top: 2px solid #000;
                padding-top: 10px;
                text-align: center;
                width: 200px;
                font-size: 10pt !important;
            }
            .html-content p {
                margin: 0.5em 0;
            }
            .html-content img {
                max-width: 100% !important;
                height: auto !important;
            }
            .html-content table {
                border-collapse: collapse;
                width: 100%;
            }
            .html-content td, .html-content th {
                border: 1px solid #000;
                padding: 4px 8px;
            }
            .html-content sub {
                font-size: 0.8em;
                vertical-align: sub;
            }
            .html-content sup {
                font-size: 0.8em;
                vertical-align: super;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
            }
        `

        const compressedStyles = `
            body {
                font-size: 10pt !important; /* Smaller base font size */
                line-height: 1.2 !important; /* Tighter line height */
            }
            .header-section {
                padding: 15px !important;
                margin-bottom: 15px !important;
            }
            .institute-name {
                font-size: 20pt !important; /* Smaller institute name */
            }
            .test-title {
                font-size: 16pt !important; /* Smaller test title */
                margin: 10px 0 8px 0 !important;
            }
            .test-info {
                font-size: 9pt !important; /* Smaller test info */
                margin-top: 10px !important;
            }
            .student-info {
                padding: 10px !important;
                margin: 15px 0 !important;
            }
            .info-row {
                margin-bottom: 5px !important;
                font-size: 9pt !important;
            }
            .instructions-box {
                padding: 10px !important;
                margin: 15px 0 !important;
            }
            .instructions-title {
                font-size: 12pt !important;
                margin: 0 0 8px 0 !important;
            }
            .instructions-grid {
                font-size: 8pt !important;
                gap: 5px !important;
            }
            .main-content-grid {
                display: grid;
                grid-template-columns: 1fr 1fr; /* Two columns for questions */
                gap: 15px; /* Reduced gap between questions */
            }
            .question-container {
                border: 1px solid #555 !important; /* Slightly thinner border */
                margin-bottom: 0 !important; /* Remove individual question bottom margin */
                page-break-inside: avoid;
                break-inside: avoid;
            }
            .question-header {
                padding: 6px 8px !important; /* Reduced padding */
                gap: 6px !important; /* Reduced gap */
            }
            .question-number {
                padding: 3px 6px !important; /* Reduced padding */
                font-size: 9pt !important; /* Smaller font */
            }
            .question-badge {
                padding: 2px 5px !important; /* Reduced padding */
                font-size: 7pt !important; /* Smaller font */
            }
            .question-content {
                padding: 10px !important; /* Reduced padding */
            }
            .question-text {
                font-size: 9pt !important; /* Smaller font */
                line-height: 1.3 !important; /* Tighter line height */
                margin-bottom: 8px !important; /* Reduced margin */
            }
            .options-container {
                grid-template-columns: 1fr !important; /* Single column for options in compressed mode */
                gap: 6px !important; /* Reduced gap */
            }
            .option-item {
                padding: 6px !important; /* Reduced padding */
            }
            .option-letter {
                padding: 2px 5px !important; /* Reduced padding */
                font-size: 8pt !important; /* Smaller font */
                min-width: 18px !important;
            }
            .option-content {
                font-size: 9pt !important; /* Smaller font */
            }
            .html-content p {
                margin: 0.2em 0 !important; /* Tighter paragraph spacing */
            }
            .signature-section {
                margin-top: 25px !important; /* Reduced margin */
            }
            .signature-box {
                padding-top: 5px !important;
                font-size: 8pt !important;
            }
        `

        const finalStyles = baseStyles + (isCompressed ? compressedStyles : "")

        return `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Test Paper - ${testData.title}</title>
              <style>
                  ${finalStyles}
              </style>
          </head>
          <body>
              <div class="print-document">
                  ${headerHtml}
                  ${studentInfoHtml}
                  ${instructionsHtml}
                  <main class="${isCompressed ? "main-content-grid" : ""}">
                      ${questionsContent}
                  </main>
                  ${footerHtml}
              </div>
          </body>
          </html>
      `
    }

    const handlePrint = () => {
        const printWindow = window.open("", "_blank")
        const printContent = generatePrintHtml("normal")
        printWindow.document.write(printContent)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    const handleCompressedPrint = () => {
        const printWindow = window.open("", "_blank")
        const printContent = generatePrintHtml("compressed")
        printWindow.document.write(printContent)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    const handleDirectPrint = () => {
        window.print()
    }

    if (!isReady || !testData) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className="print-document">
                <style jsx>{`
                    .print-document {
                        max-width: 210mm;
                        margin: 20px auto;
                        background: white;
                        box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        padding: 20px;
                    }
                    .print-controls {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        z-index: 1000;
                        background: white;
                        padding: 10px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .print-btn {
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: bold;
                        margin-left: 10px;
                        font-size: 14px;
                    }
                    .print-btn:hover {
                        opacity: 0.9;
                    }
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                    }
                `}</style>
                <div className="print-controls no-print">
                    <button className="print-btn" onClick={handlePrint}>
                        🖨️ Print Paper (Recommended)
                    </button>
                    <button className="print-btn" onClick={handleCompressedPrint} style={{ background: "#f97316" }}>
                        🖨️ Print Paper (10rs)
                    </button>
                    <button className="print-btn" onClick={handleDirectPrint} style={{ background: "#059669" }}>
                        🖨️ Direct Print
                    </button>
                    <button className="print-btn" onClick={() => window.close()} style={{ background: "#dc2626" }}>
                        ❌ Close
                    </button>
                </div>
                <header className="header-section">
                    <h1 className="institute-name">ABC CLASSES</h1>
                    <div className="test-title" dangerouslySetInnerHTML={createMarkup(testData.title || "Test Paper")} />
                    <div className="test-info">
                        <div>
                            <strong>Subject:</strong>
                            <span dangerouslySetInnerHTML={createMarkup(testData.subject)} />
                        </div>
                        <div>
                            <strong>Topic:</strong>
                            <span dangerouslySetInnerHTML={createMarkup(testData.topic)} />
                        </div>
                        <div>
                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Time:</strong> {testData.totalTime} minutes
                        </div>
                        <div>
                            <strong>Total Marks:</strong> {calculateTotalMarks()}
                        </div>
                    </div>
                </header>
                <div className="student-info">
                    <div className="info-row">
            <span>
              <strong>Name:</strong> _________________________
            </span>
                        <span>
              <strong>Roll No.:</strong> ___________
            </span>
                        <span>
              <strong>Class:</strong> ___________
            </span>
                    </div>
                    <div className="info-row">
            <span>
              <strong>Father's Name:</strong> _________________________
            </span>
                        <span>
              <strong>Date:</strong> ___________
            </span>
                    </div>
                </div>
                <div className="instructions-box">
                    <h3 className="instructions-title">INSTRUCTIONS</h3>
                    <div className="instructions-grid">
                        <div>
                            • Each question carries <strong>{testData.correctMarks} marks</strong>
                        </div>
                        <div>
                            • Wrong answer deducts <strong>{Math.abs(testData.wrongMarks)} marks</strong>
                        </div>
                        <div>• Fill the OMR sheet carefully with HB pencil</div>
                        <div>• No rough work on question paper</div>
                        <div>• Mobile phones are strictly prohibited</div>
                        <div>• Read all questions carefully before answering</div>
                    </div>
                </div>
                <main>
                    {questions.map((question, index) => {
                        const questionNumber = index + 1
                        return (
                            <div key={question.id ? `${question.id}-${index}` : `question-${index}`} className="question-container">
                                <div className="question-header">
                                    <div className="question-number">Q.{questionNumber}</div>
                                    <div className="question-badge">{question.question_type?.toUpperCase() || "MCQ"}</div>
                                    <div className="question-badge">{question.difficulty?.toUpperCase() || "MEDIUM"}</div>
                                    <div style={{ marginLeft: "auto", fontSize: "10pt" }}>
                                        [{testData.correctMarks} Mark{testData.correctMarks !== 1 ? "s" : ""}]
                                    </div>
                                </div>
                                <div className="question-content">
                                    <div
                                        className="question-text html-content"
                                        dangerouslySetInnerHTML={createMarkup(question.question_description)}
                                    />
                                    {question.question_type === "mcq" && question.options && (
                                        <div className="options-container">
                                            {Object.entries(question.options).map(([key, value]) => {
                                                if (!value) return null
                                                return (
                                                    <div key={key} className="option-item">
                                                        <div className="option-letter">{key}</div>
                                                        <div
                                                            className="option-content html-content"
                                                            dangerouslySetInnerHTML={createMarkup(value)}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                    {question.question_type === "integer" && (
                                        <div
                                            style={{
                                                marginTop: "20px",
                                                padding: "10px",
                                                border: "1px solid #ccc",
                                                background: "#f9f9f9",
                                            }}
                                        >
                                            <strong>Answer:</strong> _______________
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </main>
                <footer className="signature-section">
                    <div className="signature-box">
                        <div>Invigilator's Signature</div>
                    </div>
                    <div className="signature-box">
                        <div>Student's Signature</div>
                    </div>
                </footer>
            </div>
        </>
    )
}

const PrintableTestPaper = () => {
    return (
        <Suspense fallback={<div>Loading test paper...</div>}>
            <TestPaperContent />
        </Suspense>
    )
}

export default PrintableTestPaper
