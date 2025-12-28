import React, { useState, useEffect } from 'react';
import { X, Download, Copy, Check, Link as LinkIcon, Wifi, Mail, Phone, MessageSquare } from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import './QRGenerator.css';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';

function QRGenerator({ onClose }) {
  const [qrType, setQrType] = useState('url'); // url, text, wifi, email, phone, sms
  const [qrData, setQrData] = useState('');
  const [qrSize, setQrSize] = useState(512);
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState('M'); // L, M, Q, H
  const [qrImage, setQrImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // WiFi specific fields
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA'); // WPA, WEP, nopass

  // Email specific fields
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone/SMS specific fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Usage limit hook
  const {
    usageCount,
    usageRemaining,
    usagePercentage,
    canUse,
    isPremium,
    incrementUsage,
    showLimitError,
  } = useUsageLimit('qr', 3);

  const getQRContent = () => {
    switch (qrType) {
      case 'url':
      case 'text':
        return qrData;

      case 'wifi':
        if (!wifiSSID) return null;
        const escapeWifi = (str) => str.replace(/([\\;,":])/g, '\\$1');
        return `WIFI:T:${wifiSecurity};S:${escapeWifi(wifiSSID)};P:${escapeWifi(wifiPassword)};H:false;;`;

      case 'email':
        if (!emailTo) return null;
        let emailStr = `mailto:${emailTo}`;
        const params = [];
        if (emailSubject) params.push(`subject=${encodeURIComponent(emailSubject)}`);
        if (emailBody) params.push(`body=${encodeURIComponent(emailBody)}`);
        if (params.length > 0) emailStr += `?${params.join('&')}`;
        return emailStr;

      case 'phone':
        if (!phoneNumber) return null;
        return `tel:${phoneNumber}`;

      case 'sms':
        if (!phoneNumber) return null;
        return smsMessage 
          ? `sms:${phoneNumber}?body=${encodeURIComponent(smsMessage)}`
          : `sms:${phoneNumber}`;

      default:
        return qrData;
    }
  };

  const generateQR = async () => {
    if (!canUse) {
      showLimitError();
      return;
    }

    const content = getQRContent();
    
    if (!content) {
      toast.error('Please fill in the required fields');
      return;
    }

    setGenerating(true);

    try {
      const options = {
        width: qrSize,
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor
        },
        errorCorrectionLevel: errorLevel
      };

      const dataUrl = await QRCode.toDataURL(content, options);
      setQrImage(dataUrl);
      await incrementUsage();
      toast.success('QR code generated! 🎉');
    } catch (error) {
      console.error('QR generation error:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  // Auto-generate when data changes
  useEffect(() => {
    const content = getQRContent();
    if (content) {
      const timer = setTimeout(() => {
        generateQR();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setQrImage(null);
    }
  }, [qrType, qrData, qrSize, qrColor, bgColor, errorLevel, wifiSSID, wifiPassword, wifiSecurity, emailTo, emailSubject, emailBody, phoneNumber, smsMessage]);

  const downloadQR = () => {
    if (!qrImage) {
      toast.error('Please generate a QR code first');
      return;
    }

    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded!');
  };

  const copyQRImage = async () => {
    if (!qrImage) {
      toast.error('Please generate a QR code first');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(qrImage);
      const blob = await response.blob();
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      setCopied(true);
      toast.success('QR code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
      toast.error('Failed to copy QR code');
    }
  };

  const getPlaceholder = () => {
    switch (qrType) {
      case 'url':
        return 'https://example.com';
      case 'text':
        return 'Enter any text here';
      case 'wifi':
        return 'Configure WiFi details below';
      case 'email':
        return 'Configure email details below';
      case 'phone':
        return 'Enter phone number below';
      case 'sms':
        return 'Configure SMS details below';
      default:
        return '';
    }
  };

  const renderFields = () => {
    switch (qrType) {
      case 'url':
      case 'text':
        return (
          <div className="field-group">
            <label>{qrType === 'url' ? 'URL' : 'Text Content'}</label>
            <textarea
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder={getPlaceholder()}
              rows={4}
            />
          </div>
        );

      case 'wifi':
        return (
          <div className="wifi-fields">
            <div className="field-group">
              <label>Network Name (SSID) *</label>
              <input
                type="text"
                value={wifiSSID}
                onChange={(e) => setWifiSSID(e.target.value)}
                placeholder="MyWiFiNetwork"
              />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input
                type="text"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
            <div className="field-group">
              <label>Security Type</label>
              <div className="security-options">
                {['WPA', 'WEP', 'nopass'].map((type) => (
                  <button
                    key={type}
                    className={`security-btn ${wifiSecurity === type ? 'active' : ''}`}
                    onClick={() => setWifiSecurity(type)}
                  >
                    {type === 'nopass' ? 'No Password' : type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="email-fields">
            <div className="field-group">
              <label>Email Address *</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div className="field-group">
              <label>Subject (Optional)</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div className="field-group">
              <label>Message (Optional)</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Email message"
                rows={3}
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="field-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="field-hint">Include country code (e.g., +1 for US)</p>
          </div>
        );

      case 'sms':
        return (
          <div className="sms-fields">
            <div className="field-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
              />
              <p className="field-hint">Include country code (e.g., +1 for US)</p>
            </div>
            <div className="field-group">
              <label>Message (Optional)</label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Pre-filled SMS message"
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="qr-modal">
      <div className="qr-container">
        <div className="qr-header">
          <h2>QR Code Generator</h2>
          <p>Create customizable QR codes for various purposes</p>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="qr-content">
          <div className="qr-left">
            <UsageIndicator
            usageCount={usageCount}
            usageRemaining={usageRemaining}
            usagePercentage={usagePercentage}
            isPremium={isPremium}
          />
            {/* QR Type Selection */}
            <div className="type-selection">
              <label>QR Code Type</label>
              <div className="type-grid">
                <button
                  className={`type-btn ${qrType === 'url' ? 'active' : ''}`}
                  onClick={() => setQrType('url')}
                >
                  <LinkIcon size={20} />
                  <span>URL</span>
                </button>
                <button
                  className={`type-btn ${qrType === 'text' ? 'active' : ''}`}
                  onClick={() => setQrType('text')}
                >
                  <MessageSquare size={20} />
                  <span>Text</span>
                </button>
                <button
                  className={`type-btn ${qrType === 'wifi' ? 'active' : ''}`}
                  onClick={() => setQrType('wifi')}
                >
                  <Wifi size={20} />
                  <span>WiFi</span>
                </button>
                <button
                  className={`type-btn ${qrType === 'email' ? 'active' : ''}`}
                  onClick={() => setQrType('email')}
                >
                  <Mail size={20} />
                  <span>Email</span>
                </button>
                <button
                  className={`type-btn ${qrType === 'phone' ? 'active' : ''}`}
                  onClick={() => setQrType('phone')}
                >
                  <Phone size={20} />
                  <span>Phone</span>
                </button>
                <button
                  className={`type-btn ${qrType === 'sms' ? 'active' : ''}`}
                  onClick={() => setQrType('sms')}
                >
                  <MessageSquare size={20} />
                  <span>SMS</span>
                </button>
              </div>
            </div>

            {/* Dynamic Fields */}
            <div className="fields-section">
              {renderFields()}
            </div>

            {/* Customization Options */}
            <div className="customization-section">
              <h3>Customization</h3>
              
              <div className="custom-row">
                <div className="field-group">
                  <label>Size</label>
                  <select value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))}>
                    <option value="256">256x256 (Small)</option>
                    <option value="512">512x512 (Medium)</option>
                    <option value="1024">1024x1024 (Large)</option>
                    <option value="2048">2048x2048 (Extra Large)</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>Error Correction</label>
                  <select value={errorLevel} onChange={(e) => setErrorLevel(e.target.value)}>
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>

              <div className="custom-row">
                <div className="field-group">
                  <label>Foreground Color</label>
                  <div className="color-input">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>Background Color</label>
                  <div className="color-input">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QR Preview */}
          <div className="qr-right">
            <div className="qr-preview-section">
              <h3>Preview</h3>
              <div className="qr-preview">
                {qrImage ? (
                  <img src={qrImage} alt="QR Code" />
                ) : (
                  <div className="qr-placeholder">
                    <div className="placeholder-icon">📱</div>
                    <p>Enter data to generate QR code</p>
                  </div>
                )}
              </div>

              {qrImage && (
                <div className="qr-actions">
                  <button className="btn-secondary" onClick={copyQRImage}>
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button className="btn-primary" onClick={downloadQR}>
                    <Download size={18} />
                    Download PNG
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRGenerator;