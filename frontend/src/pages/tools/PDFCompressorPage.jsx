// src/pages/tools/PDFCompressorPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileDown, Upload, Zap, Settings, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PDFCompressorPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('medium');
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressedFile, setCompressedFile] = useState(null);
    const [stats, setStats] = useState(null);
    const [backendAvailable, setBackendAvailable] = useState(true);

    // Usage limit hook
    const {
        usageCount,
        usageRemaining,
        usagePercentage,
        canUse,
        isPremium,
        incrementUsage,
        showLimitError,
    } = useUsageLimit('pdf-compress', 3);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setCompressedFile(null);
            setStats(null);
        } else {
            toast.error('Please select a PDF file');
        }
    };

    const handleCompress = async () => {
        // Check usage limits
        if (!canUse) {
            showLimitError();
            return;
        }

        if (!file) {
            toast.error('Please select a PDF file');
            return;
        }

        setIsCompressing(true);
        const loadingToast = toast.loading('Compressing PDF...');

        try {
            const formData = new FormData();
            formData.append('pdf', file);
            formData.append('quality', quality);

            const response = await axios.post(`${API_URL}/pdf/compress`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob'
            });

            // Get stats from headers
            const originalSize = parseInt(response.headers['x-original-size'] || file.size);
            const compressedSize = parseInt(response.headers['x-compressed-size'] || response.data.size);
            const reduction = response.headers['x-reduction'] || 
                ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

            setStats({
                originalSize,
                compressedSize,
                reduction,
            });

            // Get compressed file
            setCompressedFile(response.data);

            // ✅ INCREMENT USAGE AFTER SUCCESS
            await incrementUsage();

            toast.success('PDF compressed successfully!', { id: loadingToast });
        } catch (error) {
            console.error('Compression error:', error);
            
            if (error.response?.status === 500) {
                setBackendAvailable(false);
                toast.error('Server compression failed. Ghostscript may not be installed.', { id: loadingToast });
            } else {
                toast.error('Failed to compress PDF', { id: loadingToast });
            }
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDownload = () => {
        if (!compressedFile) return;

        const url = URL.createObjectURL(compressedFile);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.pdf', '_compressed.pdf');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Downloaded!');
    };

    const handleReset = () => {
        setFile(null);
        setCompressedFile(null);
        setStats(null);
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const getCompressionLabel = () => {
        switch (quality) {
            case 'low': return 'Maximum compression (72 dpi)';
            case 'medium': return 'Balanced (150 dpi) - Recommended';
            case 'high': return 'Minimal compression (300 dpi)';
            default: return 'Balanced';
        }
    };

    return (
        <div className="tool-page-with-ads">
            <SEO
                title="PDF Compressor - Reduce PDF File Size | LiteTools"
                description="Compress PDF files online for free. Reduce file size while maintaining quality. Fast, secure, and easy to use."
                keywords="pdf compressor, compress pdf, reduce pdf size, pdf optimizer"
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
                            <Zap size={32} />
                        </div>
                        <div>
                            <h1 className="tool-title">PDF Compressor</h1>
                            <p className="tool-description">
                                Reduce PDF file size while maintaining quality
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

                    {/* Backend Status */}
                    {!backendAvailable && (
                        <div className="error-banner">
                            <AlertCircle size={18} />
                            <div>
                                <strong>Backend Error:</strong> Compression server is not available or Ghostscript is not installed. 
                                Please check the backend setup.
                            </div>
                        </div>
                    )}

                    {/* Info Banner */}
                    <div className="info-banner">
                        <AlertCircle size={18} />
                        <div>
                            <strong>Server-Side Compression:</strong> PDFs are compressed using professional Ghostscript technology. 
                            Typical compression: 40-70% reduction. Files are deleted after compression.
                        </div>
                    </div>

                    {/* Upload Section */}
                    {!file && (
                        <div className="upload-section">
                            <div
                                className="upload-zone"
                                onClick={() => document.getElementById('pdf-input').click()}
                            >
                                <Upload size={48} />
                                <h3>Upload PDF File</h3>
                                <p>Click to browse or drag and drop</p>
                                <p className="file-info">Maximum file size: 50MB</p>
                            </div>
                            <input
                                id="pdf-input"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                        </div>
                    )}

                    {/* File Selected */}
                    {file && !compressedFile && (
                        <div className="file-section">
                            <div className="file-info-card">
                                <div className="file-details">
                                    <h3>{file.name}</h3>
                                    <p>{formatBytes(file.size)}</p>
                                </div>
                                <button className="change-file-btn" onClick={handleReset}>
                                    Change File
                                </button>
                            </div>

                            {/* Quality Settings */}
                            <div className="settings-section">
                                <div className="settings-label">
                                    <Settings size={18} />
                                    <h3>Compression Quality</h3>
                                </div>
                                <div className="quality-options">
                                    <label className={`quality-option ${quality === 'low' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="quality"
                                            value="low"
                                            checked={quality === 'low'}
                                            onChange={(e) => setQuality(e.target.value)}
                                        />
                                        <div>
                                            <strong>Low Quality</strong>
                                            <span>Maximum compression (72 dpi)</span>
                                        </div>
                                    </label>

                                    <label className={`quality-option ${quality === 'medium' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="quality"
                                            value="medium"
                                            checked={quality === 'medium'}
                                            onChange={(e) => setQuality(e.target.value)}
                                        />
                                        <div>
                                            <strong>Medium Quality</strong>
                                            <span>Balanced (150 dpi) - Recommended</span>
                                        </div>
                                    </label>

                                    <label className={`quality-option ${quality === 'high' ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="quality"
                                            value="high"
                                            checked={quality === 'high'}
                                            onChange={(e) => setQuality(e.target.value)}
                                        />
                                        <div>
                                            <strong>High Quality</strong>
                                            <span>Minimal compression (300 dpi)</span>
                                        </div>
                                    </label>
                                </div>
                                <p className="settings-description">{getCompressionLabel()}</p>
                            </div>

                            {/* Compress Button */}
                            <button
                                className="compress-btn"
                                onClick={handleCompress}
                                disabled={isCompressing || !backendAvailable}
                            >
                                {isCompressing ? (
                                    <>
                                        <span className="spinner"></span>
                                        Compressing...
                                    </>
                                ) : (
                                    'Compress PDF'
                                )}
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {compressedFile && stats && (
                        <div className="results-section">
                            <div className="success-message">
                                <Zap size={48} />
                                <h2>Compression Complete!</h2>
                                <p>Your PDF has been compressed successfully</p>
                            </div>

                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span className="stat-label">Original Size</span>
                                    <span className="stat-value">{formatBytes(stats.originalSize)}</span>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Compressed Size</span>
                                    <span className="stat-value">{formatBytes(stats.compressedSize)}</span>
                                </div>
                                <div className="stat-card highlight">
                                    <span className="stat-label">Size Reduced</span>
                                    <span className="stat-value">{stats.reduction}%</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button className="download-btn" onClick={handleDownload}>
                                    <FileDown size={20} />
                                    Download Compressed PDF
                                </button>
                                <button className="reset-btn" onClick={handleReset}>
                                    Compress Another File
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="tool-features">
                    <h3>Features</h3>
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <strong>Secure</strong>
                            <p>Files processed on server and deleted immediately</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <strong>Fast</strong>
                            <p>Compress PDFs in seconds</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">🎯</div>
                            <strong>Quality Control</strong>
                            <p>Choose compression level</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon">📁</div>
                            <strong>Large Files</strong>
                            <p>Up to 50MB file size</p>
                        </div>
                    </div>
                </div>

                {/* ✅ BOTTOM AD */}
                <div className="tool-ad-bottom">
                    <div className="ad-placeholder ad-leaderboard">
                        <span>728 x 90</span>
                        <span>Ad Space</span>
                    </div>
                </div>
            </div>

            {/* ✅ RIGHT SIDEBAR AD */}
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

export default PDFCompressorPage;