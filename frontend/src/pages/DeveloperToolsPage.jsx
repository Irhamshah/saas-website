import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code, Binary, FileCode, Hash, Key, Braces, Database, Terminal } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function DeveloperToolsPage() {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);

  // Get developer tools from toolCategories
  const devCategory = toolCategories.find(cat => cat.id === 'developer');
  const tools = devCategory ? devCategory.tools : [];

  // Icon mapping for tools
  const iconMap = {
    'json-formatter': Braces,
    'csv-json': FileCode,
    'uuid': Hash,
    'regex': Terminal,
    'sql-formatter': Database,
    'jwt': Key,
    'hash': Hash,
    'base64': Binary,
  };

  // Color mapping for tools
  const colorMap = {
    'json-formatter': '#F59E0B',
    'csv-json': '#10B981',
    'uuid': '#3B82F6',
    'regex': '#EF4444',
    'sql-formatter': '#8B5CF6',
    'jwt': '#EC4899',
    'hash': '#06B6D4',
    'base64': '#6366F1',
  };

  const handleToolClick = (tool) => {
    // If tool has a route, navigate to it
    if (tool.route) {
      navigate(tool.route);
    } else {
      // Otherwise, open modal
      setSelectedTool(tool);
    }
  };

  return (
    <div className="page-with-ads">
      <SEO 
        title="Developer Tools - JSON, SQL, Regex, JWT, Hash & Base64 | LiteTools"
        description="Free developer tools: JSON formatter, SQL formatter, regex tester, JWT decoder, hash generator, Base64 encoder/decoder, and more. Built for developers."
        keywords="json formatter, sql formatter, regex tester, jwt decoder, hash generator, base64, developer tools"
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
              <Code size={48} />
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
                icon={iconMap[tool.id] || Code}
                title={tool.name}
                description={tool.description}
                to={tool.route}  // Use route if available
                onClick={!tool.route ? () => handleToolClick(tool) : undefined}  // Modal if no route
                isPremium={tool.premium}
                color={colorMap[tool.id] || '#2D5BFF'}
              />
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

      {/* Modal for tools without dedicated pages */}
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