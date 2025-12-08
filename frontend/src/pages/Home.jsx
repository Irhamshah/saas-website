import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Image, FileCode, Code, DollarSign, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import SEO from '../components/seo';
import './Home.css';

function Home() {
  const categories = [
    {
      path: '/text-tools',
      name: 'Text Tools',
      icon: FileText,
      description: 'Word count, case converter, text diff, and more',
      color: '#3B82F6',
      tools: ['Word Counter', 'Case Converter', 'Text Diff', 'Duplicate Remover'],
    },
    {
      path: '/image-tools',
      name: 'Image Tools',
      icon: Image,
      description: 'Compress, convert, crop, and manipulate images',
      color: '#10B981',
      tools: ['Image Compressor', 'Image to PDF', 'Color Picker', 'Format Converter'],
    },
    {
      path: '/pdf-tools',
      name: 'PDF Tools',
      icon: FileCode,
      description: 'Merge, split, compress, and manage PDFs',
      color: '#EF4444',
      tools: ['PDF Merger', 'PDF Compressor', 'PDF Splitter', 'Image to PDF'],
    },
    {
      path: '/developer-tools',
      name: 'Developer Tools',
      icon: Code,
      description: 'JSON, SQL, regex, JWT, hashing, and encoding',
      color: '#8B5CF6',
      tools: ['JSON Formatter', 'SQL Formatter', 'Regex Tester', 'Base64 Tool'],
    },
    {
      path: '/financial-tools',
      name: 'Financial Tools',
      icon: DollarSign,
      description: 'Calculate interest, loans, ROI, and more',
      color: '#F59E0B',
      tools: ['Interest Calculator', 'Loan Calculator', 'Invoice Generator', 'ROI Calculator'],
    },
    {
      path: '/converters',
      name: 'Converters',
      icon: RefreshCw,
      description: 'Convert units, currencies, temperatures, and more',
      color: '#06B6D4',
      tools: ['Unit Converter', 'Currency Converter', 'Temperature Converter', 'Base Converter'],
    },
    {
      path: '/generators',
      name: 'Generators',
      icon: Sparkles,
      description: 'Generate passwords, QR codes, invoices, and more',
      color: '#EC4899',
      tools: ['Password Generator', 'QR Generator', 'UUID Generator', 'Lorem Ipsum'],
    },
  ];

  return (
    <div className="home">
      <SEO 
        title="Free Online Tools - No Sign-up Required"
        description="50+ free online tools for text editing, image processing, PDF manipulation, development, financial calculations, and more. Privacy-first, no registration needed."
        keywords="online tools, free tools, text tools, image tools, pdf tools, developer tools, no signup"
      />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">LiteTools</span>
          </h1>
          <p className="hero-subtitle">
            Your Swiss Army Knife for Digital Tasks
          </p>
          <p className="hero-description">
            Fast, free, and privacy-focused tools for everyday tasks. No sign-up required.
            All processing happens in your browser.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-value">50+</div>
              <div className="stat-label">Tools</div>
            </div>
            <div className="stat">
              <div className="stat-value">100%</div>
              <div className="stat-label">Free</div>
            </div>
            <div className="stat">
              <div className="stat-value">0</div>
              <div className="stat-label">Sign-ups</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories">
        <div className="categories-header">
          <h2>Explore Tool Categories</h2>
          <p>Choose a category to get started</p>
        </div>
        <div className="categories-grid">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.path}
                to={category.path}
                className="category-card"
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon" style={{ background: `${category.color}15` }}>
                  <Icon size={32} style={{ color: category.color }} />
                </div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">{category.description}</p>
                <div className="category-tools">
                  {category.tools.map((tool, index) => (
                    <span key={index} className="tool-tag">
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="category-arrow">
                  <ArrowRight size={20} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Why Choose LiteTools?</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>All processing happens in your browser. Your data never leaves your device.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>No server round-trips. Everything runs locally for instant results.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Beautiful UI</h3>
            <p>Clean, modern interface designed for productivity and ease of use.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Fully Responsive</h3>
            <p>Works perfectly on desktop, tablet, and mobile devices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🆓</div>
            <h3>100% Free</h3>
            <p>No subscriptions, no hidden fees. All tools are completely free forever.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>No Sign-up</h3>
            <p>Jump right in and start using tools immediately. No account needed.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;