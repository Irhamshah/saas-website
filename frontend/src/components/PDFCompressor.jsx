import React, { useState } from 'react';
import { X, Upload, Trash2, FileText, Download, ArrowDown, Settings, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './PDFCompressor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function PDFCompressor({ onClose }) {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [backendAvailable, setBackendAvailable] = useState(true);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      toast.error('Please drop PDF files only');
      return;
    }
    
    addFiles(files);
  };

  const addFiles = (files) => {
    const validFiles = files.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length !== files.length) {
      toast.error('Some files were not PDFs and were skipped');
    }

    if (validFiles.length === 0) {
      return;
    }

    // Create file objects
    const newFiles = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file: file,
      name: file.name,
      originalSize: file.size,
      originalSizeFormatted: formatFileSize(file.size),
      compressedSize: null,
      compressedSizeFormatted: null,
      status: 'ready',
      compressedBlob: null
    }));

    setPdfFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} PDF${newFiles.length > 1 ? 's' : ''}`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const removeFile = (id) => {
    setPdfFiles(prev => prev.filter(file => file.id !== id));
    toast.success('File removed');
  };

  const compressPDFBackend = async (fileData) => {
    try {
      const formData = new FormData();
      formData.append('pdf', fileData.file);
      formData.append('quality', compressionLevel);

      const response = await axios.post(`${API_URL}/pdf/compress`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob'
      });

      // Get metadata from response headers
      const originalSize = parseInt(response.headers['x-original-size'] || fileData.originalSize);
      const compressedSize = parseInt(response.headers['x-compressed-size'] || response.data.size);
      const reduction = response.headers['x-reduction'] || 
        ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

      return {
        blob: response.data,
        size: compressedSize,
        reduction: reduction
      };
    } catch (error) {
      console.error('Backend compression error:', error);
      if (error.response?.status === 500) {
        setBackendAvailable(false);
        throw new Error('Backend compression failed. Server may not have Ghostscript installed.');
      }
      throw error;
    }
  };

  const compressAllPDFs = async () => {
    if (pdfFiles.length === 0) {
      toast.error('Please add PDF files to compress');
      return;
    }

    setCompressing(true);

    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        const fileData = pdfFiles[i];
        
        // Update status
        setPdfFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'processing' } : f
        ));

        // Compress using backend
        const { blob, size, reduction } = await compressPDFBackend(fileData);
        
        // Update with results
        setPdfFiles(prev => prev.map((f, idx) => 
          idx === i ? {
            ...f,
            status: 'completed',
            compressedBlob: blob,
            compressedSize: size,
            compressedSizeFormatted: formatFileSize(size),
            reduction: reduction
          } : f
        ));
      }

      toast.success('All PDFs compressed successfully! 🎉');

    } catch (error) {
      console.error('Error compressing PDFs:', error);
      toast.error(error.message || 'Failed to compress some PDFs');
      
      // Reset status
      setPdfFiles(prev => prev.map(f => ({ 
        ...f, 
        status: f.status === 'processing' ? 'ready' : f.status 
      })));
    } finally {
      setCompressing(false);
    }
  };

  const downloadFile = (fileData) => {
    if (!fileData.compressedBlob) return;

    const url = URL.createObjectURL(fileData.compressedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileData.name.replace('.pdf', '_compressed.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Downloaded!');
  };

  const downloadAll = () => {
    const compressed = pdfFiles.filter(f => f.compressedBlob);
    
    if (compressed.length === 0) {
      toast.error('No compressed files to download');
      return;
    }

    compressed.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 100);
    });
    
    toast.success(`Downloading ${compressed.length} files...`);
  };

  const clearAll = () => {
    if (confirm('Remove all files?')) {
      setPdfFiles([]);
      toast.success('All files removed');
    }
  };

  const getCompressionLabel = () => {
    switch (compressionLevel) {
      case 'low': return 'Fast (Low quality, 48 dpi)';
      case 'medium': return 'Balanced (Medium quality, 72 dpi) - Recommended';
      case 'high': return 'Best (High quality, 150 dpi)';
      default: return 'Balanced';
    }
  };

  return (
    <div className="compressor-modal">
      <div className="compressor-container">
        <div className="compressor-header">
          <div>
            <h2>PDF Compressor</h2>
            <p>Reduce PDF file sizes with quality-based compression</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="compressor-content">
          {/* Backend Status */}
          {!backendAvailable && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <div>
                <strong>Backend Error:</strong> Compression server is not available or Ghostscript is not installed. 
                Please check the backend setup.
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="info-banner">
            <AlertCircle size={18} />
            <div>
              <strong>Server-Side Compression:</strong> PDFs are compressed using professional Ghostscript technology. 
              Typical compression: 40-70% reduction. Your files are deleted after compression.
            </div>
          </div>

          {/* Compression Settings */}
          <div className="compression-settings">
            <div className="settings-label">
              <Settings size={18} />
              Compression Quality
            </div>
            <div className="compression-levels">
              <button
                className={`level-btn ${compressionLevel === 'low' ? 'active' : ''}`}
                onClick={() => setCompressionLevel('low')}
                disabled={compressing}
              >
                Fast
              </button>
              <button
                className={`level-btn ${compressionLevel === 'medium' ? 'active' : ''}`}
                onClick={() => setCompressionLevel('medium')}
                disabled={compressing}
              >
                Balanced
              </button>
              <button
                className={`level-btn ${compressionLevel === 'high' ? 'active' : ''}`}
                onClick={() => setCompressionLevel('high')}
                disabled={compressing}
              >
                Best Quality
              </button>
            </div>
            <p className="settings-description">{getCompressionLabel()}</p>
          </div>

          {/* Upload Area */}
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById('pdf-compress-input').click()}
          >
            <input
              id="pdf-compress-input"
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Upload size={48} />
            <h3>Drop PDF files here or click to browse</h3>
            <p>Professional compression • Multiple files supported • Max 50MB per file</p>
          </div>

          {/* File List */}
          {pdfFiles.length > 0 && (
            <div className="files-section">
              <div className="files-header">
                <h3>PDFs to Compress ({pdfFiles.length})</h3>
                <button className="btn-text" onClick={clearAll} disabled={compressing}>
                  Clear All
                </button>
              </div>

              <div className="files-list">
                {pdfFiles.map((file) => (
                  <div key={file.id} className={`file-item ${file.status}`}>
                    <div className="file-icon">
                      <FileText size={24} />
                    </div>
                    
                    <div className="file-info">
                      <div className="file-name">{file.name}</div>
                      <div className="file-meta">
                        <span className="file-size">Original: {file.originalSizeFormatted}</span>
                        {file.compressedSizeFormatted && (
                          <>
                            <ArrowDown size={14} className="arrow-icon" />
                            <span className="file-size compressed">
                              Compressed: {file.compressedSizeFormatted}
                            </span>
                            {parseFloat(file.reduction) > 0 ? (
                              <span className="reduction-badge">-{file.reduction}%</span>
                            ) : (
                              <span className="reduction-badge minimal">No change</span>
                            )}
                          </>
                        )}
                      </div>
                      {file.status === 'processing' && (
                        <div className="progress-bar">
                          <div className="progress-fill"></div>
                        </div>
                      )}
                    </div>

                    <div className="file-actions">
                      {file.status === 'completed' && (
                        <button
                          className="btn-icon download"
                          onClick={() => downloadFile(file)}
                          title="Download"
                        >
                          <Download size={18} />
                        </button>
                      )}
                      {!compressing && (
                        <button
                          className="btn-icon delete"
                          onClick={() => removeFile(file.id)}
                          title="Remove"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {file.status === 'completed' && (
                      <div className="status-badge completed">✓</div>
                    )}
                    {file.status === 'processing' && (
                      <div className="status-badge processing">
                        <div className="spinner-small"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {pdfFiles.length > 0 && (
            <div className="compress-actions">
              {pdfFiles.some(f => f.compressedBlob) && (
                <button
                  className="btn-secondary"
                  onClick={downloadAll}
                  disabled={compressing}
                >
                  <Download size={20} />
                  Download All
                </button>
              )}
              <button
                className="btn-primary"
                onClick={compressAllPDFs}
                disabled={compressing || !backendAvailable}
              >
                {compressing ? (
                  <>
                    <span className="spinner"></span>
                    Compressing...
                  </>
                ) : (
                  <>
                    Compress {pdfFiles.length} PDF{pdfFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PDFCompressor;