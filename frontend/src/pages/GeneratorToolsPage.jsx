import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function GeneratorToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get generator tools from various categories
  const devCategory = toolCategories.find(cat => cat.id === 'developer');
  const fileCategory = toolCategories.find(cat => cat.id === 'file');
  const businessCategory = toolCategories.find(cat => cat.id === 'business');
  const textCategory = toolCategories.find(cat => cat.id === 'text');
  
  const generatorTools = [
    ...(devCategory ? devCategory.tools.filter(t => t.id === 'uuid' || t.id === 'hash') : []),
    ...(fileCategory ? fileCategory.tools.filter(t => t.id === 'qr') : []),
    ...(businessCategory ? businessCategory.tools.filter(t => t.id === 'password' || t.id === 'invoice' || t.id === 'receipt') : []),
    ...(textCategory ? textCategory.tools.filter(t => t.id === 'lorem-ipsum') : [])
  ];

  return (
    <div className="category-page">
      <SEO 
        title="Generators - Password, QR Code, UUID & More"
        description="Free generators: secure password generator, QR code generator (6 types), UUID generator, hash generator, and lorem ipsum generator. Generate instantly."
        keywords="password generator, qr code generator, uuid generator, lorem ipsum, random password, secure password, hash generator"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <Sparkles size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Generators</h1>
          <p className="page-description">
            Generate passwords, QR codes, UUIDs, and placeholder content
          </p>
        </div>
      </div>

      <div className="tools-grid">
        {generatorTools.map((tool) => (
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

export default GeneratorToolsPage;