import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { searchTools } from '../data/tools';
import { useAuth } from '../context/AuthContext';
import './ToolsGrid.css';

function ToolsGrid({ searchQuery, onToolClick }) {
  const { user } = useAuth();
  const filteredCategories = useMemo(() => searchTools(searchQuery), [searchQuery]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="tools-section">
      <div className="container">
        {filteredCategories.length === 0 ? (
          <div className="no-results">
            <p>No tools found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredCategories.map((category, idx) => (
            <motion.div 
              key={category.id} 
              className="category-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="category-header">
                <div className={`category-icon ${category.iconClass}`}>
                  {category.icon}
                </div>
                <h2>{category.name}</h2>
              </div>
              <motion.div 
                className="tools-grid"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {category.tools.map((tool) => (
                  <motion.div
                    key={tool.id}
                    className={`tool-card ${tool.premium && !user?.isPremium ? 'premium-locked' : ''}`}
                    variants={item}
                    whileHover={{ y: -4 }}
                    onClick={() => onToolClick(tool)}
                  >
                    <div className="tool-card-content">
                      <h3>{tool.name}</h3>
                      <p>{tool.description}</p>
                      {tool.premium && (
                        <div className="premium-badge">
                          <Lock size={12} />
                          <span>PREMIUM</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}

export default ToolsGrid;
