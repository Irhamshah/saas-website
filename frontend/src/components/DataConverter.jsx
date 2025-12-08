import React, { useState } from 'react';
import { X, Upload, Download, Copy, Check, FileText, ArrowLeftRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './DataConverter.css';

function DataConverter({ onClose, initialMode = 'csv-to-json' }) {
  const [mode, setMode] = useState(initialMode); // 'csv-to-json' or 'json-to-csv'
  const [inputText, setInputText] = useState('');
  const [output, setOutput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      readFile(selectedFile);
    }
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText(e.target.result);
      toast.success(`File loaded: ${file.name}`);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const expectedType = mode === 'csv-to-json' ? 'text/csv' : 'application/json';
      const expectedExt = mode === 'csv-to-json' ? '.csv' : '.json';
      
      if (droppedFile.name.endsWith(expectedExt) || droppedFile.type.includes(expectedType.split('/')[1])) {
        setFile(droppedFile);
        readFile(droppedFile);
      } else {
        toast.error(`Please drop a ${expectedExt} file`);
      }
    }
  };

  const csvToJson = (csv) => {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    
    // Parse data rows
    const result = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Try to convert to number if possible
        if (value && !isNaN(value)) {
          value = parseFloat(value);
        }
        // Convert boolean strings
        else if (value.toLowerCase() === 'true') {
          value = true;
        } else if (value.toLowerCase() === 'false') {
          value = false;
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return JSON.stringify(result, null, 2);
  };

  const jsonToCsv = (json) => {
    let data;
    
    try {
      data = JSON.parse(json);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }

    if (!Array.isArray(data)) {
      throw new Error('JSON must be an array of objects');
    }

    if (data.length === 0) {
      throw new Error('JSON array is empty');
    }

    // Get all unique keys from all objects
    const allKeys = new Set();
    data.forEach(obj => {
      Object.keys(obj).forEach(key => allKeys.add(key));
    });
    
    const headers = Array.from(allKeys);
    
    // Create CSV header row
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    // Create CSV data rows
    data.forEach(obj => {
      const values = headers.map(header => {
        let value = obj[header];
        
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        
        // Convert to string
        value = String(value);
        
        // Wrap in quotes if contains comma or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  };

  const handleConvert = () => {
    if (!inputText.trim()) {
      toast.error('Please enter or upload some data');
      return;
    }

    setProcessing(true);
    try {
      let result;
      if (mode === 'csv-to-json') {
        result = csvToJson(inputText);
      } else {
        result = jsonToCsv(inputText);
      }
      
      setOutput(result);
      toast.success('Conversion successful! 🎉');
    } catch (error) {
      toast.error(error.message);
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
    if (!output) {
      toast.error('No output to download');
      return;
    }

    const extension = mode === 'csv-to-json' ? '.json' : '.csv';
    const mimeType = mode === 'csv-to-json' ? 'application/json' : 'text/csv';
    const filename = file 
      ? file.name.replace(/\.[^/.]+$/, extension)
      : `converted${extension}`;

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded!');
  };

  const switchMode = () => {
    setMode(mode === 'csv-to-json' ? 'json-to-csv' : 'csv-to-json');
    setInputText('');
    setOutput('');
    setFile(null);
    toast.success(`Switched to ${mode === 'csv-to-json' ? 'JSON to CSV' : 'CSV to JSON'}`);
  };

  const clearAll = () => {
    setInputText('');
    setOutput('');
    setFile(null);
  };

  const getPlaceholder = () => {
    if (mode === 'csv-to-json') {
      return `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago`;
    } else {
      return `[
  {
    "name": "John",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Jane",
    "age": 25,
    "city": "Los Angeles"
  }
]`;
    }
  };

  return (
    <div className="converter-modal">
      <div className="converter-container">
        <div className="converter-header">
          <div>
            <h2>
              {mode === 'csv-to-json' ? 'CSV to JSON' : 'JSON to CSV'} Converter
            </h2>
            <p>Convert between CSV and JSON formats with ease</p>
          </div>
          <div className="header-actions">
            <button className="switch-btn" onClick={switchMode}>
              <ArrowLeftRight size={20} />
              Switch to {mode === 'csv-to-json' ? 'JSON to CSV' : 'CSV to JSON'}
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="converter-content">
          {/* Upload Area */}
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('data-file-input').click()}
          >
            <input
              id="data-file-input"
              type="file"
              accept={mode === 'csv-to-json' ? '.csv,text/csv' : '.json,application/json'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={40} />
            <h3>Drop {mode === 'csv-to-json' ? 'CSV' : 'JSON'} file here or click to browse</h3>
            <p>Or paste/type your data below</p>
          </div>

          {file && (
            <div className="file-badge">
              <FileText size={18} />
              <span>{file.name}</span>
              <button onClick={() => { setFile(null); setInputText(''); }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input Section */}
          <div className="converter-section">
            <div className="section-header">
              <label>Input {mode === 'csv-to-json' ? 'CSV' : 'JSON'}</label>
              {inputText && (
                <button className="btn-text-small" onClick={clearAll}>
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getPlaceholder()}
              rows={12}
            />
          </div>

          {/* Convert Button */}
          <button
            className="btn-primary convert-btn"
            onClick={handleConvert}
            disabled={processing || !inputText.trim()}
          >
            {processing ? (
              <>
                <span className="spinner"></span>
                Converting...
              </>
            ) : (
              <>
                <ArrowLeftRight size={20} />
                Convert to {mode === 'csv-to-json' ? 'JSON' : 'CSV'}
              </>
            )}
          </button>

          {/* Output Section */}
          {output && (
            <div className="converter-section output-section">
              <div className="section-header">
                <label>Output {mode === 'csv-to-json' ? 'JSON' : 'CSV'}</label>
                <div className="output-actions">
                  <button className="btn-icon" onClick={handleCopy} title="Copy">
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                  <button className="btn-icon" onClick={handleDownload} title="Download">
                    <Download size={18} />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                rows={12}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataConverter;