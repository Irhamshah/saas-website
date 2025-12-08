import React, { useState } from 'react';
import { Type } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function TextToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get text tools from toolCategories
  const textCategory = toolCategories.find(cat => cat.id === 'text');
  const tools = textCategory ? textCategory.tools : [];

  return (
    <div className="category-page">
      <SEO 
        title="Text Tools - Word Counter, Case Converter & More"
        description="Free online text tools: word counter, case converter, duplicate remover, text diff checker, lorem ipsum generator, and more. No sign-up required."
        keywords="word counter, case converter, text tools, duplicate remover, sort lines, lorem ipsum, text diff"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <Type size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Text Tools</h1>
          <p className="page-description">
            Powerful tools for text manipulation, formatting, and analysis
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

export default TextToolsPage;