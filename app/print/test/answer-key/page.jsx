// FILE: pages/test/answer-key.js (or similar route)

"use client"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"

const AnswerKeyContent = () => {
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

    // Helper function to render the compact answer key grid
    const renderAnswerKeyHtml = (questions) => {
        const keyItems = questions.map((question, index) => `
            <div class="answer-item">
                <span class="q-num">${index + 1}.</span>
                <span class="q-ans">${question.correct_answer || question.answer_key || 'N/A'}</span>
            </div>
        `).join("")

        return `<div class="answer-key-grid">${keyItems}</div>`
    }

    // Generate the full HTML for the answer key print window
    const generatePrintHtml = () => {
        const headerHtml = `
            <header class="header-section">
                <h1 class="institute-name">ABC CLASSES</h1>
                <div class="test-title">${testData.title || "Test Paper"} - ANSWER KEY</div>
                <div class="test-info">
<!--                    <div><strong>Subject:</strong> ${testData.subject || ""}</div>-->
                    <div><strong>Total Questions:</strong> ${questions.length}</div>
                </div>
            </header>
        `

        const styles = `
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; font-size: 12pt; }
            .header-section { text-align: center; margin-bottom: 30px; }
            .institute-name { font-size: 24pt; font-weight: bold; margin: 0; }
            .test-title { font-size: 18pt; font-weight: 600; margin: 10px 0; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .test-info { display: flex; justify-content: space-between; font-size: 12pt; margin-top: 15px; }
            .answer-key-grid {
                display: grid;
                /* Adjust column count as needed to fit more on a page */
                grid-template-columns: repeat(6, 1fr); 
                gap: 15px 25px; /* row-gap column-gap */
                width: 100%;
                border: 1px solid #ccc;
                padding: 20px;
            }
            .answer-item {
                display: flex;
                align-items: center;
                font-size: 14pt;
                padding: 5px;
                border-bottom: 1px dotted #999;
            }
            .q-num {
                font-weight: bold;
                margin-right: 8px;
                color: #555;
            }
            .q-ans {
                font-weight: bold;
                color: #000;
            }
        `

        const answerKeyContent = renderAnswerKeyHtml(questions)

        return `
            <!DOCTYPE html><html><head><title>Answer Key - ${testData.title}</title><style>${styles}</style></head>
            <body>
                <div class="print-document">
                    ${headerHtml}
                    ${answerKeyContent}
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

    if (!isReady) return <div>Loading Answer Key...</div>

    return (
        <>
            <div className="print-controls" style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
                <button onClick={handlePrint} style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    🖨️ Print Answer Key
                </button>
            </div>
            <div style={{ maxWidth: '210mm', margin: '20px auto', padding: '20px', background: 'white' }}>
                <h1>Answer Key Preview for: {testData.title}</h1>
                <p>Click the "Print Answer Key" button to generate the document.</p>
            </div>
        </>
    )
}


const PrintableAnswerKey = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <AnswerKeyContent />
    </Suspense>
)

export default PrintableAnswerKey