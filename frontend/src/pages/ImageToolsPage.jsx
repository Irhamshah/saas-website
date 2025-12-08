import React, { useState } from 'react';
import { Image } from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolModal from '../components/ToolModal';
import SEO from '../components/seo';
import { toolCategories } from '../data/tools';
import './CategoryPage.css';

function ImageToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null);

  // Get file/image tools from toolCategories
  const fileCategory = toolCategories.find(cat => cat.id === 'file');
  const tools = fileCategory ? fileCategory.tools : [];

  return (
    <div className="category-page">
      <SEO 
        title="Image & File Tools - Compress, Convert & Edit"
        description="Free image and file tools: image compressor (60-90% reduction), image to PDF converter, QR code generator. Process files in your browser."
        keywords="image compressor, image to pdf, qr code generator, file tools, compress images"
      />
      
      <div className="page-header">
        <div className="page-icon">
          <Image size={40} />
        </div>
        <div className="page-header-content">
          <h1 className="page-title">Image & File Tools</h1>
          <p className="page-description">
            Powerful image and file manipulation tools
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

export default ImageToolsPage;