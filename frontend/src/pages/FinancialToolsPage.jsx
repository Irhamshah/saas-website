import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function FinancialToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get finance tools
  const financeCategory = toolCategories.find(cat => cat.id === 'finance');
  const tools = financeCategory ? financeCategory.tools : [];

  return (
    <div className="category-page">
      <SEO 
        title="Financial Calculators - Interest, Loan & ROI Calculators"
        description="Free financial calculators: interest calculator (simple, compound, investment), loan calculator with amortization, invoice generator, and ROI calculator."
        keywords="interest calculator, loan calculator, mortgage calculator, roi calculator, invoice generator, financial tools"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <DollarSign size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Financial Tools</h1>
          <p className="page-description">
            Smart calculators and generators for personal and business finance
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

export default FinancialToolsPage;