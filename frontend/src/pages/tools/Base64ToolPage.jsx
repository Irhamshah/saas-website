// src/pages/tools/Base64ToolPage.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Copy, 
  Check, 
  Upload, 
  Download, 
  ArrowLeftRight, 
  FileText, 
  Image as ImageIcon,
  Binary
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';
import './Base64ToolPage.css';

function Base64ToolPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [inputType, setInputType] = useState('text'); // 'text', 'file', 'image'
  const [textInput, setTextInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('base64', 3);

  // Encode to Base64
  const encodeToBase64 = (text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (err) {
      toast.error('Encoding error');
      return '';
    }
  };

  // Decode from Base64
  const decodeFromBase64 = (base64) => {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (err) {
      toast.error('Invalid Base64 string');
      return '';
    }
  };

  // Handle encode
  const handleEncode = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    if (!textInput.trim() && !file) {
      toast.error('Please enter text or upload a file');
      return;
    }

    if (inputType === 'text') {
      const encoded = encodeToBase64(textInput);
      setOutput(encoded);
      await incrementUsage();
      toast.success('Encoded to Base64!');
    } else if (file) {
      setOutput(file.base64);
      await incrementUsage();
      toast.success('Encoded to Base64!');
    }
  };

  // Handle decode
  const handleDecode = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    if (!textInput.trim()) {
      toast.error('Please enter Base64 string');
      return;
    }

    const decoded = decodeFromBase64(textInput);
    if (decoded) {
      setOutput(decoded);
      await incrementUsage();
      toast.success('Decoded from Base64!');
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();

      if (inputType === 'image' && uploadedFile.type.startsWith('image/')) {
        reader.onload = (e) => {
          const base64 = e.target.result;
          setFile({
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            base64: base64.split(',')[1]
          });
          setImagePreview(base64);
          setTextInput('');
          toast.success('Image loaded!');
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        reader.onload = (e) => {
          const content = e.target.result;
          const base64 = btoa(content);
          setFile({
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            base64: base64
          });
          setTextInput('');
          toast.success('File loaded!');
        };
        reader.readAsBinaryString(uploadedFile);
      }
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!output) {
      toast.error('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download output
  const handleDownload = () => {
    if (!output) {
      toast.error('Nothing to download');
      return;
    }

    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Swap input/output
  const handleSwap = () => {
    if (!output) {
      toast.error('Nothing to swap');
      return;
    }
    setTextInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setFile(null);
    setImagePreview('');
    toast.success('Swapped!');
  };

  // Load sample
  const loadSample = () => {
    if (mode === 'encode') {
      setTextInput('Hello, World! This is a sample text for Base64 encoding.');
      setInputType('text');
      setFile(null);
      setImagePreview('');
    } else {
      setTextInput('SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2FtcGxlIHRleHQgZm9yIEJhc2U2NCBlbmNvZGluZy4=');
    }
    setOutput('');
    toast.success('Sample loaded!');
  };

  // Clear all
  const handleClear = () => {
    setTextInput('');
    setOutput('');
    setFile(null);
    setImagePreview('');
    toast.success('Cleared!');
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="tool-page-with-ads">
      <SEO
        title="Base64 Encoder/Decoder - Encode & Decode Base64 | LiteTools"
        description="Free Base64 encoder and decoder. Encode text, files, and images to Base64 or decode Base64 strings online."
        keywords="base64 encoder, base64 decoder, encode base64, decode base64, base64 tool"
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
          <button className="back-button" onClick={() => navigate('/developer-tools')}>
            <ArrowLeft size={20} />
            <span>Back to Developer Tools</span>
          </button>

          <div className="tool-title-section">
            <div className="tool-icon">
              <Binary size={32} />
            </div>
            <div>
              <h1 className="tool-title">Base64 Encoder/Decoder</h1>
              <p className="tool-description">
                Encode and decode text, files, and images to/from Base64
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

          {/* Mode Selection */}
          <div className="mode-section">
            <div className="mode-tabs">
              <button
                className={`mode-tab ${mode === 'encode' ? 'active' : ''}`}
                onClick={() => {
                  setMode('encode');
                  setOutput('');
                }}
              >
                Encode to Base64
              </button>
              <button
                className={`mode-tab ${mode === 'decode' ? 'active' : ''}`}
                onClick={() => {
                  setMode('decode');
                  setOutput('');
                  setInputType('text');
                  setFile(null);
                  setImagePreview('');
                }}
              >
                Decode from Base64
              </button>
            </div>
          </div>

          {/* Input Type Selection (Encode only) */}
          {mode === 'encode' && (
            <div className="input-type-section">
              <label>Input Type:</label>
              <div className="input-type-tabs">
                <button
                  className={`type-tab ${inputType === 'text' ? 'active' : ''}`}
                  onClick={() => {
                    setInputType('text');
                    setFile(null);
                    setImagePreview('');
                  }}
                >
                  <FileText size={16} />
                  Text
                </button>
                <button
                  className={`type-tab ${inputType === 'file' ? 'active' : ''}`}
                  onClick={() => setInputType('file')}
                >
                  <Upload size={16} />
                  File
                </button>
                <button
                  className={`type-tab ${inputType === 'image' ? 'active' : ''}`}
                  onClick={() => setInputType('image')}
                >
                  <ImageIcon size={16} />
                  Image
                </button>
              </div>
            </div>
          )}

          {/* Input/Output Section */}
          <div className="input-output-section">
            <div className="io-pane">
              <h3>Input</h3>
              {mode === 'encode' && (inputType === 'file' || inputType === 'image') ? (
                <>
                  <div className="file-upload-zone" onClick={() => fileInputRef.current?.click()}>
                    {file ? (
                      <div className="file-info">
                        {inputType === 'image' && imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="image-preview" />
                        ) : (
                          <Upload size={48} />
                        )}
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatSize(file.size)}</span>
                          <span className="file-type">{file.type}</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {inputType === 'image' ? <ImageIcon size={48} /> : <Upload size={48} />}
                        <h4>Click to upload {inputType}</h4>
                        <p>Or drag and drop</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={inputType === 'image' ? 'image/*' : '*'}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </>
              ) : (
                <textarea
                  value={textInput}
                  onChange={(e) => {
                    setTextInput(e.target.value);
                    setFile(null);
                    setImagePreview('');
                  }}
                  placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
                  spellCheck={false}
                />
              )}
            </div>

            <div className="swap-section">
              <button className="btn-swap" onClick={handleSwap} title="Swap and reverse">
                <ArrowLeftRight size={24} />
              </button>
            </div>

            <div className="io-pane">
              <div className="output-header">
                <h3>Output</h3>
                <div className="output-actions">
                  <button className="btn-icon" onClick={handleCopy} title="Copy">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button className="btn-icon" onClick={handleDownload} title="Download">
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="actions-row">
            <button
              className="btn-action primary"
              onClick={mode === 'encode' ? handleEncode : handleDecode}
            >
              {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
            </button>
            <button className="btn-action secondary" onClick={loadSample}>
              Load Sample
            </button>
            <button className="btn-action secondary" onClick={handleClear}>
              Clear All
            </button>
          </div>

          {/* Info Section */}
          <div className="info-section">
            <h3>About Base64</h3>
            <div className="info-grid">
              <div className="info-card">
                <h4>What is Base64?</h4>
                <p>Base64 is an encoding scheme that converts binary data into ASCII text format using 64 characters (A-Z, a-z, 0-9, +, /).</p>
              </div>
              <div className="info-card">
                <h4>Common Uses</h4>
                <p>Embedding images in HTML/CSS, email attachments, data URLs, API tokens, and transmitting binary data over text-based protocols.</p>
              </div>
              <div className="info-card">
                <h4>Encoding</h4>
                <p>Converts text or binary data into Base64 string. Output is ~33% larger than input due to encoding overhead.</p>
              </div>
              <div className="info-card">
                <h4>Decoding</h4>
                <p>Requires valid Base64 input (A-Z, a-z, 0-9, +, /, =). Converts back to original text or binary data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="tool-features">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📝</div>
              <strong>Text Encoding</strong>
              <p>Encode any text to Base64 format</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📁</div>
              <strong>File Support</strong>
              <p>Upload and encode any file type</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🖼️</div>
              <strong>Image Preview</strong>
              <p>Preview images before encoding</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔄</div>
              <strong>Two-Way Conversion</strong>
              <p>Encode or decode with one click</p>
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

export default Base64ToolPage;