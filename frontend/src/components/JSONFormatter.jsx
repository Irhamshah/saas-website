import React, { useState, useRef } from 'react';
import { X, Copy, Check, Download, Upload, Minimize2, Maximize2, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './JSONFormatter.css';
import UsageIndicator from './UsageIndicator';
import { useUsageLimit } from '../hooks/useUsageLimit';

function JSONFormatter({ onClose }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('json-formatter', 3);

  // Format JSON
  const formatJSON = async (text, indent, sort) => {
    if (!canUse) {
      showLimitError();
      return;
    }

    try {
      let parsed = JSON.parse(text);
      
      // Sort keys if enabled
      if (sort) {
        parsed = sortObjectKeys(parsed);
      }
      
      const formatted = JSON.stringify(parsed, null, indent);
      
      // Calculate statistics
      const stats = {
        lines: formatted.split('\n').length,
        characters: formatted.length,
        objects: countObjects(parsed),
        arrays: countArrays(parsed),
        keys: countKeys(parsed),
        size: new Blob([formatted]).size
      };
      
      setOutput(formatted);
      setIsValid(true);
      setError('');
      setStats(stats);
      await incrementUsage();
      toast.success('JSON formatted successfully!');
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      setOutput('');
      setStats(null);
      toast.error('Invalid JSON');
    }
  };

  // Sort object keys recursively
  const sortObjectKeys = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => sortObjectKeys(item));
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)
        .sort()
        .reduce((result, key) => {
          result[key] = sortObjectKeys(obj[key]);
          return result;
        }, {});
    }
    return obj;
  };

  // Count objects
  const countObjects = (obj) => {
    let count = 0;
    if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
      count = 1;
      Object.values(obj).forEach(value => {
        count += countObjects(value);
      });
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countObjects(item);
      });
    }
    return count;
  };

  // Count arrays
  const countArrays = (obj) => {
    let count = 0;
    if (Array.isArray(obj)) {
      count = 1;
      obj.forEach(item => {
        count += countArrays(item);
      });
    } else if (obj !== null && typeof obj === 'object') {
      Object.values(obj).forEach(value => {
        count += countArrays(value);
      });
    }
    return count;
  };

  // Count keys
  const countKeys = (obj) => {
    let count = 0;
    if (obj !== null && typeof obj === 'object' && !Array.isArray(obj)) {
      count = Object.keys(obj).length;
      Object.values(obj).forEach(value => {
        count += countKeys(value);
      });
    } else if (Array.isArray(obj)) {
      obj.forEach(item => {
        count += countKeys(item);
      });
    }
    return count;
  };

  // Handle format
  const handleFormat = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to format');
      return;
    }
    formatJSON(input, indentSize, sortKeys);
  };

  // Minify JSON
  const handleMinify = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to minify');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setIsValid(true);
      setError('');
      
      const stats = {
        lines: 1,
        characters: minified.length,
        objects: countObjects(parsed),
        arrays: countArrays(parsed),
        keys: countKeys(parsed),
        size: new Blob([minified]).size
      };
      setStats(stats);
      toast.success('JSON minified successfully!');
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      setOutput('');
      setStats(null);
      toast.error('Invalid JSON');
    }
  };

  // Validate JSON
  const handleValidate = () => {
    if (!input.trim()) {
      toast.error('Please enter JSON to validate');
      return;
    }
    try {
      JSON.parse(input);
      setIsValid(true);
      setError('');
      toast.success('Valid JSON!');
    } catch (err) {
      setIsValid(false);
      setError(err.message);
      toast.error('Invalid JSON');
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

  // Download JSON
  const handleDownload = () => {
    if (!output) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Upload JSON file
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInput(e.target.result);
        toast.success('File loaded!');
      };
      reader.readAsText(file);
    }
  };

  // Sample JSON
  const loadSample = () => {
    const sample = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "traveling"],
  "isActive": true
}`;
    setInput(sample);
    toast.success('Sample JSON loaded!');
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setOutput('');
    setIsValid(null);
    setError('');
    setStats(null);
    toast.success('Cleared!');
  };

  // Format size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="formatter-modal">
      <div className="formatter-container">
        <div className="formatter-header">
          <h2>JSON Formatter</h2>
          <p>Format, validate, and beautify your JSON</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="formatter-content">
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />
          {/* Controls */}
          <div className="controls-section">
            <div className="controls-group">
              <div className="control-item">
                <label>Indent Size</label>
                <select value={indentSize} onChange={(e) => setIndentSize(Number(e.target.value))}>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              
              <div className="control-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={sortKeys}
                    onChange={(e) => setSortKeys(e.target.checked)}
                  />
                  <span>Sort Keys</span>
                </label>
              </div>
            </div>

            <div className="actions-group">
              <button className="btn-action primary" onClick={handleFormat}>
                <Maximize2 size={16} />
                Format
              </button>
              <button className="btn-action secondary" onClick={handleMinify}>
                <Minimize2 size={16} />
                Minify
              </button>
              <button className="btn-action secondary" onClick={handleValidate}>
                <CheckCircle size={16} />
                Validate
              </button>
              <button className="btn-action secondary" onClick={loadSample}>
                <Upload size={16} />
                Sample
              </button>
              <button className="btn-action secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>

          {/* Validation Status */}
          {isValid !== null && (
            <div className={`status-banner ${isValid ? 'valid' : 'error'}`}>
              {isValid ? (
                <>
                  <CheckCircle size={20} />
                  <span>Valid JSON</span>
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  <span>Invalid JSON: {error}</span>
                </>
              )}
            </div>
          )}

          {/* Editor Section */}
          <div className="editor-section">
            {/* Input */}
            <div className="editor-pane">
              <div className="editor-header">
                <h3>Input</h3>
                <div className="editor-actions">
                  <button
                    className="btn-icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload JSON file"
                  >
                    <Upload size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your JSON here..."
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="editor-pane">
              <div className="editor-header">
                <h3>Output</h3>
                <div className="editor-actions">
                  <button
                    className="btn-icon"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={handleDownload}
                    title="Download JSON"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Formatted JSON will appear here..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Statistics */}
          {stats && (
            <div className="stats-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Lines</span>
                  <span className="stat-value">{stats.lines}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Characters</span>
                  <span className="stat-value">{stats.characters.toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Objects</span>
                  <span className="stat-value">{stats.objects}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Arrays</span>
                  <span className="stat-value">{stats.arrays}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Keys</span>
                  <span className="stat-value">{stats.keys}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Size</span>
                  <span className="stat-value">{formatSize(stats.size)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JSONFormatter;