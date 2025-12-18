import React, { useState } from 'react';
import { X, Copy, Check, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useUsageLimit } from '../hooks/useUsageLimit';
import UsageIndicator from './UsageIndicator';
import './UUIDGenerator.css';

function UUIDGenerator({ onClose }) {
    const [uuids, setUuids] = useState([uuidv4()]);
    const [count, setCount] = useState(1);
    const [copied, setCopied] = useState(null);
    const [format, setFormat] = useState('default'); // default, uppercase, no-hyphens

    // ✅ Usage limit hook
    const {
        usageCount,
        usageRemaining,
        usagePercentage,
        canUse,
        isPremium,
        incrementUsage,
        showLimitError,
    } = useUsageLimit('uuid', 3);

    const generateUUIDs = async () => { // ✅ Made async for incrementUsage
        // ✅ CHECK LIMIT FIRST
        if (!canUse) {
            showLimitError();
            return;
        }

        const newUuids = Array.from({ length: count }, () => uuidv4());
        setUuids(newUuids);

        // ✅ INCREMENT USAGE AFTER SUCCESS
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
        <div className="uuid-modal-overlay" onClick={onClose}>
            <div className="uuid-modal" onClick={(e) => e.stopPropagation()}>
                <div className="uuid-header">
                    <div>
                        <h2>UUID Generator</h2>
                        <p>Generate unique identifiers instantly</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="uuid-content">
                    {/* ✅ ADD USAGE INDICATOR */}
                    <UsageIndicator
                        usageCount={usageCount}
                        usageRemaining={usageRemaining}
                        usagePercentage={usagePercentage}
                        isPremium={isPremium}
                    />

                    {/* Format Options */}
                    <div className="uuid-format-section">
                        <label>Format</label>
                        <div className="format-buttons">
                            <button
                                className={`format-btn ${format === 'default' ? 'active' : ''}`}
                                onClick={() => setFormat('default')}
                                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                Default
                            </button>
                            <button
                                className={`format-btn ${format === 'uppercase' ? 'active' : ''}`}
                                onClick={() => setFormat('uppercase')}
                                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                Uppercase
                            </button>
                            <button
                                className={`format-btn ${format === 'no-hyphens' ? 'active' : ''}`}
                                onClick={() => setFormat('no-hyphens')}
                                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                No Hyphens
                            </button>
                            <button
                                className={`format-btn ${format === 'uppercase-no-hyphens' ? 'active' : ''}`}
                                onClick={() => setFormat('uppercase-no-hyphens')}
                                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                Both
                            </button>
                        </div>
                    </div>

                    {/* Count Selector */}
                    <div className="uuid-count-section">
                        <label>Number of UUIDs</label>
                        <div className="count-selector">
                            <button
                                className="count-btn"
                                onClick={() => setCount(Math.max(1, count - 1))}
                                disabled={count <= 1 || !canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={count}
                                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                min="1"
                                max="100"
                                disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                            />
                            <button
                                className="count-btn"
                                onClick={() => setCount(Math.min(100, count + 1))}
                                disabled={count >= 100 || !canUse} // ✅ DISABLE IF LIMIT REACHED
                            >
                                +
                            </button>
                        </div>
                        <small>Maximum 100 UUIDs at once</small>
                    </div>

                    {/* Generate Button */}
                    <button
                        className="btn-primary generate-btn"
                        onClick={generateUUIDs}
                        disabled={!canUse} // ✅ DISABLE IF LIMIT REACHED
                    >
                        <RefreshCw size={20} />
                        Generate
                    </button>

                    {/* UUIDs List */}
                    <div className="uuid-list-section">
                        <div className="uuid-list-header">
                            <label>Generated UUIDs ({uuids.length})</label>
                            <div className="list-actions">
                                <button className="icon-btn" onClick={handleCopyAll} title="Copy All">
                                    <Copy size={18} />
                                </button>
                                <button className="icon-btn" onClick={handleDownload} title="Download">
                                    <Download size={18} />
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

                    {/* Info */}
                    <div className="uuid-info">
                        <p>
                            <strong>UUID v4:</strong> Randomly generated 128-bit identifier.
                            Collision probability is negligible (1 in 2<sup>122</sup>).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UUIDGenerator;