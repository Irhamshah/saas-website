// src/pages/tools/RegexTesterPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle, 
  Search, 
  FileText,
  Terminal
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';
import './RegexTesterPage.css';

function RegexTesterPage() {
  const navigate = useNavigate();
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [hasTestedOnce, setHasTestedOnce] = useState(false);

  // Common regex patterns
  const commonPatterns = {
    email: { pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Email' },
    url: { pattern: 'https?://[^\\s]+', description: 'URL' },
    phone: { pattern: '\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}', description: 'Phone' },
    date: { pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'Date (YYYY-MM-DD)' },
    ipv4: { pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'IPv4' },
    hex: { pattern: '#[0-9A-Fa-f]{6}', description: 'Hex Color' },
    username: { pattern: '[a-zA-Z0-9_-]{3,16}', description: 'Username' },
    hashtag: { pattern: '#[a-zA-Z0-9_]+', description: 'Hashtag' },
  };

  // Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('regex', 3);

  // Test regex with usage tracking
  useEffect(() => {
    if (!pattern || !testString) {
      setMatches([]);
      setStats(null);
      setError('');
      return;
    }

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

      if (!hasTestedOnce && canUse) {
        incrementUsage();
        setHasTestedOnce(true);
      }
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setStats(null);
    }
  }, [pattern, flags, testString, hasTestedOnce, canUse]);

  const loadPattern = (key) => {
    if (!canUse && !hasTestedOnce) {
      showLimitError();
      return;
    }
    setPattern(commonPatterns[key].pattern);
    setFlags({ g: true, i: false, m: false, s: false });
    toast.success(`Loaded ${commonPatterns[key].description} pattern`);
  };

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

  const copyMatches = () => {
    const matchText = matches.map((m, i) => `${i + 1}. "${m.text}" at position ${m.index}`).join('\n');
    navigator.clipboard.writeText(matchText);
    toast.success('Copied matches!');
  };

  const getHighlightedText = () => {
    if (matches.length === 0) return testString;

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push({
          text: testString.substring(lastIndex, match.index),
          isMatch: false
        });
      }
      parts.push({
        text: match.text,
        isMatch: true,
        index: i
      });
      lastIndex = match.index + match.length;
    });

    if (lastIndex < testString.length) {
      parts.push({
        text: testString.substring(lastIndex),
        isMatch: false
      });
    }

    return parts;
  };

  const handleClear = () => {
    setPattern('');
    setTestString('');
    setMatches([]);
    setStats(null);
    setError('');
    setHasTestedOnce(false);
    toast.success('Cleared!');
  };

  return (
    <div className="tool-page-with-ads">
      <SEO
        title="Regex Tester - Test Regular Expressions Online | LiteTools"
        description="Free online regex tester with live matching and highlighting. Test and debug regular expressions with common patterns and detailed statistics."
        keywords="regex tester, regular expression, regex test, pattern matching, regex validator"
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
              <Terminal size={32} />
            </div>
            <div>
              <h1 className="tool-title">Regex Tester</h1>
              <p className="tool-description">
                Test and debug your regular expressions with live matching
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

          {/* Pattern Section */}
          <div className="pattern-section">
            <label>Regular Expression</label>
            <div className="pattern-input-wrapper">
              <div className="pattern-prefix">/</div>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter your regex pattern..."
                className="pattern-input"
                spellCheck={false}
                disabled={!canUse && !hasTestedOnce}
              />
              <div className="pattern-suffix">/</div>
              <div className="flags-group">
                {['g', 'i', 'm', 's'].map(flag => (
                  <label key={flag} className={`flag-label ${flags[flag] ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={flags[flag]}
                      onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                      disabled={!canUse && !hasTestedOnce}
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
              <span className="flag-info"><strong>g:</strong> global</span>
              <span className="flag-info"><strong>i:</strong> case-insensitive</span>
              <span className="flag-info"><strong>m:</strong> multiline</span>
              <span className="flag-info"><strong>s:</strong> dotAll</span>
            </div>
          </div>

          {/* Common Patterns */}
          <div className="patterns-section">
            <label>Quick Patterns</label>
            <div className="patterns-grid">
              {Object.entries(commonPatterns).map(([key, { description }]) => (
                <button
                  key={key}
                  className="pattern-btn"
                  onClick={() => loadPattern(key)}
                  title={description}
                  disabled={!canUse && !hasTestedOnce}
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
              disabled={!canUse && !hasTestedOnce}
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

          {/* Test Section */}
          <div className="test-section">
            <div className="test-pane">
              <h3>Test String</h3>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test your regex against..."
                spellCheck={false}
                disabled={!canUse && !hasTestedOnce}
                className="test-textarea"
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
                      <span className="match-length">Length: {match.length}</span>
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

        {/* Features */}
        <div className="tool-features">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <strong>Live Testing</strong>
              <p>See matches update in real-time</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <strong>Highlighting</strong>
              <p>Visual highlighting of all matches</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <strong>Statistics</strong>
              <p>Detailed match statistics and analysis</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <strong>Quick Patterns</strong>
              <p>Common regex patterns ready to use</p>
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

export default RegexTesterPage;