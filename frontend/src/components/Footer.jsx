import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-logo">LiteTools</h3>
            <p>Free micro-services for productivity</p>
          </div>
          
          <div className="footer-section">
            <h4>Tools</h4>
            <ul>
              <li><Link to="/">All Tools</Link></li>
              <li><Link to="/pricing">Premium</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 LiteTools. All tools run securely in your browser.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
