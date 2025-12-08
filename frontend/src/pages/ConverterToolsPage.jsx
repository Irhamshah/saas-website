import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function ConverterToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get converter tools from developer and business categories
  const devCategory = toolCategories.find(cat => cat.id === 'developer');
  const businessCategory = toolCategories.find(cat => cat.id === 'business');
  
  const converterTools = [
    ...(devCategory ? devCategory.tools.filter(t => t.id === 'csv-json' || t.id === 'base64') : []),
    ...(businessCategory ? businessCategory.tools.filter(t => t.id === 'unit-converter' || t.id === 'color-picker') : [])
  ];

  return (
    <div className="category-page">
      <SEO 
        title="Converters - Unit, Format & Color Converters"
        description="Free online converters: unit converter (57+ units), CSV/JSON converter, Base64 encoder/decoder, color picker. Fast and accurate conversions."
        keywords="unit converter, csv to json, json to csv, base64, color picker, conversion tools"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <RefreshCw size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Converters</h1>
          <p className="page-description">
            Convert units, formats, and values between different systems
          </p>
        </div>
      </div>

      <div className="tools-grid">
        {converterTools.map((tool) => (
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

export default ConverterToolsPage;