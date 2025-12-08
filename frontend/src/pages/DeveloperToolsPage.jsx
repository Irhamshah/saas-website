import React, { useState } from 'react';
import { Code } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function DeveloperToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get developer tools from toolCategories
  const devCategory = toolCategories.find(cat => cat.id === 'developer');
  const tools = devCategory ? devCategory.tools : [];

  return (
    <div className="category-page">
      <SEO 
        title="Developer Tools - JSON, SQL, Regex, JWT, Hash & Base64"
        description="Free developer tools: JSON formatter, SQL formatter, regex tester, JWT decoder, hash generator, Base64 encoder/decoder, and password generator. Built for developers."
        keywords="json formatter, sql formatter, regex tester, jwt decoder, hash generator, base64, password generator, developer tools"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <Code size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Developer Tools</h1>
          <p className="page-description">
            Essential tools for developers - formatters, encoders, testers, and more
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

export default DeveloperToolsPage;