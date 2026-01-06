import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Image, 
  FileCode, 
  Code, 
  DollarSign, 
  Sparkles, 
  Hash, 
  Key, 
  Database, 
  Binary, 
  Lock, 
  ArrowRight,
  Crown
} from 'lucide-react';
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

function ToolCard({
  icon: Icon,
  title,
  description,
  to,
  onClick,
  isPremium,
  color = '#2D5BFF'
}) {
  // If onClick is provided (modal), use div. If to is provided (page), use Link
  const Component = to ? Link : 'div';
  const props = to ? { to } : { onClick };

  return (
    <Component
      {...props}
      className="tool-card"
      style={{ '--tool-color': color }}
    >
      <div className="tool-card-icon">
        <Icon size={28} />
      </div>

      <div className="tool-card-content">
        <div className="tool-card-header">
          <h3 className="tool-card-name">
            {title}
          </h3>
          {isPremium && (
            <span className="premium-badge">
              <Crown size={12} />
              <span>Premium</span>
            </span>
          )}
        </div>
        <p className="tool-card-description">{description}</p>
      </div>

      <div className="tool-card-arrow">
        <ArrowRight size={20} />
      </div>
    </Component>
  );
}

export default ToolCard;
export { iconMap };