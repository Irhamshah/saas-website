import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext'; // Your existing AuthProvider
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import TextToolsPage from './pages/TextToolsPage';
import ImageToolsPage from './pages/ImageToolsPage';
import PDFToolsPage from './pages/PDFToolsPage';
import DeveloperToolsPage from './pages/DeveloperToolsPage';
import FinancialToolsPage from './pages/FinancialToolsPage';
import ConverterToolsPage from './pages/ConverterToolsPage';
import GeneratorToolsPage from './pages/GeneratorToolsPage';
// Import your existing pages that I accidentally removed
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Pricing from './pages/PricingPage';
import Payment from './pages/Payment';
import './App.css';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1f3a',
            color: '#fff',
            border: '1px solid rgba(45, 91, 255, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Header setShowAuthModal={setShowAuthModal} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/text-tools" element={<TextToolsPage />} />
          <Route path="/image-tools" element={<ImageToolsPage />} />
          <Route path="/pdf-tools" element={<PDFToolsPage />} />
          <Route path="/developer-tools" element={<DeveloperToolsPage />} />
          <Route path="/financial-tools" element={<FinancialToolsPage />} />
          <Route path="/converters" element={<ConverterToolsPage />} />
          <Route path="/generators" element={<GeneratorToolsPage />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </main>
      
      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <HelmetProvider>
        <Router>
          <div className="app">
            <AppContent />
          </div>
        </Router>
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;