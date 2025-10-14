// FILE: pages/test/solutions.js (or similar route)

"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

const SolutionsContent = () => {
    const searchParams = useSearchParams()
    const testId = searchParams.get("id")
    const [testData, setTestData] = useState(null)
    const [questions, setQuestions] = useState([])
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (!testId) return
        try {
            const storedData = sessionStorage.getItem(testId)
            if (storedData) {
                const parsedData = JSON.parse(storedData)
                setTestData(parsedData)
                setQuestions(parsedData.questions || [])
                setIsReady(true)
            } else {
                console.error("No data found in session storage")
            }
        } catch (error) {
            console.error("Error retrieving test data:", error)
        }
    }, [testId])

    const createMarkup = (htmlString) => ({ __html: htmlString || "" })

    // Helper function to render questions AND solutions for the print window
    const renderSolutionsHtml = (questions) => {
        return questions.map((question, index) => {
            const questionNumber = index + 1
            const optionsHtml =
                question.question_type === "mcq" && question.options
                    ? `<div class="options-container">
                        ${Object.entries(question.options).map(([key, value]) => value ? `
                            <div class="option-item ${key === question.correct_answer ? 'correct' : ''}">
                                <div class="option-letter">${key}</div>
                                <div class="option-content html-content">${value || ""}</div>
                            </div>
                        ` : '').join("")}
                    </div>`
                    : ""

            const solutionHtml = `
                <div class="solution-container">
                    <div class="solution-header">
                       Correct Answer: <strong>${question.correct_answer || question.answer_key || 'N/A'}</strong>
                    </div>
                    <div class="solution-body html-content">
                        ${question.solution || "No detailed solution provided."}
                    </div>
                </div>
            `

            return `
                <div class="question-container">
                    <div class="question-header">
                        <div class="question-number">Q.${questionNumber}</div>
                        <div class="question-badge">${question.subject_name || ""}</div>
                    </div>
                    <div class="question-content">
                        <div class="question-text html-content">${question.question_description || ""}</div>
                        ${optionsHtml}
                        ${solutionHtml}
                    </div>
                </div>
            `
        }).join("")
    }

    // Generate the full HTML for the solutions print window
    const generatePrintHtml = () => {
        const headerHtml = `
            <header class="header-section">
                <h1 class="institute-name">KK MISHRA CLASSES</h1>
                <div class="test-title">${testData.title || "Test Paper"} - SOLUTIONS</div>
                <div class="test-info">
                    <div><strong>Subject:</strong> ${testData.subject || ""}</div>
                    <div><strong>Topic:</strong> ${testData.topic || ""}</div>
                </div>
            </header>
        `

        const styles = `
            /* --- Paste the ENTIRE <style> block from your original file here --- */
            /* --- I've added a few new styles below for the solution part --- */
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; }
            * { box-sizing: border-box; }
            .header-section { text-align: center; border: 2px solid #000; padding: 15px; margin-bottom: 20px; }
            .institute-name { font-size: 22pt; font-weight: bold; }
            .test-title { font-size: 16pt; font-weight: 600; margin: 10px 0; }
            .test-info { display: flex; justify-content: space-around; font-size: 10pt; }
            .question-container { border: 1.5px solid #333; margin-bottom: 20px; page-break-inside: avoid; }
            .question-header { background: #e6e6e6; padding: 10px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 10px; }
            .question-number { background: #000; color: #fff; padding: 5px 10px; font-weight: bold; }
            .question-badge { background: #666; color: #fff; padding: 3px 7px; font-size: 8pt; }
            .question-content { padding: 15px; }
            .question-text { margin-bottom: 15px; }
            .options-container { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .option-item { display: flex; align-items: flex-start; padding: 8px; border: 1px solid #ccc; }
            .option-item.correct { border: 2px solid #16a34a; background: #f0fdf4; }
            .option-letter { background: #333; color: #fff; padding: 3px 7px; margin-right: 8px; font-weight: bold; }
            .html-content img { max-width: 100%; height: auto; }
            /* --- New Styles for Solutions --- */
            .solution-container { 
                margin-top: 20px; 
                border: 2px solid #16a34a; /* Green border */
                border-radius: 5px;
                background: #f0fdf4; /* Light green background */
            }
            .solution-header {
                padding: 8px 12px;
                background: #15803d; /* Darker green */
                color: white;
                font-weight: bold;
                border-bottom: 1px solid #16a34a;
            }
            .solution-body {
                padding: 12px;
                font-size: 10.5pt;
            }
        `

        const solutionsContent = renderSolutionsHtml(questions)

        return `
            <!DOCTYPE html><html><head><title>Solutions - ${testData.title}</title><style>${styles}</style></head>
            <body>
                <div class="print-document">
                    ${headerHtml}
                    <main>${solutionsContent}</main>
                </div>
            </body></html>
        `
    }

    const handlePrint = () => {
        const printWindow = window.open("", "_blank")
        printWindow.document.write(generatePrintHtml())
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 500)
    }

    if (!isReady) return <div>Loading Solutions...</div>

    return (
        // The on-page JSX preview. You can build this similar to your original file
        // For brevity, I'm focusing on the print logic. A simple version is below.
        <>
            <div className="print-controls" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
                <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    🖨️ Print Solutions
                </button>
            </div>
            <div style={{ maxWidth: '210mm', margin: '20px auto', padding: '20px', background: 'white' }}>
                {/* This section is just a placeholder for the on-screen preview */}
                <h1>Solutions Preview for: {testData.title}</h1>
                <p>Click the "Print Solutions" button to generate the printable document.</p>
            </div>
        </>
    )
}

const PrintableSolutions = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <SolutionsContent />
    </Suspense>
)

export default PrintableSolutions