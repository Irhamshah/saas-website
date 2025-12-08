import React from 'react';
import { Search } from 'lucide-react';
import './Hero.css';

function Hero({ searchQuery, setSearchQuery }) {
  return (
    <section className="hero">
      <div className="container">
        <h1>
          <span className="gradient-text">Lite Tools,</span><br />
          Massive Productivity
        </h1>
        <p>
          A collection of free, fast, and powerful micro-services for developers, 
          creators, and professionals. No sign-up required.
        </p>
        <div className="search-bar">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="stats-row">
          <div className="stat">
            <span className="stat-number">28+</span>
            <span className="stat-label">Tools</span>
          </div>
          <div className="stat">
            <span className="stat-number">100%</span>
            <span className="stat-label">Free</span>
          </div>
          <div className="stat">
            <span className="stat-number">0s</span>
            <span className="stat-label">Sign-Up</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
