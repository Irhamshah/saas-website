// src/pages/tools/UUIDGeneratorPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Copy, 
  Check, 
  Download, 
  RefreshCw,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import SEO from '../../components/seo';
import { useUsageLimit } from '../../hooks/useUsageLimit';
import UsageIndicator from '../../components/UsageIndicator';
import './ToolPage.css';
import './UUIDGeneratorPage.css';

function UUIDGeneratorPage() {
  const navigate = useNavigate();
  const [uuids, setUuids] = useState([uuidv4()]);
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(null);
  const [format, setFormat] = useState('default'); // default, uppercase, no-hyphens, uppercase-no-hyphens

  // Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('uuid', 3);

  const generateUUIDs = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    const newUuids = Array.from({ length: count }, () => uuidv4());
    setUuids(newUuids);
    await incrementUsage();
    toast.success(`Generated ${count} UUID${count > 1 ? 's' : ''}!`);
  };

  const formatUUID = (uuid) => {
    switch (format) {
      case 'uppercase':
        return uuid.toUpperCase();
      case 'no-hyphens':
        return uuid.replace(/-/g, '');
      case 'uppercase-no-hyphens':
        return uuid.replace(/-/g, '').toUpperCase();
      default:
        return uuid;
    }
  };

  const handleCopy = (uuid, index) => {
    const formatted = formatUUID(uuid);
    navigator.clipboard.writeText(formatted);
    setCopied(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = () => {
    const formatted = uuids.map(formatUUID).join('\n');
    navigator.clipboard.writeText(formatted);
    toast.success(`Copied ${uuids.length} UUIDs!`);
  };

  const handleDownload = () => {
    const formatted = uuids.map(formatUUID).join('\n');
    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="tool-page-with-ads">
      <SEO
        title="UUID Generator - Generate Unique Identifiers | LiteTools"
        description="Free online UUID generator. Generate UUID v4 identifiers instantly. Multiple formats supported with copy and download options."
        keywords="uuid generator, unique identifier, uuid v4, generate uuid, random uuid"
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
              <Hash size={32} />
            </div>
            <div>
              <h1 className="tool-title">UUID Generator</h1>
              <p className="tool-description">
                Generate unique identifiers instantly
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

          {/* Controls Grid */}
          <div className="uuid-controls-grid">
            {/* Format Options */}
            <div className="uuid-control-section">
              <label>Format</label>
              <div className="format-buttons">
                <button
                  className={`format-btn ${format === 'default' ? 'active' : ''}`}
                  onClick={() => setFormat('default')}
                >
                  Default
                  <span className="format-example">8-4-4-4-12</span>
                </button>
                <button
                  className={`format-btn ${format === 'uppercase' ? 'active' : ''}`}
                  onClick={() => setFormat('uppercase')}
                >
                  Uppercase
                  <span className="format-example">8-4-4-4-12</span>
                </button>
                <button
                  className={`format-btn ${format === 'no-hyphens' ? 'active' : ''}`}
                  onClick={() => setFormat('no-hyphens')}
                >
                  No Hyphens
                  <span className="format-example">32 chars</span>
                </button>
                <button
                  className={`format-btn ${format === 'uppercase-no-hyphens' ? 'active' : ''}`}
                  onClick={() => setFormat('uppercase-no-hyphens')}
                >
                  Both
                  <span className="format-example">32 CHARS</span>
                </button>
              </div>
            </div>

            {/* Count Selector */}
            <div className="uuid-control-section">
              <label>Number of UUIDs</label>
              <div className="count-selector">
                <button
                  className="count-btn"
                  onClick={() => setCount(Math.max(1, count - 1))}
                  disabled={count <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  min="1"
                  max="100"
                />
                <button
                  className="count-btn"
                  onClick={() => setCount(Math.min(100, count + 1))}
                  disabled={count >= 100}
                >
                  +
                </button>
              </div>
              <small>Maximum 100 UUIDs at once</small>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn-primary generate-btn"
            onClick={generateUUIDs}
            disabled={!canUse}
          >
            <RefreshCw size={20} />
            Generate {count} UUID{count > 1 ? 's' : ''}
          </button>

          {/* UUIDs List */}
          <div className="uuid-list-section">
            <div className="uuid-list-header">
              <label>Generated UUIDs ({uuids.length})</label>
              <div className="list-actions">
                <button className="icon-btn" onClick={handleCopyAll} title="Copy All">
                  <Copy size={18} />
                  <span>Copy All</span>
                </button>
                <button className="icon-btn" onClick={handleDownload} title="Download">
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>
            </div>

            <div className="uuid-list">
              {uuids.map((uuid, index) => (
                <div key={index} className="uuid-item">
                  <div className="uuid-number">{index + 1}</div>
                  <div className="uuid-value">{formatUUID(uuid)}</div>
                  <button
                    className="uuid-copy-btn"
                    onClick={() => handleCopy(uuid, index)}
                    title="Copy"
                  >
                    {copied === index ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="uuid-info-section">
            <h3>About UUID v4</h3>
            <div className="info-cards">
              <div className="info-card">
                <h4>What is UUID?</h4>
                <p>
                  Universally Unique Identifier (UUID) is a 128-bit identifier used to uniquely 
                  identify information in computer systems.
                </p>
              </div>
              <div className="info-card">
                <h4>UUID v4</h4>
                <p>
                  Version 4 UUIDs are randomly generated. The probability of collision is 
                  negligible: 1 in 2<sup>122</sup> (5.3 × 10<sup>36</sup>).
                </p>
              </div>
              <div className="info-card">
                <h4>Format</h4>
                <p>
                  Standard format: <code>xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx</code><br />
                  Where x is any hexadecimal digit and y is one of 8, 9, A, or B.
                </p>
              </div>
              <div className="info-card">
                <h4>Use Cases</h4>
                <p>
                  Database primary keys, session IDs, file names, distributed systems, 
                  API keys, and anywhere unique identification is needed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="tool-features">
          <h3>Features</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎲</div>
              <strong>Random Generation</strong>
              <p>Cryptographically secure random UUIDs</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔢</div>
              <strong>Bulk Generation</strong>
              <p>Generate up to 100 UUIDs at once</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <strong>Multiple Formats</strong>
              <p>Choose from 4 different formats</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">💾</div>
              <strong>Export Options</strong>
              <p>Copy individual or download all</p>
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

export default UUIDGeneratorPage;