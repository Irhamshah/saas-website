import React from 'react';
import { FileCode, Zap, Merge, Split, Image, FileText } from 'lucide-react';
import SEO from '../components/seo';
import ToolCard from '../components/ToolCard';
import './CategoryPage.css';

function PDFToolsPage() {
  const tools = [
    {
      icon: Zap,
      title: 'PDF Compressor',
      description: 'Reduce PDF file size while maintaining quality',
      to: '/tools/pdf-compressor',
      color: '#EF4444',
      isPremium: false,
    },
    {
      icon: Merge,
      title: 'PDF Merger',
      description: 'Combine multiple PDFs into a single file',
      to: '/tools/pdf-merger',
      color: '#F59E0B',
      isPremium: false,
    },
    {
      icon: Split,
      title: 'PDF Splitter',
      description: 'Split PDF into separate pages or ranges',
      to: '/tools/pdf-splitter',
      color: '#10B981',
      isPremium: false,
    },
    {
      icon: Image,
      title: 'Image to PDF',
      description: 'Convert images to PDF documents',
      to: '/tools/image-to-pdf',
      color: '#3B82F6',
      isPremium: false,
    },
    {
      icon: FileText,
      title: 'Extract Text',
      description: 'Extract text content from PDFs',
      to: '/tools/pdf-text-extract',
      color: '#8B5CF6',
      isPremium: false,
    },
  ];

  return (
    <div className="page-with-ads">
      <SEO 
        title="PDF Tools - Free Online PDF Editor | LiteTools"
        description="Free PDF tools: compress, merge, split, convert, and edit PDFs online. Fast, secure, and easy to use."
        keywords="pdf tools, pdf editor, compress pdf, merge pdf, split pdf"
      />

      {/* ✅ LEFT SIDEBAR AD */}
      <aside className="ad-sidebar-left">
        <div className="ad-banner ad-skyscraper">
          <div>
            <span>160 x 600</span>
            <br />
            <span>Ad Space</span>
          </div>
        </div>
      </aside>

      {/* ✅ MAIN CONTENT */}
      <div className="page-content">
        <div className="category-page">
          <div className="page-header">
            <div className="page-icon">
              <FileCode size={48} />
            </div>
            <div className="page-header-content">
              <h1 className="page-title">PDF Tools</h1>
              <p className="page-description">
                Professional PDF tools for merging, compressing, and managing PDFs
              </p>
            </div>
          </div>

          <div className="tools-grid">
            {tools.map((tool, index) => (
              <ToolCard key={index} {...tool} />
            ))}
          </div>

          {/* ✅ BOTTOM AD */}
          <div className="category-ad-bottom">
            <div className="ad-banner ad-leaderboard">
              <div>
                <span>728 x 90</span>
                <br />
                <span>Ad Space</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ RIGHT SIDEBAR AD */}
      <aside className="ad-sidebar-right">
        <div className="ad-banner ad-skyscraper">
          <div>
            <span>160 x 600</span>
            <br />
            <span>Ad Space</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default PDFToolsPage;