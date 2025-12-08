import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Type, AlignLeft, List, ArrowUpDown, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import './TextTools.css';

function TextTools({ onClose, initialTool = 'word-counter' }) {
  const [currentTool, setCurrentTool] = useState(initialTool);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Word Counter state
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    readingTime: 0
  });

  // Case Converter state
  const [caseType, setCaseType] = useState('lower');

  // Lorem Ipsum state
  const [loremType, setLoremType] = useState('paragraphs');
  const [loremCount, setLoremCount] = useState(3);
  const [loremWords, setLoremWords] = useState(500);

  // Text Diff state
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState([]);

  // Calculate word counter stats
  useEffect(() => {
    if (currentTool === 'word-counter') {
      const text = inputText;
      
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      
      const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      
      const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
      
      const lines = text === '' ? 0 : text.split('\n').length;
      
      const readingTime = Math.ceil(words / 200); // 200 words per minute

      setStats({
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        lines,
        readingTime
      });
    }
  }, [inputText, currentTool]);

  // Case Converter
  const convertCase = (type) => {
    let result = '';
    
    switch (type) {
      case 'lower':
        result = inputText.toLowerCase();
        break;
      case 'upper':
        result = inputText.toUpperCase();
        break;
      case 'title':
        result = inputText.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'sentence':
        result = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, l => l.toUpperCase());
        break;
      case 'camel':
        result = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^(.)/, (m, chr) => chr.toLowerCase());
        break;
      case 'pascal':
        result = inputText
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
          .replace(/^(.)/, (m, chr) => chr.toUpperCase());
        break;
      case 'snake':
        result = inputText.trim().toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebab':
        result = inputText.trim().toLowerCase().replace(/\s+/g, '-');
        break;
      case 'alternate':
        result = inputText.split('').map((char, i) => 
          i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      case 'inverse':
        result = inputText.split('').map(char => {
          if (char === char.toUpperCase()) return char.toLowerCase();
          return char.toUpperCase();
        }).join('');
        break;
      default:
        result = inputText;
    }
    
    setOutputText(result);
    toast.success('Text converted!');
  };

  // Duplicate Line Remover
  const removeDuplicates = () => {
    const lines = inputText.split('\n');
    const uniqueLines = [...new Set(lines)];
    const removed = lines.length - uniqueLines.length;
    
    setOutputText(uniqueLines.join('\n'));
    toast.success(`Removed ${removed} duplicate line${removed !== 1 ? 's' : ''}!`);
  };

  // Sort Lines
  const sortLines = (order = 'asc', caseInsensitive = true) => {
    const lines = inputText.split('\n');
    
    const sorted = lines.sort((a, b) => {
      const aCompare = caseInsensitive ? a.toLowerCase() : a;
      const bCompare = caseInsensitive ? b.toLowerCase() : b;
      
      if (order === 'asc') {
        return aCompare.localeCompare(bCompare);
      } else {
        return bCompare.localeCompare(aCompare);
      }
    });
    
    setOutputText(sorted.join('\n'));
    toast.success(`Lines sorted ${order === 'asc' ? 'A-Z' : 'Z-A'}!`);
  };

  // Lorem Ipsum Generator
  const loremWordsArray = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateSentence = () => {
    const length = Math.floor(Math.random() * 10) + 5;
    const words = [];
    for (let i = 0; i < length; i++) {
      words.push(loremWordsArray[Math.floor(Math.random() * loremWordsArray.length)]);
    }
    return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
  };

  const generateParagraph = () => {
    const sentences = Math.floor(Math.random() * 4) + 3;
    const paragraph = [];
    for (let i = 0; i < sentences; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(' ');
  };

  const generateLorem = () => {
    let result = '';
    
    switch (loremType) {
      case 'paragraphs':
        // Distribute words across paragraphs
        const wordsPerParagraph = Math.floor(loremWords / loremCount);
        const paragraphs = [];
        
        for (let i = 0; i < loremCount; i++) {
          const targetWords = i === loremCount - 1 
            ? loremWords - (wordsPerParagraph * (loremCount - 1)) // Last paragraph gets remaining words
            : wordsPerParagraph;
          
          let paragraphWords = [];
          let currentWordCount = 0;
          
          while (currentWordCount < targetWords) {
            const sentenceLength = Math.min(
              Math.floor(Math.random() * 10) + 5,
              targetWords - currentWordCount
            );
            
            const words = [];
            for (let j = 0; j < sentenceLength; j++) {
              words.push(loremWordsArray[Math.floor(Math.random() * loremWordsArray.length)]);
            }
            
            const sentence = words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
            paragraphWords.push(sentence);
            currentWordCount += sentenceLength;
          }
          
          paragraphs.push(paragraphWords.join(' '));
        }
        
        result = paragraphs.join('\n\n');
        break;
        
      case 'sentences':
        const sentences = [];
        for (let i = 0; i < loremCount; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;
        
      case 'words':
        const words = [];
        for (let i = 0; i < loremCount; i++) {
          words.push(loremWordsArray[Math.floor(Math.random() * loremWordsArray.length)]);
        }
        result = words.join(' ');
        break;
    }
    
    setOutputText(result);
    toast.success('Lorem ipsum generated!');
  };

  // Text Diff Checker
  const compareTexts = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const result = [];
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 === line2) {
        result.push({ type: 'equal', line1, line2 });
      } else if (!line1) {
        result.push({ type: 'added', line1: '', line2 });
      } else if (!line2) {
        result.push({ type: 'removed', line1, line2: '' });
      } else {
        result.push({ type: 'modified', line1, line2 });
      }
    }
    
    setDiffResult(result);
  };

  useEffect(() => {
    if (currentTool === 'text-diff' && (text1 || text2)) {
      compareTexts();
    }
  }, [text1, text2, currentTool]);

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear all
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setText1('');
    setText2('');
    setDiffResult([]);
  };

  const renderToolContent = () => {
    switch (currentTool) {
      case 'word-counter':
        return (
          <div className="tool-content-wrapper">
            <div className="input-section">
              <label>Enter or paste your text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={15}
                autoFocus
              />
            </div>
            
            <div className="stats-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.words}</div>
                  <div className="stat-label">Words</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.characters}</div>
                  <div className="stat-label">Characters</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.charactersNoSpaces}</div>
                  <div className="stat-label">Characters (no spaces)</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.sentences}</div>
                  <div className="stat-label">Sentences</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.paragraphs}</div>
                  <div className="stat-label">Paragraphs</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.lines}</div>
                  <div className="stat-label">Lines</div>
                </div>
              </div>
              
              <div className="reading-time">
                <Zap size={18} />
                <span>Estimated reading time: <strong>{stats.readingTime} min</strong></span>
              </div>
            </div>
          </div>
        );

      case 'case-converter':
        return (
          <div className="tool-content-wrapper">
            <div className="input-section">
              <label>Enter your text</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={8}
                autoFocus
              />
            </div>

            <div className="case-buttons">
              <button onClick={() => convertCase('lower')} className="case-btn">lowercase</button>
              <button onClick={() => convertCase('upper')} className="case-btn">UPPERCASE</button>
              <button onClick={() => convertCase('title')} className="case-btn">Title Case</button>
              <button onClick={() => convertCase('sentence')} className="case-btn">Sentence case</button>
              <button onClick={() => convertCase('camel')} className="case-btn">camelCase</button>
              <button onClick={() => convertCase('pascal')} className="case-btn">PascalCase</button>
              <button onClick={() => convertCase('snake')} className="case-btn">snake_case</button>
              <button onClick={() => convertCase('kebab')} className="case-btn">kebab-case</button>
              <button onClick={() => convertCase('alternate')} className="case-btn">aLtErNaTe</button>
              <button onClick={() => convertCase('inverse')} className="case-btn">InVeRsE</button>
            </div>

            {outputText && (
              <div className="output-section">
                <div className="output-header">
                  <label>Result</label>
                  <button className="copy-btn" onClick={() => copyToClipboard(outputText)}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  rows={8}
                />
              </div>
            )}
          </div>
        );

      case 'duplicate-remover':
        return (
          <div className="tool-content-wrapper">
            <div className="input-section">
              <label>Enter text (one item per line)</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Line 1&#10;Line 2&#10;Line 1 (duplicate)&#10;Line 3"
                rows={10}
                autoFocus
              />
              <button className="action-btn primary" onClick={removeDuplicates}>
                <List size={18} />
                Remove Duplicates
              </button>
            </div>

            {outputText && (
              <div className="output-section">
                <div className="output-header">
                  <label>Result (Unique lines)</label>
                  <button className="copy-btn" onClick={() => copyToClipboard(outputText)}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  rows={10}
                />
              </div>
            )}
          </div>
        );

      case 'sort-lines':
        return (
          <div className="tool-content-wrapper">
            <div className="input-section">
              <label>Enter text (one item per line)</label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Zebra&#10;Apple&#10;Banana&#10;Orange"
                rows={10}
                autoFocus
              />
              <div className="sort-buttons">
                <button className="action-btn primary" onClick={() => sortLines('asc', true)}>
                  <ArrowUpDown size={18} />
                  Sort A-Z
                </button>
                <button className="action-btn secondary" onClick={() => sortLines('desc', true)}>
                  <ArrowUpDown size={18} />
                  Sort Z-A
                </button>
              </div>
            </div>

            {outputText && (
              <div className="output-section">
                <div className="output-header">
                  <label>Result (Sorted)</label>
                  <button className="copy-btn" onClick={() => copyToClipboard(outputText)}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  rows={10}
                />
              </div>
            )}
          </div>
        );

      case 'lorem-ipsum':
        return (
          <div className="tool-content-wrapper">
            <div className="lorem-controls">
              <div className="lorem-options">
                <div className="option-group">
                  <label>Generate</label>
                  <select value={loremType} onChange={(e) => setLoremType(e.target.value)}>
                    <option value="paragraphs">Paragraphs</option>
                    <option value="sentences">Sentences</option>
                    <option value="words">Words</option>
                  </select>
                </div>
                
                {loremType === 'paragraphs' ? (
                  <>
                    <div className="option-group">
                      <label>Paragraphs</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={loremCount}
                        onChange={(e) => setLoremCount(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="option-group">
                      <label>Total Words</label>
                      <input
                        type="number"
                        min="10"
                        max="5000"
                        step="10"
                        value={loremWords}
                        onChange={(e) => setLoremWords(parseInt(e.target.value) || 10)}
                      />
                    </div>
                  </>
                ) : (
                  <div className="option-group">
                    <label>Count</label>
                    <input
                      type="number"
                      min="1"
                      max={loremType === 'words' ? 5000 : 100}
                      value={loremCount}
                      onChange={(e) => setLoremCount(parseInt(e.target.value) || 1)}
                    />
                  </div>
                )}
                
                <button className="action-btn primary" onClick={generateLorem}>
                  <FileText size={18} />
                  Generate
                </button>
              </div>
              
              {loremType === 'paragraphs' && (
                <div className="lorem-hint">
                  <span>Will generate {loremWords} words across {loremCount} paragraph{loremCount !== 1 ? 's' : ''} (~{Math.floor(loremWords / loremCount)} words per paragraph)</span>
                </div>
              )}
            </div>

            {outputText && (
              <div className="output-section full">
                <div className="output-header">
                  <label>Generated Lorem Ipsum</label>
                  <button className="copy-btn" onClick={() => copyToClipboard(outputText)}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  value={outputText}
                  readOnly
                  rows={15}
                />
              </div>
            )}
          </div>
        );

      case 'text-diff':
        return (
          <div className="diff-container">
            <div className="diff-inputs">
              <div className="diff-input-section">
                <label>Original Text</label>
                <textarea
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter original text..."
                  rows={12}
                />
              </div>
              
              <div className="diff-input-section">
                <label>Modified Text</label>
                <textarea
                  value={text2}
                  onChange={(e) => setText2(e.target.value)}
                  placeholder="Enter modified text..."
                  rows={12}
                />
              </div>
            </div>

            {diffResult.length > 0 && (
              <div className="diff-results">
                <h3>Differences</h3>
                <div className="diff-legend">
                  <span className="legend-item added">Added</span>
                  <span className="legend-item removed">Removed</span>
                  <span className="legend-item modified">Modified</span>
                </div>
                <div className="diff-output">
                  {diffResult.map((item, index) => (
                    <div key={index} className={`diff-line ${item.type}`}>
                      <div className="diff-line-content">
                        <div className="diff-line-original">
                          {item.line1 || <span className="empty-line">(empty)</span>}
                        </div>
                        <div className="diff-line-modified">
                          {item.line2 || <span className="empty-line">(empty)</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="text-tools-modal">
      <div className="text-tools-container">
        <div className="text-tools-header">
          <h2>Text Tools</h2>
          <p>Powerful text manipulation and analysis tools</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="text-tools-content">
          <div className="tools-sidebar">
            <button
              className={`tool-tab ${currentTool === 'word-counter' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('word-counter'); clearAll(); }}
            >
              <Type size={18} />
              Word Counter
            </button>
            <button
              className={`tool-tab ${currentTool === 'case-converter' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('case-converter'); clearAll(); }}
            >
              <AlignLeft size={18} />
              Case Converter
            </button>
            <button
              className={`tool-tab ${currentTool === 'duplicate-remover' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('duplicate-remover'); clearAll(); }}
            >
              <List size={18} />
              Remove Duplicates
            </button>
            <button
              className={`tool-tab ${currentTool === 'sort-lines' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('sort-lines'); clearAll(); }}
            >
              <ArrowUpDown size={18} />
              Sort Lines
            </button>
            <button
              className={`tool-tab ${currentTool === 'lorem-ipsum' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('lorem-ipsum'); clearAll(); }}
            >
              <FileText size={18} />
              Lorem Ipsum
            </button>
            <button
              className={`tool-tab ${currentTool === 'text-diff' ? 'active' : ''}`}
              onClick={() => { setCurrentTool('text-diff'); clearAll(); }}
            >
              <FileText size={18} />
              Text Diff
            </button>
          </div>

          <div className="tool-main">
            {renderToolContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextTools;