import React from 'react';
import { FileText, Image, FileCode, Code, DollarSign, Sparkles, Hash, Key, Database, Binary, Lock } from 'lucide-react';
import './ToolCard.css';

// Map tool IDs to icons since tools.js doesn't have icon components
const iconMap = {
  // Text tools
  'word-counter': FileText,
  'case-converter': FileText,
  'duplicate-remover': FileText,
  'sort-lines': FileText,
  'text-diff': FileText,
  'markdown-preview': FileText,
  'lorem-ipsum': FileText,
  
  // Developer tools
  'json-formatter': Code,
  'sql-formatter': Database,
  'regex': Code,
  'jwt': Key,
  'hash': Hash,
  'base64': Binary,
  'uuid': Sparkles,
  'csv-json': Code,
  
  // File/Image tools
  'image-compress': Image,
  'image-pdf': Image,
  'pdf-merge': FileCode,
  'pdf-split': FileCode,
  'pdf-compress': FileCode,
  'qr': Sparkles,
  
  // Business tools
  'invoice': DollarSign,
  'receipt': DollarSign,
  'password': Lock,
  'color-picker': Image,
  'unit-converter': Sparkles,
  
  // Finance tools
  'interest-calculator': DollarSign,
  'loan-calculator': DollarSign,
};

function ToolCard({ tool, onClick }) {
  // Get icon from map or use default
  const Icon = iconMap[tool.id] || FileText;

  return (
    <div className="tool-card" onClick={() => onClick(tool)}>
      <div className="tool-card-icon">
        <Icon size={28} />
      </div>
      <div className="tool-card-content">
        <h3 className="tool-card-name">{tool.name}</h3>
        <p className="tool-card-description">{tool.description}</p>
      </div>
      <div className="tool-card-arrow">→</div>
    </div>
  );
}

export default ToolCard;