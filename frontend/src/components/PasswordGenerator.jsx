import React, { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw, Shield, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import './PasswordGenerator.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function PasswordGenerator({ onClose }) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [quantity, setQuantity] = useState(1);
  const [passwords, setPasswords] = useState([]);
  
  // Character type options
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  // Usage Limits
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('password', 3);

  // Advanced options
  const [advanced, setAdvanced] = useState({
    excludeSimilar: false,
    excludeAmbiguous: false,
    noRepeat: false,
    startWithLetter: false,
    noSequential: false,
    customCharset: '',
  });

  // Requirements
  const [requirements, setRequirements] = useState({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });

  const [strength, setStrength] = useState({ score: 0, label: '', color: '' });
  const [copied, setCopied] = useState(false);

  // Character sets
  const charsets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  };

  // Similar characters to exclude
  const similarChars = 'il1Lo0O';
  const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';
  const sequentialChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Generate password
  const generatePassword = async () => {

    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols && !advanced.customCharset) {
      toast.error('Please select at least one character type');
      return '';
    }

    // Build character set
    let charset = '';
    if (options.uppercase) charset += charsets.uppercase;
    if (options.lowercase) charset += charsets.lowercase;
    if (options.numbers) charset += charsets.numbers;
    if (options.symbols) charset += charsets.symbols;
    if (advanced.customCharset) charset += advanced.customCharset;

    // Apply exclusions
    if (advanced.excludeSimilar) {
      charset = charset.split('').filter(c => !similarChars.includes(c)).join('');
    }
    if (advanced.excludeAmbiguous) {
      charset = charset.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }

    // Remove duplicates
    charset = [...new Set(charset.split(''))].join('');

    if (charset.length === 0) {
      toast.error('No characters available with current settings');
      return '';
    }

    // Generate password with requirements
    let pass = '';
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      pass = '';
      
      // Start with letter if required
      if (advanced.startWithLetter) {
        const letters = charset.split('').filter(c => /[a-zA-Z]/.test(c));
        if (letters.length > 0) {
          pass += letters[Math.floor(Math.random() * letters.length)];
        }
      }

      // Generate rest of password
      for (let i = pass.length; i < length; i++) {
        let char;
        let charAttempts = 0;
        
        do {
          char = charset[Math.floor(Math.random() * charset.length)];
          charAttempts++;
        } while (
          charAttempts < 50 &&
          ((advanced.noRepeat && pass.includes(char)) ||
          (advanced.noSequential && i > 0 && isSequential(pass[i - 1], char)))
        );
        
        pass += char;
      }

      // Check if meets requirements
      if (meetsRequirements(pass)) {
        break;
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      toast.error('Could not generate password meeting all requirements. Try relaxing some constraints.');
      return '';
    }

    return pass;
  };

  // Check if characters are sequential
  const isSequential = (char1, char2) => {
    const index1 = sequentialChars.indexOf(char1);
    const index2 = sequentialChars.indexOf(char2);
    if (index1 === -1 || index2 === -1) return false;
    return Math.abs(index2 - index1) === 1;
  };

  // Check if password meets requirements
  const meetsRequirements = (pass) => {
    const counts = {
      uppercase: (pass.match(/[A-Z]/g) || []).length,
      lowercase: (pass.match(/[a-z]/g) || []).length,
      numbers: (pass.match(/[0-9]/g) || []).length,
      symbols: (pass.match(/[^A-Za-z0-9]/g) || []).length,
    };

    return (
      (!options.uppercase || counts.uppercase >= requirements.minUppercase) &&
      (!options.lowercase || counts.lowercase >= requirements.minLowercase) &&
      (!options.numbers || counts.numbers >= requirements.minNumbers) &&
      (!options.symbols || counts.symbols >= requirements.minSymbols)
    );
  };

  // Calculate password strength
  const calculateStrength = (pass) => {
    if (!pass) return { score: 0, label: 'No Password', color: '#6B7280' };

    let score = 0;
    
    // Length score
    if (pass.length >= 8) score += 1;
    if (pass.length >= 12) score += 1;
    if (pass.length >= 16) score += 1;
    if (pass.length >= 20) score += 1;

    // Character variety
    if (/[a-z]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    // Additional checks
    if (pass.length >= 16 && /[a-z]/.test(pass) && /[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) {
      score += 2;
    }

    // Map score to strength
    if (score <= 3) return { score, label: 'Weak', color: '#EF4444' };
    if (score <= 5) return { score, label: 'Fair', color: '#F59E0B' };
    if (score <= 7) return { score, label: 'Good', color: '#3B82F6' };
    if (score <= 9) return { score, label: 'Strong', color: '#10B981' };
    return { score, label: 'Very Strong', color: '#059669' };
  };

  // Handle generate
  const handleGenerate = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    if (quantity === 1) {
      const newPassword = await generatePassword();
      if (newPassword) {
        setPassword(newPassword);
        setStrength(calculateStrength(newPassword));
        toast.success('Password generated!');
      }
    } else {
      const newPasswords = [];
      for (let i = 0; i < quantity; i++) {
        const pass = generatePassword();
        if (pass) {
          newPasswords.push({
            id: i,
            value: pass,
            strength: calculateStrength(pass)
          });
        }
      }
      setPasswords(newPasswords);
      setPassword('');
      if (newPasswords.length > 0) {
        await incrementUsage();
        toast.success(`Generated ${newPasswords.length} passwords!`);
      }
    }
  };

  // Copy password
  const copyPassword = (pass) => {
    navigator.clipboard.writeText(pass);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download passwords
  const downloadPasswords = () => {
    const content = passwords.map((p, i) => `${i + 1}. ${p.value}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwords.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  // Auto-generate on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  // Presets
  const applyPreset = (preset) => {
    switch (preset) {
      case 'memorable':
        setLength(12);
        setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: false });
        setAdvanced({ ...advanced, excludeSimilar: true, excludeAmbiguous: true });
        break;
      case 'pin':
        setLength(6);
        setOptions({ uppercase: false, lowercase: false, numbers: true, symbols: false });
        break;
      case 'strong':
        setLength(20);
        setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: true });
        setAdvanced({ ...advanced, noRepeat: true });
        break;
      case 'max':
        setLength(32);
        setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: true });
        setAdvanced({ ...advanced, noRepeat: true, excludeSimilar: true });
        break;
    }
    toast.success(`Applied ${preset} preset`);
  };

  return (
    <div className="password-modal">
      <div className="password-container">
        <div className="password-header">
          <h2>Password Generator</h2>
          <p>Generate secure passwords with advanced options</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="password-content">
          <UsageIndicator
            usageCount={usageCount}
            usageLimit={3}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
          />
          {/* Password Display */}
          {password && (
            <div className="password-display">
              <div className="password-value">
                <input type="text" value={password} readOnly />
                <button className="btn-copy" onClick={() => copyPassword(password)}>
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              <div className="strength-indicator">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(strength.score / 10) * 100}%`,
                      backgroundColor: strength.color
                    }}
                  />
                </div>
                <div className="strength-label" style={{ color: strength.color }}>
                  <Shield size={16} />
                  <span>{strength.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Presets */}
          <div className="presets-section">
            <label>Quick Presets:</label>
            <div className="presets-grid">
              <button className="preset-btn" onClick={() => applyPreset('memorable')}>
                Memorable (12 chars)
              </button>
              <button className="preset-btn" onClick={() => applyPreset('pin')}>
                PIN (6 digits)
              </button>
              <button className="preset-btn" onClick={() => applyPreset('strong')}>
                Strong (20 chars)
              </button>
              <button className="preset-btn" onClick={() => applyPreset('max')}>
                Maximum (32 chars)
              </button>
            </div>
          </div>

          {/* Length & Quantity */}
          <div className="settings-grid">
            <div className="setting-item">
              <label>
                Password Length: <span className="value">{length}</span>
              </label>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            <div className="setting-item">
              <label>
                Quantity: <span className="value">{quantity}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Character Types */}
          <div className="options-section">
            <h3>Character Types</h3>
            <div className="options-grid">
              <label className={`option-item ${options.uppercase ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                />
                <div>
                  <span className="option-name">Uppercase (A-Z)</span>
                  <span className="option-example">ABCDEFG</span>
                </div>
              </label>

              <label className={`option-item ${options.lowercase ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={options.lowercase}
                  onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                />
                <div>
                  <span className="option-name">Lowercase (a-z)</span>
                  <span className="option-example">abcdefg</span>
                </div>
              </label>

              <label className={`option-item ${options.numbers ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={options.numbers}
                  onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                />
                <div>
                  <span className="option-name">Numbers (0-9)</span>
                  <span className="option-example">0123456</span>
                </div>
              </label>

              <label className={`option-item ${options.symbols ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={options.symbols}
                  onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                />
                <div>
                  <span className="option-name">Symbols</span>
                  <span className="option-example">!@#$%^&</span>
                </div>
              </label>
            </div>
          </div>

          {/* Requirements */}
          <div className="requirements-section">
            <h3>Minimum Requirements</h3>
            <div className="requirements-grid">
              {options.uppercase && (
                <div className="requirement-item">
                  <label>Min Uppercase:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={requirements.minUppercase}
                    onChange={(e) => setRequirements({ ...requirements, minUppercase: Number(e.target.value) })}
                  />
                </div>
              )}
              {options.lowercase && (
                <div className="requirement-item">
                  <label>Min Lowercase:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={requirements.minLowercase}
                    onChange={(e) => setRequirements({ ...requirements, minLowercase: Number(e.target.value) })}
                  />
                </div>
              )}
              {options.numbers && (
                <div className="requirement-item">
                  <label>Min Numbers:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={requirements.minNumbers}
                    onChange={(e) => setRequirements({ ...requirements, minNumbers: Number(e.target.value) })}
                  />
                </div>
              )}
              {options.symbols && (
                <div className="requirement-item">
                  <label>Min Symbols:</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={requirements.minSymbols}
                    onChange={(e) => setRequirements({ ...requirements, minSymbols: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="advanced-section">
            <h3>Advanced Options</h3>
            <div className="advanced-grid">
              <label className="advanced-item">
                <input
                  type="checkbox"
                  checked={advanced.excludeSimilar}
                  onChange={(e) => setAdvanced({ ...advanced, excludeSimilar: e.target.checked })}
                />
                <div>
                  <span className="advanced-name">Exclude Similar Characters</span>
                  <span className="advanced-desc">Avoid: i, l, 1, L, o, 0, O</span>
                </div>
              </label>

              <label className="advanced-item">
                <input
                  type="checkbox"
                  checked={advanced.excludeAmbiguous}
                  onChange={(e) => setAdvanced({ ...advanced, excludeAmbiguous: e.target.checked })}
                />
                <div>
                  <span className="advanced-name">Exclude Ambiguous Symbols</span>
                  <span className="advanced-desc">Avoid: {'{}'} [] () / \ ' " ` ~</span>
                </div>
              </label>

              <label className="advanced-item">
                <input
                  type="checkbox"
                  checked={advanced.noRepeat}
                  onChange={(e) => setAdvanced({ ...advanced, noRepeat: e.target.checked })}
                />
                <div>
                  <span className="advanced-name">No Repeating Characters</span>
                  <span className="advanced-desc">Each character used only once</span>
                </div>
              </label>

              <label className="advanced-item">
                <input
                  type="checkbox"
                  checked={advanced.startWithLetter}
                  onChange={(e) => setAdvanced({ ...advanced, startWithLetter: e.target.checked })}
                />
                <div>
                  <span className="advanced-name">Start with Letter</span>
                  <span className="advanced-desc">First character is a letter</span>
                </div>
              </label>

              <label className="advanced-item">
                <input
                  type="checkbox"
                  checked={advanced.noSequential}
                  onChange={(e) => setAdvanced({ ...advanced, noSequential: e.target.checked })}
                />
                <div>
                  <span className="advanced-name">No Sequential Characters</span>
                  <span className="advanced-desc">Avoid abc, 123, etc.</span>
                </div>
              </label>
            </div>

            <div className="custom-charset">
              <label>Custom Characters (optional):</label>
              <input
                type="text"
                value={advanced.customCharset}
                onChange={(e) => setAdvanced({ ...advanced, customCharset: e.target.value })}
                placeholder="Add custom characters..."
              />
            </div>
          </div>

          {/* Generate Button */}
          <button className="btn-generate" onClick={handleGenerate}>
            <RefreshCw size={20} />
            Generate Password{quantity > 1 ? 's' : ''}
          </button>

          {/* Multiple Passwords List */}
          {passwords.length > 0 && (
            <div className="passwords-list-section">
              <div className="list-header">
                <h3>Generated Passwords ({passwords.length})</h3>
                <button className="btn-download" onClick={downloadPasswords}>
                  <Download size={16} />
                  Download All
                </button>
              </div>
              <div className="passwords-list">
                {passwords.map((p) => (
                  <div key={p.id} className="password-list-item">
                    <div className="password-list-value">
                      <span className="password-text">{p.value}</span>
                      <button
                        className="btn-copy-small"
                        onClick={() => copyPassword(p.value)}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <div className="password-list-strength" style={{ color: p.strength.color }}>
                      {p.strength.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="tips-section">
            <h3>Password Security Tips</h3>
            <div className="tips-grid">
              <div className="tip-item">
                <CheckCircle size={18} />
                <span>Use at least 16 characters for strong security</span>
              </div>
              <div className="tip-item">
                <CheckCircle size={18} />
                <span>Include uppercase, lowercase, numbers, and symbols</span>
              </div>
              <div className="tip-item">
                <CheckCircle size={18} />
                <span>Use unique passwords for each account</span>
              </div>
              <div className="tip-item">
                <AlertTriangle size={18} />
                <span>Never reuse passwords across different services</span>
              </div>
              <div className="tip-item">
                <AlertTriangle size={18} />
                <span>Store passwords in a password manager</span>
              </div>
              <div className="tip-item">
                <AlertTriangle size={18} />
                <span>Change passwords regularly, especially after breaches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PasswordGenerator;