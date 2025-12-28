import React, { useState, useEffect } from 'react';
import { X, Copy, Check, AlertCircle, CheckCircle, Key, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import './JWTDecoder.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function JWTDecoder({ onClose }) {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [signature, setSignature] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [copiedSection, setCopiedSection] = useState('');
  const [stats, setStats] = useState(null);
  const [hasDecodedOnce, setHasDecodedOnce] = useState(false); // ✅ Track if decoded

  // ✅ Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('jwt-decoder', 3);

  // ✅ Decode JWT with usage tracking
  useEffect(() => {
    if (!token.trim()) {
      setHeader(null);
      setPayload(null);
      setSignature('');
      setError('');
      setIsValid(null);
      setStats(null);
      return;
    }

    // ✅ CHECK LIMIT BEFORE DECODING
    if (!canUse && !hasDecodedOnce) {
      setHeader(null);
      setPayload(null);
      setSignature('');
      setError('');
      setIsValid(null);
      setStats(null);
      return;
    }

    try {
      // Check if it's a valid JWT format (three parts separated by dots)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Must have 3 parts separated by dots.');
      }

      // Decode header
      const decodedHeader = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      setHeader(decodedHeader);

      // Decode payload
      const decodedPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setPayload(decodedPayload);

      // Store signature
      setSignature(parts[2]);

      // Calculate statistics
      const now = Math.floor(Date.now() / 1000);
      const isExpired = decodedPayload.exp && decodedPayload.exp < now;
      const timeUntilExpiry = decodedPayload.exp ? decodedPayload.exp - now : null;
      const issuedAt = decodedPayload.iat ? new Date(decodedPayload.iat * 1000).toLocaleString() : null;
      const expiresAt = decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toLocaleString() : null;

      setStats({
        algorithm: decodedHeader.alg || 'Unknown',
        type: decodedHeader.typ || 'Unknown',
        isExpired,
        timeUntilExpiry,
        issuedAt,
        expiresAt,
        issuer: decodedPayload.iss || 'Not specified',
        subject: decodedPayload.sub || 'Not specified',
        audience: decodedPayload.aud || 'Not specified',
      });

      setIsValid(true);
      setError('');

      // ✅ INCREMENT USAGE ON FIRST DECODE
      if (!hasDecodedOnce && canUse) {
        incrementUsage();
        setHasDecodedOnce(true);
      }
    } catch (err) {
      setError(err.message);
      setHeader(null);
      setPayload(null);
      setSignature('');
      setIsValid(false);
      setStats(null);
    }
  }, [token]);

  // Format JSON
  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  // Copy to clipboard
  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success(`Copied ${section}!`);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  // ✅ Load sample with limit check
  const loadSample = () => {
    if (!canUse && !hasDecodedOnce) {
      showLimitError();
      return;
    }

    const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5OTk5OTk5OTksImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    setToken(sampleToken);
    toast.success('Sample JWT loaded!');
  };

  // ✅ Clear all and reset usage flag
  const handleClear = () => {
    setToken('');
    setHeader(null);
    setPayload(null);
    setSignature('');
    setError('');
    setIsValid(null);
    setStats(null);
    setHasDecodedOnce(false); // ✅ Reset for new decode
    toast.success('Cleared!');
  };

  // Format time until expiry
  const formatTimeUntil = (seconds) => {
    if (!seconds) return null;
    if (seconds < 0) return 'Expired';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="jwt-modal">
      <div className="jwt-container">
        <div className="jwt-header">
          <h2>JWT Decoder</h2>
          <p>Decode and inspect JSON Web Tokens</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="jwt-content">
          {/* ✅ ADD USAGE INDICATOR */}
          <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />

          {/* Token Input */}
          <div className="token-section">
            <label>JWT Token</label>
            <div className="token-input-wrapper">
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your JWT token here..."
                spellCheck={false}
                disabled={!canUse && !hasDecodedOnce} // ✅ DISABLE IF LIMIT REACHED
              />
            </div>
            <div className="token-actions">
              <button 
                className="btn-action secondary" 
                onClick={loadSample}
                disabled={!canUse && !hasDecodedOnce} // ✅ DISABLE IF LIMIT REACHED
              >
                <Key size={16} />
                Load Sample
              </button>
              <button className="btn-action secondary" onClick={handleClear}>
                Clear
              </button>
            </div>
          </div>

          {/* Status */}
          {error && (
            <div className="status-banner error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {isValid && (
            <div className="status-banner success">
              <CheckCircle size={20} />
              <span>Valid JWT Token</span>
            </div>
          )}

          {/* Decoded Sections */}
          {isValid && (
            <>
              {/* Token Info */}
              {stats && (
                <div className="info-section">
                  <div className="info-grid">
                    <div className="info-item">
                      <Shield size={18} />
                      <div>
                        <span className="info-label">Algorithm</span>
                        <span className="info-value">{stats.algorithm}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Key size={18} />
                      <div>
                        <span className="info-label">Type</span>
                        <span className="info-value">{stats.type}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <Lock size={18} />
                      <div>
                        <span className="info-label">Status</span>
                        <span className={`info-value ${stats.isExpired ? 'expired' : 'valid'}`}>
                          {stats.isExpired ? 'Expired' : 'Valid'}
                        </span>
                      </div>
                    </div>
                    {stats.timeUntilExpiry !== null && (
                      <div className="info-item">
                        <div>
                          <span className="info-label">
                            {stats.isExpired ? 'Expired' : 'Expires In'}
                          </span>
                          <span className="info-value">
                            {formatTimeUntil(stats.timeUntilExpiry)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="decoded-section">
                <div className="section-header">
                  <h3>Header</h3>
                  <button
                    className="btn-copy-section"
                    onClick={() => copyToClipboard(formatJSON(header), 'header')}
                  >
                    {copiedSection === 'header' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="json-display">
                  <pre>{formatJSON(header)}</pre>
                </div>
              </div>

              {/* Payload */}
              <div className="decoded-section">
                <div className="section-header">
                  <h3>Payload</h3>
                  <button
                    className="btn-copy-section"
                    onClick={() => copyToClipboard(formatJSON(payload), 'payload')}
                  >
                    {copiedSection === 'payload' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="json-display">
                  <pre>{formatJSON(payload)}</pre>
                </div>
                
                {/* Claims Info */}
                {stats && (
                  <div className="claims-info">
                    <h4>Standard Claims</h4>
                    <div className="claims-grid">
                      {stats.issuer !== 'Not specified' && (
                        <div className="claim-item">
                          <span className="claim-label">iss (Issuer)</span>
                          <span className="claim-value">{stats.issuer}</span>
                        </div>
                      )}
                      {stats.subject !== 'Not specified' && (
                        <div className="claim-item">
                          <span className="claim-label">sub (Subject)</span>
                          <span className="claim-value">{stats.subject}</span>
                        </div>
                      )}
                      {stats.audience !== 'Not specified' && (
                        <div className="claim-item">
                          <span className="claim-label">aud (Audience)</span>
                          <span className="claim-value">{stats.audience}</span>
                        </div>
                      )}
                      {stats.issuedAt && (
                        <div className="claim-item">
                          <span className="claim-label">iat (Issued At)</span>
                          <span className="claim-value">{stats.issuedAt}</span>
                        </div>
                      )}
                      {stats.expiresAt && (
                        <div className="claim-item">
                          <span className="claim-label">exp (Expires At)</span>
                          <span className="claim-value">{stats.expiresAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Signature */}
              <div className="decoded-section">
                <div className="section-header">
                  <h3>Signature</h3>
                  <button
                    className="btn-copy-section"
                    onClick={() => copyToClipboard(signature, 'signature')}
                  >
                    {copiedSection === 'signature' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="signature-display">
                  <code>{signature}</code>
                </div>
                <div className="signature-note">
                  <AlertCircle size={16} />
                  <span>Signature verification requires the secret key</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default JWTDecoder;