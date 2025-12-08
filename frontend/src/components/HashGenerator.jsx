import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Hash, Upload, Download, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import CryptoJS from 'crypto-js';
import './HashGenerator.css';

function HashGenerator({ onClose }) {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['MD5', 'SHA256', 'SHA512']);
  const [copiedHash, setCopiedHash] = useState('');
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'file'
  const [file, setFile] = useState(null);
  const fileInputRef = React.useRef(null);

  // Available hash algorithms
  const algorithms = [
    { id: 'MD5', name: 'MD5', description: '128-bit hash' },
    { id: 'SHA1', name: 'SHA-1', description: '160-bit hash' },
    { id: 'SHA256', name: 'SHA-256', description: '256-bit hash' },
    { id: 'SHA512', name: 'SHA-512', description: '512-bit hash' },
    { id: 'SHA3', name: 'SHA-3', description: 'SHA-3 (Keccak)' },
    { id: 'RIPEMD160', name: 'RIPEMD-160', description: '160-bit hash' },
  ];

  // Generate hashes
  useEffect(() => {
    if (!input.trim() && !file) {
      setHashes({});
      return;
    }

    const newHashes = {};
    const textToHash = input || file?.text || '';

    selectedAlgorithms.forEach(algo => {
      try {
        switch (algo) {
          case 'MD5':
            newHashes[algo] = CryptoJS.MD5(textToHash).toString();
            break;
          case 'SHA1':
            newHashes[algo] = CryptoJS.SHA1(textToHash).toString();
            break;
          case 'SHA256':
            newHashes[algo] = CryptoJS.SHA256(textToHash).toString();
            break;
          case 'SHA512':
            newHashes[algo] = CryptoJS.SHA512(textToHash).toString();
            break;
          case 'SHA3':
            newHashes[algo] = CryptoJS.SHA3(textToHash).toString();
            break;
          case 'RIPEMD160':
            newHashes[algo] = CryptoJS.RIPEMD160(textToHash).toString();
            break;
        }
      } catch (err) {
        console.error(`Error generating ${algo}:`, err);
      }
    });

    setHashes(newHashes);
  }, [input, selectedAlgorithms, file]);

  // Toggle algorithm
  const toggleAlgorithm = (algoId) => {
    if (selectedAlgorithms.includes(algoId)) {
      setSelectedAlgorithms(selectedAlgorithms.filter(id => id !== algoId));
    } else {
      setSelectedAlgorithms([...selectedAlgorithms, algoId]);
    }
  };

  // Select all algorithms
  const selectAll = () => {
    setSelectedAlgorithms(algorithms.map(a => a.id));
    toast.success('All algorithms selected');
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedAlgorithms([]);
    toast.success('Selection cleared');
  };

  // Copy hash
  const copyHash = (algo, hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(algo);
    toast.success(`Copied ${algo} hash!`);
    setTimeout(() => setCopiedHash(''), 2000);
  };

  // Copy all hashes
  const copyAll = () => {
    const allHashes = Object.entries(hashes)
      .map(([algo, hash]) => `${algo}: ${hash}`)
      .join('\n');
    navigator.clipboard.writeText(allHashes);
    toast.success('Copied all hashes!');
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFile({
          name: uploadedFile.name,
          text: e.target.result,
          size: uploadedFile.size
        });
        setInput('');
        toast.success('File loaded!');
      };
      reader.readAsText(uploadedFile);
    }
  };

  // Download hashes
  const downloadHashes = () => {
    if (Object.keys(hashes).length === 0) {
      toast.error('No hashes to download');
      return;
    }

    const content = Object.entries(hashes)
      .map(([algo, hash]) => `${algo}: ${hash}`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Load sample
  const loadSample = () => {
    setInput('Hello, World! This is a sample text for hash generation.');
    setFile(null);
    setInputMode('text');
    toast.success('Sample loaded!');
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setFile(null);
    setHashes({});
    toast.success('Cleared!');
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="hash-modal">
      <div className="hash-container">
        <div className="hash-header">
          <h2>Hash Generator</h2>
          <p>Generate cryptographic hashes with multiple algorithms</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="hash-content">
          {/* Input Mode Selection */}
          <div className="mode-section">
            <div className="mode-tabs">
              <button
                className={`mode-tab ${inputMode === 'text' ? 'active' : ''}`}
                onClick={() => {
                  setInputMode('text');
                  setFile(null);
                }}
              >
                Text Input
              </button>
              <button
                className={`mode-tab ${inputMode === 'file' ? 'active' : ''}`}
                onClick={() => setInputMode('file')}
              >
                <Upload size={16} />
                File Input
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="input-section">
            {inputMode === 'text' ? (
              <>
                <label>Text to Hash</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text to generate hashes..."
                  spellCheck={false}
                />
              </>
            ) : (
              <>
                <label>File to Hash</label>
                <div className="file-upload-zone" onClick={() => fileInputRef.current?.click()}>
                  {file ? (
                    <div className="file-info">
                      <Upload size={32} />
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">{formatSize(file.size)}</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} />
                      <h3>Click to upload file</h3>
                      <p>Or drag and drop</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="actions-row">
            <button className="btn-action secondary" onClick={loadSample}>
              <Zap size={16} />
              Load Sample
            </button>
            <button className="btn-action secondary" onClick={handleClear}>
              Clear
            </button>
            {Object.keys(hashes).length > 0 && (
              <>
                <button className="btn-action secondary" onClick={copyAll}>
                  <Copy size={16} />
                  Copy All
                </button>
                <button className="btn-action secondary" onClick={downloadHashes}>
                  <Download size={16} />
                  Download
                </button>
              </>
            )}
          </div>

          {/* Algorithm Selection */}
          <div className="algorithms-section">
            <div className="algorithms-header">
              <h3>Hash Algorithms</h3>
              <div className="algorithm-actions">
                <button className="btn-small" onClick={selectAll}>Select All</button>
                <button className="btn-small" onClick={clearSelection}>Clear</button>
              </div>
            </div>
            <div className="algorithms-grid">
              {algorithms.map(algo => (
                <label
                  key={algo.id}
                  className={`algorithm-item ${selectedAlgorithms.includes(algo.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAlgorithms.includes(algo.id)}
                    onChange={() => toggleAlgorithm(algo.id)}
                  />
                  <div className="algorithm-info">
                    <span className="algorithm-name">{algo.name}</span>
                    <span className="algorithm-desc">{algo.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Hashes Display */}
          {Object.keys(hashes).length > 0 && (
            <div className="hashes-section">
              <h3>Generated Hashes</h3>
              <div className="hashes-list">
                {Object.entries(hashes).map(([algo, hash]) => (
                  <div key={algo} className="hash-item">
                    <div className="hash-header">
                      <div className="hash-algo">
                        <Hash size={18} />
                        <span>{algo}</span>
                      </div>
                      <button
                        className="btn-copy-hash"
                        onClick={() => copyHash(algo, hash)}
                      >
                        {copiedHash === algo ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="hash-value">
                      <code>{hash}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="info-section">
            <h3>Algorithm Information</h3>
            <div className="info-grid">
              <div className="info-card">
                <h4>MD5</h4>
                <p>Fast but not cryptographically secure. Good for checksums, not for security.</p>
              </div>
              <div className="info-card">
                <h4>SHA-256</h4>
                <p>Widely used, secure hash function. Part of SHA-2 family. Recommended for most uses.</p>
              </div>
              <div className="info-card">
                <h4>SHA-512</h4>
                <p>More secure than SHA-256 with longer output. Better for high-security applications.</p>
              </div>
              <div className="info-card">
                <h4>SHA-3</h4>
                <p>Latest standard, based on Keccak algorithm. Alternative to SHA-2 family.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HashGenerator;