import React, { useState } from 'react';
import { FileCode } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function PDFToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get PDF tools from file category
  const fileCategory = toolCategories.find(cat => cat.id === 'file');
  const tools = fileCategory ? fileCategory.tools.filter(t => t.id.startsWith('pdf')) : [];

  return (
    <div className="category-page">
      <SEO 
        title="PDF Tools - Merge, Compress & Split PDFs"
        description="Free PDF tools: merge PDFs, compress PDFs (40-70% reduction), split PDFs into pages. All processing happens in your browser."
        keywords="pdf merger, pdf compressor, pdf splitter, merge pdf, compress pdf, split pdf"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <FileCode size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">PDF Tools</h1>
          <p className="page-description">
            Merge, compress, split, and manage PDF documents with ease
          </p>
        </div>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={setSelectedTool}
          />
        ))}
      </div>

      {selectedTool && (
        <ToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
}

export default PDFToolsPage;