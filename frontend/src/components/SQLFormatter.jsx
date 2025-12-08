import React, { useState, useRef } from 'react';
import { X, Copy, Check, Download, Upload, Maximize2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import './SQLFormatter.css';

function SQLFormatter({ onClose }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [uppercase, setUppercase] = useState(true);
  const [linesBetweenQueries, setLinesBetweenQueries] = useState(1);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  // SQL keywords
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
    'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
    'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
    'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
    'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'VIEW',
    'AS', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CAST', 'UNION', 'ALL'
  ];

  // Format SQL
  const formatSQL = (sql) => {
    if (!sql.trim()) {
      toast.error('Please enter SQL to format');
      return;
    }

    try {
      let formatted = sql;
      
      // Remove extra whitespace
      formatted = formatted.replace(/\s+/g, ' ').trim();
      
      // Apply uppercase/lowercase to keywords
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        formatted = formatted.replace(regex, uppercase ? keyword : keyword.toLowerCase());
      });
      
      // Add newlines and indentation
      const indent = ' '.repeat(indentSize);
      
      // Split on major keywords
      formatted = formatted
        // Major clauses on new lines
        .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|OUTER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|UNION|INSERT INTO|UPDATE|DELETE FROM|CREATE TABLE|DROP TABLE|ALTER TABLE)\b/gi, '\n$1')
        // AND/OR on new lines with indent
        .replace(/\b(AND|OR)\b/gi, `\n${indent}$1`)
        // ON clause on new line with indent
        .replace(/\b(ON)\b/gi, `\n${indent}$1`)
        // Commas in SELECT with newline
        .replace(/,(?=\s*\S)/g, ',\n' + indent)
        // Clean up whitespace
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      // Add lines between queries (semicolons)
      const separator = '\n'.repeat(linesBetweenQueries + 1);
      formatted = formatted.replace(/;\s*/g, ';' + separator);
      
      // Calculate statistics
      const lines = formatted.split('\n').length;
      const characters = formatted.length;
      const words = formatted.split(/\s+/).length;
      const queries = (formatted.match(/;/g) || []).length + (formatted.includes(';') ? 0 : 1);
      
      const keywordCounts = {};
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = formatted.match(regex);
        if (matches) {
          keywordCounts[keyword] = matches.length;
        }
      });
      
      setOutput(formatted);
      setStats({
        lines,
        characters,
        words,
        queries,
        size: new Blob([formatted]).size,
        topKeywords: Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      });
      
      toast.success('SQL formatted successfully!');
    } catch (err) {
      toast.error('Error formatting SQL');
      console.error(err);
    }
  };

  // Minify SQL
  const handleMinify = () => {
    if (!input.trim()) {
      toast.error('Please enter SQL to minify');
      return;
    }
    
    let minified = input
      .replace(/\s+/g, ' ')
      .replace(/\s*([(),;=<>])\s*/g, '$1')
      .trim();
    
    setOutput(minified);
    setStats({
      lines: 1,
      characters: minified.length,
      words: minified.split(/\s+/).length,
      queries: (minified.match(/;/g) || []).length + (minified.includes(';') ? 0 : 1),
      size: new Blob([minified]).size,
      topKeywords: []
    });
    
    toast.success('SQL minified!');
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

  // Download SQL
  const handleDownload = () => {
    if (!output) {
      toast.error('Nothing to download');
      return;
    }
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.sql';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Upload SQL file
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

  // Load sample SQL
  const loadSample = () => {
    const sample = `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count, SUM(o.total) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at >= '2024-01-01' AND u.status = 'active' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY total_spent DESC LIMIT 10;`;
    setInput(sample);
    toast.success('Sample SQL loaded!');
  };

  // Clear all
  const handleClear = () => {
    setInput('');
    setOutput('');
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
          <h2>SQL Formatter</h2>
          <p>Format and beautify your SQL queries</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="formatter-content">
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
              
              <div className="control-item">
                <label>Query Spacing</label>
                <select value={linesBetweenQueries} onChange={(e) => setLinesBetweenQueries(Number(e.target.value))}>
                  <option value={0}>No spacing</option>
                  <option value={1}>1 line</option>
                  <option value={2}>2 lines</option>
                  <option value={3}>3 lines</option>
                </select>
              </div>
              
              <div className="control-item checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                  />
                  <span>Uppercase Keywords</span>
                </label>
              </div>
            </div>

            <div className="actions-group">
              <button className="btn-action primary" onClick={() => formatSQL(input)}>
                <Maximize2 size={16} />
                Format
              </button>
              <button className="btn-action secondary" onClick={handleMinify}>
                <FileText size={16} />
                Minify
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
                    title="Upload SQL file"
                  >
                    <Upload size={16} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".sql,.txt"
                    onChange={handleUpload}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your SQL here..."
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
                    title="Download SQL"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Formatted SQL will appear here..."
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
                  <span className="stat-label">Words</span>
                  <span className="stat-value">{stats.words}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Queries</span>
                  <span className="stat-value">{stats.queries}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Size</span>
                  <span className="stat-value">{formatSize(stats.size)}</span>
                </div>
              </div>
              
              {stats.topKeywords.length > 0 && (
                <div className="keywords-section">
                  <h4>Top Keywords</h4>
                  <div className="keywords-list">
                    {stats.topKeywords.map(([keyword, count]) => (
                      <div key={keyword} className="keyword-item">
                        <span className="keyword-name">{keyword}</span>
                        <span className="keyword-count">{count}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SQLFormatter;