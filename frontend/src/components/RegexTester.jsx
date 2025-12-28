import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertCircle, CheckCircle, Search, FileText, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import './RegexTester.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function RegexTester({ onClose }) {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasTestedOnce, setHasTestedOnce] = useState(false); // ✅ Track if user tested

  // Common regex patterns
  const commonPatterns = {
    email: { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Email address' },
    url: { pattern: 'https?://[^\\s]+', description: 'URL' },
    phone: { pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}', description: 'Phone number' },
    date: { pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'Date (YYYY-MM-DD)' },
    ipv4: { pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'IPv4 address' },
    hex: { pattern: '#[0-9A-Fa-f]{6}', description: 'Hex color code' },
    username: { pattern: '[a-zA-Z0-9_-]{3,16}', description: 'Username (3-16 chars)' },
    hashtag: { pattern: '#[a-zA-Z0-9_]+', description: 'Hashtag' },
  };

  // ✅ Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('regex', 3);

  // ✅ Test regex with usage tracking
  useEffect(() => {
    if (!pattern || !testString) {
      setMatches([]);
      setStats(null);
      setError('');
      return;
    }

    // ✅ CHECK LIMIT BEFORE PROCESSING
    if (!canUse && !hasTestedOnce) {
      setMatches([]);
      setStats(null);
      setError('');
      return;
    }

    try {
      const flagString = Object.entries(flags)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join('');

      const regex = new RegExp(pattern, flagString);
      const foundMatches = [];

      if (flags.g) {
        // Global search
        let match;
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
            length: match[0].length
          });
        }
      } else {
        // Single match
        const match = regex.exec(testString);
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1),
            length: match[0].length
          });
        }
      }

      setMatches(foundMatches);
      setError('');

      // Calculate statistics
      if (foundMatches.length > 0) {
        setStats({
          totalMatches: foundMatches.length,
          uniqueMatches: new Set(foundMatches.map(m => m.text)).size,
          avgLength: (foundMatches.reduce((sum, m) => sum + m.length, 0) / foundMatches.length).toFixed(2),
          totalLength: foundMatches.reduce((sum, m) => sum + m.length, 0),
          coverage: ((foundMatches.reduce((sum, m) => sum + m.length, 0) / testString.length) * 100).toFixed(2)
        });
      } else {
        setStats(null);
      }

      // ✅ INCREMENT USAGE ON FIRST TEST
      if (!hasTestedOnce && canUse) {
        incrementUsage();
        setHasTestedOnce(true);
      }
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setStats(null);
    }
  }, [pattern, flags, testString]);

  // ✅ Load pattern with limit check
  const loadPattern = (key) => {
    if (!canUse && !hasTestedOnce) {
      showLimitError();
      return;
    }

    setPattern(commonPatterns[key].pattern);
    setFlags({ g: true, i: false, m: false, s: false });
    toast.success(`Loaded ${commonPatterns[key].description} pattern`);
  };

  // ✅ Load sample with limit check
  const loadSample = () => {
    if (!canUse && !hasTestedOnce) {
      showLimitError();
      return;
    }

    setPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
    setTestString('Contact us at support@example.com or sales@company.org for more information. You can also reach admin@test.co.uk');
    setFlags({ g: true, i: false, m: false, s: false });
    toast.success('Sample loaded!');
  };

  // Copy regex
  const copyRegex = () => {
    const flagString = Object.entries(flags)
      .filter(([_, value]) => value)
      .map(([key]) => key)
      .join('');
    const regexString = `/${pattern}/${flagString}`;
    navigator.clipboard.writeText(regexString);
    setCopied(true);
    toast.success('Copied regex!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy matches
  const copyMatches = () => {
    const matchText = matches.map((m, i) => `${i + 1}. "${m.text}" at position ${m.index}`).join('\n');
    navigator.clipboard.writeText(matchText);
    toast.success('Copied matches!');
  };

  // Highlight matches in text
  const getHighlightedText = () => {
    if (matches.length === 0) return testString;

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push({
          text: testString.substring(lastIndex, match.index),
          isMatch: false
        });
      }

      // Add match
      parts.push({
        text: match.text,
        isMatch: true,
        index: i
      });

      lastIndex = match.index + match.length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      parts.push({
        text: testString.substring(lastIndex),
        isMatch: false
      });
    }

    return parts;
  };

  // ✅ Clear all and reset usage flag
  const handleClear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setStats(null);
    setError('');
    setHasTestedOnce(false); // ✅ Reset so they can test again
    toast.success('Cleared!');
  };

  return (
    <div className="regex-modal">
      <div className="regex-container">
        <div className="regex-header">
          <h2>Regex Tester</h2>
          <p>Test and debug your regular expressions with live matching</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="regex-content">
          {/* ✅ ADD USAGE INDICATOR */}
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />

          {/* Pattern Section */}
          <div className="pattern-section">
            <div className="pattern-input-wrapper">
              <div className="pattern-prefix">/</div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter your regex pattern..."
                className="pattern-input"
                spellCheck={false}
                disabled={!canUse && !hasTestedOnce} // ✅ DISABLE IF LIMIT REACHED
              />
              <div className="pattern-suffix">/</div>
              <div className="flags-group">
                {['g', 'i', 'm', 's'].map(flag => (
                  <label key={flag} className={`flag-label ${flags[flag] ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={flags[flag]}
                      onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                      disabled={!canUse && !hasTestedOnce} // ✅ DISABLE IF LIMIT REACHED
                    />
                    <span>{flag}</span>
                  </label>
                ))}
              </div>
              <button className="btn-copy-regex" onClick={copyRegex} title="Copy regex">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <div className="flags-info">
              <span className="flag-info">g: global</span>
              <span className="flag-info">i: case-insensitive</span>
              <span className="flag-info">m: multiline</span>
              <span className="flag-info">s: dotAll</span>
            </div>
          </div>

          {/* Common Patterns */}
          <div className="patterns-section">
            <label>Quick Patterns:</label>
            <div className="patterns-grid">
              {Object.entries(commonPatterns).map(([key, { description }]) => (
                <button
                  key={key}
                  className="pattern-btn"
                  onClick={() => loadPattern(key)}
                  title={description}
                  disabled={!canUse && !hasTestedOnce} // ✅ DISABLE IF LIMIT REACHED
                >
                  {description}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="actions-row">
            <button
              className="btn-action secondary"
              onClick={loadSample}
              disabled={!canUse && !hasTestedOnce} // ✅ DISABLE IF LIMIT REACHED
            >
              <FileText size={16} />
              Load Sample
            </button>
            <button className="btn-action secondary" onClick={handleClear}>
              Clear All
            </button>
            {matches.length > 0 && (
              <button className="btn-action secondary" onClick={copyMatches}>
                <Copy size={16} />
                Copy Matches
              </button>
            )}
          </div>

          {/* Status */}
          {error && (
            <div className="status-banner error">
              <AlertCircle size={20} />
              <span>Invalid regex: {error}</span>
            </div>
          )}

          {!error && pattern && testString && (
            <div className={`status-banner ${matches.length > 0 ? 'success' : 'info'}`}>
              {matches.length > 0 ? (
                <>
                  <CheckCircle size={20} />
                  <span>Found {matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
                </>
              ) : (
                <>
                  <Search size={20} />
                  <span>No matches found</span>
                </>
              )}
            </div>
          )}

          {/* Test String & Results */}
          <div className="test-section">
            <div className="test-pane">
              <h3>Test String</h3>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test your regex against..."
                spellCheck={false}
                disabled={!canUse && !hasTestedOnce} // ✅ DISABLE IF LIMIT REACHED
              />
            </div>

            {testString && (
              <div className="test-pane">
                <h3>Highlighted Results</h3>
                <div className="highlighted-text">
                  {Array.isArray(getHighlightedText()) ? (
                    getHighlightedText().map((part, i) => (
                      part.isMatch ? (
                        <span key={i} className="match" title={`Match ${part.index + 1}`}>
                          {part.text}
                        </span>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    ))
                  ) : (
                    <span>{getHighlightedText()}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          {stats && (
            <div className="stats-section">
              <h3>Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Matches</span>
                  <span className="stat-value">{stats.totalMatches}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Unique Matches</span>
                  <span className="stat-value">{stats.uniqueMatches}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Length</span>
                  <span className="stat-value">{stats.avgLength}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Length</span>
                  <span className="stat-value">{stats.totalLength}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Coverage</span>
                  <span className="stat-value">{stats.coverage}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Matches List */}
          {matches.length > 0 && (
            <div className="matches-section">
              <h3>Matches ({matches.length})</h3>
              <div className="matches-list">
                {matches.map((match, i) => (
                  <div key={i} className="match-item">
                    <div className="match-header">
                      <span className="match-number">#{i + 1}</span>
                      <span className="match-position">Position: {match.index}</span>
                    </div>
                    <div className="match-text">"{match.text}"</div>
                    {match.groups.length > 0 && (
                      <div className="match-groups">
                        <span className="groups-label">Groups:</span>
                        {match.groups.map((group, gi) => (
                          <span key={gi} className="group-item">
                            ${gi + 1}: "{group}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegexTester;