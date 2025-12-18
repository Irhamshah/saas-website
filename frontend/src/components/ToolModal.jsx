import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Download, Upload, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { toolProcessors } from '../utils/toolProcessors';
import axios from 'axios';
import './ToolModal.css';
import PDFMerge from './PDFMerge';
import PDFCompressor from './PDFCompressor';
import ImageCompressor from './ImageCompressor';
import DataConverter from './DataConverter';
import ImageToPDF from './ImageToPDF';
import QRGenerator from './QRGenerator';
import TextTools from './TextTools';
import InvoiceGenerator from './InvoiceGenerator';
import ReceiptGenerator from './ReceiptGenerator';
import ImageColorPicker from './ImageColorPicker';
import UnitConverter from './UnitConverter';
import JSONFormatter from './JSONFormatter';
import SQLFormatter from './SQLFormatter';
import RegexTester from './RegexTester';
import JWTDecoder from './JWTDecoder';
import HashGenerator from './HashGenerator';
import Base64Tool from './Base64Tool';
import PasswordGenerator from './PasswordGenerator';
import InterestCalculator from './InterestCalculator';
import LoanCalculator from './LoanCalculator';
import UUIDGenerator from './UUIDGenerator';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ToolModal({ tool, onClose }) {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState(null);
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit] = useState(3);

  const requiresPremium = tool.premium && !user?.isPremium;
  const needsFile = ['image-compress', 'image-pdf', 'pdf-merge', 'pdf-split', 'pdf-compress'].includes(tool.id);
  const needsInput = !['uuid', 'password', 'qr'].includes(tool.id) && !needsFile;

  useEffect(() => {
    checkUsageLimit();
  }, [tool.id]);

  const checkUsageLimit = async () => {
    // Get usage from localStorage (client-side tracking)
    const currentMonth = new Date().getMonth();
    const storageKey = `usage_${currentMonth}`;
    const usage = JSON.parse(localStorage.getItem(storageKey) || '{}');
    setUsageCount(usage[tool.id] || 0);

    // If user is logged in, sync with server
    if (user) {
      try {
        const response = await axios.get(`${API_URL}/analytics/usage/${tool.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUsageCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching usage:', error);
      }
    }
  };

  const incrementUsage = async () => {
    const currentMonth = new Date().getMonth();
    const storageKey = `usage_${currentMonth}`;
    const usage = JSON.parse(localStorage.getItem(storageKey) || '{}');
    usage[tool.id] = (usage[tool.id] || 0) + 1;
    localStorage.setItem(storageKey, JSON.stringify(usage));
    setUsageCount(usage[tool.id]);

    // If user is logged in, track on server
    if (user) {
      try {
        await axios.post(
          `${API_URL}/analytics/track`,
          { toolId: tool.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } catch (error) {
        console.error('Error tracking usage:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.success(`File selected: ${selectedFile.name}`);
    }
  };

  const handleProcess = async () => {
    // Check usage limit for free users
    if (!user?.isPremium && usageCount >= usageLimit) {
      toast.error(`Free limit reached! You've used this tool ${usageLimit} times this month. Upgrade to Premium for unlimited access.`);
      return;
    }

    if (requiresPremium) {
      toast.error('This feature requires a Premium subscription');
      return;
    }

    if (needsFile && !file) {
      toast.error('Please select a file first');
      return;
    }

    if (needsInput && !input.trim() && !file) {
      toast.error('Please enter some input');
      return;
    }

    setProcessing(true);
    try {
      const processor = toolProcessors[tool.id];
      if (processor) {
        let result;
        if (needsFile) {
          result = await processor(file);
        } else {
          result = await processor(input);
        }
        setOutput(result);
        await incrementUsage();
        toast.success('Processed successfully!');
      } else {
        setOutput('Tool processor not implemented yet');
      }
    } catch (error) {
      toast.error(error.message || 'Processing failed');
      setOutput(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Handle different output types
    if (output.startsWith('data:')) {
      // It's a data URL (image or file)
      const link = document.createElement('a');
      link.href = output;
      link.download = `${tool.id}-output.${getFileExtension(output)}`;
      link.click();
      toast.success('Downloaded!');
    } else {
      // Text output
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tool.id}-output.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    }
  };

  const getFileExtension = (dataUrl) => {
    if (dataUrl.includes('image/png')) return 'png';
    if (dataUrl.includes('image/jpeg')) return 'jpg';
    if (dataUrl.includes('application/pdf')) return 'pdf';
    return 'file';
  };

  const usagePercentage = (usageCount / usageLimit) * 100;
  const usageRemaining = Math.max(0, usageLimit - usageCount);

  // Add at the start, before existing return
  if (tool.id === 'pdf-merge') {
    return <PDFMerge onClose={onClose} />;
  }

  if (tool.id === 'pdf-compress') {
    return <PDFCompressor onClose={onClose} />;
  }

  if (tool.id === 'image-compress') {
    return <ImageCompressor onClose={onClose} />;
  }

  // Add this check for csv-json tool
  if (tool.id === 'csv-json') {
    return <DataConverter onClose={onClose} initialMode="csv-to-json" />;
  }

  // Image to PDF
  if (tool.id === 'image-pdf') {
    return <ImageToPDF onClose={onClose} />;
  }

  // QR Code Generator
  if (tool.id === 'qr') {
    return <QRGenerator onClose={onClose} />;
  }
  // Word Counter
  if (tool.id === 'word-counter') {
    return <TextTools onClose={onClose} initialTool="word-counter" />;
  }

  // Case Converter
  if (tool.id === 'case-converter') {
    return <TextTools onClose={onClose} initialTool="case-converter" />;
  }

  // Duplicate Remover
  if (tool.id === 'duplicate-remover') {
    return <TextTools onClose={onClose} initialTool="duplicate-remover" />;
  }

  // Sort Lines
  if (tool.id === 'sort-lines') {
    return <TextTools onClose={onClose} initialTool="sort-lines" />;
  }

  // Text Diff
  if (tool.id === 'text-diff') {
    return <TextTools onClose={onClose} initialTool="text-diff" />;
  }

  // Lorem Ipsum Generator
  if (tool.id === 'lorem-ipsum') {
    return <TextTools onClose={onClose} initialTool="lorem-ipsum" />;
  }

  if (tool.id === 'invoice') {
    return <InvoiceGenerator onClose={onClose} />;
  }

  if (tool.id === 'receipt') {
    return <ReceiptGenerator onClose={onClose} />;
  }

  if (tool.id === 'color-picker') {
    return <ImageColorPicker onClose={onClose} />;
  }

  if (tool.id === 'unit-converter') {
    return <UnitConverter onClose={onClose} />;
  }

  // JSON Formatter
  if (tool.id === 'json-formatter') {
    return <JSONFormatter onClose={onClose} />;
  }

  // SQL Formatter
  if (tool.id === 'sql-formatter') {
    return <SQLFormatter onClose={onClose} />;
  }

  if (tool.id === 'regex') {
    return <RegexTester onClose={onClose} />;
  }

  if (tool.id === 'jwt') {
    return <JWTDecoder onClose={onClose} />;
  }

  // Hash Generator
  if (tool.id === 'hash') {
    return <HashGenerator onClose={onClose} />;
  }

  // Base64 Tool
  if (tool.id === 'base64') {
    return <Base64Tool onClose={onClose} />;
  }

  if (tool.id === 'password') {
    return <PasswordGenerator onClose={onClose} />;
  }

  if (tool.id === 'interest-calculator') {
    return <InterestCalculator onClose={onClose} />;
  }

  if (tool.id === 'loan-calculator') {
    return <LoanCalculator onClose={onClose} />;
  }

  if (tool.id === 'uuid') {
    return <UUIDGenerator onClose={onClose} />;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div>
              <h2>{tool.name}</h2>
              <p className="modal-description">{tool.description}</p>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="modal-content">
            {/* Usage Limit Display for Free Users */}
            {!user?.isPremium && (
              <div className={`usage-indicator ${usageCount >= usageLimit ? 'limit-reached' : ''}`}>
                <div className="usage-header">
                  <AlertCircle size={18} />
                  <span>Free Monthly Limit: {usageRemaining} uses remaining</span>
                </div>
                <div className="usage-bar">
                  <div
                    className="usage-fill"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                {usageCount >= usageLimit && (
                  <p className="usage-text">
                    Upgrade to Premium for unlimited access!
                  </p>
                )}
              </div>
            )}

            {requiresPremium && (
              <div className="premium-notice">
                <p>🔒 This tool requires a Premium subscription</p>
                <button className="btn-secondary">Upgrade to Premium</button>
              </div>
            )}

            {/* File Upload Section */}
            {needsFile && !requiresPremium && (
              <div className="tool-input-section">
                <label>Upload File</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    accept={getAcceptTypes()}
                    disabled={requiresPremium || usageCount >= usageLimit}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-input" className="file-upload-label">
                    <Upload size={24} />
                    <span>{file ? file.name : 'Click to select file'}</span>
                    <span className="file-hint">{getFileHint()}</span>
                  </label>
                </div>
              </div>
            )}

            {/* Text Input Section */}
            {needsInput && !requiresPremium && (
              <div className="tool-input-section">
                <label>Input</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={getPlaceholder()}
                  disabled={requiresPremium || usageCount >= usageLimit}
                />
              </div>
            )}

            <button
              className="btn-primary process-btn"
              onClick={handleProcess}
              disabled={requiresPremium || processing || usageCount >= usageLimit}
            >
              {processing ? 'Processing...' : needsInput || needsFile ? 'Process' : 'Generate'}
            </button>

            {output && (
              <motion.div
                className="tool-output-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="output-header">
                  <label>Output</label>
                  <div className="output-actions">
                    {!output.startsWith('data:') && (
                      <button
                        className="icon-btn"
                        onClick={handleCopy}
                        title="Copy to clipboard"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    )}
                    <button
                      className="icon-btn"
                      onClick={handleDownload}
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
                {output.startsWith('data:image') ? (
                  <div className="output-image">
                    <img src={output} alt="Processed output" />
                  </div>
                ) : output.startsWith('data:') ? (
                  <div className="output-file">
                    <p>✅ File processed successfully!</p>
                    <button className="btn-primary" onClick={handleDownload}>
                      Download Result
                    </button>
                  </div>
                ) : (
                  <pre className="output-content">{output}</pre>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  function getAcceptTypes() {
    switch (tool.id) {
      case 'image-compress':
      case 'image-pdf':
        return 'image/*';
      case 'pdf-merge':
      case 'pdf-split':
      case 'pdf-compress':
        return 'application/pdf';
      default:
        return '*/*';
    }
  }

  function getFileHint() {
    switch (tool.id) {
      case 'image-compress':
        return ' PNG, JPG, WebP (Max 10MB)';
      case 'image-pdf':
        return ' Any image format';
      case 'pdf-merge':
      case 'pdf-split':
      case 'pdf-compress':
        return ' PDF files only';
      default:
        return ' Any file';
    }
  }

  function getPlaceholder() {
    if (tool.id.includes('json')) return 'Enter JSON here...';
    if (tool.id.includes('csv')) return 'Enter CSV or JSON here...';
    if (tool.id.includes('sql')) return 'Enter SQL query here...';
    return 'Enter text here...';
  }
}

export default ToolModal;
