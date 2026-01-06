// src/pages/tools/PDFMergerPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Upload,
    Trash2,
    FileText,
    Download,
    AlertCircle,
    ArrowUp,
    ArrowDown,
    Merge
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';
import './PDFMergerPage.css';

function PDFMergerPage() {
    const navigate = useNavigate();
    const [pdfFiles, setPdfFiles] = useState([]);
    const [merging, setMerging] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Usage limit hook
    const {
        usageCount,
        usageRemaining,
        usagePercentage,
        canUse,
        isPremium,
        incrementUsage,
        showLimitError,
    } = useUsageLimit('pdf-merge', 3);

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        addFiles(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(
            file => file.type === 'application/pdf'
        );

        if (files.length === 0) {
            toast.error('Please drop PDF files only');
            return;
        }

        addFiles(files);
    };

    const addFiles = (files) => {
        const validFiles = files.filter(file => file.type === 'application/pdf');

        if (validFiles.length !== files.length) {
            toast.error('Some files were not PDFs and were skipped');
        }

        if (validFiles.length === 0) {
            return;
        }

        // Create file objects with preview info
        const newFiles = validFiles.map((file, index) => ({
            id: Date.now() + index,
            file: file,
            name: file.name,
            size: formatFileSize(file.size),
            status: 'ready'
        }));

        setPdfFiles(prev => [...prev, ...newFiles]);
        toast.success(`Added ${newFiles.length} PDF${newFiles.length > 1 ? 's' : ''}`);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const removeFile = (id) => {
        setPdfFiles(prev => prev.filter(file => file.id !== id));
        toast.success('File removed');
    };

    const moveFile = (index, direction) => {
        const newFiles = [...pdfFiles];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newFiles.length) return;

        [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
        setPdfFiles(newFiles);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === index) return;

        const newFiles = [...pdfFiles];
        const draggedFile = newFiles[draggedIndex];

        newFiles.splice(draggedIndex, 1);
        newFiles.splice(index, 0, draggedFile);

        setPdfFiles(newFiles);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const mergePDFs = async () => {
        if (!canUse) {
            showLimitError();
            return;
        }

        if (pdfFiles.length < 2) {
            toast.error('Please add at least 2 PDF files to merge');
            return;
        }

        setMerging(true);

        try {
            // Create a new PDF document
            const mergedPdf = await PDFDocument.create();

            // Process each PDF file
            for (let i = 0; i < pdfFiles.length; i++) {
                const fileData = pdfFiles[i];

                // Update status
                setPdfFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'processing' } : f
                ));

                // Read the file
                const arrayBuffer = await fileData.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);

                // Copy all pages from this PDF
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => {
                    mergedPdf.addPage(page);
                });

                // Update status
                setPdfFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'completed' } : f
                ));
            }

            // Save the merged PDF
            const mergedPdfBytes = await mergedPdf.save();
            const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = `merged_${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // ✅ INCREMENT USAGE AFTER SUCCESS
            await incrementUsage();

            toast.success('PDFs merged successfully! 🎉');

            // Reset after 2 seconds
            setTimeout(() => {
                setPdfFiles([]);
            }, 2000);

        } catch (error) {
            console.error('Error merging PDFs:', error);
            toast.error('Failed to merge PDFs. Please try again.');

            // Reset status
            setPdfFiles(prev => prev.map(f => ({ ...f, status: 'ready' })));
        } finally {
            setMerging(false);
        }
    };

    const clearAll = () => {
        if (window.confirm('Remove all files?')) {
            setPdfFiles([]);
            toast.success('All files removed');
        }
    };

    return (
        <div className="tool-page-with-ads">
            <SEO
                title="PDF Merger - Combine Multiple PDFs | LiteTools"
                description="Merge multiple PDF files into one document online for free. Drag and drop to reorder pages. Fast, secure, and easy to use."
                keywords="pdf merger, combine pdf, merge pdf files, pdf joiner"
            />

            {/* ✅ LEFT SIDEBAR AD */}
            <aside className="tool-ad-sidebar tool-ad-left">
                <div className="tool-ad-sticky">
                    <div className="ad-placeholder ad-skyscraper">
                        <span>160 x 600</span>
                        <span>Ad Space</span>
                    </div>
                </div>
            </aside>

            {/* ✅ MAIN CONTENT */}
            <div className="tool-page">
                {/* Header */}
                <div className="tool-header">
                    <button className="back-button" onClick={() => navigate('/pdf-tools')}>
                        <ArrowLeft size={20} />
                        <span>Back to PDF Tools</span>
                    </button>

                    <div className="tool-title-section">
                        <div className="tool-icon">
                            <Merge size={32} />
                        </div>
                        <div>
                            <h1 className="tool-title">PDF Merger</h1>
                            <p className="tool-description">
                                Combine multiple PDF files into one document
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="tool-content">
                    {/* Usage Indicator */}
                    <UsageIndicator
                        usageCount={usageCount}
                        usageRemaining={usageRemaining}
                        usagePercentage={usagePercentage}
                        isPremium={isPremium}
                    />

                    {/* Upload Area */}
                    <div
                        className="upload-area"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => document.getElementById('pdf-file-input').click()}
                    >
                        <input
                            id="pdf-file-input"
                            type="file"
                            accept="application/pdf"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <Upload size={48} />
                        <h3>Drop PDF files here or click to browse</h3>
                        <p>You can select multiple PDF files at once</p>
                        <p className="file-info">Drag and drop to reorder files</p>
                    </div>

                    {/* File List */}
                    {pdfFiles.length > 0 && (
                        <div className="files-section">
                            <div className="files-header">
                                <h3>Files to Merge ({pdfFiles.length})</h3>
                                <button className="btn-text" onClick={clearAll}>
                                    Clear All
                                </button>
                            </div>

                            <div className="files-list">
                                {pdfFiles.map((file, index) => (
                                    <div
                                        key={file.id}
                                        className={`file-item ${file.status}`}
                                        draggable
                                        onDragStart={() => handleDragStart(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="file-icon">
                                            <FileText size={24} />
                                        </div>

                                        <div className="file-info-content">
                                            <div className="file-name">{file.name}</div>
                                            <div className="file-meta">
                                                <span className="file-size">{file.size}</span>
                                                {file.status === 'processing' && (
                                                    <span className="file-status">Processing...</span>
                                                )}
                                                {file.status === 'completed' && (
                                                    <span className="file-status completed">✓ Done</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="file-actions">
                                            {!merging && (
                                                <>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => moveFile(index, 'up')}
                                                        disabled={index === 0}
                                                        title="Move up"
                                                    >
                                                        <ArrowUp size={18} />
                                                    </button>
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => moveFile(index, 'down')}
                                                        disabled={index === pdfFiles.length - 1}
                                                        title="Move down"
                                                    >
                                                        <ArrowDown size={18} />
                                                    </button>
                                                    <button
                                                        className="btn-icon delete"
                                                        onClick={() => removeFile(file.id)}
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="file-order">#{index + 1}</div>
                                    </div>
                                ))}
                            </div>

                            {pdfFiles.length < 2 && (
                                <div className="info-message">
                                    <AlertCircle size={20} />
                                    <span>Add at least 2 PDF files to merge</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    {pdfFiles.length > 0 && (
                        <div className="merge-actions">
                            <button
                                className="btn-secondary"
                                onClick={clearAll}
                                disabled={merging}
                            >
                                Clear All
                            </button>
                            <button
                                className="btn-primary merge-btn"
                                onClick={mergePDFs}
                                disabled={pdfFiles.length < 2 || merging}
                            >
                                {merging ? (
                                    <>
                                        <span className="spinner"></span>
                                        Merging PDFs...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Merge {pdfFiles.length} PDFs
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="tool-features">
                    <h3>Features</h3>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🔀</div>
                            <strong>Drag & Drop</strong>
                            <p>Easily reorder files by dragging them</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📁</div>
                            <strong>Multiple Files</strong>
                            <p>Merge unlimited PDFs at once</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <strong>Fast Processing</strong>
                            <p>Client-side merging for instant results</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <strong>Secure</strong>
                            <p>All processing happens in your browser</p>
                        </div>
                    </div>
                </div>

                <div className="tool-ad-bottom">
                    <div className="ad-placeholder ad-leaderboard">
                        <span>728 x 90</span>
                        <span>Ad Space</span>
                    </div>
                </div>
            </div>

            <aside className="tool-ad-sidebar tool-ad-right">
                <div className="tool-ad-sticky">
                    <div className="ad-placeholder ad-skyscraper">
                        <span>160 x 600</span>
                        <span>Ad Space</span>
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default PDFMergerPage;