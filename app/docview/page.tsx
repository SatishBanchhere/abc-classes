'use client';

import { useState } from 'react';

interface ImageDimension {
    id: string;
    originalWidth?: number;
    originalHeight?: number;
    scaledWidth?: number;
    scaledHeight?: number;
}

interface ProcessResult {
    html: string;
    messages: any[];
    success: boolean;
    imagesProcessed: number;
    imageDimensions: ImageDimension[];
}

export default function DocumentViewer() {
    const [documentHtml, setDocumentHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.name.endsWith('.docx')) {
            setError('Please upload a .docx file');
            return;
        }

        setIsLoading(true);
        setError('');
        setDocumentHtml('');
        setUploadStatus('Processing document...');

        try {
            const formData = new FormData();
            formData.append('docx', file);

            setUploadStatus('Processing images with adaptive sizing...');

            const response = await fetch('/api/process-docx', {
                method: 'POST',
                body: formData,
            });

            const result: ProcessResult = await response.json();

            if (result.success) {
                setDocumentHtml(result.html);
                setUploadStatus(
                    `✅ Document processed! ${result.imagesProcessed} images uploaded with optimal sizing`
                );

                if (result.messages.length > 0) {
                    console.log('Conversion messages:', result.messages);
                }
            } else {
                setError(result.error || 'Failed to process document');
            }
        } catch (err) {
            setError('Error uploading file: ' + (err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .document-content img {
                    max-width: 100% !important;
                    height: auto !important;
                    vertical-align: middle;
                    margin: 0 2px;
                    display: inline-block;
                }
                
                .document-content p img {
                    vertical-align: middle;
                }
                
                .document-content {
                    line-height: 1.6;
                }
            `}</style>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ color: '#1976d2', marginBottom: '10px' }}>
                    DOCX Viewer with Adaptive Image Sizing
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Smart image sizing based on content type and dimensions
                </p>
            </div>

            {/* File Upload */}
            <div style={{
                border: '2px dashed #1976d2',
                borderRadius: '10px',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#fafafa',
                marginBottom: '30px'
            }}>
                <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    style={{
                        marginBottom: '15px',
                        padding: '10px',
                        fontSize: '16px',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                    }}
                    disabled={isLoading}
                />
                <p style={{ margin: 0, color: '#666' }}>
                    Images will be sized intelligently based on their content and dimensions
                </p>
            </div>

            {/* Loading/Status */}
            {isLoading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '15px',
                    padding: '30px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        border: '3px solid #e3f2fd',
                        borderTop: '3px solid #1976d2',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ margin: 0, color: '#1976d2', fontWeight: '600' }}>
                        {uploadStatus}
                    </p>
                </div>
            )}

            {/* Status */}
            {!isLoading && uploadStatus && !error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#e8f5e8',
                    border: '1px solid #4caf50',
                    color: '#2e7d32',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>
                    {uploadStatus}
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    color: '#c62828',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Document Display with enhanced image support */}
            {documentHtml && (
                <div style={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginTop: '20px'
                }}>
                    <div
                        className="document-content"
                        style={{
                            padding: '60px 80px',
                            maxWidth: '21cm',
                            margin: '0 auto',
                            fontFamily: 'Times New Roman, Times, serif',
                            fontSize: '12pt',
                            lineHeight: '1.6',
                            color: '#333',
                            background: 'white',
                            minHeight: '29.7cm'
                        }}
                        dangerouslySetInnerHTML={{ __html: documentHtml }}
                    />
                </div>
            )}
        </div>
    );
}
