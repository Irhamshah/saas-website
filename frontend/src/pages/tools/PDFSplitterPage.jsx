// src/pages/tools/PDFSplitterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Upload, 
  Download, 
  FileText, 
  Scissors,
  AlertCircle
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';
import './PDFSplitterPage.css';

function PDFSplitterPage() {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState('range'); // 'range', 'single', 'bulk'
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [singlePages, setSinglePages] = useState('');
  const [bulkSize, setBulkSize] = useState(1);
  const [splitting, setSplitting] = useState(false);
  const [splitFiles, setSplitFiles] = useState([]);

  // Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('pdf-split', 3);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      await loadPDF(file);
    } else {
      toast.error('Please select a PDF file');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await loadPDF(file);
    } else {
      toast.error('Please drop a PDF file');
    }
  };

  const loadPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();

      setPdfFile(file);
      setPdfDoc(pdf);
      setPageCount(pages);
      setRangeEnd(pages);
      setSplitFiles([]);

      toast.success(`Loaded PDF with ${pages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF');
    }
  };

  const splitByRange = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    if (rangeStart < 1 || rangeEnd > pageCount || rangeStart > rangeEnd) {
      toast.error('Invalid page range');
      return;
    }

    setSplitting(true);

    try {
      const newPdf = await PDFDocument.create();
      
      for (let i = rangeStart - 1; i < rangeEnd; i++) {
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      setSplitFiles([{
        id: Date.now(),
        name: `pages_${rangeStart}-${rangeEnd}.pdf`,
        blob: blob,
        pages: `${rangeStart}-${rangeEnd}`,
        size: blob.size
      }]);

      await incrementUsage();
      toast.success('PDF split successfully! 🎉');
    } catch (error) {
      console.error('Split error:', error);
      toast.error('Failed to split PDF');
    } finally {
      setSplitting(false);
    }
  };

  const splitBySinglePages = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    const pages = singlePages
      .split(',')
      .map(p => parseInt(p.trim()))
      .filter(p => p >= 1 && p <= pageCount);

    if (pages.length === 0) {
      toast.error('Please enter valid page numbers (e.g., 1,3,5)');
      return;
    }

    setSplitting(true);

    try {
      const files = [];

      for (const pageNum of pages) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
        newPdf.addPage(copiedPage);

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        files.push({
          id: Date.now() + pageNum,
          name: `page_${pageNum}.pdf`,
          blob: blob,
          pages: `${pageNum}`,
          size: blob.size
        });
      }

      setSplitFiles(files);
      await incrementUsage();
      toast.success(`Created ${files.length} PDF files! 🎉`);
    } catch (error) {
      console.error('Split error:', error);
      toast.error('Failed to split PDF');
    } finally {
      setSplitting(false);
    }
  };

  const splitByBulk = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    if (bulkSize < 1 || bulkSize > pageCount) {
      toast.error('Invalid pages per file');
      return;
    }

    setSplitting(true);

    try {
      const files = [];
      let currentPage = 0;
      let fileIndex = 1;

      while (currentPage < pageCount) {
        const newPdf = await PDFDocument.create();
        const endPage = Math.min(currentPage + bulkSize, pageCount);

        for (let i = currentPage; i < endPage; i++) {
          const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
          newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        files.push({
          id: Date.now() + fileIndex,
          name: `part_${fileIndex}.pdf`,
          blob: blob,
          pages: `${currentPage + 1}-${endPage}`,
          size: blob.size
        });

        currentPage = endPage;
        fileIndex++;
      }

      setSplitFiles(files);
      await incrementUsage();
      toast.success(`Created ${files.length} PDF files! 🎉`);
    } catch (error) {
      console.error('Split error:', error);
      toast.error('Failed to split PDF');
    } finally {
      setSplitting(false);
    }
  };

  const handleSplit = () => {
    if (splitMode === 'range') {
      splitByRange();
    } else if (splitMode === 'single') {
      splitBySinglePages();
    } else if (splitMode === 'bulk') {
      splitByBulk();
    }
  };

  const downloadFile = (file) => {
    const url = URL.createObjectURL(file.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const downloadAll = () => {
    splitFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
    toast.success(`Downloading ${splitFiles.length} files...`);
  };

  const reset = () => {
    setPdfFile(null);
    setPdfDoc(null);
    setPageCount(0);
    setSplitFiles([]);
    setRangeStart(1);
    setRangeEnd(1);
    setSinglePages('');
    setBulkSize(1);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="tool-page-with-ads">
      <SEO
        title="PDF Splitter - Split PDF Pages | LiteTools"
        description="Split PDF files by page range, individual pages, or bulk split. Extract specific pages from PDF documents online for free."
        keywords="pdf splitter, split pdf, extract pdf pages, pdf page extractor"
      />

      {/* LEFT SIDEBAR AD */}
      <aside className="tool-ad-sidebar tool-ad-left">
        <div className="tool-ad-sticky">
          <div className="ad-placeholder ad-skyscraper">
            <span>160 x 600</span>
            <span>Ad Space</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="tool-page">
        {/* Header */}
        <div className="tool-header">
          <button className="back-button" onClick={() => navigate('/pdf-tools')}>
            <ArrowLeft size={20} />
            <span>Back to PDF Tools</span>
          </button>

          <div className="tool-title-section">
            <div className="tool-icon">
              <Scissors size={32} />
            </div>
            <div>
              <h1 className="tool-title">PDF Splitter</h1>
              <p className="tool-description">
                Split PDF files into separate documents
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

          {/* Upload Section */}
          {!pdfFile && (
            <div
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('pdf-split-input').click()}
            >
              <input
                id="pdf-split-input"
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <Upload size={48} />
              <h3>Upload PDF File</h3>
              <p>Click to browse or drag and drop</p>
              <p className="file-info">Maximum file size: 50MB</p>
            </div>
          )}

          {/* PDF Loaded */}
          {pdfFile && (
            <>
              <div className="file-info-card">
                <div className="file-details">
                  <FileText size={24} />
                  <div>
                    <h3>{pdfFile.name}</h3>
                    <p>{pageCount} pages • {formatBytes(pdfFile.size)}</p>
                  </div>
                </div>
                <button className="change-file-btn" onClick={reset}>
                  Change File
                </button>
              </div>

              {/* Split Mode Selection */}
              <div className="split-modes">
                <h3>Split Mode</h3>
                <div className="mode-buttons">
                  <button
                    className={`mode-btn ${splitMode === 'range' ? 'active' : ''}`}
                    onClick={() => setSplitMode('range')}
                    disabled={splitting}
                  >
                    <span>📄</span>
                    <strong>Page Range</strong>
                    <small>Extract specific range</small>
                  </button>
                  <button
                    className={`mode-btn ${splitMode === 'single' ? 'active' : ''}`}
                    onClick={() => setSplitMode('single')}
                    disabled={splitting}
                  >
                    <span>📑</span>
                    <strong>Single Pages</strong>
                    <small>Extract individual pages</small>
                  </button>
                  <button
                    className={`mode-btn ${splitMode === 'bulk' ? 'active' : ''}`}
                    onClick={() => setSplitMode('bulk')}
                    disabled={splitting}
                  >
                    <span>📚</span>
                    <strong>Bulk Split</strong>
                    <small>Split into equal parts</small>
                  </button>
                </div>
              </div>

              {/* Range Mode */}
              {splitMode === 'range' && (
                <div className="split-settings">
                  <h3>Page Range</h3>
                  <div className="range-inputs">
                    <div className="input-group">
                      <label>From Page</label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={rangeStart}
                        onChange={(e) => setRangeStart(parseInt(e.target.value) || 1)}
                        disabled={splitting}
                      />
                    </div>
                    <span className="range-separator">to</span>
                    <div className="input-group">
                      <label>To Page</label>
                      <input
                        type="number"
                        min="1"
                        max={pageCount}
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(parseInt(e.target.value) || pageCount)}
                        disabled={splitting}
                      />
                    </div>
                  </div>
                  <p className="settings-hint">
                    Extract pages {rangeStart} to {rangeEnd} ({rangeEnd - rangeStart + 1} pages)
                  </p>
                </div>
              )}

              {/* Single Pages Mode */}
              {splitMode === 'single' && (
                <div className="split-settings">
                  <h3>Page Numbers</h3>
                  <input
                    type="text"
                    className="pages-input"
                    placeholder="e.g., 1, 3, 5, 7"
                    value={singlePages}
                    onChange={(e) => setSinglePages(e.target.value)}
                    disabled={splitting}
                  />
                  <p className="settings-hint">
                    Enter page numbers separated by commas (e.g., 1, 3, 5)
                  </p>
                </div>
              )}

              {/* Bulk Mode */}
              {splitMode === 'bulk' && (
                <div className="split-settings">
                  <h3>Pages Per File</h3>
                  <input
                    type="number"
                    className="bulk-input"
                    min="1"
                    max={pageCount}
                    value={bulkSize}
                    onChange={(e) => setBulkSize(parseInt(e.target.value) || 1)}
                    disabled={splitting}
                  />
                  <p className="settings-hint">
                    Will create {Math.ceil(pageCount / bulkSize)} PDF files
                  </p>
                </div>
              )}

              {/* Split Button */}
              <button
                className="split-btn"
                onClick={handleSplit}
                disabled={splitting}
              >
                {splitting ? (
                  <>
                    <span className="spinner"></span>
                    Splitting...
                  </>
                ) : (
                  <>
                    <Scissors size={20} />
                    Split PDF
                  </>
                )}
              </button>
            </>
          )}

          {/* Results */}
          {splitFiles.length > 0 && (
            <div className="results-section">
              <div className="results-header">
                <h3>Split Files ({splitFiles.length})</h3>
                <button className="download-all-btn" onClick={downloadAll}>
                  <Download size={18} />
                  Download All
                </button>
              </div>

              <div className="split-files-list">
                {splitFiles.map((file) => (
                  <div key={file.id} className="split-file-item">
                    <FileText size={24} />
                    <div className="split-file-info">
                      <div className="split-file-name">{file.name}</div>
                      <div className="split-file-meta">
                        Pages {file.pages} • {formatBytes(file.size)}
                      </div>
                    </div>
                    <button
                      className="download-file-btn"
                      onClick={() => downloadFile(file)}
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="tool-features">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📄</div>
              <strong>Page Range</strong>
              <p>Extract specific page ranges</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📑</div>
              <strong>Single Pages</strong>
              <p>Extract individual pages</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📚</div>
              <strong>Bulk Split</strong>
              <p>Split into equal parts</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <strong>Secure</strong>
              <p>All processing in your browser</p>
            </div>
          </div>
        </div>

        {/* BOTTOM AD */}
        <div className="tool-ad-bottom">
          <div className="ad-placeholder ad-leaderboard">
            <span>728 x 90</span>
            <span>Ad Space</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR AD */}
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

export default PDFSplitterPage;